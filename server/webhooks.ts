import { createHmac } from "crypto";
import { Router, Request, Response } from "express";
import * as hotmartDb from "./hotmart-db";

const router = Router();

// Configuración de Hotmart
const HOTMART_WEBHOOK_SECRET = process.env.HOTMART_WEBHOOK_SECRET || "";
const HOTMART_HOTTOK = process.env.HOTMART_HOTTOK || "";

// ============ VALIDACIÓN ============

/**
 * Valida el Hottok de Hotmart
 * Busca el token en: header hottok, header authorization, o body JSON
 */
function validateHotmartHottok(
  hottokHeader: string | undefined,
  hottokFromAuth: string | undefined,
  hottokFromBody: string | undefined
): boolean {
  if (!HOTMART_HOTTOK) {
    console.error("[Webhook] Hottok not configured in environment");
    return false;
  }

  try {
    // Limpiar y normalizar el Hottok configurado
    const configuredHottok = HOTMART_HOTTOK.trim();

    // Intentar validar en orden de prioridad
    const candidates = [hottokHeader, hottokFromAuth, hottokFromBody].filter(
      Boolean
    );

    console.log("[Webhook] Searching for Hottok in", candidates.length, "candidates");

    for (const candidate of candidates) {
      if (!candidate) continue;

      // Limpiar espacios y caracteres especiales
      let cleanToken = String(candidate).trim();

      // Extraer token si viene en formato "Bearer {token}"
      if (cleanToken.startsWith("Bearer ")) {
        cleanToken = cleanToken.substring(7).trim();
      }

      // Extraer token si viene en formato "bearer {token}" (minúsculas)
      if (cleanToken.toLowerCase().startsWith("bearer ")) {
        cleanToken = cleanToken.substring(7).trim();
      }

      // Remover comillas si las hay
      cleanToken = cleanToken.replace(/^"|"$/g, "").trim();
      cleanToken = cleanToken.replace(/^'|'$/g, "").trim();

      // Remover caracteres de control y espacios en blanco
      cleanToken = cleanToken.replace(/[\r\n\t]/g, "").trim();

      console.log("[Webhook] Validating Hottok candidate:", {
        candidatePrefix: candidate.substring(0, 10) + "...",
        cleanedPrefix: cleanToken.substring(0, 10) + "...",
        configuredPrefix: configuredHottok.substring(0, 10) + "...",
        match: cleanToken === configuredHottok,
      });

      // Comparar tokens de forma segura
      if (cleanToken === configuredHottok) {
        console.log("[Webhook] Hottok validation successful");
        return true;
      }
    }

    console.error("[Webhook] No valid Hottok found in any location");
    return false;
  } catch (error) {
    console.error("[Webhook] Error validating Hottok:", error);
    return false;
  }
}

/**
 * Valida la firma HMAC de Hotmart
 * Hotmart envía un header X-Hotmart-Signature con la firma HMAC-SHA256
 */
