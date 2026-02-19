import { ScrollView, Text, View, Platform, KeyboardAvoidingView, Alert, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { WebSafeButton } from "@/components/web-safe-button";

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSignIn = async () => {
    setErrorMsg("");

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace("/(tabs)");
    } catch (error: any) {
      const msg = error.message === "ACCOUNT_INACTIVE"
        ? "Tu suscripción ha vencido. Renueva tu membresía en Hotmart."
        : "Email o contraseña incorrectos";
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // On web, use native HTML inputs for reliable state sync
  if (Platform.OS === "web") {
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
              <Text className="text-base text-muted">Inicia sesión en tu cuenta</Text>
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
                <label style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>Email</label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  style={{
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontSize: 16,
                    color: colors.foreground,
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>Contraseña</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSignIn(); }}
                    style={{
                      backgroundColor: colors.surface,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 12,
                      padding: "12px 16px",
                      paddingRight: 48,
                      fontSize: 16,
                      color: colors.foreground,
                      outline: "none",
                      fontFamily: "inherit",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <IconSymbol
                      name={showPassword ? "eye.slash.fill" : "eye.fill"}
                      size={20}
                      color={colors.muted}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSignIn}
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
                }}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>

              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ fontSize: 14, color: colors.muted }}>¿No tienes cuenta?</span>
                <button
                  onClick={() => router.replace("/auth/signup" as any)}
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
                  Regístrate aquí
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
              <Text className="text-base text-muted">Inicia sesión en tu cuenta</Text>
            </View>

            {errorMsg ? (
              <View style={{ backgroundColor: "#FEE2E2", borderRadius: 8, padding: 12 }}>
                <Text style={{ color: "#DC2626", fontSize: 14, textAlign: "center" }}>{errorMsg}</Text>
              </View>
            ) : null}

            <View className="gap-4">
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
                    onSubmitEditing={handleSignIn}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: 4 }}
                    activeOpacity={0.6}
                  >
                    <IconSymbol
                      name={showPassword ? "eye.slash.fill" : "eye.fill"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <WebSafeButton
              onPress={handleSignIn}
              title="Iniciar sesión"
              isLoading={isLoading}
              backgroundColor={colors.primary}
            />

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Text className="text-sm text-muted">¿No tienes cuenta?</Text>
              <Text
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.replace("/auth/signup" as any);
                }}
                style={{ color: colors.primary, fontSize: 14, fontWeight: "600" }}
              >
                Regístrate aquí
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
