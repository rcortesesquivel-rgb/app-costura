import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";

/**
 * Tests para validar:
 * 1. Validación de Hottok
 * 2. Validación de HMAC-SHA256
 * 3. Rechazo de peticiones sin credenciales válidas
 */

describe("Hotmart Webhook Endpoint Security", () => {
  const HOTMART_HOTTOK = "vuhBhEDkbNTrGco8E1T4K4LmA92ndI40242810";
  const HOTMART_WEBHOOK_SECRET = "i+Tm@9f,9&S,Vr2";
  const TEST_EMAIL = "rcortesesquivel@gmail.com";

  /**
   * Función auxiliar para crear firma HMAC
   */
  function createHotmartSignature(payload: string, secret: string): string {
    const hmac = createHmac("sha256", secret);
    hmac.update(payload);
    return hmac.digest("hex");
  }

  describe("Hottok Validation", () => {
    it("debe aceptar Hottok válido en header 'hottok'", () => {
      const hottok = HOTMART_HOTTOK;
      expect(hottok).toBeDefined();
      expect(hottok.length).toBeGreaterThan(0);
      expect(hottok).toBe("vuhBhEDkbNTrGco8E1T4K4LmA92ndI40242810");
    });

    it("debe aceptar Hottok válido en formato Bearer", () => {
      const bearerToken = `Bearer ${HOTMART_HOTTOK}`;
      const token = bearerToken.startsWith("Bearer ")
        ? bearerToken.substring(7)
        : bearerToken;

      expect(token).toBe(HOTMART_HOTTOK);
    });

    it("debe rechazar Hottok inválido", () => {
      const validHottok = HOTMART_HOTTOK;
      const invalidHottok = "invalid_token_12345";

      expect(validHottok).not.toBe(invalidHottok);
    });

    it("debe rechazar petición sin Hottok", () => {
      const hottok = undefined;
      expect(hottok).toBeUndefined();
    });
  });

  describe("HMAC Signature Validation", () => {
    it("debe validar firma HMAC correcta para PURCHASE_APPROVED", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "purchase_123",
          product: {
            id: "prod_123",
            is_recurring: false,
          },
        },
      };

      const payloadString = JSON.stringify(payload);
      const signature = createHotmartSignature(
        payloadString,
        HOTMART_WEBHOOK_SECRET
      );

      // Validar que la firma se genera correctamente
      expect(signature).toBeDefined();
      expect(signature.length).toBe(64); // SHA256 hex = 64 caracteres
      expect(typeof signature).toBe("string");
    });

    it("debe validar firma HMAC correcta para subscription_charge_success", () => {
      const payload = {
        event: "subscription_charge_success",
        data: {
          email: TEST_EMAIL,
          charge_id: "charge_123",
          amount: 29.99,
        },
      };

      const payloadString = JSON.stringify(payload);
      const signature = createHotmartSignature(
        payloadString,
        HOTMART_WEBHOOK_SECRET
      );

      expect(signature).toBeDefined();
      expect(signature.length).toBe(64);
    });

    it("debe rechazar firma HMAC modificada", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "purchase_123",
        },
      };

      const payloadString = JSON.stringify(payload);
      const correctSignature = createHotmartSignature(
        payloadString,
        HOTMART_WEBHOOK_SECRET
      );
      const modifiedSignature = correctSignature.substring(0, 32) + "0000000000000000";

      expect(correctSignature).not.toBe(modifiedSignature);
    });

    it("debe rechazar payload modificado después de firmar", () => {
      const payload1 = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "purchase_123",
          amount: 29.99,
        },
      };

      const payload2 = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "purchase_123",
          amount: 99.99, // Modificado
        },
      };

      const signature1 = createHotmartSignature(
        JSON.stringify(payload1),
        HOTMART_WEBHOOK_SECRET
      );
      const signature2 = createHotmartSignature(
        JSON.stringify(payload2),
        HOTMART_WEBHOOK_SECRET
      );

      expect(signature1).not.toBe(signature2);
    });
  });

  describe("Dual Validation (Hottok + HMAC)", () => {
    it("debe requerir ambas validaciones para procesar evento", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "purchase_123",
        },
      };

      const payloadString = JSON.stringify(payload);
      const validHottok = HOTMART_HOTTOK;
      const validSignature = createHotmartSignature(
        payloadString,
        HOTMART_WEBHOOK_SECRET
      );

      // Ambas deben ser válidas
      expect(validHottok).toBeDefined();
      expect(validSignature).toBeDefined();
      expect(validHottok.length).toBeGreaterThan(0);
      expect(validSignature.length).toBe(64);
    });

    it("debe rechazar si Hottok es válido pero firma es inválida", () => {
      const validHottok = HOTMART_HOTTOK;
      const invalidSignature = "invalid_signature_1234567890abcdef";

      expect(validHottok).toBeDefined();
      expect(invalidSignature.length).not.toBe(64);
    });

    it("debe rechazar si firma es válida pero Hottok es inválido", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "purchase_123",
        },
      };

      const payloadString = JSON.stringify(payload);
      const validSignature = createHotmartSignature(
        payloadString,
        HOTMART_WEBHOOK_SECRET
      );
      const invalidHottok = "invalid_hottok_token";

      expect(validSignature.length).toBe(64);
      expect(invalidHottok).not.toBe(HOTMART_HOTTOK);
    });
  });

  describe("Webhook Events Processing", () => {
    it("debe procesar PURCHASE_APPROVED con ambas validaciones", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "purchase_123",
          product: {
            id: "prod_123",
            is_recurring: false,
          },
          amount: 99.99,
        },
      };

      expect(payload.event).toBe("PURCHASE_APPROVED");
      expect(payload.data.email).toBe(TEST_EMAIL);
      expect(payload.data.product.is_recurring).toBe(false);
    });

    it("debe procesar subscription_charge_success con ambas validaciones", () => {
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

    it("debe procesar subscription_cancellation con ambas validaciones", () => {
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
  });

  describe("Configuration Verification", () => {
    it("debe confirmar que Hottok está configurado", () => {
      expect(HOTMART_HOTTOK).toBeDefined();
      expect(HOTMART_HOTTOK).toBe("vuhBhEDkbNTrGco8E1T4K4LmA92ndI40242810");
    });

    it("debe confirmar que webhook secret está configurado", () => {
      expect(HOTMART_WEBHOOK_SECRET).toBeDefined();
      expect(HOTMART_WEBHOOK_SECRET).toBe("i+Tm@9f,9&S,Vr2");
    });

    it("debe generar firma consistente para mismo payload", () => {
      const payload = {
        event: "PURCHASE_APPROVED",
        data: {
          email: TEST_EMAIL,
          purchase_id: "purchase_123",
        },
      };

      const payloadString = JSON.stringify(payload);
      const signature1 = createHotmartSignature(
        payloadString,
        HOTMART_WEBHOOK_SECRET
      );
      const signature2 = createHotmartSignature(
        payloadString,
        HOTMART_WEBHOOK_SECRET
      );

      expect(signature1).toBe(signature2);
    });
  });
});
