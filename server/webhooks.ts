import { createHmac } from "crypto";
import { Router, Request, Response } from "express";
import * as hotmartDb from "./hotmart-db";

const router = Router();

// Configuración de Hotmart
const HOTMART_WEBHOOK_SECRET = process.env.HOTMART_WEBHOOK_SECRET || "";

// ============ VALIDACIÓN DE FIRMA ============

/**
 * Valida la firma HMAC de Hotmart
 * Hotmart envía un header X-Hotmart-Signature con la firma HMAC-SHA256
 */
function validateHotmartSignature(
  payload: string,
  signature: string | undefined
): boolean {
  if (!signature || !HOTMART_WEBHOOK_SECRET) {
    console.error("Missing signature or webhook secret");
    return false;
  }

  try {
    // Crear HMAC-SHA256 del payload
    const hmac = createHmac("sha256", HOTMART_WEBHOOK_SECRET);
    hmac.update(payload);
    const expectedSignature = hmac.digest("hex");

    // Comparar firmas de forma segura (timing-safe)
    return expectedSignature === signature;
  } catch (error) {
    console.error("Error validating signature:", error);
    return false;
  }
}

// ============ ENDPOINTS ============

/**
 * POST /api/webhooks/hotmart
 * Recibe eventos de Hotmart y los procesa
 */
router.post("/hotmart", async (req: Request, res: Response) => {
  try {
    // Obtener la firma del header
    const signature = req.headers["x-hotmart-signature"] as string | undefined;

    // Obtener el payload como string (necesario para validar firma)
    const rawPayload = JSON.stringify(req.body);

    // Validar firma
    if (!validateHotmartSignature(rawPayload, signature)) {
      console.error("Invalid Hotmart webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const payload = req.body;
    const eventType = payload.event;
    const email = payload.data?.email || payload.data?.buyer?.email;

    if (!eventType || !email) {
      console.error("Missing event type or email in webhook payload");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Guardar evento en base de datos
    await hotmartDb.saveWebhookEvent(eventType, email, payload);

    // Procesar evento según tipo
    let webhookId: number | undefined;
    try {
      switch (eventType) {
        case "subscription_charge_success":
          await hotmartDb.processSubscriptionChargeSuccess(email, payload.data);
          break;

        case "subscription_cancellation":
          await hotmartDb.processSubscriptionCancellation(email, payload.data);
          break;

        case "charge_refund":
          await hotmartDb.processChargeRefund(email, payload.data);
          break;

        case "PURCHASE_APPROVED":
          await hotmartDb.processPurchaseApproved(email, payload.data);
          break;

        default:
          console.log(`Unhandled event type: ${eventType}`);
      }

      // Marcar webhook como procesado
      const webhooks = await hotmartDb.getUnprocessedWebhooks();
      const webhook = webhooks.find(w => w.email === email && w.eventType === eventType);
      if (webhook) {
        await hotmartDb.markWebhookAsProcessed(webhook.id);
      }

      // Responder con éxito
      return res.status(200).json({
        success: true,
        message: `Event ${eventType} processed successfully`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error processing webhook event ${eventType}:`, errorMessage);

      // Marcar webhook como procesado con error
      const webhooks = await hotmartDb.getUnprocessedWebhooks();
      const webhook = webhooks.find(w => w.email === email && w.eventType === eventType);
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
    console.error("Webhook processing error:", errorMessage);

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

  return res.status(200).json({
    status: "ok",
    webhookConfigured: hasSecret,
    message: hasSecret
      ? "Hotmart webhook is configured"
      : "Hotmart webhook secret is not configured",
  });
});

export default router;
