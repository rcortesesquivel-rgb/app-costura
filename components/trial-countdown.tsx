import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface TrialCountdownProps {
  expiresAt: Date | null;
  isTrialUser: boolean;
}

/**
 * Componente que muestra un contador regresivo para usuarios de prueba (48h)
 * Se actualiza cada segundo y desaparece cuando se agota el tiempo
 */
export function TrialCountdown({ expiresAt, isTrialUser }: TrialCountdownProps) {
  const colors = useColors();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!isTrialUser || !expiresAt) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const expireDate = new Date(expiresAt);
      const diff = expireDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      setIsExpired(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calcular inmediatamente
    calculateTimeLeft();

    // Actualizar cada segundo
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, isTrialUser]);

  // No mostrar si no es usuario de prueba o si ya expiró
  if (!isTrialUser || isExpired || !timeLeft) {
    return null;
  }

  // Determinar color según tiempo restante
  let bgColor = '#FEF3C7'; // Amarillo (más de 12 horas)
  let textColor = '#92400E'; // Marrón oscuro
  let borderColor = '#FBBF24'; // Amarillo más oscuro

  if (timeLeft.hours < 12) {
    bgColor = '#FED7AA'; // Naranja (menos de 12 horas)
    textColor = '#92400E';
    borderColor = '#FB923C';
  }

  if (timeLeft.hours < 6) {
    bgColor = '#FECACA'; // Rojo (menos de 6 horas)
    textColor = '#7F1D1D'; // Rojo oscuro
    borderColor = '#F87171';
  }

  return (
    <View
      className="w-full px-4 py-3 rounded-lg border-l-4 mb-4"
      style={{
        backgroundColor: bgColor,
        borderLeftColor: borderColor,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className="text-sm font-bold mb-1"
            style={{ color: textColor }}
          >
            ⏱️ Prueba Gratuita
          </Text>
          <Text
            className="text-xs"
            style={{ color: textColor }}
          >
            {timeLeft.days > 0
              ? `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`
              : `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s`}
            {' '}restantes
          </Text>
        </View>

        {/* Barra de progreso visual */}
        <View className="w-12 h-12 rounded-full items-center justify-center border-2" style={{ borderColor }}>
          <Text className="text-xs font-bold" style={{ color: textColor }}>
            {timeLeft.days > 0 ? `${timeLeft.days}d` : `${timeLeft.hours}h`}
          </Text>
        </View>
      </View>

      {/* Mensaje de urgencia si quedan menos de 6 horas */}
      {timeLeft.hours < 6 && (
        <Text
          className="text-xs mt-2 font-semibold"
          style={{ color: textColor }}
        >
          ⚠️ Tu prueba está por expirar. Adquiere tu membresía para continuar.
        </Text>
      )}
    </View>
  );
}
