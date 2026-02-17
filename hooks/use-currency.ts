import { useMemo } from 'react';

/**
 * Hook que detecta la configuración regional del navegador del usuario
 * y proporciona funciones para formatear moneda dinámicamente.
 * 
 * Ejemplos:
 * - Costa Rica (es-CR): ₡1,234.56
 * - USA (en-US): $1,234.56
 * - México (es-MX): MXN 1,234.56
 * - España (es-ES): 1.234,56 €
 */
export function useCurrency() {
  return useMemo(() => {
    // Detectar locale del navegador
    const locale = typeof navigator !== 'undefined' 
      ? navigator.language || 'es-ES'
      : 'es-ES';

    /**
     * Formatea un número como moneda usando la configuración regional del usuario
     */
    const formatCurrency = (amount: number): string => {
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: getCurrencyCode(locale),
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch (e) {
        // Fallback si hay error
        return `${amount.toFixed(2)}`;
      }
    };

    /**
     * Obtiene el símbolo de moneda para el locale actual
     */
    const getCurrencySymbol = (): string => {
      try {
        const formatter = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: getCurrencyCode(locale),
        });
        
        // Extraer símbolo del formato
        const parts = formatter.formatToParts(1);
        const currencyPart = parts.find(p => p.type === 'currency');
        return currencyPart?.value || '$';
      } catch (e) {
        return '$';
      }
    };

    /**
     * Obtiene el código de moneda (ISO 4217) basado en el locale
     */
    const getCurrencyCode = (loc: string): string => {
      // Mapeo de locales a códigos de moneda
      const currencyMap: Record<string, string> = {
        'es-CR': 'CRC', // Costa Rica - Colón
        'en-CR': 'CRC',
        'es-MX': 'MXN', // México - Peso Mexicano
        'en-MX': 'MXN',
        'es-CO': 'COP', // Colombia - Peso Colombiano
        'en-CO': 'COP',
        'es-AR': 'ARS', // Argentina - Peso Argentino
        'en-AR': 'ARS',
        'es-CL': 'CLP', // Chile - Peso Chileno
        'en-CL': 'CLP',
        'es-PE': 'PEN', // Perú - Sol
        'en-PE': 'PEN',
        'es-ES': 'EUR', // España - Euro
        'en-GB': 'GBP', // Reino Unido - Libra
        'en-US': 'USD', // USA - Dólar
        'en-CA': 'CAD', // Canadá - Dólar Canadiense
        'fr-FR': 'EUR', // Francia - Euro
        'de-DE': 'EUR', // Alemania - Euro
        'it-IT': 'EUR', // Italia - Euro
        'pt-BR': 'BRL', // Brasil - Real
        'ja-JP': 'JPY', // Japón - Yen
        'zh-CN': 'CNY', // China - Yuan
        'ru-RU': 'RUB', // Rusia - Rublo
      };

      // Buscar coincidencia exacta
      if (currencyMap[loc]) {
        return currencyMap[loc];
      }

      // Buscar coincidencia por idioma (ej: es-* -> buscar es-ES)
      const lang = loc.split('-')[0];
      const fallback = Object.entries(currencyMap).find(
        ([key]) => key.startsWith(lang)
      );
      if (fallback) {
        return fallback[1];
      }

      // Fallback final: USD
      return 'USD';
    };

    return {
      locale,
      formatCurrency,
      getCurrencySymbol,
      getCurrencyCode: () => getCurrencyCode(locale),
    };
  }, []);
}
