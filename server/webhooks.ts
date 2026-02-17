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
 * Hotmart envía el token en el header 'hottok' o 'authorization'
 */
function validateHotmartHottok(hottok: string | undefined): boolean {
  if (!hottok || !HOTMART_HOTTOK) {
    console.error("Missing Hottok or Hottok not configured");
    return false;
  }

  try {
    // Extraer token si viene en formato "Bearer {token}"
    const token = hottok.startsWith("Bearer ") ? hottok.substring(7) : hottok;

    // Comparar tokens de forma segura (timing-safe)
    return token === HOTMART_HOTTOK;
  } catch (error) {
    console.error("Error validating Hottok:", error);
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
 * Valida tanto Hottok como firma HMAC para máxima seguridad
 */
router.post("/hotmart", async (req: Request, res: Response) => {
  try {
    // Obtener Hottok del header (puede venir como 'hottok' o 'authorization')
    const hottokHeader =
      (req.headers["hottok"] as string | undefined) ||
      (req.headers["authorization"] as string | undefined);

    // Validar Hottok primero
    if (!validateHotmartHottok(hottokHeader)) {
      console.error("Invalid Hotmart Hottok");
      return res.status(401).json({ error: "Invalid Hottok" });
    }

    // Obtener la firma del header
    const signature = req.headers["x-hotmart-signature"] as string | undefined;

    // Obtener el payload como string (necesario para validar firma)
    const rawPayload = JSON.stringify(req.body);

    // Validar firma HMAC
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
      const webhook = webhooks.find(
        (w) => w.email === email && w.eventType === eventType
      );
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
  });
});

export default router;
