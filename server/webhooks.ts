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
 * Busca el token en: header hottok, header authorization, o body JSON.
 */
function validateHotmartHottok(
  hottokHeader: string | undefined,
  hottokFromAuth: string | undefined,
  hottokFromBody: string | undefined
): boolean {
  if (!HOTMART_HOTTOK) {
    // Si no hay Hottok configurado, aceptar (modo desarrollo)
    console.warn("[Webhook] Hottok not configured — accepting request in dev mode");
    return true;
  }

  try {
    const configuredHottok = HOTMART_HOTTOK.trim();
    const candidates = [hottokHeader, hottokFromAuth, hottokFromBody].filter(Boolean);

    for (const candidate of candidates) {
      if (!candidate) continue;

      let cleanToken = String(candidate).trim();

      // Extraer token si viene en formato "Bearer {token}"
      if (cleanToken.toLowerCase().startsWith("bearer ")) {
        cleanToken = cleanToken.substring(7).trim();
      }

      // Remover comillas
      cleanToken = cleanToken.replace(/^"|"$/g, "").replace(/^'|'$/g, "").trim();
      cleanToken = cleanToken.replace(/[\r\n\t]/g, "").trim();

      if (cleanToken === configuredHottok) {
        console.log("[Webhook] ✓ Hottok validation successful");
        return true;
      } else {
        console.log("[Webhook] Hottok no coincide:", {
          received: cleanToken.substring(0, 10) + "...",
          expected: configuredHottok.substring(0, 10) + "...",
        });
      }
    }

    console.error("[Webhook] No valid Hottok found");
    return false;
  } catch (error) {
    console.error("[Webhook] Error validating Hottok:", error);
    return false;
  }
}

/**
 * Valida la firma HMAC de Hotmart (opcional si no está configurado el secret).
 */
function validateHotmartSignature(
  payload: string,
  signature: string | undefined
): boolean {
  if (!HOTMART_WEBHOOK_SECRET) {
    // Si no hay secret configurado, aceptar (modo desarrollo)
    console.warn("[Webhook] HMAC secret not configured — skipping signature validation");
    return true;
  }

  if (!signature) {
    console.warn("[Webhook] No signature provided — skipping HMAC validation");
    return true;
  }

  try {
    const hmac = createHmac("sha256", HOTMART_WEBHOOK_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("[Webhook] Error validating signature:", error);
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
    console.log("[Webhook] Nueva solicitud recibida:", new Date().toISOString());

    // Obtener Hottok de múltiples ubicaciones posibles
    // Hotmart envía el Hottok en el header x-hotmart-token
    const hottokFromHeader = (req.headers["x-hotmart-token"] || req.headers["hottok"]) as string | undefined;
    const hottokFromAuth = req.headers["authorization"] as string | undefined;
    const hottokFromBody = req.body?.hottok as string | undefined;

    console.log("[Webhook] Headers recibidos:", {
      "x-hotmart-token": hottokFromHeader ? "***" : "no recibido",
      "authorization": hottokFromAuth ? "***" : "no recibido",
      "x-hotmart-signature": req.headers["x-hotmart-signature"] ? "***" : "no recibido",
    });

    // Validar Hottok
    if (!validateHotmartHottok(hottokFromHeader, hottokFromAuth, hottokFromBody)) {
      console.error("[Webhook] Hottok inválido");
      return res.status(401).json({
        error: "Invalid Hottok",
        message: "Hottok validation failed",
      });
    }

    // Validar firma HMAC (opcional)
    const signature = req.headers["x-hotmart-signature"] as string | undefined;
    const rawPayload = JSON.stringify(req.body);

    if (!validateHotmartSignature(rawPayload, signature)) {
      console.error("[Webhook] Firma HMAC inválida");
      return res.status(401).json({
        error: "Invalid signature",
        message: "HMAC signature validation failed",
      });
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
      console.error("[Webhook] Faltan campos requeridos:", { eventType, email });
      return res.status(400).json({
        error: "Missing required fields",
        message: "event and email are required",
      });
    }

    console.log("[Webhook] Procesando evento:", {
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
          console.log("[Webhook] → Procesando charge_refund");
          result = await hotmartDb.processChargeRefund(email, payload.data || payload);
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

      console.log("[Webhook] ✓ Evento procesado exitosamente:", eventType);
      console.log("[Webhook] ═══════════════════════════════════════\n");

      return res.status(200).json({
        success: true,
        message: `Event ${eventType} processed successfully`,
        result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Webhook] ✗ Error procesando ${eventType}:`, errorMessage);

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
    console.error("[Webhook] Error general:", errorMessage);

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

export default router;
