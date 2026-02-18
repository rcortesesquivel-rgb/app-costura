import { useEffect, useRef, useState } from "react";
import { Platform, TouchableOpacity, Alert, View, Text } from "react-native";
import * as Haptics from "expo-haptics";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

// Declaración global para Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

/**
 * Mapa de palabras habladas en español a números.
 * Cubre los casos más comunes de dictado en español.
 */
const WORD_TO_NUMBER: Record<string, number> = {
  cero: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4,
  cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14,
  quince: 15, dieciséis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiuno: 21, veintidós: 22, veintitrés: 23, veinticuatro: 24,
  veinticinco: 25, veintiséis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
  treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60,
  setenta: 70, ochenta: 80, noventa: 90,
  cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400,
  quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900,
  mil: 1000, millón: 1000000, millones: 1000000,
};

/**
 * Convierte texto hablado a número.
 * Ej: "son cien pesos" → "100"
 * Ej: "cinco mil quinientos" → "5500"
 * Ej: "1500" → "1500" (ya es número)
 */
function extractNumber(text: string): string {
  // Primero intentar extraer números directos del texto
  const directNumbers = text.match(/[\d]+[.,]?[\d]*/g);
  if (directNumbers && directNumbers.length > 0) {
    // Unir todos los números encontrados y normalizar coma a punto
    return directNumbers.join("").replace(",", ".");
  }

  // Si no hay números directos, intentar convertir palabras a números
  const words = text.toLowerCase()
    .replace(/[.,;:!?¿¡]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 0);

  let total = 0;
  let current = 0;
  let hasNumber = false;

  for (const word of words) {
    const val = WORD_TO_NUMBER[word];
    if (val !== undefined) {
      hasNumber = true;
      if (val === 1000) {
        current = current === 0 ? 1000 : current * 1000;
      } else if (val === 1000000) {
        current = current === 0 ? 1000000 : current * 1000000;
      } else if (val >= 100 && val < 1000) {
        current += val;
      } else {
        current += val;
      }
    } else if (word === "y" || word === "con") {
      // Ignorar conectores
      continue;
    } else if (hasNumber && (word === "pesos" || word === "colones" || word === "mil")) {
      if (word === "mil") {
        current = current === 0 ? 1000 : current * 1000;
      }
      // Ignorar "pesos" y "colones"
      continue;
    }
  }

  total += current;

  if (hasNumber && total > 0) {
    return total.toString();
  }

  // Si no se pudo convertir, retornar string vacío
  return "";
}

export type VoiceInputMode = "text" | "numeric";

interface VoiceInputProps {
  /** Modo del campo: "text" escribe todo, "numeric" filtra solo números */
  mode: VoiceInputMode;
  /** Callback cuando se obtiene el resultado del dictado */
  onResult: (value: string) => void;
  /** Tamaño del botón (default 32) */
  size?: number;
  /** Si el botón está deshabilitado */
  disabled?: boolean;
}

/**
 * Componente de dictado por voz reutilizable.
 * - En modo "text": escribe todo el texto dictado.
 * - En modo "numeric": filtra y convierte a número (ej: "cien pesos" → "100").
 * - Usa el contador audioTranscriptionsThisMonth para limitar uso.
 * - Tiempo de escucha: 20 segundos.
 */
export function VoiceInput({ mode, onResult, size = 32, disabled = false }: VoiceInputProps) {
  const colors = useColors();
  const [grabando, setGrabando] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: canRecord } = trpc.superAdmin.audio.canRecord.useQuery();
  const utils = trpc.useUtils();

  // Inicializar Web Speech API
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const instance = new SpeechRecognition();
    instance.continuous = false;
    instance.interimResults = false;
    instance.lang = "es-ES";
    instance.maxAlternatives = 1;

    instance.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setGrabando(false);
      clearTimer();

      if (mode === "numeric") {
        const num = extractNumber(transcript);
        if (num) {
          onResult(num);
        } else {
          Alert.alert("No se detectó número", `Se escuchó: "${transcript}". Intenta decir solo el número.`);
        }
      } else {
        onResult(transcript);
      }

      // Registrar transcripción en el servidor
      try {
        await utils.client.superAdmin.audio.recordTranscription.mutate();
        utils.superAdmin.audio.canRecord.invalidate();
      } catch (error) {
        console.error("Error registrando transcripción:", error);
      }
    };

    instance.onerror = () => {
      setGrabando(false);
      clearTimer();
    };

    instance.onend = () => {
      setGrabando(false);
      clearTimer();
    };

    recognitionRef.current = instance;

    return () => {
      clearTimer();
      try {
        instance.abort();
      } catch (_) {}
    };
  }, [mode, onResult]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Alert.alert("Información", "La grabación de voz solo está disponible en la versión web.");
      return;
    }

    if (!recognitionRef.current) {
      Alert.alert("Error", "Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    if (canRecord === false) {
      Alert.alert(
        "Límite alcanzado",
        "Has alcanzado tu límite mensual de transcripciones de audio. Actualiza tu plan para uso ilimitado."
      );
      return;
    }

    if (grabando) {
      recognitionRef.current.stop();
      setGrabando(false);
      clearTimer();
    } else {
      try {
        recognitionRef.current.start();
        setGrabando(true);
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        // Auto-stop después de 20 segundos
        timerRef.current = setTimeout(() => {
          try {
            recognitionRef.current?.stop();
          } catch (_) {}
          setGrabando(false);
        }, 20000);
      } catch (e) {
        setGrabando(false);
        Alert.alert("Error", "No se pudo iniciar el reconocimiento de voz.");
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: grabando ? colors.error : colors.primary + "20",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <IconSymbol
        name="mic.fill"
        size={size * 0.5}
        color={grabando ? "#FFFFFF" : colors.primary}
      />
    </TouchableOpacity>
  );
}

// Exportar extractNumber para testing
export { extractNumber };
