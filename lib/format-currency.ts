import { Platform } from "react-native";
import * as Localization from "expo-localization";

/**
 * Detect the user's locale and currency automatically.
 * Falls back to "es-DO" / "DOP" (Dominican Republic) as default.
 */
function getUserLocale(): string {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      return locales[0].languageTag || "es-DO";
    }
  } catch {
    // fallback
  }
  return "es-DO";
}

function getUserCurrency(): string {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0 && locales[0].currencyCode) {
      return locales[0].currencyCode;
    }
  } catch {
    // fallback
  }
  return "DOP";
}

/**
 * Format a number as currency using the user's locale and currency.
 *
 * @param amount - The numeric amount to format
 * @param options - Optional overrides for currency and locale
 * @returns Formatted currency string (e.g., "RD$1,500.00", "$1,500.00", "€1.500,00")
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options?: { currency?: string; locale?: string }
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);

  if (isNaN(numericAmount)) {
    return formatCurrency(0, options);
  }

  const locale = options?.locale || getUserLocale();
  const currency = options?.currency || getUserCurrency();

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    // Fallback if Intl is not available or currency code is invalid
    return `$${numericAmount.toFixed(2)}`;
  }
}

/**
 * Format a number as a compact currency (no decimals for whole numbers).
 */
export function formatCurrencyCompact(
  amount: number | string | null | undefined,
  options?: { currency?: string; locale?: string }
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);

  if (isNaN(numericAmount)) {
    return formatCurrencyCompact(0, options);
  }

  const locale = options?.locale || getUserLocale();
  const currency = options?.currency || getUserCurrency();

  const hasDecimals = numericAmount % 1 !== 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    }).format(numericAmount);
  } catch {
    return hasDecimals ? `$${numericAmount.toFixed(2)}` : `$${numericAmount}`;
  }
}
