import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.message === "ACCOUNT_INACTIVE") {
        Alert.alert(
          "Cuenta Inactiva",
          "Tu suscripción ha vencido. Por favor, renueva tu membresía en Hotmart para continuar usando la app.",
          [
            { text: "OK", onPress: () => {} },
          ]
        );
      } else {
        Alert.alert("Error", "Email o contraseña incorrectos");
      }
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <View className="p-6 gap-6 flex-1 justify-center">
            {/* Logo */}
            <View className="items-center gap-3">
              <View className="bg-primary/10 rounded-full p-6">
                <IconSymbol name="scissors" size={48} color={colors.primary} />
              </View>
              <Text className="text-3xl font-bold text-foreground">Taller de Costura</Text>
              <Text className="text-base text-muted">Inicia sesión en tu cuenta</Text>
            </View>

            {/* Formulario */}
            <View className="gap-4">
              {/* Email */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Email</Text>
                <View className="bg-surface rounded-xl border border-border flex-row items-center px-4 py-3 gap-3">
                  <IconSymbol name="envelope.fill" size={20} color={colors.muted} />
                  <TextInput
                    className="flex-1 text-base text-foreground"
                    placeholder="tu@email.com"
                    placeholderTextColor={colors.muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Contraseña */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Contraseña</Text>
                <View className="bg-surface rounded-xl border border-border flex-row items-center px-4 py-3 gap-3">
                  <IconSymbol name="lock.fill" size={20} color={colors.muted} />
                  <TextInput
                    className="flex-1 text-base text-foreground"
                    placeholder="Tu contraseña"
                    placeholderTextColor={colors.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    <IconSymbol
                      name={showPassword ? "eye.fill" : "eye.slash.fill"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Botón de login */}
            <TouchableOpacity
              className="rounded-xl py-4 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-semibold text-white">Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            {/* Enlace a registro */}
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-sm text-muted">¿No tienes cuenta?</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.replace("/auth/signup" as any);
                }}
                disabled={isLoading}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Regístrate aquí
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
