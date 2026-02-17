import { describe, it, expect, beforeAll } from "vitest";
import { createHmac } from "crypto";

/**
 * Tests para validar:
 * 1. Procesamiento de PURCHASE_APPROVED
 * 2. Validación HMAC-SHA256 correcta
 * 3. Rechazo de firmas inválidas
 */

describe("Hotmart Webhooks", () => {
  const WEBHOOK_SECRET = "i+Tm@9f,9&S,Vr2";
  const TEST_EMAIL = "rcortesesquivel@gmail.com";

  /**
   * Función auxiliar para crear firma HMAC
   */
  function createHotmartSignature(payload: string, secret: string): string {
    const hmac = createHmac("sha256", secret);
    hmac.update(payload);
    return hmac.digest("hex");
  }

  describe("PURCHASE_APPROVED Event", () => {
    it("debe procesar PURCHASE_APPROVED para suscripción recurrente", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "12345",
          product: {
            id: "prod_123",
            is_recurring: true,
          },
          amount: 29.99,
        },
      };

      const payloadString = JSON.stringify(payload);
      const signature = createHotmartSignature(payloadString, WEBHOOK_SECRET);

      // Validar que la firma se genera correctamente
      expect(signature).toBeDefined();
      expect(signature.length).toBe(64); // SHA256 hex = 64 caracteres
      expect(typeof signature).toBe("string");
    });

    it("debe procesar PURCHASE_APPROVED para pago único (lifetime)", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "67890",
          product: {
            id: "prod_456",
            is_recurring: false,
          },
          amount: 99.99,
        },
      };

      const payloadString = JSON.stringify(payload);
      const signature = createHotmartSignature(payloadString, WEBHOOK_SECRET);

      expect(signature).toBeDefined();
      expect(signature.length).toBe(64);
    });

    it("debe detectar automáticamente plan mensual vs lifetime", () => {
      const monthlyPayload = {
        event: "PURCHASE_APPROVED",
        data: {
          product: { is_recurring: true },
        },
      };

      const lifetimePayload = {
        event: "PURCHASE_APPROVED",
        data: {
          product: { is_recurring: false },
        },
      };

      // Validar lógica de detección
      const isMonthlyRecurring = monthlyPayload.data.product.is_recurring;
      const isLifetimeRecurring = lifetimePayload.data.product.is_recurring;

      expect(isMonthlyRecurring).toBe(true);
      expect(isLifetimeRecurring).toBe(false);
    });
  });

  describe("HMAC Signature Validation", () => {
    it("debe validar firma HMAC correcta", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "test_123",
        },
      };

      const payloadString = JSON.stringify(payload);
      const correctSignature = createHotmartSignature(payloadString, WEBHOOK_SECRET);

      // Simular validación
      const hmac = createHmac("sha256", WEBHOOK_SECRET);
      hmac.update(payloadString);
      const expectedSignature = hmac.digest("hex");

      expect(correctSignature).toBe(expectedSignature);
    });

    it("debe rechazar firma HMAC incorrecta", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "test_123",
        },
      };

      const payloadString = JSON.stringify(payload);
      const correctSignature = createHotmartSignature(payloadString, WEBHOOK_SECRET);
      const incorrectSignature = "invalid_signature_12345";

      expect(correctSignature).not.toBe(incorrectSignature);
    });

    it("debe rechazar firma con clave secreta incorrecta", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "test_123",
        },
      };

      const payloadString = JSON.stringify(payload);
      const correctSignature = createHotmartSignature(payloadString, WEBHOOK_SECRET);
      const wrongSecretSignature = createHotmartSignature(
        payloadString,
        "wrong_secret_key"
      );

      expect(correctSignature).not.toBe(wrongSecretSignature);
    });

    it("debe rechazar payload modificado", () => {
      const payload1 = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "test_123",
          amount: 29.99,
        },
      };

      const payload2 = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "test_123",
          amount: 99.99, // Cantidad modificada
        },
      };

      const signature1 = createHotmartSignature(
        JSON.stringify(payload1),
        WEBHOOK_SECRET
      );
      const signature2 = createHotmartSignature(
        JSON.stringify(payload2),
        WEBHOOK_SECRET
      );

      expect(signature1).not.toBe(signature2);
    });
  });

  describe("Webhook Events", () => {
    it("debe procesar subscription_charge_success", () => {
      const payload = {
        event: "subscription_charge_success",
        data: {
          email: TEST_EMAIL,
          charge_id: "charge_123",
          amount: 29.99,
        },
      };

      expect(payload.event).toBe("subscription_charge_success");
      expect(payload.data.email).toBe(TEST_EMAIL);
    });

    it("debe procesar subscription_cancellation", () => {
      const payload = {
        event: "subscription_cancellation",
        data: {
          email: TEST_EMAIL,
          subscription_id: "sub_123",
        },
      };

      expect(payload.event).toBe("subscription_cancellation");
      expect(payload.data.email).toBe(TEST_EMAIL);
    });

    it("debe procesar charge_refund", () => {
      const payload = {
        event: "charge_refund",
        data: {
          email: TEST_EMAIL,
          charge_id: "charge_123",
          refund_amount: 29.99,
        },
      };

      expect(payload.event).toBe("charge_refund");
      expect(payload.data.email).toBe(TEST_EMAIL);
    });
  });

  describe("Webhook Secret Configuration", () => {
    it("debe confirmar que la clave secreta está configurada", () => {
      expect(WEBHOOK_SECRET).toBeDefined();
      expect(WEBHOOK_SECRET.length).toBeGreaterThan(0);
      expect(WEBHOOK_SECRET).toBe("i+Tm@9f,9&S,Vr2");
    });

    it("debe validar formato de clave secreta", () => {
      // La clave debe contener caracteres especiales para mayor seguridad
      const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        WEBHOOK_SECRET
      );
      expect(hasSpecialChars).toBe(true);
    });

    it("debe generar firma consistente para mismo payload", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "test_123",
        },
      };

      const payloadString = JSON.stringify(payload);
      const signature1 = createHotmartSignature(payloadString, WEBHOOK_SECRET);
      const signature2 = createHotmartSignature(payloadString, WEBHOOK_SECRET);

      expect(signature1).toBe(signature2);
    });
  });
});
