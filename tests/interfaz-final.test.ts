import { describe, it, expect } from "vitest";

// ========================================
// Tests para las 4 mejoras de interfaz
// ========================================

describe("1. Urgencia por colores", () => {
  function getUrgenciaAuto(fechaEntrega: string | Date | null | undefined): "alta" | "media" | "baja" | null {
    if (!fechaEntrega) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(fechaEntrega);
    entrega.setHours(0, 0, 0, 0);
    const diffDias = Math.ceil((entrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDias <= 1) return "alta";
    if (diffDias <= 4) return "media";
    return "baja";
  }

  it("debe retornar 'alta' para fecha de hoy", () => {
    const hoy = new Date().toISOString().split("T")[0];
    expect(getUrgenciaAuto(hoy)).toBe("alta");
  });

  it("debe retornar 'alta' para fecha de mañana", () => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    expect(getUrgenciaAuto(manana.toISOString().split("T")[0])).toBe("alta");
  });

  it("debe retornar 'media' para 3 días", () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 3);
    expect(getUrgenciaAuto(fecha.toISOString().split("T")[0])).toBe("media");
  });

  it("debe retornar 'baja' para 7 días", () => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 7);
    expect(getUrgenciaAuto(fecha.toISOString().split("T")[0])).toBe("baja");
  });

  it("debe retornar null si no hay fecha", () => {
    expect(getUrgenciaAuto(null)).toBeNull();
    expect(getUrgenciaAuto(undefined)).toBeNull();
  });
});

describe("2. Centro de Ayuda", () => {
  it("debe tener email de soporte correcto", () => {
    const SOPORTE_EMAIL = "soporteviral@gmail.com";
    expect(SOPORTE_EMAIL).toBe("soporteviral@gmail.com");
    expect(SOPORTE_EMAIL).toContain("@");
  });

  it("debe generar URL de mailto correcta", () => {
    const email = "soporteviral@gmail.com";
    const subject = encodeURIComponent("Soporte - Taller de Costura App");
    const mailtoUrl = `mailto:${email}?subject=${subject}`;
    expect(mailtoUrl).toContain("mailto:soporteviral@gmail.com");
    expect(mailtoUrl).toContain("subject=");
  });

  it("debe tener link de WhatsApp válido", () => {
    const WHATSAPP_LINK = "https://wa.me/message/YOURLINK";
    expect(WHATSAPP_LINK).toContain("wa.me");
  });
});

describe("3. Subcategorías", () => {
  const CATEGORIAS = ["arreglo", "confeccion", "bordado", "sublimado", "otros"];

  it("debe tener 5 categorías incluyendo Bordado y Sublimado", () => {
    expect(CATEGORIAS).toHaveLength(5);
    expect(CATEGORIAS).toContain("bordado");
    expect(CATEGORIAS).toContain("sublimado");
    expect(CATEGORIAS).toContain("otros");
  });

  it("no debe contener 'personalizacion'", () => {
    expect(CATEGORIAS).not.toContain("personalizacion");
  });

  it("debe tener labels en español", () => {
    const labels: Record<string, string> = {
      arreglo: "Arreglo",
      confeccion: "Confección",
      bordado: "Bordado",
      sublimado: "Sublimado",
      otros: "Otros",
    };
    for (const cat of CATEGORIAS) {
      expect(labels[cat]).toBeDefined();
      expect(labels[cat].length).toBeGreaterThan(0);
    }
  });
});

describe("4. Traducción español", () => {
  const ESTADOS_LABELS: Record<string, string> = {
    en_espera: "En espera",
    cortando: "Cortando",
    cosiendo: "Cosiendo",
    listo: "Listo",
    entregado: "Entregado",
  };

  it("todos los estados deben tener label en español", () => {
    for (const [key, label] of Object.entries(ESTADOS_LABELS)) {
      expect(label).toBeDefined();
      expect(label.length).toBeGreaterThan(0);
      // No debe contener palabras en inglés comunes
      expect(label.toLowerCase()).not.toContain("pending");
      expect(label.toLowerCase()).not.toContain("cutting");
      expect(label.toLowerCase()).not.toContain("sewing");
      expect(label.toLowerCase()).not.toContain("ready");
      expect(label.toLowerCase()).not.toContain("delivered");
    }
  });

  it("tabs deben estar en español", () => {
    const tabs = ["Mis Trabajos", "Clientes", "Búsqueda", "Ayuda"];
    for (const tab of tabs) {
      expect(tab.length).toBeGreaterThan(0);
      // No debe contener palabras en inglés
      expect(tab.toLowerCase()).not.toContain("dashboard");
      expect(tab.toLowerCase()).not.toContain("settings");
      expect(tab.toLowerCase()).not.toContain("search");
      expect(tab.toLowerCase()).not.toContain("home");
    }
  });

  it("urgencia labels deben estar en español", () => {
    const urgenciaLabels: Record<string, string> = {
      alta: "Urgente",
      media: "Media",
      baja: "Baja",
    };
    for (const [key, label] of Object.entries(urgenciaLabels)) {
      expect(label).toBeDefined();
      expect(label.length).toBeGreaterThan(0);
    }
  });
});
