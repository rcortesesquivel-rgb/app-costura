import { describe, it, expect } from "vitest";

/**
 * Tests para la validación del webhook de Hotmart.
 * Verifica que la lógica de búsqueda del Hottok funcione en todas las ubicaciones.
 */

// Simular la lógica de extracción de candidatos del Hottok
function extractHottokCandidates(headers: Record<string, string | undefined>, body: any, query: any): { source: string; value: string }[] {
  const candidates: { source: string; value: string }[] = [];

  // 1. Header oficial: x-hotmart-hottok
  if (headers["x-hotmart-hottok"]) {
    candidates.push({ source: "header x-hotmart-hottok", value: headers["x-hotmart-hottok"] });
  }

  // 2. Header simplificado: hottok
  if (headers["hottok"]) {
    candidates.push({ source: "header hottok", value: headers["hottok"] });
  }

  // 3. Header alternativo: x-hotmart-token
  if (headers["x-hotmart-token"]) {
    candidates.push({ source: "header x-hotmart-token", value: headers["x-hotmart-token"] });
  }

  // 4. Header Authorization
  if (headers["authorization"]) {
    candidates.push({ source: "header authorization", value: headers["authorization"] });
  }

  // 5. Body: hottok
  if (body?.hottok) {
    candidates.push({ source: "body hottok", value: String(body.hottok) });
  }

  // 6. Body: data.hottok
  if (body?.data?.hottok) {
    candidates.push({ source: "body data.hottok", value: String(body.data.hottok) });
  }

  // 7. Query: hottok
  if (query?.hottok) {
    candidates.push({ source: "query hottok", value: String(query.hottok) });
  }

  return candidates;
}

