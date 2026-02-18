import { Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from "react-native";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { VoiceInput } from "@/components/voice-input";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/format-currency";

export default function EditarTrabajoScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const trabajoId = parseInt(id as string);

  // Estado del formulario
  const [descripcion, setDescripcion] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [impuestos, setImpuestos] = useState("");
  const [varios, setVarios] = useState("");
  const [abonoInicial, setAbonoInicial] = useState("0");
  const [fechaEntrega, setFechaEntrega] = useState("");

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
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo actualizar el trabajo: " + error.message);
    },
  });

  const deleteMutation = trpc.trabajos.delete.useMutation({
    onSuccess: async () => {
      await utils.trabajos.list.invalidate();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Eliminado", "El trabajo ha sido eliminado", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo eliminar: " + error.message);
    },
  });

  // Cargar datos del trabajo cuando se obtienen
  useEffect(() => {
    if (trabajo) {
      setDescripcion(trabajo.descripcion || "");
      setPrecioBase(trabajo.precioBase || "0");
      setImpuestos(trabajo.impuestos || "0");
      setVarios(trabajo.varios || "0");
      setAbonoInicial(trabajo.abonoInicial || "0");
      if (trabajo.fechaEntrega) {
        const d = new Date(trabajo.fechaEntrega);
        setFechaEntrega(d.toISOString().split("T")[0]);
      }
    }
  }, [trabajo]);

  // Cálculos en tiempo real
  const granTotal = useMemo(() => {
    const base = parseFloat(precioBase) || 0;
    const imp = parseFloat(impuestos) || 0;
    const var_ = parseFloat(varios) || 0;
    return base + imp + var_;
  }, [precioBase, impuestos, varios]);

  const saldoPendiente = useMemo(() => {
    const abono = parseFloat(abonoInicial) || 0;
    return granTotal - abono;
  }, [granTotal, abonoInicial]);

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

    const data: any = {
      descripcion: descripcion.trim(),
      precioBase: (parseFloat(precioBase) || 0).toFixed(2),
      impuestos: (parseFloat(impuestos) || 0).toFixed(2),
      varios: (parseFloat(varios) || 0).toFixed(2),
      abonoInicial: (parseFloat(abonoInicial) || 0).toFixed(2),
    };

    if (fechaEntrega) {
      const parsed = new Date(fechaEntrega + "T12:00:00");
      if (!isNaN(parsed.getTime())) {
        data.fechaEntrega = parsed;
      }
    }

    updateMutation.mutate({ id: trabajoId, data });
  };

  const handleEliminar = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      "Eliminar trabajo",
      "¿Estás seguro de que deseas borrar este registro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => deleteMutation.mutate({ id: trabajoId }),
        },
      ]
    );
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

          {/* Descripción con dictado */}
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-semibold text-foreground">Descripción *</Text>
              <VoiceInput
                mode="text"
                onResult={(text) => setDescripcion((prev) => prev ? `${prev} ${text}` : text)}
                size={32}
              />
            </View>
            <TextInput
              className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
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
            <Text className="text-sm font-semibold text-foreground">Precio base (₡) *</Text>
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                value={precioBase}
                onChangeText={setPrecioBase}
                keyboardType="decimal-pad"
              />
              <VoiceInput mode="numeric" onResult={setPrecioBase} size={36} />
            </View>
          </View>

          {/* Impuestos */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Impuestos (₡)</Text>
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                value={impuestos}
                onChangeText={setImpuestos}
                keyboardType="decimal-pad"
              />
              <VoiceInput mode="numeric" onResult={setImpuestos} size={32} />
            </View>
          </View>

          {/* Varios */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Varios (₡)</Text>
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                value={varios}
                onChangeText={setVarios}
                keyboardType="decimal-pad"
              />
              <VoiceInput mode="numeric" onResult={setVarios} size={32} />
            </View>
          </View>

          {/* Fecha de entrega */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Fecha de entrega</Text>
            <TextInput
              className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
              placeholder="AAAA-MM-DD (ej: 2026-03-15)"
              placeholderTextColor={colors.muted}
              value={fechaEntrega}
              onChangeText={setFechaEntrega}
            />
          </View>

          {/* Resumen de totales en tiempo real */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
            <Text className="text-sm font-semibold text-foreground mb-1">Resumen</Text>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Precio base</Text>
              <Text className="text-sm font-medium text-foreground">{formatCurrency(precioBase || "0")}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Impuestos</Text>
              <Text className="text-sm font-medium text-foreground">{formatCurrency(impuestos || "0")}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Varios</Text>
              <Text className="text-sm font-medium text-foreground">{formatCurrency(varios || "0")}</Text>
            </View>
            <View className="h-px bg-border my-1" />
            <View className="flex-row justify-between">
              <Text className="text-base font-bold text-foreground">Gran Total</Text>
              <Text className="text-base font-bold" style={{ color: colors.primary }}>
                {formatCurrency(granTotal)}
              </Text>
            </View>
          </View>

          {/* Abono inicial */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Abono inicial (₡)</Text>
            <View className="flex-row items-center gap-2">
              <TextInput
                className="flex-1 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                value={abonoInicial}
                onChangeText={setAbonoInicial}
                keyboardType="decimal-pad"
              />
              <VoiceInput mode="numeric" onResult={setAbonoInicial} size={36} />
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-sm font-semibold text-foreground">Saldo pendiente:</Text>
              <Text className="text-sm font-bold" style={{ color: saldoPendiente > 0 ? colors.error : colors.success }}>
                {formatCurrency(Math.max(saldoPendiente, 0))}
              </Text>
            </View>
          </View>

          {/* Botones */}
          <View className="gap-3 mt-4">
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

            {/* Botón eliminar */}
            <TouchableOpacity
              className="rounded-xl py-4 items-center flex-row justify-center gap-2"
              style={{ backgroundColor: colors.error }}
              onPress={handleEliminar}
              disabled={deleteMutation.isPending}
              activeOpacity={0.8}
            >
              <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
              <Text className="text-base font-semibold text-white">
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar trabajo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-xl py-4 items-center border border-border"
              onPress={() => router.back()}
              disabled={updateMutation.isPending}
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-foreground">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
