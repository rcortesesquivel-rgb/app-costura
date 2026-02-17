import { eq } from "drizzle-orm";
import { users, hotmartWebhooks, auditLog } from "../drizzle/schema";
import { getDb } from "./db";

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

// ============ PROCESAMIENTO DE EVENTOS ============

export async function processSubscriptionChargeSuccess(email: string, payload: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar usuario por email
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!user || user.length === 0) {
    throw new Error(`User not found with email: ${email}`);
  }

  const userId = user[0].id;

  // Actualizar estado a activo
  await db
    .update(users)
    .set({
      isActive: "active",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Registrar en auditoría
  await db.insert(auditLog).values({
    userId,
    action: "subscription_charge_success",
    details: JSON.stringify({
      email,
      chargeId: payload.charge_id,
      amount: payload.amount,
      date: new Date().toISOString(),
    }),
  });

  return { success: true, userId };
}

export async function processSubscriptionCancellation(email: string, payload: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar usuario por email
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!user || user.length === 0) {
    throw new Error(`User not found with email: ${email}`);
  }

  const userId = user[0].id;

  // Actualizar estado a inactivo
  await db
    .update(users)
    .set({
      isActive: "inactive",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Registrar en auditoría
  await db.insert(auditLog).values({
    userId,
    action: "subscription_cancellation",
    details: JSON.stringify({
      email,
      subscriptionId: payload.subscription_id,
      date: new Date().toISOString(),
    }),
  });

  return { success: true, userId };
}

export async function processChargeRefund(email: string, payload: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar usuario por email
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!user || user.length === 0) {
    throw new Error(`User not found with email: ${email}`);
  }

  const userId = user[0].id;

  // Actualizar estado a inactivo
  await db
    .update(users)
    .set({
      isActive: "inactive",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Registrar en auditoría
  await db.insert(auditLog).values({
    userId,
    action: "charge_refund",
    details: JSON.stringify({
      email,
      chargeId: payload.charge_id,
      refundAmount: payload.refund_amount,
      date: new Date().toISOString(),
    }),
  });

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

export async function processPurchaseApproved(email: string, payload: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar usuario por email
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (!user || user.length === 0) {
    throw new Error(`User not found with email: ${email}`);
  }

  const userId = user[0].id;

  // Detectar si es suscripción o pago único
  const isRecurring = payload.product?.is_recurring || payload.subscription_id;
  const plan = isRecurring ? "monthly" : "lifetime";
  const isPriority = isRecurring ? 1 : 0;

  // Actualizar usuario
  await db
    .update(users)
    .set({
      isActive: "active",
      plan,
      isPriority,
      audioTranscriptionsThisMonth: 0,
      lastAudioResetDate: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  // Registrar en auditoría
  await db.insert(auditLog).values({
    userId,
    action: "purchase_approved",
    details: JSON.stringify({
      email,
      plan,
      isRecurring,
      productId: payload.product?.id,
      purchaseId: payload.purchase_id,
      amount: payload.amount,
      date: new Date().toISOString(),
    }),
  });

  return { success: true, userId, plan, isPriority };
}
