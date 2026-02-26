import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

/**
 * Hook para detectar cuando el usuario regresa a la app
 * Útil para mostrar pop-ups después de que el usuario vuelve de WhatsApp
 */
export function useAppState(onForeground?: () => void, onBackground?: () => void) {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // Detectar cuando la app vuelve al foreground
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // Usuario regresó a la app
        onForeground?.();
      }

      // Detectar cuando la app va al background
      if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // Usuario salió de la app
        onBackground?.();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [onForeground, onBackground]);

  return appState.current;
}

/**
 * Hook para detectar cuando el usuario regresa de WhatsApp
 * Muestra un callback después de un delay para dar tiempo a que la app se estabilice
 */
export function useWhatsAppReturn(onReturn: () => void, delay: number = 1000) {
  const hasLeftApp = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useAppState(
    () => {
      // Usuario regresó a la app
      if (hasLeftApp.current) {
        // Esperar un poco antes de ejecutar el callback
        timeoutRef.current = setTimeout(() => {
          onReturn();
          hasLeftApp.current = false;
        }, delay);
      }
    },
    () => {
      // Usuario salió de la app
      hasLeftApp.current = true;
      
      // Limpiar timeout si existe
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}

/**
 * Hook para detectar focus en web
 * En web, usamos window focus events
 */
export function useWindowFocus(onFocus?: () => void, onBlur?: () => void) {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleFocus = () => {
      onFocus?.();
    };

    const handleBlur = () => {
      onBlur?.();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onFocus, onBlur]);
}
