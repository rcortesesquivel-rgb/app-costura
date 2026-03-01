import { describe, it, expect } from "vitest";

describe("EXPO_PUBLIC_API_BASE_URL - Railway Backend", () => {
  it("debe estar configurada como variable de entorno", () => {
    const url = process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(url).toBeDefined();
    expect(url).not.toBe("");
  });

  it("debe ser una URL HTTPS válida de Railway", () => {
    const url = process.env.EXPO_PUBLIC_API_BASE_URL!;
    expect(url).toMatch(/^https:\/\//);
    expect(url).toContain("railway.app");
  });

  it("el backend de Railway debe responder en /api/health", async () => {
    const url = process.env.EXPO_PUBLIC_API_BASE_URL!;
    const response = await fetch(`${url}/api/health`, {
      signal: AbortSignal.timeout(15000),
    });
    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data.ok).toBe(true);
  }, 20000);
});
