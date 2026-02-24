import { eq } from "drizzle-orm";
import { users, hotmartWebhooks, auditLog, emailsAutorizados } from "../drizzle/schema";
import { getDb } from "./db";

// ============ WHITELIST (emailsAutorizados) ============

/**
 * Agrega o actualiza un email en la whitelist.
 * - PURCHASE_APPROVED: status='pagado', expiresAt=+30 días
 * - subscription_charge_success: status='pagado', expiresAt=+30 días desde ahora
 * - subscription_cancellation / charge_refund: no modifica whitelist (el portero ya verifica expiresAt)
 */
async function upsertWhitelist(email: string, status: "prueba" | "pagado", diasAcceso: number) {
  const db = await getDb();
  if (!db) return;

  const emailLower = email.toLowerCase().trim();
  const ahora = new Date();
  const expiresAt = new Date(ahora.getTime() + diasAcceso * 24 * 60 * 60 * 1000);

  const existing = await db.select().from(emailsAutorizados).where(eq(emailsAutorizados.email, emailLower));

  if (existing.length > 0) {
    // Si ya existe, extender la fecha de expiración
    const currentExpires = existing[0].expiresAt ? new Date(existing[0].expiresAt) : ahora;
    const baseDate = currentExpires > ahora ? currentExpires : ahora;
    const newExpires = new Date(baseDate.getTime() + diasAcceso * 24 * 60 * 60 * 1000);

    await db.update(emailsAutorizados).set({
      status,
      expiresAt: newExpires,
    }).where(eq(emailsAutorizados.email, emailLower));

    console.log(`[Whitelist] Actualizado: ${emailLower} → status=${status}, expiresAt=${newExpires.toISOString()}`);
  } else {
    // Si no existe, crear nuevo registro
    await db.insert(emailsAutorizados).values({
      email: emailLower,
      nombre: email.split("@")[0],
      plan: status === "pagado" ? "vip" : "basic",
      status,
      expiresAt,
    });

    console.log(`[Whitelist] Creado: ${emailLower} → status=${status}, expiresAt=${expiresAt.toISOString()}`);
  }
}

/**
 * Marca un email como vencido en la whitelist (cancelación/reembolso).
 * Pone expiresAt en el pasado para que el portero lo bloquee.
 */
async function expireWhitelist(email: string) {
  const db = await getDb();
  if (!db) return;

  const emailLower = email.toLowerCase().trim();
  const pastDate = new Date(Date.now() - 1000); // 1 segundo en el pasado

  await db.update(emailsAutorizados).set({
    expiresAt: pastDate,
  }).where(eq(emailsAutorizados.email, emailLower));

  console.log(`[Whitelist] Expirado: ${emailLower}`);
}

// ============ WEBHOOKS ============

export async function saveWebhookEvent(
  eventType: string,
  email: string,
  payload: any
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(hotmartWebhooks).values({
    eventType,
    email,
    payload: JSON.stringify(payload),
    processed: 0,
  });
}

export async function markWebhookAsProcessed(webhookId: number, error?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(hotmartWebhooks)
    .set({
      processed: 1,
      processedAt: new Date(),
      error: error || null,
    })
    .where(eq(hotmartWebhooks.id, webhookId));
}

export async function getUnprocessedWebhooks() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(hotmartWebhooks)
    .where(eq(hotmartWebhooks.processed, 0));
}

// ============ MAPEO DE PRODUCTOS HOTMART → ROLES ============

/**
 * Determina el rol y plan del usuario según el producto/oferta de Hotmart.
 *
 * Lógica de asignación:
 * - Producto con nombre que contiene "admin" o "administrador" → rol "admin", plan según recurrencia
 * - Suscripción recurrente → plan "vip"
 * - Pago único → plan "lifetime"
 * - Por defecto → rol "user" (Sastre)
 *
 * El nombre del producto se obtiene de payload.product.name o payload.product_name
 */
function determineRoleAndPlan(payload: any): {
  role: "user" | "admin";
  plan: "basic" | "vip" | "lifetime";
  isPriority: number;
} {
  const productName = (
    payload?.product?.name ||
    payload?.product_name ||
    payload?.offer?.name ||
    ""
  ).toLowerCase();

  const isRecurring = !!(payload?.product?.is_recurring || payload?.subscription_id);

  // Detectar si el producto es de tipo Administrador
  const isAdminProduct =
    productName.includes("admin") ||
    productName.includes("administrador") ||
    productName.includes("premium") ||
    productName.includes("completo");

  const role: "user" | "admin" = isAdminProduct ? "admin" : "user";
  const plan: "basic" | "vip" | "lifetime" = isRecurring ? "vip" : "lifetime";
  const isPriority = isRecurring ? 1 : 0;

  return { role, plan, isPriority };
}

// ============ PROCESAMIENTO DE EVENTOS ============

/**
 * Procesa PURCHASE_APPROVED de Hotmart.
 * Si el usuario no existe, lo crea automáticamente con:
 * - openId compatible con el login por email (email:{email})
 * - Rol según el producto comprado (Sastre o Administrador)
 * - Plan según tipo de pago (VIP para suscripción, Lifetime para pago único)
 * - Estado activo
 *
 * Si el usuario ya existe, actualiza su plan, rol y estado.
 */
