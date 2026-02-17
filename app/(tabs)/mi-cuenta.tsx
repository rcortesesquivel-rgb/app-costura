import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useColors } from "@/hooks/use-colors";

export default function MiCuentaScreen() {
  const { user, isSignedIn, signOut } = useAuth();
  const router = useRouter();
  const colors = useColors();

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      await signOut();
      router.replace("/(tabs)");
    }
  };

  const handleLogin = () => {
    router.push("/auth/signin");
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
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
                  {user?.role === "admin" ? "Administrador" : "Usuario"}
                </Text>
              </View>
              <View>
                <Text className="text-xs font-semibold text-muted uppercase mb-1">Estado</Text>
                <Text className="text-base text-success font-semibold">Activo</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
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
    </ScreenContainer>
  );
}
