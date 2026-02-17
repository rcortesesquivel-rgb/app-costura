import { describe, it, expect } from "vitest";

/**
 * Tests para la lógica de asignación de roles y planes del webhook de Hotmart.
 * Replica la función determineRoleAndPlan del servidor para validar la lógica.
 */

function determineRoleAndPlan(payload: any): {
  role: "user" | "admin";
  plan: "basic" | "vip" | "lifetime";
  isPriority: number;
} {
  const productName = (
    payload?.product?.name ||
    payload?.product_name ||
    payload?.offer?.name ||
    ""
  ).toLowerCase();

  const isRecurring = !!(payload?.product?.is_recurring || payload?.subscription_id);

  const isAdminProduct =
    productName.includes("admin") ||
    productName.includes("administrador") ||
    productName.includes("premium") ||
    productName.includes("completo");

  const role: "user" | "admin" = isAdminProduct ? "admin" : "user";
  const plan: "basic" | "vip" | "lifetime" = isRecurring ? "vip" : "lifetime";
  const isPriority = isRecurring ? 1 : 0;

  return { role, plan, isPriority };
}

describe("Hotmart Webhook - determineRoleAndPlan", () => {
  it("asigna rol 'user' (Sastre) para productos normales con suscripción", () => {
    const result = determineRoleAndPlan({
      product: { name: "Plan Sastre Mensual", is_recurring: true },
      subscription_id: "sub_001",
    });
    expect(result.role).toBe("user");
    expect(result.plan).toBe("vip");
    expect(result.isPriority).toBe(1);
  });

  it("asigna rol 'user' (Sastre) para productos normales con pago único", () => {
    const result = determineRoleAndPlan({
      product: { name: "Plan Sastre Anual", is_recurring: false },
    });
    expect(result.role).toBe("user");
    expect(result.plan).toBe("lifetime");
    expect(result.isPriority).toBe(0);
  });

  it("asigna rol 'admin' para productos con 'administrador' en el nombre", () => {
    const result = determineRoleAndPlan({
      product: { name: "Plan Administrador Completo", is_recurring: true },
      subscription_id: "sub_002",
    });
    expect(result.role).toBe("admin");
    expect(result.plan).toBe("vip");
    expect(result.isPriority).toBe(1);
  });

  it("asigna rol 'admin' para productos con 'admin' en el nombre", () => {
    const result = determineRoleAndPlan({
      product: { name: "Taller Admin Pro", is_recurring: false },
    });
    expect(result.role).toBe("admin");
    expect(result.plan).toBe("lifetime");
    expect(result.isPriority).toBe(0);
  });

  it("asigna rol 'admin' para productos con 'premium' en el nombre", () => {
    const result = determineRoleAndPlan({
      product: { name: "Acceso Premium", is_recurring: true },
      subscription_id: "sub_003",
    });
    expect(result.role).toBe("admin");
    expect(result.plan).toBe("vip");
  });

  it("asigna rol 'admin' para productos con 'completo' en el nombre", () => {
    const result = determineRoleAndPlan({
      product: { name: "Paquete Completo Taller", is_recurring: false },
    });
    expect(result.role).toBe("admin");
    expect(result.plan).toBe("lifetime");
  });

  it("maneja payload vacío sin errores", () => {
    const result = determineRoleAndPlan({});
    expect(result.role).toBe("user");
    expect(result.plan).toBe("lifetime");
    expect(result.isPriority).toBe(0);
  });

  it("maneja payload null sin errores", () => {
    const result = determineRoleAndPlan(null);
    expect(result.role).toBe("user");
    expect(result.plan).toBe("lifetime");
    expect(result.isPriority).toBe(0);
  });

  it("detecta suscripción por subscription_id aunque is_recurring sea false", () => {
    const result = determineRoleAndPlan({
      product: { name: "Plan Básico", is_recurring: false },
      subscription_id: "sub_004",
    });
    expect(result.plan).toBe("vip");
    expect(result.isPriority).toBe(1);
  });

  it("usa offer.name como fallback para el nombre del producto", () => {
    const result = determineRoleAndPlan({
      offer: { name: "Oferta Administrador" },
    });
    expect(result.role).toBe("admin");
  });

  it("es case-insensitive para nombres de productos", () => {
    const result = determineRoleAndPlan({
      product: { name: "PLAN ADMINISTRADOR PREMIUM", is_recurring: true },
      subscription_id: "sub_005",
    });
    expect(result.role).toBe("admin");
    expect(result.plan).toBe("vip");
  });
});

describe("Hotmart Webhook - Email extraction", () => {
  it("extrae email de data.buyer.email (formato estándar Hotmart)", () => {
    const payload = {
      event: "PURCHASE_APPROVED",
      data: {
        buyer: { email: "test@example.com", name: "Test User" },
      },
    };
    const email =
      payload.data?.buyer?.email ||
      (payload.data as any)?.email ||
      (payload.data as any)?.subscriber?.email;
    expect(email).toBe("test@example.com");
  });

  it("extrae email de data.email como fallback", () => {
    const payload = {
      event: "PURCHASE_APPROVED",
      data: {
        email: "fallback@example.com",
      },
    };
    const email =
      (payload.data as any)?.buyer?.email ||
      payload.data?.email;
    expect(email).toBe("fallback@example.com");
  });

  it("extrae email de data.subscriber.email como fallback", () => {
    const payload = {
      event: "PURCHASE_APPROVED",
      data: {
        subscriber: { email: "subscriber@example.com" },
      },
    };
    const email =
      (payload.data as any)?.buyer?.email ||
      (payload.data as any)?.email ||
      payload.data?.subscriber?.email;
    expect(email).toBe("subscriber@example.com");
  });
});

describe("Hotmart Webhook - Buyer name extraction", () => {
  it("extrae nombre de buyer.name", () => {
    const payload = { buyer: { name: "María García" } };
    const name =
      payload?.buyer?.name ||
      (payload as any)?.customer?.name ||
      (payload as any)?.subscriber?.name ||
      "default";
    expect(name).toBe("María García");
  });

  it("usa email como fallback si no hay nombre", () => {
    const payload = {};
    const email = "maria@test.com";
    const name =
      (payload as any)?.buyer?.name ||
      (payload as any)?.customer?.name ||
      (payload as any)?.subscriber?.name ||
      email.split("@")[0];
    expect(name).toBe("maria");
  });
});
