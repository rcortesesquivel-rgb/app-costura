import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-8 justify-center">
          {/* Hero Section */}
          <View className="items-center gap-4">
            <Text className="text-5xl font-bold text-foreground">Taller de Costura</Text>
            <Text className="text-lg text-muted text-center">
              Gestiona tus clientes, trabajos y medidas de forma profesional
            </Text>
          </View>

          {/* Features */}
          <View className="gap-4">
            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">👥 Gestión de Clientes</Text>
              <Text className="text-sm text-muted">Registra y mantén el historial de tus clientes con sus medidas</Text>
            </View>

            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">📋 Seguimiento de Trabajos</Text>
              <Text className="text-sm text-muted">Organiza arreglos, confecciones y personalizaciones</Text>
            </View>

            <View className="bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-2">🎤 Notas de Voz</Text>
              <Text className="text-sm text-muted">Graba instrucciones y transcribe automáticamente</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <View className="gap-3">
            <TouchableOpacity 
              className="bg-primary px-6 py-4 rounded-full active:opacity-80"
              onPress={() => router.push("/auth/signin")}
            >
              <Text className="text-center text-background font-semibold text-lg">Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-surface border border-primary px-6 py-4 rounded-full active:opacity-80"
              onPress={() => router.push("/auth/signup")}
            >
              <Text className="text-center text-primary font-semibold text-lg">Crear Cuenta</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center mt-8">
            <Text className="text-xs text-muted">
              Versión 1.0.0 | Taller de Costura © 2026
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