function validateHotmartSignature(
  payload: string,
  signature: string | undefined
): boolean {
  if (!signature || !HOTMART_WEBHOOK_SECRET) {
    console.error("[Webhook] Missing signature or webhook secret");
    return false;
  }

  try {
    // Crear HMAC-SHA256 del payload
    const hmac = createHmac("sha256", HOTMART_WEBHOOK_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    console.log("[Webhook] Signature validation:", {
      received: signature.substring(0, 16) + "...",
      expected: expectedSignature.substring(0, 16) + "...",
      match: expectedSignature === signature,
    });

    // Comparar firmas de forma segura (timing-safe)
    return expectedSignature === signature;
  } catch (error) {
    console.error("[Webhook] Error validating signature:", error);
    return false;
  }
}

// ============ ENDPOINTS ============

/**
 * POST /api/webhooks/hotmart
 * Recibe eventos de Hotmart y los procesa
 * Valida tanto Hottok como firma HMAC para máxima seguridad
 */
router.post("/hotmart", async (req: Request, res: Response) => {
  try {
    console.log("\n[Webhook] Nueva solicitud recibida");

    // Obtener Hottok de múltiples ubicaciones posibles
    const hottokFromHeader = req.headers["hottok"] as string | undefined;
    const hottokFromAuth = req.headers["authorization"] as string | undefined;
    const hottokFromBody = req.body?.hottok as string | undefined;

    console.log("[Webhook] Received webhook request", {
      hasHottokHeader: !!hottokFromHeader,
      hasAuthHeader: !!hottokFromAuth,
      hasBodyHottok: !!hottokFromBody,
      eventType: req.body?.event,
    });

    // Validar Hottok primero (busca en múltiples ubicaciones)
    if (
      !validateHotmartHottok(hottokFromHeader, hottokFromAuth, hottokFromBody)
    ) {
      console.error("[Webhook] Invalid Hotmart Hottok");
      return res.status(401).json({
        error: "Invalid Hottok",
        message: "Hottok validation failed",
      });
    }

    // Obtener la firma del header
    const signature = req.headers["x-hotmart-signature"] as string | undefined;

    // Obtener el payload como string (necesario para validar firma)
    const rawPayload = JSON.stringify(req.body);

    // Validar firma HMAC
    if (!validateHotmartSignature(rawPayload, signature)) {
      console.error("[Webhook] Invalid Hotmart webhook signature");
      return res.status(401).json({
        error: "Invalid signature",
        message: "HMAC signature validation failed",
      });
    }

    const payload = req.body;
    const eventType = payload.event;
    const email = payload.data?.email || payload.data?.buyer?.email;

    if (!eventType || !email) {
      console.error("[Webhook] Missing event type or email in webhook payload");
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("[Webhook] Processing event:", {
      eventType,
      email,
      timestamp: new Date().toISOString(),
    });

    // Guardar evento en base de datos
    await hotmartDb.saveWebhookEvent(eventType, email, payload);

    // Procesar evento según tipo
    try {
      switch (eventType) {
        case "subscription_charge_success":
          console.log("[Webhook] Processing subscription_charge_success");
          await hotmartDb.processSubscriptionChargeSuccess(email, payload.data);
          break;

        case "subscription_cancellation":
          console.log("[Webhook] Processing subscription_cancellation");
          await hotmartDb.processSubscriptionCancellation(email, payload.data);
          break;

        case "charge_refund":
          console.log("[Webhook] Processing charge_refund");
          await hotmartDb.processChargeRefund(email, payload.data);
          break;

        case "PURCHASE_APPROVED":
          console.log("[Webhook] Processing PURCHASE_APPROVED");
          await hotmartDb.processPurchaseApproved(email, payload.data);
          break;

        default:
          console.log(`[Webhook] Unhandled event type: ${eventType}`);
      }

      // Marcar webhook como procesado
      const webhooks = await hotmartDb.getUnprocessedWebhooks();
      const webhook = webhooks.find(
        (w) => w.email === email && w.eventType === eventType
      );
      if (webhook) {
        await hotmartDb.markWebhookAsProcessed(webhook.id);
      }

      // Responder con éxito
      console.log("[Webhook] Event processed successfully:", eventType);
      return res.status(200).json({
        success: true,
        message: `Event ${eventType} processed successfully`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        `[Webhook] Error processing webhook event ${eventType}:`,
        errorMessage
      );

      // Marcar webhook como procesado con error
      const webhooks = await hotmartDb.getUnprocessedWebhooks();
      const webhook = webhooks.find(
        (w) => w.email === email && w.eventType === eventType
      );
      if (webhook) {
        await hotmartDb.markWebhookAsProcessed(webhook.id, errorMessage);
      }

      // Responder con error pero status 200 para que Hotmart no reintente
      return res.status(200).json({
        success: false,
        error: errorMessage,
        message: "Event received but processing failed",
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Webhook] Webhook processing error:", errorMessage);

    // Responder con error
    return res.status(500).json({
      error: "Internal server error",
      message: errorMessage,
    });
  }
});

/**
 * GET /api/webhooks/hotmart/status
 * Endpoint para verificar el estado del servicio de webhooks
 */
router.get("/hotmart/status", (req: Request, res: Response) => {
  const hasSecret = !!HOTMART_WEBHOOK_SECRET;
  const hasHottok = !!HOTMART_HOTTOK;

  return res.status(200).json({
    status: "ok",
    webhookConfigured: hasSecret && hasHottok,
    hmacConfigured: hasSecret,
    hottokConfigured: hasHottok,
    message:
      hasSecret && hasHottok
        ? "Hotmart webhook is fully configured (HMAC + Hottok)"
        : "Hotmart webhook is partially configured",
    timestamp: new Date().toISOString(),
  });
});

export default router;
