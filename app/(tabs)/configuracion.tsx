import { ScrollView, Text, View, TouchableOpacity, Alert, Platform } from "react-native";
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
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (Platform.OS === "web") {
      window.alert("Taller de Costura\n\nVersión 1.0.0\n\nAplicación para gestión de taller de costura.\n\nDesarrollado con Expo y React Native.");
    } else {
      Alert.alert(
        "Taller de Costura",
        "Versión 1.0.0\n\nAplicación para gestión de taller de costura.\n\nDesarrollado con Expo y React Native.",
        [{ text: "OK" }]
      );
    }
  };

  const handleAyuda = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (Platform.OS === "web") {
      window.alert("Para soporte y ayuda, contacta con el desarrollador de la aplicación.");
    } else {
      Alert.alert(
        "Ayuda",
        "Para soporte y ayuda, contacta con el desarrollador de la aplicación.",
        [{ text: "OK" }]
      );
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
      if (confirmed) {
        try {
          await signOut();
          router.replace("/auth/signin" as any);
        } catch (error) {
          window.alert("No se pudo cerrar sesión");
        }
      }
    } else {
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
    }
  };

  // Web version with native HTML buttons
  if (Platform.OS === "web") {
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
              <View style={{ backgroundColor: `${colors.primary}10`, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: `${colors.primary}30` }}>
                <View className="flex-row items-center gap-3">
                  <View style={{ backgroundColor: colors.primary, borderRadius: 999, padding: 12 }}>
                    <IconSymbol name="person.fill" size={24} color="#FFFFFF" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{user.name || user.email}</Text>
                    <Text className="text-sm text-muted" style={{ marginTop: 4 }}>{user.email}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Sección General */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-muted" style={{ textTransform: "uppercase", letterSpacing: 1 }}>General</Text>
              
              <View className="bg-surface rounded-2xl border border-border" style={{ overflow: "hidden" }}>
                <button
                  onClick={handleAcercaDe}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderBottom: `1px solid ${colors.border}`,
                    background: "none",
                    border: "none",
                    borderBottomWidth: 1,
                    borderBottomStyle: "solid" as const,
                    borderBottomColor: colors.border,
                    cursor: "pointer",
                    width: "100%",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 999, padding: 8 }}>
                      <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                    </View>
                    <span style={{ fontSize: 16, color: colors.foreground }}>Acerca de</span>
                  </div>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </button>

                <button
                  onClick={handleAyuda}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 999, padding: 8 }}>
                      <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                    </View>
                    <span style={{ fontSize: 16, color: colors.foreground }}>Ayuda y soporte</span>
                  </div>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </button>
              </View>
            </View>

            {/* Información */}
            <View className="bg-surface rounded-2xl p-6 border border-border">
              <View className="items-center gap-3">
                <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 999, padding: 16 }}>
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
              <Text className="text-sm font-semibold text-muted" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Características</Text>
              
              <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
                <View className="flex-row items-start gap-3">
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground">Gestión de clientes</Text>
                    <Text className="text-sm text-muted" style={{ marginTop: 4 }}>Base de datos completa con medidas</Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground">Seguimiento de trabajos</Text>
                    <Text className="text-sm text-muted" style={{ marginTop: 4 }}>Estados y fechas de entrega</Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground">Búsqueda inteligente</Text>
                    <Text className="text-sm text-muted" style={{ marginTop: 4 }}>Filtros por tipo y estado</Text>
                  </View>
                </View>

                <View className="flex-row items-start gap-3">
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground">Gestión de precios</Text>
                    <Text className="text-sm text-muted" style={{ marginTop: 4 }}>Agregados y cálculo automático</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Cerrar sesión - HTML button for web */}
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 16,
                padding: "16px 24px",
                border: `1px solid ${colors.error}40`,
                backgroundColor: `${colors.error}08`,
                cursor: "pointer",
                fontFamily: "inherit",
                width: "100%",
              }}
            >
              <IconSymbol name="arrow.left.circle.fill" size={20} color={colors.error} />
              <span style={{ fontSize: 16, fontWeight: "600", color: colors.error }}>
                Cerrar sesión
              </span>
            </button>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Native version (iOS/Android)
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
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}
                onPress={handleAcercaDe}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 999, padding: 8 }}>
                    <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                  </View>
                  <Text className="text-base text-foreground">Acerca de</Text>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.muted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}
                onPress={handleAyuda}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 999, padding: 8 }}>
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
              <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 999, padding: 16 }}>
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
            style={{
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: `${colors.error}40`,
              backgroundColor: `${colors.error}08`,
            }}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <IconSymbol name="arrow.left.circle.fill" size={20} color={colors.error} />
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.error }}>
                Cerrar sesión
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
