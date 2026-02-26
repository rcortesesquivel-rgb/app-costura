import React from 'react';
import { View, Text, Pressable, Modal, ScrollView, Platform, Linking } from 'react-native';

interface ConversionPopupProps {
  visible: boolean;
  onClose: () => void;
  userName: string;
  onActivate: () => void;
}

/**
 * Pop-up de conversión profesional que aparece cuando el usuario regresa
 * después de enviar WhatsApp o cambiar estado a Listo/Entregado
 */
export function ConversionPopup({ visible, onClose, userName, onActivate }: ConversionPopupProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: 20,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: '#1E3A5F',
            maxHeight: '90%',
          }}
        >
          {/* Botón de cerrar pequeño */}
          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 10,
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>×</Text>
          </Pressable>

          <ScrollView contentContainerStyle={{ padding: 24 }}>
            {/* Título con emoji y nombre */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 8, color: '#FFD700' }}>
                {"¡Excelente atención al cliente! 🧵✨"}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center', color: '#FFFFFF' }}>
                {userName}
              </Text>
            </View>

            {/* Cuerpo del mensaje */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 15, textAlign: 'center', lineHeight: 22, color: '#FFFFFF' }}>
                {"Estás a un paso de profesionalizar tu taller. Únete a las primeras "}
                <Text style={{ fontWeight: '700', color: '#FFD700' }}>{"1000 suscriptoras"}</Text>
                {" y participa por una "}
                <Text style={{ fontWeight: '700', color: '#FFA500' }}>{"Tablet Profesional"}</Text>
                {" o "}
                <Text style={{ fontWeight: '700', color: '#FFA500' }}>{"Meses de Suscripción Gratis"}</Text>
                {"."}
              </Text>
            </View>

            {/* Condiciones */}
            <View
              style={{
                borderRadius: 16,
                padding: 16,
                marginBottom: 24,
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 1,
                borderColor: '#FFD700',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', marginBottom: 12, color: '#FFD700' }}>
                {"Condiciones para participar:"}
              </Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <Text style={{ color: '#FFA500' }}>{"•"}</Text>
                  <Text style={{ flex: 1, fontSize: 13, color: '#FFFFFF' }}>
                    {"Activar la membresía de "}
                    <Text style={{ fontWeight: '700' }}>{"$12/mes"}</Text>
                    {", "}
                    <Text style={{ fontWeight: '700' }}>{"Anual"}</Text>
                    {" o "}
                    <Text style={{ fontWeight: '700' }}>{"Licencia Vitalicia"}</Text>
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <Text style={{ color: '#FFA500' }}>{"•"}</Text>
                  <Text style={{ flex: 1, fontSize: 13, color: '#FFFFFF' }}>
                    {"Haber registrado al menos "}
                    <Text style={{ fontWeight: '700' }}>{"1 trabajo"}</Text>
                    {" en la app"}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                  <Text style={{ color: '#FFA500' }}>{"•"}</Text>
                  <Text style={{ flex: 1, fontSize: 13, color: '#FFFFFF' }}>
                    {"Comentar en nuestra publicación oficial qué función te gusta más y etiquetar a "}
                    <Text style={{ fontWeight: '700' }}>{"2 colegas costureras"}</Text>
                  </Text>
                </View>
              </View>
            </View>

            {/* Planes y precios */}
            <View
              style={{
                borderRadius: 16,
                padding: 16,
                marginBottom: 24,
                backgroundColor: 'rgba(255, 165, 0, 0.1)',
                borderWidth: 1,
                borderColor: '#FFA500',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: '#FFA500' }}>
                {"Elige tu plan:"}
              </Text>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: '#FFFFFF' }}>{"Suscripción Mensual"}</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFD700' }}>{"$12"}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: '#FFFFFF' }}>{"Suscripción Anual"}</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFD700' }}>{"$120"}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#FFA500' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>{"Licencia Vitalicia PRO"}</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFD700' }}>{"$597"}</Text>
                </View>
              </View>
            </View>

            {/* Botón de acción principal */}
            <Pressable
              onPress={onActivate}
              style={({ pressed }) => ({
                borderRadius: 24,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 12,
                backgroundColor: '#FFD700',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#1E3A5F' }}>
                {"Activar mi Membresía por $12"}
              </Text>
            </Pressable>

            {/* Texto adicional */}
            <Text style={{ fontSize: 12, textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
              {"Únete ahora y participa automáticamente en el sorteo"}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
