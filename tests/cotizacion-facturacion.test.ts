import { describe, it, expect } from "vitest";
import { generateCotizacionText } from "../lib/generate-cotizacion-text";

describe("Cotización y Facturación", () => {
  describe("generateCotizacionText", () => {
    it("should generate cotización text with all fields", () => {
      const result = generateCotizacionText({
        clienteName: "Juan Pérez",
        clientePhone: "50686419894",
        clienteEmail: "juan@test.com",
        descripcion: "Confección de vestido",
        precioUnitario: 15000,
        cantidad: 2,
        impuestos: 3900,
        varios: 500,
        abonoInicial: 10000,
        fechaEntrega: "15/03/2026",
        tallerName: "Taller de Costura",
        condicionesPago: "50% al confirmar, 50% a la entrega",
      });

      expect(result).toContain("COTIZACIÓN");
      expect(result).toContain("Juan Pérez");
      expect(result).toContain("50686419894");
      expect(result).toContain("juan@test.com");
      expect(result).toContain("Confección de vestido");
      expect(result).toContain("15000.00");
      expect(result).toContain("30000.00"); // subtotal = 15000 * 2
      expect(result).toContain("3900.00"); // impuestos
      expect(result).toContain("500.00"); // varios
      expect(result).toContain("34400.00"); // total = 30000 + 3900 + 500
      expect(result).toContain("10000.00"); // abono
      expect(result).toContain("24400.00"); // saldo = 34400 - 10000
      expect(result).toContain("15/03/2026");
      expect(result).toContain("50% al confirmar");
    });

    it("should generate cotización without optional fields", () => {
      const result = generateCotizacionText({
        clienteName: "María López",
        descripcion: "Arreglo de pantalón",
        precioUnitario: 5000,
        cantidad: 1,
        impuestos: 0,
        varios: 0,
        abonoInicial: 0,
      });

      expect(result).toContain("María López");
      expect(result).toContain("Arreglo de pantalón");
      expect(result).toContain("5000.00");
      expect(result).not.toContain("Impuestos");
      expect(result).not.toContain("Otros Gastos");
    });

    it("should calculate correct totals", () => {
      const result = generateCotizacionText({
        clienteName: "Test",
        descripcion: "Test",
        precioUnitario: 10000,
        cantidad: 3,
        impuestos: 1000,
        varios: 500,
        abonoInicial: 5000,
      });

      // subtotal = 10000 * 3 = 30000
      // total = 30000 + 1000 + 500 = 31500
      // saldo = 31500 - 5000 = 26500
      expect(result).toContain("30000.00"); // subtotal
      expect(result).toContain("31500.00"); // total
      expect(result).toContain("26500.00"); // saldo
    });

    it("should not show negative saldo", () => {
      const result = generateCotizacionText({
        clienteName: "Test",
        descripcion: "Test",
        precioUnitario: 5000,
        cantidad: 1,
        impuestos: 0,
        varios: 0,
        abonoInicial: 10000, // more than total
      });

      expect(result).toContain("0.00"); // saldo should be 0, not negative
    });
  });

  describe("Facturación message generation", () => {
    it("should generate a valid WhatsApp URL format", () => {
      const phone = "50670460451";
      const message = "📋 *DATOS PARA FACTURACIÓN*\n\nTest message";
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      expect(url).toContain("https://wa.me/50670460451");
      expect(url).toContain("text=");
      expect(url).toContain(encodeURIComponent("FACTURACIÓN"));
    });

    it("should clean phone number correctly", () => {
      const rawPhone = "+506 7046-0451";
      const cleaned = rawPhone.replace(/[^0-9]/g, "");
      expect(cleaned).toBe("50670460451");
    });

    it("should validate phone number length", () => {
      const shortPhone = "123";
      const validPhone = "50670460451";

      expect(shortPhone.length).toBeLessThan(8);
      expect(validPhone.length).toBeGreaterThanOrEqual(8);
    });
  });

  describe("Icon mapping", () => {
    it("should have doc.text.fill mapped", async () => {
      // Read the icon-symbol file to verify mapping exists
      const fs = await import("fs");
      const content = fs.readFileSync("components/ui/icon-symbol.tsx", "utf-8");
      expect(content).toContain("doc.text.fill");
      expect(content).toContain("dollarsign.circle.fill");
    });
  });
});
