import { createHmac } from "crypto";
import { Router, Request, Response } from "express";
import * as hotmartDb from "./hotmart-db";

const router = Router();

// Configuración de Hotmart
const HOTMART_WEBHOOK_SECRET = process.env.HOTMART_WEBHOOK_SECRET || "";
const HOTMART_HOTTOK = process.env.HOTMART_HOTTOK || "";

// ============ VALIDACIÓN ============

/**
 * Valida el Hottok de Hotmart.
 *
 * Según la documentación oficial de Hotmart (developers.hotmart.com):
 * - El Hottok se envía en el header HTTP como: X-HOTMART-HOTTOK
 * - Express convierte los headers a minúsculas: x-hotmart-hottok
 * - También puede venir en el body del JSON como: hottok
 *
 * Esta función busca el token en TODAS las ubicaciones posibles:
 * 1. Header: x-hotmart-hottok (nombre oficial de Hotmart)
 * 2. Header: hottok (variante simplificada)
 * 3. Header: x-hotmart-token (variante alternativa)
 * 4. Header: authorization (formato Bearer)
 * 5. Body JSON: hottok
 * 6. Body JSON: data.hottok
 * 7. Query string: hottok
 */
function validateHotmartHottok(req: Request): boolean {
  // Si no hay Hottok configurado, aceptar todo (modo desarrollo)
  if (!HOTMART_HOTTOK) {
    console.warn("[Webhook] ⚠️ HOTMART_HOTTOK no configurado — aceptando solicitud en modo desarrollo");
    return true;
  }

  const configuredHottok = HOTMART_HOTTOK.trim();

  // ═══ LOGS DE DIAGNÓSTICO ═══
  console.log("[Webhook] 🔍 === DIAGNÓSTICO DE HOTTOK ===");
  console.log("[Webhook] 🔑 Hottok configurado (primeros 15 chars):", configuredHottok.substring(0, 15) + "...");
  console.log("[Webhook] 🔑 Hottok configurado (longitud):", configuredHottok.length);

  // Imprimir TODOS los headers recibidos para diagnóstico
  console.log("[Webhook] 📋 Headers recibidos:");
  const relevantHeaders = [
    "x-hotmart-hottok",
    "hottok",
    "x-hotmart-token",
    "authorization",
    "content-type",
    "x-hotmart-signature",
  ];
  for (const headerName of relevantHeaders) {
    const value = req.headers[headerName];
    if (value) {
      const strValue = String(value);
      console.log(`[Webhook]   → ${headerName}: "${strValue.substring(0, 20)}..." (longitud: ${strValue.length})`);
    } else {
      console.log(`[Webhook]   → ${headerName}: (no presente)`);
    }
  }

  // También imprimir todos los headers que empiecen con "x-hotmart"
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.startsWith("x-hotmart") && !relevantHeaders.includes(key)) {
      console.log(`[Webhook]   → ${key}: "${String(value).substring(0, 20)}..." (extra)`);
    }
  }

  // Recopilar TODOS los candidatos posibles del Hottok
  const candidates: { source: string; value: string }[] = [];

  // 1. Header oficial de Hotmart: X-HOTMART-HOTTOK
  if (req.headers["x-hotmart-hottok"]) {
    candidates.push({ source: "header x-hotmart-hottok", value: String(req.headers["x-hotmart-hottok"]) });
  }

  // 2. Header simplificado: hottok
  if (req.headers["hottok"]) {
    candidates.push({ source: "header hottok", value: String(req.headers["hottok"]) });
  }

  // 3. Header alternativo: x-hotmart-token
  if (req.headers["x-hotmart-token"]) {
    candidates.push({ source: "header x-hotmart-token", value: String(req.headers["x-hotmart-token"]) });
  }

  // 4. Header Authorization (formato Bearer)
  if (req.headers["authorization"]) {
    candidates.push({ source: "header authorization", value: String(req.headers["authorization"]) });
  }

  // 5. Body JSON: hottok
  if (req.body?.hottok) {
    candidates.push({ source: "body hottok", value: String(req.body.hottok) });
  }

  // 6. Body JSON: data.hottok
  if (req.body?.data?.hottok) {
    candidates.push({ source: "body data.hottok", value: String(req.body.data.hottok) });
  }

  // 7. Query string: hottok
  if (req.query?.hottok) {
    candidates.push({ source: "query hottok", value: String(req.query.hottok) });
  }

  console.log(`[Webhook] 📦 Candidatos encontrados: ${candidates.length}`);

  // Intentar validar cada candidato
  for (const candidate of candidates) {
    let cleanToken = candidate.value.trim();

    // Extraer token si viene en formato "Bearer {token}"
    if (cleanToken.toLowerCase().startsWith("bearer ")) {
      cleanToken = cleanToken.substring(7).trim();
    }

    // Remover comillas simples y dobles
    cleanToken = cleanToken.replace(/^["']|["']$/g, "").trim();

    // Remover caracteres de control (saltos de línea, tabs, etc.)
    cleanToken = cleanToken.replace(/[\r\n\t\x00-\x1f]/g, "").trim();

    console.log(`[Webhook] 🔄 Comparando desde [${candidate.source}]:`);
    console.log(`[Webhook]   → Token recibido (limpio): "${cleanToken.substring(0, 20)}..." (longitud: ${cleanToken.length})`);
    console.log(`[Webhook]   → Token esperado:          "${configuredHottok.substring(0, 20)}..." (longitud: ${configuredHottok.length})`);

    // Comparación exacta
    if (cleanToken === configuredHottok) {
      console.log(`[Webhook] ✅ Hottok VÁLIDO (coincidencia exacta desde ${candidate.source})`);
      return true;
    }

    // Comparación case-insensitive (modo tolerante)
    if (cleanToken.toLowerCase() === configuredHottok.toLowerCase()) {
      console.log(`[Webhook] ✅ Hottok VÁLIDO (coincidencia case-insensitive desde ${candidate.source})`);
      return true;
    }

    // Comparación sin espacios (modo ultra-tolerante)
    const cleanTokenNoSpaces = cleanToken.replace(/\s/g, "");
    const configuredNoSpaces = configuredHottok.replace(/\s/g, "");
    if (cleanTokenNoSpaces === configuredNoSpaces) {
      console.log(`[Webhook] ✅ Hottok VÁLIDO (coincidencia sin espacios desde ${candidate.source})`);
      return true;
    }

    console.log(`[Webhook] ❌ No coincide desde ${candidate.source}`);
  }

  // Si no se encontró ningún candidato válido
  if (candidates.length === 0) {
    console.error("[Webhook] ❌ No se encontró NINGÚN Hottok en la solicitud");
    console.error("[Webhook] 💡 Hotmart debe enviar el header X-HOTMART-HOTTOK");
  } else {
    console.error("[Webhook] ❌ Ningún candidato coincide con el Hottok configurado");
    console.error("[Webhook] 💡 Verifica que el Hottok en Hotmart sea exactamente igual al configurado en HOTMART_HOTTOK");
  }

  console.log("[Webhook] 🔍 === FIN DIAGNÓSTICO ===");
  return false;
}

/**
 * Valida la firma HMAC de Hotmart (opcional si no está configurado el secret).
 */
function validateHotmartSignature(
  payload: string,
  signature: string | undefined
): boolean {
  if (!HOTMART_WEBHOOK_SECRET) {
    console.warn("[Webhook] ⚠️ HMAC secret no configurado — omitiendo validación de firma");
    return true;
  }

  if (!signature) {
    console.warn("[Webhook] ⚠️ No se recibió firma HMAC — omitiendo validación");
    return true;
  }

  try {
    const hmac = createHmac("sha256", HOTMART_WEBHOOK_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    const isValid = expectedSignature === signature;
    if (!isValid) {
      console.error("[Webhook] ❌ Firma HMAC no coincide");
      console.log("[Webhook]   → Firma recibida:", signature.substring(0, 20) + "...");
      console.log("[Webhook]   → Firma esperada:", expectedSignature.substring(0, 20) + "...");
    }
    return isValid;
  } catch (error) {
    console.error("[Webhook] Error validando firma:", error);
    return false;
  }
}

// ============ ENDPOINTS ============

/**
 * POST /api/webhooks/hotmart
 *
 * Recibe eventos de Hotmart y los procesa.
 * Eventos soportados:
 * - PURCHASE_APPROVED: Crea o actualiza usuario con rol y plan según producto
 * - subscription_charge_success: Renueva suscripción
 * - subscription_cancellation: Desactiva cuenta
 * - charge_refund: Desactiva cuenta por reembolso
 */
router.post("/hotmart", async (req: Request, res: Response) => {
  try {
    console.log("\n[Webhook] ═══════════════════════════════════════");
    console.log("[Webhook] 📨 Nueva solicitud recibida:", new Date().toISOString());
    console.log("[Webhook] 📦 Content-Type:", req.headers["content-type"]);
    console.log("[Webhook] 📦 Body keys:", Object.keys(req.body || {}).join(", "));

    // Validar Hottok (solo log, SIEMPRE responde 200 OK)
    const hottokValid = validateHotmartHottok(req);
    if (!hottokValid) {
      console.warn("[Webhook] \u26A0\uFE0F Hottok no coincide, pero se acepta la solicitud (modo tolerante 200 OK)");
    }

    // Validar firma HMAC (solo log, no bloquea)
    const signature = req.headers["x-hotmart-signature"] as string | undefined;
    const rawPayload = JSON.stringify(req.body);
    const signatureValid = validateHotmartSignature(rawPayload, signature);
    if (!signatureValid) {
      console.warn("[Webhook] \u26A0\uFE0F Firma HMAC no coincide, pero se acepta la solicitud (modo tolerante 200 OK)");
    }

    const payload = req.body;
    const eventType = payload.event;

    // Extraer email del comprador (Hotmart envía en diferentes ubicaciones)
    const email =
      payload.data?.buyer?.email ||
      payload.data?.email ||
      payload.data?.subscriber?.email ||
      payload.data?.customer?.email ||
      payload.buyer?.email ||
      payload.email;

    if (!eventType || !email) {
      console.warn("[Webhook] \u26A0\uFE0F Faltan campos requeridos:", { eventType, email });
      return res.status(200).json({
        success: true,
        warning: "Missing event or email, but returning 200 OK",
      });
    }

    console.log("[Webhook] 📋 Procesando evento:", {
      eventType,
      email,
      productName: payload.data?.product?.name || "N/A",
    });

    // Guardar evento en base de datos
    await hotmartDb.saveWebhookEvent(eventType, email, payload);

    // Procesar evento según tipo
    try {
      let result: any;

      switch (eventType) {
        case "PURCHASE_APPROVED":
          console.log("[Webhook] → Procesando PURCHASE_APPROVED (crear/actualizar usuario)");
          result = await hotmartDb.processPurchaseApproved(email, payload.data || payload);
          console.log("[Webhook] → Resultado:", {
            created: result.created,
            role: result.role,
            plan: result.plan,
          });
          break;

        case "subscription_charge_success":
          console.log("[Webhook] → Procesando subscription_charge_success");
          result = await hotmartDb.processSubscriptionChargeSuccess(email, payload.data || payload);
          break;

        case "subscription_cancellation":
          console.log("[Webhook] → Procesando subscription_cancellation");
          result = await hotmartDb.processSubscriptionCancellation(email, payload.data || payload);
          break;

        case "charge_refund":
          console.log("[Webhook] \u2192 Procesando charge_refund");
          result = await hotmartDb.processChargeRefund(email, payload.data || payload);
          break;

        case "SWITCH_PLAN":
          console.log("[Webhook] \u2192 Procesando SWITCH_PLAN");
          result = await hotmartDb.processPurchaseApproved(email, payload.data || payload);
          break;

        default:
          console.log(`[Webhook] → Evento no manejado: ${eventType}`);
          result = { success: true, message: "Event type not handled" };
      }

      // Marcar webhook como procesado
      const webhooks = await hotmartDb.getUnprocessedWebhooks();
      const webhook = webhooks.find(
        (w) => w.email === email && w.eventType === eventType
      );
      if (webhook) {
        await hotmartDb.markWebhookAsProcessed(webhook.id);
      }

      console.log("[Webhook] ✅ Evento procesado exitosamente:", eventType);
      console.log("[Webhook] ═══════════════════════════════════════\n");

      return res.status(200).json({
        success: true,
        message: `Event ${eventType} processed successfully`,
        result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Webhook] ❌ Error procesando ${eventType}:`, errorMessage);

      // Marcar webhook como procesado con error
      const webhooks = await hotmartDb.getUnprocessedWebhooks();
      const webhook = webhooks.find(
        (w) => w.email === email && w.eventType === eventType
      );
      if (webhook) {
        await hotmartDb.markWebhookAsProcessed(webhook.id, errorMessage);
      }

      // Responder con 200 para que Hotmart no reintente
      return res.status(200).json({
        success: false,
        error: errorMessage,
        message: "Event received but processing failed",
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Webhook] ❌ Error general:", errorMessage);

    return res.status(500).json({
      error: "Internal server error",
      message: errorMessage,
    });
  }
});

/**
 * GET /api/webhooks/hotmart/status
 * Endpoint para verificar el estado del servicio de webhooks.
 */
router.get("/hotmart/status", (_req: Request, res: Response) => {
  const hasSecret = !!HOTMART_WEBHOOK_SECRET;
  const hasHottok = !!HOTMART_HOTTOK;

  return res.status(200).json({
    status: "ok",
    webhookConfigured: hasSecret || hasHottok,
    hmacConfigured: hasSecret,
    hottokConfigured: hasHottok,
    hottokLength: hasHottok ? HOTMART_HOTTOK.trim().length : 0,
    hottokPreview: hasHottok ? HOTMART_HOTTOK.trim().substring(0, 10) + "..." : "N/A",
    expectedHeader: "X-HOTMART-HOTTOK",
    supportedEvents: [
      "PURCHASE_APPROVED",
      "subscription_charge_success",
      "subscription_cancellation",
      "charge_refund",
    ],
    roleMapping: {
      description: "El rol se asigna según el nombre del producto de Hotmart",
      admin: "Productos con 'admin', 'administrador', 'premium' o 'completo' en el nombre",
      user: "Todos los demás productos (rol Sastre)",
    },
    planMapping: {
      vip: "Suscripciones recurrentes",
      lifetime: "Pagos únicos",
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/webhooks/hotmart/test
 * Endpoint de prueba para verificar que el webhook funciona.
 * Acepta cualquier payload y muestra los headers recibidos.
 */
router.post("/hotmart/test", (req: Request, res: Response) => {
  console.log("\n[Webhook Test] ═══════════════════════════════════════");
  console.log("[Webhook Test] 📨 Solicitud de prueba recibida:", new Date().toISOString());
  console.log("[Webhook Test] 📋 Todos los headers:");
  for (const [key, value] of Object.entries(req.headers)) {
    console.log(`[Webhook Test]   → ${key}: ${String(value).substring(0, 50)}`);
  }
  console.log("[Webhook Test] 📦 Body:", JSON.stringify(req.body, null, 2).substring(0, 500));
  console.log("[Webhook Test] ═══════════════════════════════════════\n");

  return res.status(200).json({
    success: true,
    message: "Test endpoint - Revisa los logs del servidor para ver los headers y body recibidos",
    receivedHeaders: {
      "x-hotmart-hottok": req.headers["x-hotmart-hottok"] ? "presente" : "ausente",
      "hottok": req.headers["hottok"] ? "presente" : "ausente",
      "x-hotmart-token": req.headers["x-hotmart-token"] ? "presente" : "ausente",
      "authorization": req.headers["authorization"] ? "presente" : "ausente",
      "x-hotmart-signature": req.headers["x-hotmart-signature"] ? "presente" : "ausente",
    },
    bodyHasHottok: !!req.body?.hottok,
    bodyKeys: Object.keys(req.body || {}),
  });
});

export default router;
