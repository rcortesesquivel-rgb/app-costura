import { describe, it, expect } from "vitest";

describe("Webhook Trial - Solicitud de Prueba 48h", () => {
  const API_URL = "http://127.0.0.1:3000";

  describe("GET /api/webhooks/trial/status", () => {
    it("should return status ok", async () => {
      const res = await fetch(`${API_URL}/api/webhooks/trial/status`);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.status).toBe("ok");
      expect(data.endpoint).toBe("POST /api/webhooks/trial");
    });
  });

  describe("POST /api/webhooks/trial", () => {
    it("should reject request without email", async () => {
      const res = await fetch(`${API_URL}/api/webhooks/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should reject invalid email", async () => {
      const res = await fetch(`${API_URL}/api/webhooks/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "noesvalido" }),
      });
      const data = await res.json();
      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it("should activate 48h trial for valid email", async () => {
      const testEmail = `test-trial-${Date.now()}@test.com`;
      const res = await fetch(`${API_URL}/api/webhooks/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, nombre: "Test User" }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.email).toBe(testEmail);
      expect(data.status).toBe("prueba");
      expect(data.expiresAt).toBeDefined();

      // Verify expiration is ~48 hours from now
      const expiresAt = new Date(data.expiresAt);
      const now = new Date();
      const diffHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThan(47);
      expect(diffHours).toBeLessThan(49);
    });

    it("should accept email in 'correo' field", async () => {
      const testEmail = `test-correo-${Date.now()}@test.com`;
      const res = await fetch(`${API_URL}/api/webhooks/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: testEmail }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.email).toBe(testEmail);
    });

    it("should accept email in nested 'data.email' field", async () => {
      const testEmail = `test-data-${Date.now()}@test.com`;
      const res = await fetch(`${API_URL}/api/webhooks/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { email: testEmail } }),
      });
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.email).toBe(testEmail);
    });

    it("should extend trial if email already has active trial", async () => {
      const testEmail = `test-extend-${Date.now()}@test.com`;

      // First request
      const res1 = await fetch(`${API_URL}/api/webhooks/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data1 = await res1.json();
      expect(data1.success).toBe(true);

      // Second request - should extend
      const res2 = await fetch(`${API_URL}/api/webhooks/trial`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data2 = await res2.json();
      expect(data2.success).toBe(true);
      expect(data2.message).toContain("extendida");

      // Expiration should be later than first request
      const expires1 = new Date(data1.expiresAt);
      const expires2 = new Date(data2.expiresAt);
      expect(expires2.getTime()).toBeGreaterThan(expires1.getTime());
    });
  });
});
