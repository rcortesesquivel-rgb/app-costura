import { describe, it, expect } from "vitest";

describe("Módulo 1: Seguridad, Escalabilidad y Ventas", () => {
  describe("1. Gestión de Admin", () => {
    it("admin.tsx existe", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("app/(tabs)/admin.tsx", "utf-8");
      expect(content).toContain("Gestión de Usuarios");
      expect(content).toContain("Activar");
      expect(content).toContain("Desactivar");
      expect(content).toContain("Eliminar");
    });

    it("admin-db tiene funciones de gestión de usuarios", async () => {
      const mod = await import("../server/admin-db");
      expect(mod.getAllUsers).toBeDefined();
      expect(mod.updateUserStatus).toBeDefined();
      expect(mod.deleteUser).toBeDefined();
    });
  });

  describe("2. Webhook Hotmart", () => {
    it("webhooks.ts existe y exporta handler", async () => {
      const mod = await import("../server/webhooks");
      expect(mod).toBeDefined();
    });
  });

  describe("3. Login con ojo de contraseña", () => {
    it("signin.tsx tiene icono de ojo para contraseña", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("app/auth/signin.tsx", "utf-8");
      expect(content).toContain("showPassword");
      expect(content).toContain("secureTextEntry");
    });
  });

  describe("4. Centro de Ayuda actualizado", () => {
    it("configuracion.tsx tiene email y WhatsApp actualizados", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("app/(tabs)/configuracion.tsx", "utf-8");
      expect(content).toContain("ryrnissi@gmail.com");
      expect(content).toContain("50670460451");
    });
  });

  describe("5. Moneda CRC por defecto", () => {
    it("format-currency.ts usa CRC como fallback", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("lib/format-currency.ts", "utf-8");
      expect(content).toContain('"CRC"');
      expect(content).toContain('"es-CR"');
    });
  });

  describe("6. Input de banderas y WhatsApp en clientes", () => {
    it("crear-cliente.tsx tiene selector de país y campo WhatsApp", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("app/crear-cliente.tsx", "utf-8");
      expect(content).toContain("COUNTRY_CODES");
      expect(content).toContain("codigoPais");
      expect(content).toContain("whatsapp");
      expect(content).toContain("Copiar Tel.");
    });

    it("schema tiene campos codigoPais y whatsapp en clientes", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("drizzle/schema.ts", "utf-8");
      expect(content).toContain('codigoPais');
      expect(content).toContain('whatsapp');
    });

    it("routers.ts acepta codigoPais y whatsapp en create y update", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("server/routers.ts", "utf-8");
      expect(content).toContain("codigoPais: z.string()");
      expect(content).toContain("whatsapp: z.string()");
    });
  });

  describe("7. Iconos de ojo en icon-symbol.tsx", () => {
    it("icon-symbol.tsx tiene mapeo de eye.fill y eye.slash.fill", async () => {
      const fs = await import("fs");
      const content = fs.readFileSync("components/ui/icon-symbol.tsx", "utf-8");
      expect(content).toContain('"eye.fill"');
      expect(content).toContain('"eye.slash.fill"');
    });
  });
});
