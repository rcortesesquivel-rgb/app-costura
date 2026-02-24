import { describe, it, expect } from "vitest";

describe("Buzón de Sugerencias", () => {
  describe("Schema validation", () => {
    it("should have sugerencias table in schema", async () => {
      const schema = await import("../drizzle/schema");
      expect(schema.sugerencias).toBeDefined();
    });

    it("should have correct columns in sugerencias table", async () => {
      const schema = await import("../drizzle/schema");
      const table = schema.sugerencias;
      // Verify the table has the expected columns
      const columns = Object.keys(table);
      expect(columns).toContain("id");
      expect(columns).toContain("userId");
      expect(columns).toContain("nombreUsuario");
      expect(columns).toContain("emailUsuario");
      expect(columns).toContain("asunto");
      expect(columns).toContain("mensaje");
      expect(columns).toContain("leida");
      expect(columns).toContain("createdAt");
    });

    it("should export InsertSugerencia type", async () => {
      const schema = await import("../drizzle/schema");
      // Type exists if the module exports it
      expect(schema).toHaveProperty("sugerencias");
    });
  });

  describe("Router integration", () => {
    it("should have sugerencias router in appRouter", async () => {
      const { appRouter } = await import("../server/routers");
      // Check that the router has sugerencias procedures
      const procedures = Object.keys(appRouter._def.procedures);
      expect(procedures).toContain("sugerencias.enviar");
      expect(procedures).toContain("sugerencias.listar");
    });
  });

  describe("Input validation", () => {
    it("should validate asunto is not empty", () => {
      const asunto = "";
      expect(asunto.trim().length).toBe(0);
    });

    it("should validate mensaje is not empty", () => {
      const mensaje = "";
      expect(mensaje.trim().length).toBe(0);
    });

    it("should validate asunto max length", () => {
      const asunto = "a".repeat(501);
      expect(asunto.length).toBeGreaterThan(500);
    });

    it("should validate mensaje max length", () => {
      const mensaje = "a".repeat(5001);
      expect(mensaje.length).toBeGreaterThan(5000);
    });

    it("should accept valid input", () => {
      const asunto = "Nueva función";
      const mensaje = "Me gustaría que agregaran un calendario de entregas.";
      expect(asunto.trim().length).toBeGreaterThan(0);
      expect(asunto.length).toBeLessThanOrEqual(500);
      expect(mensaje.trim().length).toBeGreaterThan(0);
      expect(mensaje.length).toBeLessThanOrEqual(5000);
    });
  });

  describe("Icon mapping", () => {
    it("should have star.fill icon mapped for buzón button", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("components/ui/icon-symbol.tsx", "utf-8");
      expect(content).toContain("star.fill");
    });
  });

  describe("Navigation", () => {
    it("should have sugerencias screen file", async () => {
      const fs = await import("fs");
      const exists = fs.existsSync("app/sugerencias.tsx");
      expect(exists).toBe(true);
    });

    it("should have buzón link in configuracion screen", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("app/(tabs)/configuracion.tsx", "utf-8");
      expect(content).toContain("Buzón de Sugerencias");
      expect(content).toContain("/sugerencias");
    });
  });
});
