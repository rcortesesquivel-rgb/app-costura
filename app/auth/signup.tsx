import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signUp } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Error", "Por favor ingresa un email válido");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, nombre);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la cuenta. Intenta de nuevo.");
      console.error("Sign up error:", error);
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
              <Text className="text-base text-muted">Crea tu cuenta para empezar</Text>
            </View>

            {/* Formulario */}
            <View className="gap-4">
              {/* Nombre */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Nombre completo</Text>
                <View className="bg-surface rounded-xl border border-border flex-row items-center px-4 py-3 gap-3">
                  <IconSymbol name="person.fill" size={20} color={colors.muted} />
                  <TextInput
                    className="flex-1 text-base text-foreground"
                    placeholder="Tu nombre"
                    placeholderTextColor={colors.muted}
                    value={nombre}
                    onChangeText={setNombre}
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>
              </View>

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
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={colors.muted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    returnKeyType="next"
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

              {/* Confirmar Contraseña */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Confirmar contraseña</Text>
                <View className="bg-surface rounded-xl border border-border flex-row items-center px-4 py-3 gap-3">
                  <IconSymbol name="lock.fill" size={20} color={colors.muted} />
                  <TextInput
                    className="flex-1 text-base text-foreground"
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={colors.muted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>

            {/* Botón de registro */}
            <TouchableOpacity
              className="rounded-xl py-4 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-base font-semibold text-white">Crear cuenta</Text>
              )}
            </TouchableOpacity>

            {/* Enlace a login */}
            <View className="flex-row items-center justify-center gap-2">
              <Text className="text-sm text-muted">¿Ya tienes cuenta?</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.replace("/auth/signin" as any);
                }}
                disabled={isLoading}
              >
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                  Inicia sesión
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
