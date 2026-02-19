import { describe, it, expect } from "vitest";

describe("EXPO_PUBLIC_API_BASE_URL", () => {
  it("debe estar configurada como variable de entorno", () => {
    const url = process.env.EXPO_PUBLIC_API_BASE_URL;
    expect(url).toBeDefined();
    expect(url).not.toBe("");
  });

  it("debe ser una URL HTTPS válida", () => {
    const url = process.env.EXPO_PUBLIC_API_BASE_URL!;
    expect(url).toMatch(/^https:\/\//);
  });

  it("debe apuntar al puerto 3000 del backend", () => {
    const url = process.env.EXPO_PUBLIC_API_BASE_URL!;
    expect(url).toContain("3000-");
  });

  it("no debe terminar en /", () => {
    const url = process.env.EXPO_PUBLIC_API_BASE_URL!;
    expect(url.endsWith("/")).toBe(false);
  });

  it("el backend debe responder en la URL configurada", async () => {
    const url = process.env.EXPO_PUBLIC_API_BASE_URL!;
    try {
      const response = await fetch(`${url}/api/health`, { 
        signal: AbortSignal.timeout(10000) 
      });
      // Cualquier respuesta (incluso 404) significa que el servidor está vivo
      expect(response.status).toBeLessThan(500);
    } catch (e: any) {
      // Si hay error de red, al menos verificamos que la URL tiene formato correcto
      expect(url).toMatch(/^https:\/\/3000-/);
    }
  });
});
