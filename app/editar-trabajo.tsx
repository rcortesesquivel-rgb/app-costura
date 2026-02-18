import { Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function EditarTrabajoScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const trabajoId = parseInt(id as string);

  // Estado del formulario
  const [descripcion, setDescripcion] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [abonoInicial, setAbonoInicial] = useState("0");

  const { data: trabajo, isLoading: loadingTrabajo } = trpc.trabajos.getById.useQuery({ id: trabajoId });

  const utils = trpc.useUtils();
  const updateMutation = trpc.trabajos.update.useMutation({
    onSuccess: async () => {
      await utils.trabajos.list.invalidate();
      await utils.trabajos.getById.invalidate({ id: trabajoId });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Éxito", "Trabajo actualizado correctamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo actualizar el trabajo: " + error.message);
    },
  });

  // Cargar datos del trabajo cuando se obtienen
  useEffect(() => {
    if (trabajo) {
      setDescripcion(trabajo.descripcion || "");
      setPrecioBase(trabajo.precioBase || "0");
      setAbonoInicial(trabajo.abonoInicial || "0");
    }
  }, [trabajo]);

  const handleGuardar = () => {
    if (!descripcion.trim()) {
      Alert.alert("Error", "La descripción es obligatoria");
      return;
    }

    if (!precioBase || parseFloat(precioBase) <= 0) {
      Alert.alert("Error", "El precio base debe ser mayor a 0");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const data = {
      descripcion: descripcion.trim(),
      precioBase,
      abonoInicial: abonoInicial || "0",
    };

    updateMutation.mutate({ id: trabajoId, data });
  };

  if (loadingTrabajo) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!trabajo) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-base text-muted">Trabajo no encontrado</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.back();
              }}
              activeOpacity={0.7}
            >
              <IconSymbol name="chevron.right" size={28} color={colors.foreground} style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Editar trabajo</Text>
            </View>
          </View>

          {/* Descripción */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Descripción</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-base border"
              style={{ color: colors.foreground, borderColor: colors.border }}
              placeholder="Describe el trabajo a realizar"
              placeholderTextColor={colors.muted}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Precio base */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Precio base (₡)</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-base border"
              style={{ color: colors.foreground, borderColor: colors.border }}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              value={precioBase}
              onChangeText={setPrecioBase}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Abono inicial */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Abono inicial (₡)</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-base border"
              style={{ color: colors.foreground, borderColor: colors.border }}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              value={abonoInicial}
              onChangeText={setAbonoInicial}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Saldo pendiente en tiempo real */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row justify-between">
              <Text className="text-base font-semibold text-foreground">Saldo pendiente</Text>
              <Text className="text-base font-bold" style={{ color: (parseFloat(precioBase || "0") - parseFloat(abonoInicial || "0")) > 0 ? colors.error : colors.success }}>
                ₡{((parseFloat(precioBase || "0") - parseFloat(abonoInicial || "0"))).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Botón guardar */}
          <TouchableOpacity
            className="rounded-xl py-4 items-center"
            style={{ backgroundColor: colors.primary }}
            onPress={handleGuardar}
            disabled={updateMutation.isPending}
            activeOpacity={0.8}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-semibold text-white">Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
