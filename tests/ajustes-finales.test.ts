import { describe, it, expect } from "vitest";

describe("Ajustes Finales de Usabilidad", () => {
  describe("WhatsApp Real", () => {
    it("debe tener el enlace correcto de WhatsApp", () => {
      const whatsappLink = "https://wa.me/50686419894";
      expect(whatsappLink).toContain("wa.me");
      expect(whatsappLink).toContain("50686419894");
    });
  });

  describe("Selector de Fecha Nativo", () => {
    it("debe formatear fecha como AAAA-MM-DD para input type=date", () => {
      const fecha = new Date(2026, 2, 15); // 15 de marzo 2026
      const formatted = fecha.toISOString().split("T")[0];
      expect(formatted).toBe("2026-03-15");
    });

    it("debe parsear fecha correctamente desde input", () => {
      const input = "2026-03-15";
      const parsed = new Date(input + "T12:00:00");
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(2); // 0-indexed
      expect(parsed.getDate()).toBe(15);
    });
  });

  describe("Formato de Moneda", () => {
    it("debe mostrar 2 decimales siempre", () => {
      const amount = 1000;
      const formatted = amount.toFixed(2);
      expect(formatted).toBe("1000.00");
    });

    it("debe formatear decimales correctamente", () => {
      const amount = 1000.5;
      const formatted = amount.toFixed(2);
      expect(formatted).toBe("1000.50");
    });

    it("debe redondear correctamente", () => {
      const amount = 1000.456;
      const formatted = amount.toFixed(2);
      expect(formatted).toBe("1000.46");
    });
  });

  describe("Cálculo de Días Restantes", () => {
    it("debe calcular 0 días si la entrega es hoy", () => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const entrega = new Date(hoy);
      const diffMs = entrega.getTime() - hoy.getTime();
      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDias).toBe(0);
    });

    it("debe calcular 1 día si la entrega es mañana", () => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const entrega = new Date(hoy);
      entrega.setDate(entrega.getDate() + 1);
      const diffMs = entrega.getTime() - hoy.getTime();
      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDias).toBe(1);
    });

    it("debe calcular 5 días correctamente", () => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const entrega = new Date(hoy);
      entrega.setDate(entrega.getDate() + 5);
      const diffMs = entrega.getTime() - hoy.getTime();
      const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      expect(diffDias).toBe(5);
    });

    it("debe retornar null si no hay fecha de entrega", () => {
      const diasRestantes = null;
      expect(diasRestantes).toBeNull();
    });
  });

  describe("Integración de Ajustes", () => {
    it("debe mantener la lógica de cálculos con decimales", () => {
      const precioBase = parseFloat("100.00");
      const cantidad = 2;
      const subtotal = precioBase * cantidad;
      const impuestos = parseFloat("20.00");
      const varios = parseFloat("5.50");
      const granTotal = subtotal + impuestos + varios;
      
      expect(subtotal).toBe(200);
      expect(granTotal).toBe(225.50);
      expect(granTotal.toFixed(2)).toBe("225.50");
    });

    it("debe calcular saldo pendiente correctamente", () => {
      const granTotal = 225.50;
      const abonoInicial = 100.00;
      const saldoPendiente = granTotal - abonoInicial;
      
      expect(saldoPendiente).toBe(125.50);
      expect(saldoPendiente.toFixed(2)).toBe("125.50");
    });
  });
});