export async function processPurchaseApproved(email: string, payload: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { role, plan, isPriority } = determineRoleAndPlan(payload);

  // Nombre del comprador desde el payload de Hotmart
  const buyerName =
    payload?.buyer?.name ||
    payload?.customer?.name ||
    payload?.subscriber?.name ||
    email.split("@")[0];

  // Buscar usuario por email
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUsers && existingUsers.length > 0) {
    // Usuario ya existe → actualizar plan, rol y estado
    const userId = existingUsers[0].id;

    await db
      .update(users)
      .set({
        isActive: "active",
        role,
        plan,
        isPriority,
        name: existingUsers[0].name || buyerName, // No sobrescribir nombre si ya tiene uno
        audioTranscriptionsThisMonth: 0,
        lastAudioResetDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Registrar en auditoría
    await db.insert(auditLog).values({
      userId,
      action: "purchase_approved_user_updated",
      details: JSON.stringify({
        email,
        role,
        plan,
        isRecurring: !!payload?.subscription_id,
        productName: payload?.product?.name || "N/A",
        productId: payload?.product?.id,
        purchaseId: payload?.purchase_id,
        amount: payload?.purchase?.price?.value || payload?.amount,
        currency: payload?.purchase?.price?.currency_code || "USD",
        date: new Date().toISOString(),
      }),
    });

    // Actualizar whitelist con 30 días de acceso
    await upsertWhitelist(email, "pagado", 30);

    console.log(`[Hotmart] Usuario actualizado: ${email} → rol=${role}, plan=${plan}`);
    return { success: true, userId, created: false, role, plan, isPriority };
  } else {
    // Usuario NO existe → crear nuevo usuario automáticamente
    // Usar openId compatible con el sistema de login por email
    const openId = `email:${email}`;

    await db.insert(users).values({
      openId,
      email,
      name: buyerName,
      loginMethod: "hotmart",
      role,
      isActive: "active",
      plan,
      isPriority,
      audioTranscriptionsThisMonth: 0,
      lastAudioResetDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    // Obtener el usuario creado
    const createdUser = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId));

    const userId = createdUser[0]?.id;

    // Registrar en auditoría
    if (userId) {
      await db.insert(auditLog).values({
        userId,
        action: "purchase_approved_user_created",
        details: JSON.stringify({
          email,
          role,
          plan,
          buyerName,
          isRecurring: !!payload?.subscription_id,
          productName: payload?.product?.name || "N/A",
          productId: payload?.product?.id,
          purchaseId: payload?.purchase_id,
          amount: payload?.purchase?.price?.value || payload?.amount,
          currency: payload?.purchase?.price?.currency_code || "USD",
          date: new Date().toISOString(),
        }),
      });
    }

    // Agregar a whitelist con 30 días de acceso
    await upsertWhitelist(email, "pagado", 30);

    console.log(`[Hotmart] Nuevo usuario creado: ${email} → rol=${role}, plan=${plan}`);
    return { success: true, userId, created: true, role, plan, isPriority };
  }
}

/**
 * Procesa subscription_charge_success de Hotmart.
 * Renueva la suscripción del usuario (lo marca como activo).
 */
export async function processSubscriptionChargeSuccess(email: string, payload: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!existingUsers || existingUsers.length === 0) {
    // Si no existe, crear usuario automáticamente (mismo flujo que PURCHASE_APPROVED)
    return processPurchaseApproved(email, { ...payload, subscription_id: true });
  }

  const userId = existingUsers[0].id;

  await db
    .update(users)
    .set({
      isActive: "active",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await db.insert(auditLog).values({
    userId,
    action: "subscription_charge_success",
    details: JSON.stringify({
      email,
      chargeId: payload?.charge_id,
      amount: payload?.purchase?.price?.value || payload?.amount,
      date: new Date().toISOString(),
    }),
  });

  // Renovar whitelist con 30 días más
  await upsertWhitelist(email, "pagado", 30);

  console.log(`[Hotmart] Suscripción renovada: ${email}`);
  return { success: true, userId };
}

/**
 * Procesa subscription_cancellation de Hotmart.
 * Desactiva la cuenta del usuario.
 */
export async function processSubscriptionCancellation(email: string, payload: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!existingUsers || existingUsers.length === 0) {
    console.warn(`[Hotmart] Usuario no encontrado para cancelación: ${email}`);
    return { success: false, error: "User not found" };
  }

  const userId = existingUsers[0].id;

  await db
    .update(users)
    .set({
      isActive: "inactive",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await db.insert(auditLog).values({
    userId,
    action: "subscription_cancellation",
    details: JSON.stringify({
      email,
      subscriptionId: payload?.subscription_id,
      date: new Date().toISOString(),
    }),
  });

  // Expirar whitelist inmediatamente
  await expireWhitelist(email);

  console.log(`[Hotmart] Suscripción cancelada: ${email}`);
  return { success: true, userId };
}

/**
 * Procesa charge_refund de Hotmart.
 * Desactiva la cuenta del usuario por reembolso.
 */
export async function processChargeRefund(email: string, payload: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!existingUsers || existingUsers.length === 0) {
    console.warn(`[Hotmart] Usuario no encontrado para reembolso: ${email}`);
    return { success: false, error: "User not found" };
  }

  const userId = existingUsers[0].id;

  await db
    .update(users)
    .set({
      isActive: "inactive",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await db.insert(auditLog).values({
    userId,
    action: "charge_refund",
    details: JSON.stringify({
      email,
      chargeId: payload?.charge_id,
      refundAmount: payload?.refund_amount,
      date: new Date().toISOString(),
    }),
  });

  // Expirar whitelist inmediatamente
  await expireWhitelist(email);

  console.log(`[Hotmart] Reembolso procesado: ${email}`);
  return { success: true, userId };
}

// ============ AUDITORÍA ============

export async function logAuditEvent(
  userId: number,
  action: string,
  details: any,
  adminId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(auditLog).values({
    userId,
    adminId,
    action,
    details: JSON.stringify(details),
  });
}

export async function getAuditLog(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(auditLog)
    .where(eq(auditLog.userId, userId))
    .limit(limit);
}
