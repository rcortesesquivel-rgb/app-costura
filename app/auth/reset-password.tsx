import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { confirmAction, confirmDestructive, showAlert } from "@/lib/confirm";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const colors = useColors();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleResetPassword = async () => {
    // Validaciones
    if (!token) {
      showAlert("Error", "Token de recuperación no válido");
      return;
    }

    if (!newPassword || !confirmPassword) {
      showAlert("Error", "Por favor completa todos los campos");
      return;
    }

    if (newPassword.length < 6) {
      showAlert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Error", "Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert("Error", data.error || "No se pudo restablecer la contraseña");
        return;
      }

      showAlert(
        "Éxito",
        "Tu contraseña ha sido restablecida correctamente. Por favor inicia sesión con tu nueva contraseña.",
        () => router.push("/auth/signin")
      );
    } catch (error) {
      console.error("Error resetting password:", error);
      showAlert("Error", "Ocurrió un error al restablecer la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground mb-2">
              Restablecer Contraseña
            </Text>
            <Text className="text-base text-muted">
              Ingresa tu nueva contraseña para acceder a tu cuenta
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {/* Nueva Contraseña */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Nueva Contraseña
              </Text>
              <View
                className="flex-row items-center border rounded-lg px-4 py-3"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <TextInput
                  placeholder="Ingresa tu nueva contraseña"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  editable={!isLoading}
                  className="flex-1 text-foreground"
                  style={{ color: colors.foreground }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text className="text-primary font-semibold ml-2">
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Contraseña */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Confirmar Contraseña
              </Text>
              <View
                className="flex-row items-center border rounded-lg px-4 py-3"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <TextInput
                  placeholder="Confirma tu nueva contraseña"
                  placeholderTextColor={colors.muted}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isLoading}
                  className="flex-1 text-foreground"
                  style={{ color: colors.foreground }}
                />
              </View>
            </View>

            {/* Requisitos de Contraseña */}
            <View className="mt-4 p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
              <Text className="text-xs font-semibold text-muted mb-2">
                Requisitos de contraseña:
              </Text>
              <View className="gap-1">
                <Text
                  className={`text-xs ${
                    newPassword.length >= 6 ? "text-success" : "text-muted"
                  }`}
                >
                  • Mínimo 6 caracteres
                </Text>
                <Text
                  className={`text-xs ${
                    newPassword === confirmPassword && newPassword.length > 0
                      ? "text-success"
                      : "text-muted"
                  }`}
                >
                  • Las contraseñas coinciden
                </Text>
              </View>
            </View>
          </View>

          {/* Botones */}
          <View className="gap-3 mt-8">
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={isLoading}
              className="rounded-lg py-4 items-center"
              style={{
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              <Text className="text-background font-bold text-base">
                {isLoading ? "Procesando..." : "Restablecer Contraseña"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/auth/signin")}
              disabled={isLoading}
            >
              <Text className="text-center text-primary font-semibold">
                Volver a Iniciar Sesión
              </Text>
            </TouchableOpacity>
          </View>

          {/* Nota de Seguridad */}
          <View className="mt-8 p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
            <Text className="text-xs text-muted text-center">
              Por tu seguridad, este enlace expira en 1 hora. Si no puedes restablecer tu
              contraseña, solicita un nuevo enlace desde la pantalla de inicio de sesión.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
