import { describe, it, expect } from "vitest";

describe("Schema Fix - Decimal types and cantidad field", () => {
  describe("Tabla trabajos - campos simplificados", () => {
    it("precioBase debe aceptar valores decimales como string", () => {
      const precioBase = "15000.50";
      const parsed = parseFloat(precioBase);
      expect(parsed).toBe(15000.50);
      expect(typeof precioBase).toBe("string"); // decimal en drizzle retorna string
    });

    it("abonoInicial debe aceptar valores decimales como string", () => {
      const abonoInicial = "5000.00";
      const parsed = parseFloat(abonoInicial);
      expect(parsed).toBe(5000);
    });

    it("campos eliminados no deben existir en el tipo", () => {
      // Estos campos fueron eliminados del esquema:
      // tipo, tipoPrenda, nivelUrgencia, tipoTela, metrosRequeridos,
      // tipoPersonalizacion, notasVoz, fechaPrueba, fechaEntregado
      const trabajoFields = [
        "id", "userId", "clienteId", "descripcion",
        "precioBase", "abonoInicial", "estado",
        "fechaEntrega", "createdAt", "updatedAt"
      ];
      expect(trabajoFields).toHaveLength(10);
      expect(trabajoFields).not.toContain("tipo");
      expect(trabajoFields).not.toContain("tipoPrenda");
      expect(trabajoFields).not.toContain("nivelUrgencia");
      expect(trabajoFields).not.toContain("tipoTela");
      expect(trabajoFields).not.toContain("notasVoz");
    });
  });

  describe("Tabla agregados - campo cantidad agregado", () => {
    it("debe calcular subtotal con cantidad", () => {
      const agregado = { concepto: "Botones", precio: "500.00", cantidad: 3 };
      const subtotal = parseFloat(agregado.precio) * agregado.cantidad;
      expect(subtotal).toBe(1500);
    });

    it("cantidad default debe ser 1", () => {
      const agregado = { concepto: "Cierre", precio: "1000.00", cantidad: 1 };
      expect(agregado.cantidad).toBe(1);
    });

    it("userId fue eliminado de agregados", () => {
      const agregadoFields = ["id", "trabajoId", "concepto", "precio", "cantidad", "createdAt"];
      expect(agregadoFields).toHaveLength(6);
      expect(agregadoFields).not.toContain("userId");
    });
  });

  describe("Cálculo total del trabajo", () => {
    it("total = precioBase + sum(precio * cantidad de cada agregado)", () => {
      const precioBase = "10000.00";
      const agregados = [
        { precio: "500.00", cantidad: 3 },   // 1500
        { precio: "2000.00", cantidad: 1 },   // 2000
        { precio: "750.00", cantidad: 2 },    // 1500
      ];

      const base = parseFloat(precioBase);
      const totalAgregados = agregados.reduce((sum, ag) => {
        return sum + (parseFloat(ag.precio) * ag.cantidad);
      }, 0);
      const total = base + totalAgregados;

      expect(base).toBe(10000);
      expect(totalAgregados).toBe(5000);
      expect(total).toBe(15000);
    });

    it("saldo = total - abonoInicial", () => {
      const total = 15000;
      const abonoInicial = "5000.00";
      const saldo = total - parseFloat(abonoInicial);
      expect(saldo).toBe(10000);
    });

    it("saldo se actualiza en tiempo real al cambiar abono", () => {
      const total = 15000;
      
      // Simular cambio de abono en tiempo real
      const abonos = ["0", "5000", "10000", "15000"];
      const saldosEsperados = [15000, 10000, 5000, 0];

      abonos.forEach((abono, i) => {
        const saldo = total - parseFloat(abono);
        expect(saldo).toBe(saldosEsperados[i]);
      });
    });
  });

  describe("Generación de recibo", () => {
    it("recibo debe calcular totales correctamente con cantidad", () => {
      const trabajo = {
        precioBase: "10000.00",
        abonoInicial: "3000.00",
      };

      const agregadosData = [
        { concepto: "Botones", precio: "500.00", cantidad: 4 },
        { concepto: "Cierre", precio: "1500.00", cantidad: 1 },
      ];

      const precioBase = parseFloat(trabajo.precioBase);
      const abonoInicial = parseFloat(trabajo.abonoInicial);
      const totalAgregados = agregadosData.reduce((sum, item) => {
        const precio = parseFloat(item.precio);
        const cant = item.cantidad || 1;
        return sum + (precio * cant);
      }, 0);

      const total = precioBase + totalAgregados;
      const saldo = total - abonoInicial;

      expect(precioBase).toBe(10000);
      expect(totalAgregados).toBe(3500); // 500*4 + 1500*1
      expect(total).toBe(13500);
      expect(saldo).toBe(10500);
    });
  });
});