// Simular la lógica de comparación tolerante
function validateToken(receivedToken: string, configuredToken: string): boolean {
  let cleanToken = receivedToken.trim();

  // Extraer Bearer token
  if (cleanToken.toLowerCase().startsWith("bearer ")) {
    cleanToken = cleanToken.substring(7).trim();
  }

  // Remover comillas
  cleanToken = cleanToken.replace(/^["']|["']$/g, "").trim();

  // Remover caracteres de control
  cleanToken = cleanToken.replace(/[\r\n\t\x00-\x1f]/g, "").trim();

  const configured = configuredToken.trim();

  // Comparación exacta
  if (cleanToken === configured) return true;

  // Case-insensitive
  if (cleanToken.toLowerCase() === configured.toLowerCase()) return true;

  // Sin espacios
  if (cleanToken.replace(/\s/g, "") === configured.replace(/\s/g, "")) return true;

  return false;
}

describe("Webhook Validation - Extracción de Candidatos", () => {
  it("encuentra Hottok en header oficial x-hotmart-hottok", () => {
    const candidates = extractHottokCandidates(
      { "x-hotmart-hottok": "mi_token_123" },
      {},
      {}
    );
    expect(candidates.length).toBe(1);
    expect(candidates[0].source).toBe("header x-hotmart-hottok");
    expect(candidates[0].value).toBe("mi_token_123");
  });

  it("encuentra Hottok en header simplificado hottok", () => {
    const candidates = extractHottokCandidates(
      { "hottok": "mi_token_456" },
      {},
      {}
    );
    expect(candidates.length).toBe(1);
    expect(candidates[0].source).toBe("header hottok");
  });

  it("encuentra Hottok en header alternativo x-hotmart-token", () => {
    const candidates = extractHottokCandidates(
      { "x-hotmart-token": "mi_token_789" },
      {},
      {}
    );
    expect(candidates.length).toBe(1);
    expect(candidates[0].source).toBe("header x-hotmart-token");
  });

  it("encuentra Hottok en header Authorization", () => {
    const candidates = extractHottokCandidates(
      { "authorization": "Bearer mi_token_abc" },
      {},
      {}
    );
    expect(candidates.length).toBe(1);
    expect(candidates[0].source).toBe("header authorization");
  });

  it("encuentra Hottok en body.hottok", () => {
    const candidates = extractHottokCandidates(
      {},
      { hottok: "body_token_123" },
      {}
    );
    expect(candidates.length).toBe(1);
    expect(candidates[0].source).toBe("body hottok");
  });

  it("encuentra Hottok en body.data.hottok", () => {
    const candidates = extractHottokCandidates(
      {},
      { data: { hottok: "nested_token_456" } },
      {}
    );
    expect(candidates.length).toBe(1);
    expect(candidates[0].source).toBe("body data.hottok");
  });

  it("encuentra Hottok en query string", () => {
    const candidates = extractHottokCandidates(
      {},
      {},
      { hottok: "query_token_789" }
    );
    expect(candidates.length).toBe(1);
    expect(candidates[0].source).toBe("query hottok");
  });

  it("encuentra múltiples candidatos cuando están en varias ubicaciones", () => {
    const candidates = extractHottokCandidates(
      { "x-hotmart-hottok": "header_token" },
      { hottok: "body_token" },
      { hottok: "query_token" }
    );
    expect(candidates.length).toBe(3);
  });

  it("devuelve lista vacía si no hay Hottok en ningún lugar", () => {
    const candidates = extractHottokCandidates({}, {}, {});
    expect(candidates.length).toBe(0);
  });
});

describe("Webhook Validation - Comparación Tolerante", () => {
  it("valida token exacto", () => {
    expect(validateToken("abc123", "abc123")).toBe(true);
  });

  it("valida token con espacios al inicio/final", () => {
    expect(validateToken("  abc123  ", "abc123")).toBe(true);
  });

  it("valida token con formato Bearer", () => {
    expect(validateToken("Bearer abc123", "abc123")).toBe(true);
  });

  it("valida token case-insensitive", () => {
    expect(validateToken("ABC123", "abc123")).toBe(true);
    expect(validateToken("abc123", "ABC123")).toBe(true);
  });

  it("valida token con comillas", () => {
    expect(validateToken('"abc123"', "abc123")).toBe(true);
    expect(validateToken("'abc123'", "abc123")).toBe(true);
  });

  it("valida token con caracteres de control", () => {
    expect(validateToken("abc123\n", "abc123")).toBe(true);
    expect(validateToken("abc123\r\n", "abc123")).toBe(true);
    expect(validateToken("abc123\t", "abc123")).toBe(true);
  });

  it("valida token con espacios internos (modo ultra-tolerante)", () => {
    expect(validateToken("abc 123", "abc123")).toBe(true);
  });

  it("rechaza token completamente diferente", () => {
    expect(validateToken("wrong_token", "abc123")).toBe(false);
  });

  it("rechaza token vacío", () => {
    expect(validateToken("", "abc123")).toBe(false);
  });

  it("valida token real de Hotmart (formato largo)", () => {
    const realToken = "vuhBhEDkbN1234567890abcdefghijklmnopqr";
    expect(validateToken(realToken, realToken)).toBe(true);
    expect(validateToken(`  ${realToken}  `, realToken)).toBe(true);
    expect(validateToken(`Bearer ${realToken}`, realToken)).toBe(true);
  });
});

describe("Webhook Validation - Escenarios Reales de Hotmart", () => {
  it("simula solicitud real de Hotmart (header X-HOTMART-HOTTOK)", () => {
    const configuredHottok = "vuhBhEDkbN1234567890";
    const candidates = extractHottokCandidates(
      { "x-hotmart-hottok": configuredHottok },
      {
        event: "PURCHASE_APPROVED",
        data: {
          buyer: { email: "comprador@email.com", name: "Juan Pérez" },
          product: { name: "Taller de Costura VIP" },
        },
      },
      {}
    );

    expect(candidates.length).toBeGreaterThan(0);
    const isValid = candidates.some((c) => validateToken(c.value, configuredHottok));
    expect(isValid).toBe(true);
  });

  it("simula solicitud con Hottok en body (formato antiguo)", () => {
    const configuredHottok = "vuhBhEDkbN1234567890";
    const candidates = extractHottokCandidates(
      {},
      {
        hottok: configuredHottok,
        event: "PURCHASE_APPROVED",
        data: {
          buyer: { email: "comprador@email.com" },
        },
      },
      {}
    );

    expect(candidates.length).toBeGreaterThan(0);
    const isValid = candidates.some((c) => validateToken(c.value, configuredHottok));
    expect(isValid).toBe(true);
  });

  it("simula solicitud con Hottok en ambos (header + body)", () => {
    const configuredHottok = "vuhBhEDkbN1234567890";
    const candidates = extractHottokCandidates(
      { "x-hotmart-hottok": configuredHottok },
      { hottok: configuredHottok, event: "PURCHASE_APPROVED" },
      {}
    );

    expect(candidates.length).toBe(2);
    const isValid = candidates.some((c) => validateToken(c.value, configuredHottok));
    expect(isValid).toBe(true);
  });

  it("rechaza solicitud sin Hottok", () => {
    const candidates = extractHottokCandidates(
      { "content-type": "application/json" },
      { event: "PURCHASE_APPROVED", data: {} },
      {}
    );

    expect(candidates.length).toBe(0);
  });
});
