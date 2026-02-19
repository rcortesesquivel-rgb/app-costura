import { View, Text, TouchableOpacity, ScrollView, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/lib/auth-context";
import { useColors } from "@/hooks/use-colors";
import { getApiBaseUrl } from "@/constants/oauth";
import { confirmAction, confirmDestructive, showAlert } from "@/lib/confirm";

export default function MiCuentaScreen() {
  const { user, isSignedIn, signOut } = useAuth();
  const router = useRouter();
  const colors = useColors();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        await signOut();
        router.replace("/(tabs)");
      }
    } else {
      confirmDestructive(
        "Cerrar sesión",
        "¿Estás seguro de que deseas cerrar sesión?",
        async () => {
          await signOut();
          router.replace("/(tabs)");
        },
        "Cerrar sesión"
      );
    }
  };

  const handleLogin = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/auth/signin");
  };

  const handleSignUp = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/auth/signup");
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail.trim()) {
      showAlert("Error", "Por favor ingresa tu email");
      return;
    }

    setIsLoadingReset(true);
    setResetMessage("");

    try {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Error al procesar" }));
        throw new Error(err.error || "Error al enviar el correo de recuperación");
      }

      setResetMessage("✓ Se envió un enlace de recuperación a tu email. Revisa tu bandeja de entrada.");
      setForgotEmail("");

      // Cerrar el modal después de 3 segundos
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetMessage("");
      }, 3000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Error desconocido";
      showAlert("Error", errorMsg);
    } finally {
      setIsLoadingReset(false);
    }
  };

  if (!isSignedIn) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center gap-6">
            {/* Header */}
            <View className="items-center gap-2">
              <Text className="text-3xl font-bold text-foreground">Mi Cuenta</Text>
              <Text className="text-base text-muted text-center">
                Inicia sesión para acceder a tu perfil y gestionar tus datos
              </Text>
            </View>

            {/* Login Card */}
            <View className="w-full bg-surface rounded-2xl p-6 gap-4 border border-border">
              <Text className="text-lg font-semibold text-foreground">¿Ya tienes cuenta?</Text>
              <TouchableOpacity
                onPress={handleLogin}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
              >
                <Text className="text-center font-semibold text-background">Iniciar Sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowForgotPassword(true)}
                style={{ paddingVertical: 8 }}
              >
                <Text style={{ color: colors.primary, textAlign: "center", fontSize: 14, fontWeight: "500" }}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Signup Card */}
            <View className="w-full bg-surface rounded-2xl p-6 gap-4 border border-border">
              <Text className="text-lg font-semibold text-foreground">¿Nuevo usuario?</Text>
              <TouchableOpacity
                onPress={handleSignUp}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  opacity: 0.8,
                }}
              >
                <Text className="text-center font-semibold text-background">Crear Cuenta</Text>
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View className="bg-warning/10 rounded-lg p-4 border border-warning/30">
              <Text className="text-sm text-foreground">
                💡 <Text className="font-semibold">Nota:</Text> Puedes usar la app sin iniciar sesión, pero necesitarás una cuenta para guardar tus datos y acceder desde otros dispositivos.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Modal de Olvidé mi contraseña */}
        {showForgotPassword && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <View
              className="rounded-2xl p-6 gap-4 w-11/12 max-w-sm"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-bold text-foreground">Recuperar Contraseña</Text>
                <TouchableOpacity onPress={() => setShowForgotPassword(false)}>
                  <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
                </TouchableOpacity>
              </View>

              {/* Descripción */}
              <Text className="text-sm text-muted">
                Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña.
              </Text>

              {/* Input de Email */}
              <View
                className="rounded-lg p-3 border"
                style={{ borderColor: colors.border, backgroundColor: colors.background }}
              >
                <Text className="text-xs font-semibold text-muted uppercase mb-2">Email</Text>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.currentTarget.value)}
                  style={{
                    fontSize: 16,
                    padding: 8,
                    color: colors.foreground,
                    border: "none",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </View>

              {/* Mensaje de éxito */}
              {resetMessage && (
                <View className="bg-success/10 rounded-lg p-3 border border-success/30">
                  <Text className="text-sm text-success font-semibold">{resetMessage}</Text>
                </View>
              )}

              {/* Botones */}
              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  onPress={() => setShowForgotPassword(false)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text className="text-center font-semibold text-foreground">Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  disabled={isLoadingReset}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                    opacity: isLoadingReset ? 0.6 : 1,
                  }}
                >
                  <Text className="text-center font-semibold text-background">
                    {isLoadingReset ? "Enviando..." : "Enviar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScreenContainer>
    );
  }

  // Usuario autenticado - mostrar perfil
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2">
            <View
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-2xl font-bold text-background">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-foreground">{user?.name || "Usuario"}</Text>
            <Text className="text-sm text-muted">{user?.email}</Text>
          </View>

          {/* User Info Card */}
          <View className="w-full bg-surface rounded-2xl p-6 gap-4 border border-border">
            <View className="gap-3">
              <View>
                <Text className="text-xs font-semibold text-muted uppercase mb-1">ID de Usuario</Text>
                <Text className="text-base text-foreground">{user?.id}</Text>
              </View>
              <View>
                <Text className="text-xs font-semibold text-muted uppercase mb-1">Rol</Text>
                <Text className="text-base text-foreground capitalize">
                  {user?.role === "admin" ? "Administrador" : "Sastre"}
                </Text>
              </View>
              <View>
                <Text className="text-xs font-semibold text-muted uppercase mb-1">Estado</Text>
                <Text className="text-base text-success font-semibold">Activo</Text>
              </View>
            </View>
          </View>

          {/* Cambiar Contraseña */}
          <TouchableOpacity
            onPress={() => setShowForgotPassword(true)}
            style={{
              backgroundColor: colors.surface,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <IconSymbol name="lock.fill" size={20} color={colors.primary} />
              <Text className="font-semibold text-foreground">Cambiar Contraseña</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Cerrar Sesión */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: colors.error,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              marginTop: 8,
            }}
          >
            <Text className="text-center font-semibold text-background">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal de Cambiar Contraseña (reutiliza el mismo modal) */}
      {showForgotPassword && isSignedIn && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <View
            className="rounded-2xl p-6 gap-4 w-11/12 max-w-sm"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Cambiar Contraseña</Text>
              <TouchableOpacity onPress={() => setShowForgotPassword(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {/* Descripción */}
            <Text className="text-sm text-muted">
              Te enviaremos un enlace de recuperación a tu email para cambiar tu contraseña.
            </Text>

            {/* Mensaje de éxito */}
            {resetMessage && (
              <View className="bg-success/10 rounded-lg p-3 border border-success/30">
                <Text className="text-sm text-success font-semibold">{resetMessage}</Text>
              </View>
            )}

            {/* Botones */}
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                onPress={() => setShowForgotPassword(false)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text className="text-center font-semibold text-foreground">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={isLoadingReset}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  opacity: isLoadingReset ? 0.6 : 1,
                }}
              >
                <Text className="text-center font-semibold text-background">
                  {isLoadingReset ? "Enviando..." : "Enviar Enlace"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}
