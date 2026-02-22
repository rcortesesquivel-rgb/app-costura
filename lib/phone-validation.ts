/**
 * Validación y formateo de números telefónicos por país
 */

export interface CountryPhoneConfig {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  pattern: RegExp;
  format: (number: string) => string;
  minLength: number;
  maxLength: number;
}

// Configuración de países y sus formatos de teléfono
export const COUNTRY_PHONE_CONFIGS: Record<string, CountryPhoneConfig> = {
  CR: {
    code: "CR",
    name: "Costa Rica",
    dialCode: "+506",
    flag: "🇨🇷",
    pattern: /^(\+506)?[\s]?(\d{4}[-]?\d{4})$/,
    format: (number: string) => {
      const cleaned = number.replace(/\D/g, "");
      if (cleaned.length <= 4) return cleaned;
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
    },
    minLength: 8,
    maxLength: 8,
  },
  CO: {
    code: "CO",
    name: "Colombia",
    dialCode: "+57",
    flag: "🇨🇴",
    pattern: /^(\+57)?[\s]?(\d{1})?[\s]?(\d{4}[-]?\d{4})$/,
    format: (number: string) => {
      const cleaned = number.replace(/\D/g, "");
      if (cleaned.length <= 4) return cleaned;
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
    },
    minLength: 10,
    maxLength: 10,
  },
  MX: {
    code: "MX",
    name: "México",
    dialCode: "+52",
    flag: "🇲🇽",
    pattern: /^(\+52)?[\s]?(\d{2})?[\s]?(\d{4}[-]?\d{4})$/,
    format: (number: string) => {
      const cleaned = number.replace(/\D/g, "");
      if (cleaned.length <= 4) return cleaned;
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
    },
    minLength: 10,
    maxLength: 10,
  },
  AR: {
    code: "AR",
    name: "Argentina",
    dialCode: "+54",
    flag: "🇦🇷",
    pattern: /^(\+54)?[\s]?(\d{2})?[\s]?(\d{4}[-]?\d{4})$/,
    format: (number: string) => {
      const cleaned = number.replace(/\D/g, "");
      if (cleaned.length <= 4) return cleaned;
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
    },
    minLength: 10,
    maxLength: 10,
  },
  CL: {
    code: "CL",
    name: "Chile",
    dialCode: "+56",
    flag: "🇨🇱",
    pattern: /^(\+56)?[\s]?(\d{1})?[\s]?(\d{4}[-]?\d{4})$/,
    format: (number: string) => {
      const cleaned = number.replace(/\D/g, "");
      if (cleaned.length <= 4) return cleaned;
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
    },
    minLength: 9,
    maxLength: 9,
  },
  PE: {
    code: "PE",
    name: "Perú",
    dialCode: "+51",
    flag: "🇵🇪",
    pattern: /^(\+51)?[\s]?(\d{1})?[\s]?(\d{4}[-]?\d{4})$/,
    format: (number: string) => {
      const cleaned = number.replace(/\D/g, "");
      if (cleaned.length <= 4) return cleaned;
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
    },
    minLength: 9,
    maxLength: 9,
  },
  EC: {
    code: "EC",
    name: "Ecuador",
    dialCode: "+593",
    flag: "🇪🇨",
    pattern: /^(\+593)?[\s]?(\d{1})?[\s]?(\d{4}[-]?\d{4})$/,
    format: (number: string) => {
      const cleaned = number.replace(/\D/g, "");
      if (cleaned.length <= 4) return cleaned;
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
    },
    minLength: 9,
    maxLength: 9,
  },
  VE: {
    code: "VE",
    name: "Venezuela",
    dialCode: "+58",
    flag: "🇻🇪",
    pattern: /^(\+58)?[\s]?(\d{3}[-]?\d{4}[-]?\d{4})$/,
    format: (number: string) => {
      const cleaned = number.replace(/\D/g, "");
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    },
    minLength: 11,
    maxLength: 11,
  },
  US: {
    code: "US",
    name: "Estados Unidos",
    dialCode: "+1",
    flag: "🇺🇸",
    pattern: /^(\+1)?[\s]?(\d{3}[-]?\d{3}[-]?\d{4})$/,
    format: (number: string) => {
      const cleaned = number.replace(/\D/g, "");
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    },
    minLength: 10,
    maxLength: 10,
  },
  ES: {
    code: "ES",
    name: "España",
    dialCode: "+34",
    flag: "🇪🇸",
    pattern: /^(\+34)?[\s]?(\d{3}[-]?\d{2}[-]?\d{2}[-]?\d{2})$/,
    format: (number: string) => {
      const cleaned = number.replace(/\D/g, "");
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 7)}-${cleaned.slice(7, 9)}`;
    },
    minLength: 9,
    maxLength: 9,
  },
};

/**
 * Valida un número telefónico según el país especificado
 */
export function validatePhoneNumber(phoneNumber: string, countryCode: string): boolean {
  const config = COUNTRY_PHONE_CONFIGS[countryCode];
  if (!config) return false;

  const cleaned = phoneNumber.replace(/\D/g, "");
  return (
    cleaned.length >= config.minLength &&
    cleaned.length <= config.maxLength &&
    config.pattern.test(phoneNumber)
  );
}

/**
 * Formatea un número telefónico según el país
 */
export function formatPhoneNumber(phoneNumber: string, countryCode: string): string {
  const config = COUNTRY_PHONE_CONFIGS[countryCode];
  if (!config) return phoneNumber;

  return config.format(phoneNumber);
}

/**
 * Obtiene el código de país por defecto basado en la ubicación del usuario
 * En una app real, esto usaría geolocalización o preferencias del usuario
 */
export function getDefaultCountryCode(): string {
  // Por defecto Costa Rica (CR) - puede cambiar según necesidad
  return "CR";
}

/**
 * Obtiene lista de países ordenados alfabéticamente
 */
export function getCountriesList(): CountryPhoneConfig[] {
  return Object.values(COUNTRY_PHONE_CONFIGS).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/**
 * Obtiene configuración de un país específico
 */
export function getCountryConfig(countryCode: string): CountryPhoneConfig | null {
  return COUNTRY_PHONE_CONFIGS[countryCode] || null;
}

/**
 * Extrae el número sin formato (solo dígitos)
 */
export function cleanPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, "");
}

/**
 * Combina código de país y número para almacenamiento
 */
export function formatPhoneForStorage(phoneNumber: string, countryCode: string): string {
  const config = COUNTRY_PHONE_CONFIGS[countryCode];
  if (!config) return phoneNumber;

  const cleaned = cleanPhoneNumber(phoneNumber);
  return `${config.dialCode}${cleaned}`;
}
