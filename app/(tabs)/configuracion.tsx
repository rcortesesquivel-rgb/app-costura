import { ScrollView, Text, View, TouchableOpacity, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";

export default function ConfiguracionScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleAcercaDe = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Taller de Costura",
      "Versión 1.0.0\n\nAplicación para gestión de taller de costura.\n\nDesarrollado con Expo y React Native.",
      [{ text: "OK" }]
    );
  };

  const handleAyuda = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      "Ayuda",
      "Para soporte y ayuda, contacta con el desarrollador de la aplicación.",
      [{ text: "OK" }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas cerrar sesión?",
      [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        {
          text: "Cerrar sesión",
          onPress: async () => {
            try {
              await signOut();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace("/auth/signin" as any);
            } catch (error) {
              Alert.alert("Error", "No se pudo cerrar sesión");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Configuración</Text>
            <Text className="text-base text-muted">Ajustes de la aplicación</Text>
          </View>

          {/* Usuario */}
          {user && (
            <View className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-4 border border-primary/20">
              <View className="flex-row items-center gap-3">
                <View className="bg-primary rounded-full p-3">
                  <IconSymbol name="person.fill" size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">{user.name || user.email}</Text>
                  <Text className="text-sm text-muted mt-1">{user.email}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Sección General */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted uppercase tracking-wide">General</Text>
            
            <View className="bg-surface rounded-2xl border border-border overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center justify-between p-4 border-b border-border"
                onPress={handleAcercaDe}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className="bg-primary/10 rounded-full p-2">
                    <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                  </View>
                  <Text className="text-base text-foreground">Acerca de</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={handleAyuda}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-3">
                  <View className="bg-primary/10 rounded-full p-2">
                    <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                  </View>
                  <Text className="text-base text-foreground">Ayuda y soporte</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Información */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="items-center gap-3">
              <View className="bg-primary/10 rounded-full p-4">
                <IconSymbol name="scissors" size={48} color={colors.primary} />
              </View>
              <Text className="text-xl font-bold text-foreground">Taller de Costura</Text>
              <Text className="text-sm text-muted text-center">
                Gestiona tu taller de manera profesional con seguimiento de clientes, trabajos y estados.
              </Text>
            </View>
          </View>

          {/* Características */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted uppercase tracking-wide">Características</Text>
            
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <View className="flex-row items-start gap-3">
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Gestión de clientes</Text>
                  <Text className="text-sm text-muted mt-1">Base de datos completa con medidas</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Seguimiento de trabajos</Text>
                  <Text className="text-sm text-muted mt-1">Estados y fechas de entrega</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Búsqueda inteligente</Text>
                  <Text className="text-sm text-muted mt-1">Filtros por tipo y estado</Text>
                </View>
              </View>

              <View className="flex-row items-start gap-3">
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">Gestión de precios</Text>
                  <Text className="text-sm text-muted mt-1">Agregados y cálculo automático</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Cerrar sesión */}
          <TouchableOpacity
            className="rounded-2xl py-4 items-center border border-error/30 bg-error/5"
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center gap-2">
              <IconSymbol name="arrow.left.circle.fill" size={20} color={colors.error} />
              <Text className="text-base font-semibold" style={{ color: colors.error }}>
                Cerrar sesión
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
