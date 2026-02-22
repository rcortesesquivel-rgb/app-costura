import { describe, it, expect } from "vitest";
import {
  validatePhoneNumber,
  formatPhoneNumber,
  formatPhoneForStorage,
  cleanPhoneNumber,
  getCountryConfig,
  COUNTRY_PHONE_CONFIGS,
} from "../lib/phone-validation";

describe("Phone Validation", () => {
  describe("validatePhoneNumber", () => {
    it("should validate Costa Rica phone numbers", () => {
      expect(validatePhoneNumber("87654321", "CR")).toBe(true);
      expect(validatePhoneNumber("8765-4321", "CR")).toBe(true);
      expect(validatePhoneNumber("123", "CR")).toBe(false);
      expect(validatePhoneNumber("12345678901", "CR")).toBe(false);
    });

    it("should validate Colombia phone numbers", () => {
      expect(validatePhoneNumber("123", "CO")).toBe(false);
    });

    it("should validate Mexico phone numbers", () => {
      expect(validatePhoneNumber("5512345678", "MX")).toBe(true);
    });

    it("should validate USA phone numbers", () => {
      expect(validatePhoneNumber("2025551234", "US")).toBe(true);
    });

    it("should validate Spain phone numbers", () => {
      expect(validatePhoneNumber("912345678", "ES")).toBe(true);
    });
  });

  describe("formatPhoneNumber", () => {
    it("should format Costa Rica numbers", () => {
      expect(formatPhoneNumber("87654321", "CR")).toBe("8765-4321");
      expect(formatPhoneNumber("8765", "CR")).toBe("8765");
    });

    it("should format Colombia numbers", () => {
      expect(formatPhoneNumber("3001234567", "CO")).toBe("3001-2345");
      expect(formatPhoneNumber("300", "CO")).toBe("300");
    });

    it("should format USA numbers", () => {
      expect(formatPhoneNumber("2025551234", "US")).toBe("202-555-1234");
      expect(formatPhoneNumber("202555", "US")).toBe("202-555");
    });
  });

  describe("formatPhoneForStorage", () => {
    it("should format phone with country code for storage", () => {
      expect(formatPhoneForStorage("8765-4321", "CR")).toBe("+50687654321");
      expect(formatPhoneForStorage("3001234567", "CO")).toBe("+573001234567");
    });
  });

  describe("cleanPhoneNumber", () => {
    it("should remove all non-digit characters", () => {
      expect(cleanPhoneNumber("8765-4321")).toBe("87654321");
      expect(cleanPhoneNumber("+506 8765-4321")).toBe("50687654321");
      expect(cleanPhoneNumber("(202) 555-1234")).toBe("2025551234");
    });

    it("should handle empty strings", () => {
      expect(cleanPhoneNumber("")).toBe("");
    });
  });

  describe("getCountryConfig", () => {
    it("should return config for valid country codes", () => {
      const crConfig = getCountryConfig("CR");
      expect(crConfig).toBeDefined();
      expect(crConfig?.name).toBe("Costa Rica");
      expect(crConfig?.dialCode).toBe("+506");
      expect(crConfig?.minLength).toBe(8);
      expect(crConfig?.maxLength).toBe(8);
    });

    it("should return null for invalid country codes", () => {
      expect(getCountryConfig("XX")).toBeNull();
      expect(getCountryConfig("")).toBeNull();
    });
  });

  describe("COUNTRY_PHONE_CONFIGS", () => {
    it("should have configs for all expected countries", () => {
      const expectedCountries = ["CR", "CO", "MX", "AR", "CL", "PE", "EC", "VE", "US", "ES"];
      expectedCountries.forEach((code) => {
        expect(COUNTRY_PHONE_CONFIGS[code]).toBeDefined();
        expect(COUNTRY_PHONE_CONFIGS[code].code).toBe(code);
        expect(COUNTRY_PHONE_CONFIGS[code].name).toBeDefined();
        expect(COUNTRY_PHONE_CONFIGS[code].dialCode).toBeDefined();
        expect(COUNTRY_PHONE_CONFIGS[code].pattern).toBeDefined();
        expect(COUNTRY_PHONE_CONFIGS[code].format).toBeDefined();
        expect(COUNTRY_PHONE_CONFIGS[code].minLength).toBeGreaterThan(0);
        expect(COUNTRY_PHONE_CONFIGS[code].maxLength).toBeGreaterThan(0);
      });
    });

    it("should have flag emoji for all countries", () => {
      Object.values(COUNTRY_PHONE_CONFIGS).forEach((config) => {
        expect(config.flag).toBeDefined();
        expect(config.flag.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle phone numbers with various formatting", () => {
      const variations = ["8765-4321", "87654321"];
      variations.forEach((phone) => {
        expect(validatePhoneNumber(phone, "CR")).toBe(true);
      });
    });

    it("should reject invalid formats", () => {
      expect(validatePhoneNumber("abc-defg", "CR")).toBe(false);
      expect(validatePhoneNumber("", "CR")).toBe(false);
      expect(validatePhoneNumber("   ", "CR")).toBe(false);
    });

    it("should handle numbers with extra spaces", () => {
      expect(validatePhoneNumber("8765-4321", "CR")).toBe(true);
    });
  });
});
