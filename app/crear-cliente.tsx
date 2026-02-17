import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function CrearClienteScreen() {
  const colors = useColors();
  const router = useRouter();
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");

  const utils = trpc.useUtils();
  const createMutation = trpc.clientes.create.useMutation({
    onSuccess: async (data) => {
      await utils.clientes.list.invalidate();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Éxito", "Cliente creado correctamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo crear el cliente: " + error.message);
    },
  });

  const handleGuardar = () => {
    if (!nombreCompleto.trim()) {
      Alert.alert("Error", "El nombre completo es obligatorio");
      return;
    }

    const redesSociales = JSON.stringify({
      instagram: instagram.trim(),
      facebook: facebook.trim(),
    });

    createMutation.mutate({
      nombreCompleto: nombreCompleto.trim(),
      telefono: telefono.trim() || undefined,
      direccion: direccion.trim() || undefined,
      redesSociales: redesSociales,
    });
  };

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <View className="p-6 gap-6">
            {/* Header */}
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                activeOpacity={0.7}
              >
                <IconSymbol name="chevron.right" size={28} color={colors.foreground} style={{ transform: [{ rotate: "180deg" }] }} />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">Nuevo Cliente</Text>
              </View>
            </View>

            {/* Formulario */}
            <View className="gap-4">
              {/* Nombre completo */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Nombre completo *</Text>
                <TextInput
                  className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                  placeholder="Ej: María García López"
                  placeholderTextColor={colors.muted}
                  value={nombreCompleto}
                  onChangeText={setNombreCompleto}
                  returnKeyType="next"
                />
              </View>

              {/* Teléfono */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Teléfono</Text>
                <TextInput
                  className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                  placeholder="Ej: +34 600 123 456"
                  placeholderTextColor={colors.muted}
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>

              {/* Dirección */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Dirección</Text>
                <TextInput
                  className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                  placeholder="Ej: Calle Mayor 123, Madrid"
                  placeholderTextColor={colors.muted}
                  value={direccion}
                  onChangeText={setDireccion}
                  returnKeyType="next"
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Redes sociales */}
              <View className="gap-3">
                <Text className="text-sm font-semibold text-foreground">Redes sociales</Text>
                
                <View className="gap-2">
                  <Text className="text-xs text-muted">Instagram</Text>
                  <TextInput
                    className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder="@usuario"
                    placeholderTextColor={colors.muted}
                    value={instagram}
                    onChangeText={setInstagram}
                    returnKeyType="next"
                    autoCapitalize="none"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted">Facebook</Text>
                  <TextInput
                    className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder="Usuario de Facebook"
                    placeholderTextColor={colors.muted}
                    value={facebook}
                    onChangeText={setFacebook}
                    returnKeyType="done"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            {/* Botones */}
            <View className="gap-3 mt-4">
              <TouchableOpacity
                className="rounded-xl py-4 items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleGuardar}
                disabled={createMutation.isPending}
                activeOpacity={0.8}
              >
                <Text className="text-base font-semibold text-white">
                  {createMutation.isPending ? "Guardando..." : "Guardar cliente"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-xl py-4 items-center border border-border"
                onPress={() => router.back()}
                disabled={createMutation.isPending}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-foreground">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
