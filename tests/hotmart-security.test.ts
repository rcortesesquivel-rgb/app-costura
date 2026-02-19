import { describe, it, expect } from "vitest";

describe("Hotmart Webhook Security", () => {
  const API_BASE = process.env.API_BASE_URL || "http://127.0.0.1:3000";
  const HOTMART_HOTTOK = process.env.HOTMART_HOTTOK || "";

  it("should reject webhook without hottok (403 Forbidden)", async () => {
    const response = await fetch(`${API_BASE}/api/webhooks/hotmart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "PURCHASE_APPROVED", data: {} }),
    });
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.error).toBe("Forbidden");
  });

  it("should reject webhook with invalid hottok (403 Forbidden)", async () => {
    const response = await fetch(`${API_BASE}/api/webhooks/hotmart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hotmart-hottok": "INVALID_TOKEN_12345",
      },
      body: JSON.stringify({ event: "PURCHASE_APPROVED", data: {} }),
    });
    expect(response.status).toBe(403);
  });

  it("should accept webhook with valid hottok (200 OK)", async () => {
    const response = await fetch(`${API_BASE}/api/webhooks/hotmart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hotmart-hottok": HOTMART_HOTTOK,
      },
      body: JSON.stringify({
        event: "PURCHASE_APPROVED",
        data: {
          buyer: { email: "test@example.com" },
          product: { id: 1 },
        },
      }),
    });
    expect(response.status).toBe(200);
  });
});
