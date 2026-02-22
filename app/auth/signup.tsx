import { ScrollView, Text, View, Platform, KeyboardAvoidingView, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { WebSafeButton } from "@/components/web-safe-button";
import { PhoneInput } from "@/components/phone-input";
import { getDefaultCountryCode, formatPhoneForStorage, validatePhoneNumber } from "@/lib/phone-validation";

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signUp } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [countryCode, setCountryCode] = useState(getDefaultCountryCode());
  const [phoneError, setPhoneError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const handleSignUp = async () => {
    setErrorMsg("");
    setPhoneError("");

    if (!nombre.trim()) {
      setErrorMsg("El nombre es obligatorio");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMsg("Por favor ingresa un email válido");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }

    let phoneToSend = telefono;
    if (telefono.trim()) {
      if (!validatePhoneNumber(telefono, countryCode)) {
        setPhoneError("Por favor ingresa un número de teléfono válido");
        return;
      }
      phoneToSend = formatPhoneForStorage(telefono, countryCode);
    }

    setIsLoading(true);
    try {
      await signUp(email, password, nombre, phoneToSend);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace("/(tabs)");
    } catch (error: any) {
      setErrorMsg(error.message || "No se pudo crear la cuenta. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Web version with native HTML inputs for reliable state sync
  if (Platform.OS === "web") {
    const inputStyle = {
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: 12,
      padding: "12px 16px",
      fontSize: 16,
      color: colors.foreground,
      outline: "none",
      fontFamily: "inherit",
      width: "100%",
      boxSizing: "border-box" as const,
    };

    return (
      <ScreenContainer className="bg-background">
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <View className="p-6 gap-6 flex-1 justify-center">
            {/* Logo */}
            <View className="items-center gap-3">
              <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 999, padding: 24 }}>
                <IconSymbol name="scissors" size={48} color={colors.primary} />
              </View>
              <Text className="text-3xl font-bold text-foreground">Taller de Costura</Text>
              <Text className="text-base text-muted">Crea tu cuenta</Text>
            </View>

            {/* Error message */}
            {errorMsg ? (
              <View style={{ backgroundColor: "#FEE2E2", borderRadius: 8, padding: 12 }}>
                <Text style={{ color: "#DC2626", fontSize: 14, textAlign: "center" }}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Web-native form */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isLoading}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>Email</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  style={inputStyle}
                />
              </div>

              <PhoneInput
                value={telefono}
                onChangeText={setTelefono}
                countryCode={countryCode}
                onCountryChange={setCountryCode}
                disabled={isLoading}
                error={phoneError}
              />

              <button
                onClick={handleSignUp}
                disabled={isLoading}
                style={{
                  backgroundColor: colors.primary,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 24px",
                  fontSize: 16,
                  fontWeight: "600",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  opacity: isLoading ? 0.7 : 1,
                  fontFamily: "inherit",
                  transition: "opacity 0.2s",
                  width: "100%",
                }}
              >
                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
              </button>

              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: colors.muted }}>¿Ya tienes cuenta?</span>
                <button
                  onClick={() => router.replace("/auth/signin" as any)}
                  style={{
                    background: "none",
                    border: "none",
                    color: colors.primary,
                    fontSize: 14,
                    fontWeight: "600",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  Inicia sesión
                </button>
              </div>
            </div>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Native version (iOS/Android)
  const TextInput = require("react-native").TextInput;
  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <View className="p-6 gap-6 flex-1 justify-center">
            <View className="items-center gap-3">
              <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 999, padding: 24 }}>
                <IconSymbol name="scissors" size={48} color={colors.primary} />
              </View>
              <Text className="text-3xl font-bold text-foreground">Taller de Costura</Text>
              <Text className="text-base text-muted">Crea tu cuenta</Text>
            </View>

            {errorMsg ? (
              <View style={{ backgroundColor: "#FEE2E2", borderRadius: 8, padding: 12 }}>
                <Text style={{ color: "#DC2626", fontSize: 14, textAlign: "center" }}>{errorMsg}</Text>
              </View>
            ) : null}

            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Nombre completo</Text>
                <View className="bg-surface rounded-xl border border-border flex-row items-center px-4 py-3 gap-3">
                  <IconSymbol name="person.fill" size={20} color={colors.muted} />
                  <TextInput className="flex-1 text-base text-foreground" placeholder="Tu nombre" placeholderTextColor={colors.muted} value={nombre} onChangeText={setNombre} editable={!isLoading} returnKeyType="next" />
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Email</Text>
                <View className="bg-surface rounded-xl border border-border flex-row items-center px-4 py-3 gap-3">
                  <IconSymbol name="envelope.fill" size={20} color={colors.muted} />
                  <TextInput className="flex-1 text-base text-foreground" placeholder="tu@email.com" placeholderTextColor={colors.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!isLoading} returnKeyType="next" />
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Contraseña</Text>
                <View className="bg-surface rounded-xl border border-border flex-row items-center px-4 py-3 gap-3">
                  <IconSymbol name="lock.fill" size={20} color={colors.muted} />
                  <TextInput className="flex-1 text-base text-foreground" placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.muted} value={password} onChangeText={setPassword} secureTextEntry editable={!isLoading} returnKeyType="next" />
                </View>
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Confirmar contraseña</Text>
                <View className="bg-surface rounded-xl border border-border flex-row items-center px-4 py-3 gap-3">
                  <IconSymbol name="lock.fill" size={20} color={colors.muted} />
                  <TextInput className="flex-1 text-base text-foreground" placeholder="Repite tu contraseña" placeholderTextColor={colors.muted} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry editable={!isLoading} returnKeyType="done" onSubmitEditing={handleSignUp} />
                </View>
              </View>
            </View>

            <WebSafeButton onPress={handleSignUp} title="Crear cuenta" isLoading={isLoading} backgroundColor={colors.primary} />

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Text className="text-sm text-muted">¿Ya tienes cuenta?</Text>
              <Text onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.replace("/auth/signin" as any); }} style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}>Inicia sesión</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
