import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, Linking } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";

const SOPORTE_EMAIL = "soporteviral@gmail.com";
const WHATSAPP_LINK = "https://wa.me/50686419894";

export default function CentroAyudaScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleEmail = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const subject = encodeURIComponent("Soporte - Taller de Costura App");
    const body = encodeURIComponent(`Hola, necesito ayuda con la aplicación.\n\nUsuario: ${user?.email || "N/A"}\n\nDescripción del problema:\n`);
    const mailtoUrl = `mailto:${SOPORTE_EMAIL}?subject=${subject}&body=${body}`;
    Linking.openURL(mailtoUrl).catch(() => {
      if (Platform.OS === "web") {
        window.alert(`No se pudo abrir el correo. Escribe directamente a: ${SOPORTE_EMAIL}`);
      } else {
        Alert.alert("Error", `No se pudo abrir el correo. Escribe directamente a: ${SOPORTE_EMAIL}`);
      }
    });
  };

  const handleWhatsApp = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(WHATSAPP_LINK).catch(() => {
      if (Platform.OS === "web") {
        window.alert("No se pudo abrir WhatsApp. Intenta de nuevo.");
      } else {
        Alert.alert("Error", "No se pudo abrir WhatsApp. Intenta de nuevo.");
      }
    });
  };

  const handleAcercaDe = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const msg = "Taller de Costura\n\nVersión 1.0.0\n\nAplicación profesional para gestión de talleres de costura.\n\nDesarrollado con Expo y React Native.";
    if (Platform.OS === "web") {
      window.alert(msg);
    } else {
      Alert.alert("Acerca de", msg, [{ text: "Aceptar" }]);
    }
  };

  const handleLogout = async () => {
    const doLogout = async () => {
      try {
        await signOut();
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        router.replace("/auth/signin" as any);
      } catch (error) {
        if (Platform.OS === "web") {
          window.alert("No se pudo cerrar sesión");
        } else {
          Alert.alert("Error", "No se pudo cerrar sesión");
        }
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        await doLogout();
      }
    } else {
      Alert.alert(
        "Cerrar sesión",
        "¿Estás seguro de que deseas cerrar sesión?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Cerrar sesión", onPress: doLogout, style: "destructive" },
        ]
      );
    }
  };

  const MenuItem = ({ icon, label, subtitle, onPress, iconBg }: { icon: any; label: string; subtitle?: string; onPress: () => void; iconBg: string }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
      }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
        <View style={{ backgroundColor: iconBg, borderRadius: 999, padding: 8 }}>
          <IconSymbol name={icon} size={20} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text className="text-base text-foreground">{label}</Text>
          {subtitle && <Text className="text-xs text-muted" style={{ marginTop: 2 }}>{subtitle}</Text>}
        </View>
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="p-6 gap-6">
          {/* Encabezado */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Centro de Ayuda</Text>
            <Text className="text-base text-muted">Soporte y configuración</Text>
          </View>

          {/* Información del usuario */}
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

          {/* Sección: Contacto */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Contacto</Text>
            <View className="bg-surface rounded-2xl border border-border" style={{ overflow: "hidden" }}>
              <MenuItem
                icon="envelope.fill"
                label="Correo electrónico"
                subtitle={SOPORTE_EMAIL}
                onPress={handleEmail}
                iconBg="#007AFF"
              />
              <MenuItem
                icon="message.fill"
                label="WhatsApp"
                subtitle="Chatea con soporte"
                onPress={handleWhatsApp}
                iconBg="#25D366"
              />
            </View>
          </View>

          {/* Sección: Información */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Información</Text>
            <View className="bg-surface rounded-2xl border border-border" style={{ overflow: "hidden" }}>
              <MenuItem
                icon="info.circle.fill"
                label="Acerca de"
                subtitle="Versión 1.0.0"
                onPress={handleAcercaDe}
                iconBg={colors.primary}
              />
            </View>
          </View>

          {/* Información de la app */}
          <View className="bg-surface rounded-2xl p-6 border border-border">
            <View className="items-center gap-3">
              <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 999, padding: 16 }}>
                <IconSymbol name="scissors" size={48} color={colors.primary} />
              </View>
              <Text className="text-xl font-bold text-foreground">Taller de Costura</Text>
              <Text className="text-sm text-muted text-center">
                Gestiona tu taller de manera profesional con seguimiento de clientes, trabajos, estados y urgencias.
              </Text>
            </View>
          </View>

          {/* Características */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted" style={{ textTransform: "uppercase", letterSpacing: 1 }}>Características</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              {[
                { title: "Gestión de clientes", desc: "Base de datos completa con medidas" },
                { title: "Seguimiento de trabajos", desc: "Estados, urgencias y fechas de entrega" },
                { title: "Búsqueda por categoría", desc: "Arreglo, Confección, Bordado, Sublimado" },
                { title: "Cálculos automáticos", desc: "Precio × Cantidad + Impuestos + Varios" },
                { title: "Dictado por voz", desc: "Dicta descripciones y precios" },
              ].map((item, i) => (
                <View key={i} className="flex-row items-start gap-3">
                  <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground">{item.title}</Text>
                    <Text className="text-sm text-muted" style={{ marginTop: 2 }}>{item.desc}</Text>
                  </View>
                </View>
              ))}
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
