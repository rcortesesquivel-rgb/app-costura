import { ScrollView, Text, View, TouchableOpacity, Alert, Platform, Linking, TextInput } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { confirmAction, confirmDestructive, showAlert } from "@/lib/confirm";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";

const SOPORTE_EMAIL = "ryrnissi@gmail.com";
const WHATSAPP_LINK = "https://wa.me/50670460451";

export default function CentroAyudaScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [sinpeTelefono, setSinpeTelefono] = useState("");
  const [telefono, setTelefono] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [fullUser, setFullUser] = useState<any>(null);

  // Obtener datos completos del usuario
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const meData = await trpc.auth.me.query();
        if (meData) {
          setFullUser(meData);
          setSinpeTelefono((meData as any).sinpeTelefono || "");
          setTelefono((meData as any).telefono || "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

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
        showAlert("Error", `No se pudo abrir el correo. Escribe directamente a: ${SOPORTE_EMAIL}`);
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
        showAlert("Error", "No se pudo abrir WhatsApp. Intenta de nuevo.");
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
      showAlert("Acerca de", msg);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sinpeTelefono,
          telefono,
        }),
        credentials: "include",
      });
      if (response.ok) {
        setIsEditingProfile(false);
        if (Platform.OS === "web") {
          window.alert("Perfil actualizado correctamente");
        } else {
          showAlert("Éxito", "Perfil actualizado correctamente");
        }
      } else {
        throw new Error("Error al actualizar");
      }
    } catch (error) {
      if (Platform.OS === "web") {
        window.alert("Error al actualizar el perfil");
      } else {
        showAlert("Error", "Error al actualizar el perfil");
      }
    } finally {
      setIsSaving(false);
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
          showAlert("Error", "No se pudo cerrar sesión");
        }
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        await doLogout();
      }
    } else {
      confirmDestructive(
        "Cerrar sesión",
        "¿Estás seguro de que deseas cerrar sesión?",
        doLogout,
        "Cerrar sesión"
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
              <View className="flex-row items-center gap-3 mb-4">
                <View style={{ backgroundColor: colors.primary, borderRadius: 999, padding: 12 }}>
                  <IconSymbol name="person.fill" size={24} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-foreground">{user.name || user.email}</Text>
                  <Text className="text-sm text-muted" style={{ marginTop: 4 }}>{user.email}</Text>
                </View>
              </View>
              {!isEditingProfile ? (
                <TouchableOpacity onPress={() => setIsEditingProfile(true)} style={{ paddingVertical: 8 }}>
                  <Text style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>Editar datos de pago</Text>
                </TouchableOpacity>
              ) : (
                <View className="gap-3 mt-4">
                  <View>
                    <Text className="text-xs font-semibold text-muted mb-2">Numero SINPE</Text>
                    <TextInput placeholder="Ej: 70460451" value={sinpeTelefono} onChangeText={setSinpeTelefono} editable={!isSaving} style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, color: colors.foreground, fontSize: 14 }} />
                  </View>
                  <View>
                    <Text className="text-xs font-semibold text-muted mb-2">Telefono de contacto</Text>
                    <TextInput placeholder="Ej: 70460451" value={telefono} onChangeText={setTelefono} editable={!isSaving} style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, color: colors.foreground, fontSize: 14 }} />
                  </View>
                  <View className="flex-row gap-2 mt-2">
                    <TouchableOpacity onPress={() => setIsEditingProfile(false)} disabled={isSaving} style={{ flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}>
                      <Text style={{ color: colors.foreground, fontWeight: "600", fontSize: 14 }}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveProfile} disabled={isSaving} style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", opacity: isSaving ? 0.6 : 1 }}>
                      <Text style={{ color: "#FFFFFF", fontWeight: "600", fontSize: 14 }}>{isSaving ? "Guardando..." : "Guardar"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
