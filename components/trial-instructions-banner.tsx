import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface TrialInstructionsBannerProps {
  isTrialUser: boolean;
  onDismiss?: () => void;
}

/**
 * Banner minimizable que muestra instrucciones iniciales para usuarios de prueba (48h gratuita)
 * Solo aparece para usuarios con status "prueba"
 */
export function TrialInstructionsBanner({
  isTrialUser,
  onDismiss,
}: TrialInstructionsBannerProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const router = useRouter();

  if (!isTrialUser) {
    return null;
  }

  const handleContactSupport = () => {
    router.push('/configuracion');
  };

  return (
    <View
      style={{
        width: '100%',
        borderLeftWidth: 4,
        borderLeftColor: '#F97316',
        backgroundColor: '#FFF7ED',
      }}
    >
      {/* Header minimizable */}
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#F97316',
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18, marginRight: 8 }}>{"🎓"}</Text>
          <Text style={{ color: '#FFFFFF', fontWeight: '600', flex: 1 }}>
            {isExpanded ? 'Instrucciones Iniciales' : 'Toca para expandir'}
          </Text>
        </View>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>
          {isExpanded ? '−' : '+'}
        </Text>
      </Pressable>

      {/* Contenido expandible */}
      {isExpanded ? (
        <ScrollView
          style={{ maxHeight: 384, paddingHorizontal: 16, paddingVertical: 16 }}
          scrollEnabled={Platform.OS !== 'web'}
        >
          <View style={{ gap: 16 }}>
            {/* Paso 1 */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>{"1"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 16, color: '#1C1C1E' }}>
                    {"Crear cliente o clientes"}
                  </Text>
                  <Text style={{ color: '#8E8E93', fontSize: 14, lineHeight: 20 }}>
                    {"Comienza agregando tus clientes. Si deseas, puedes entrar al cliente y guardar sus medidas en la sección \"Editar\"."}
                  </Text>
                </View>
              </View>
            </View>

            {/* Paso 2 */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>{"2"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 16, color: '#1C1C1E' }}>
                    {"Crear trabajo o trabajos"}
                  </Text>
                  <Text style={{ color: '#8E8E93', fontSize: 14, lineHeight: 20 }}>
                    {"Selecciona el tipo de trabajo y su urgencia. Puedes usar el grabador de voz para anotar detalles rápidamente."}
                  </Text>
                </View>
              </View>
            </View>

            {/* Paso 3 */}
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>{"3"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', fontSize: 16, color: '#1C1C1E' }}>
                    {"Editar y cambiar estado"}
                  </Text>
                  <Text style={{ color: '#8E8E93', fontSize: 14, lineHeight: 20 }}>
                    {"Entra al trabajo creado y edítalo si deseas. Puedes cambiar su categoría a \"Listo\" o \"Entregado\" según el progreso."}
                  </Text>
                </View>
              </View>
            </View>

            {/* Mensaje motivacional */}
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#FED7AA', marginTop: 8 }}>
              <Text style={{ fontSize: 14, lineHeight: 20, color: '#1C1C1E' }}>
                <Text style={{ fontWeight: '600' }}>{"Poco a poco aprenderás"}</Text>
                {" cómo funciona la app y verás lo fácil que es. ¡Estamos aquí para ayudarte!"}
              </Text>
            </View>

            {/* Botón de soporte */}
            <Pressable
              onPress={handleContactSupport}
              style={({ pressed }) => ({
                backgroundColor: '#F97316',
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: 'center',
                marginTop: 8,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                {"¿Dudas? Contacta a Soporte"}
              </Text>
            </Pressable>

            {/* Botón de cerrar */}
            <Pressable
              onPress={() => {
                setIsExpanded(false);
                onDismiss?.();
              }}
              style={({ pressed }) => ({
                paddingVertical: 8,
                paddingHorizontal: 16,
                alignItems: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ color: '#8E8E93', fontSize: 14 }}>{"Cerrar instrucciones"}</Text>
            </Pressable>
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}
