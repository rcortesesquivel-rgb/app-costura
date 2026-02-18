import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { VoiceInput } from "@/components/voice-input";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/format-currency";

export default function CrearTrabajoScreen() {
  const colors = useColors();
  const router = useRouter();

  // Estado del formulario
  const [clienteId, setClienteId] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [abonoInicial, setAbonoInicial] = useState("0");
  const [fechaEntrega, setFechaEntrega] = useState("");

  // Agregados
  const [agregados, setAgregados] = useState<Array<{ concepto: string; precio: string; cantidad: string }>>([]);
  const [nuevoConcepto, setNuevoConcepto] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");
  const [nuevaCantidad, setNuevaCantidad] = useState("1");

  const { data: clientes, isLoading: loadingClientes } = trpc.clientes.list.useQuery();

  const utils = trpc.useUtils();
  const createMutation = trpc.trabajos.create.useMutation({
    onSuccess: async (data) => {
      for (const agregado of agregados) {
        await utils.client.agregados.create.mutate({
          trabajoId: data.id,
          concepto: agregado.concepto,
          precio: agregado.precio,
          cantidad: parseInt(agregado.cantidad) || 1,
        });
      }

      await utils.trabajos.list.invalidate();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Éxito", "Trabajo creado correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo crear el trabajo: " + error.message);
    },
  });

  const handleAgregarItem = () => {
    if (!nuevoConcepto.trim() || !nuevoPrecio.trim() || !nuevaCantidad.trim()) {
      Alert.alert("Error", "Completa el concepto, precio y cantidad del agregado");
      return;
    }
    setAgregados([...agregados, { concepto: nuevoConcepto.trim(), precio: nuevoPrecio.trim(), cantidad: nuevaCantidad.trim() }]);
    setNuevoConcepto("");
    setNuevoPrecio("");
    setNuevaCantidad("1");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleEliminarItem = (index: number) => {
    setAgregados(agregados.filter((_, i) => i !== index));
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const calcularTotal = () => {
    const base = parseFloat(precioBase) || 0;
    const totalAgregados = agregados.reduce((sum, item) => {
      const precio = parseFloat(item.precio) || 0;
      const cantidad = parseFloat(item.cantidad) || 1;
      return sum + (precio * cantidad);
    }, 0);
    return base + totalAgregados;
  };

  const calcularSaldo = () => {
    return calcularTotal() - (parseFloat(abonoInicial) || 0);
  };

  const handleGuardar = () => {
    if (!clienteId || !descripcion.trim() || !precioBase) {
      Alert.alert("Error", "Completa los campos obligatorios: cliente, descripción y precio base");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const data: any = {
      clienteId: parseInt(clienteId),
      descripcion: descripcion.trim(),
      precioBase: precioBase.trim(),
      abonoInicial: abonoInicial.trim() || "0",
    };

    if (fechaEntrega) {
      const parsed = new Date(fechaEntrega + "T12:00:00");
      if (!isNaN(parsed.getTime())) {
        data.fechaEntrega = parsed;
      }
    }

    createMutation.mutate(data);
  };

  if (loadingClientes) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <View className="p-6 gap-6">
            {/* Header */}
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <IconSymbol name="chevron.right" size={28} color={colors.foreground} style={{ transform: [{ rotate: "180deg" }] }} />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">Nuevo Trabajo</Text>
              </View>
            </View>

            {/* Selector de cliente */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Cliente *</Text>
              <View className="bg-surface rounded-xl border border-border">
                {clientes && clientes.map((cliente) => (
                  <TouchableOpacity
                    key={cliente.id}
                    className="p-3 border-b border-border"
                    onPress={() => setClienteId(cliente.id.toString())}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: clienteId === cliente.id.toString() ? colors.primary : colors.muted + "30" }}
                      >
                        {clienteId === cliente.id.toString() && (
                          <IconSymbol name="checkmark.circle.fill" size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <Text className="text-base text-foreground">{cliente.nombreCompleto}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
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
                placeholder="Describe el trabajo..."
                placeholderTextColor={colors.muted}
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Precio base con dictado numérico */}
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

            {/* Agregados dinámicos */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">Agregados</Text>

              {agregados.map((item, index) => (
                <View key={index} className="bg-surface rounded-xl border border-border p-3 flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base text-foreground">{item.concepto}</Text>
                    <Text className="text-sm text-muted mt-1">
                      {formatCurrency(item.precio)} x {item.cantidad} = {formatCurrency((parseFloat(item.precio) || 0) * (parseFloat(item.cantidad) || 1))}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleEliminarItem(index)} activeOpacity={0.7}>
                    <IconSymbol name="trash.fill" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <View className="gap-2">
                {/* Concepto con dictado texto */}
                <View className="flex-row gap-2 items-center">
                  <TextInput
                    className="flex-1 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder="Concepto"
                    placeholderTextColor={colors.muted}
                    value={nuevoConcepto}
                    onChangeText={setNuevoConcepto}
                  />
                  <VoiceInput mode="text" onResult={setNuevoConcepto} size={32} />
                </View>
                {/* Cantidad y precio con dictado numérico */}
                <View className="flex-row gap-2 items-center">
                  <TextInput
                    className="w-20 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder="Cant."
                    placeholderTextColor={colors.muted}
                    value={nuevaCantidad}
                    onChangeText={setNuevaCantidad}
                    keyboardType="numeric"
                  />
                  <VoiceInput mode="numeric" onResult={setNuevaCantidad} size={28} />
                  <TextInput
                    className="flex-1 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder="Precio"
                    placeholderTextColor={colors.muted}
                    value={nuevoPrecio}
                    onChangeText={setNuevoPrecio}
                    keyboardType="decimal-pad"
                  />
                  <VoiceInput mode="numeric" onResult={setNuevoPrecio} size={28} />
                  <TouchableOpacity
                    className="rounded-xl p-3 items-center justify-center"
                    style={{ backgroundColor: colors.primary }}
                    onPress={handleAgregarItem}
                    activeOpacity={0.8}
                  >
                    <IconSymbol name="plus.circle.fill" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Resumen de precios */}
            <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Precio base</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(precioBase || "0")}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Agregados</Text>
                <Text className="text-sm font-medium text-foreground">
                  {formatCurrency(agregados.reduce((sum, item) => {
                    const precio = parseFloat(item.precio) || 0;
                    const cantidad = parseFloat(item.cantidad) || 1;
                    return sum + (precio * cantidad);
                  }, 0))}
                </Text>
              </View>
              <View className="h-px bg-border my-1" />
              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-foreground">Total</Text>
                <Text className="text-base font-bold" style={{ color: colors.primary }}>
                  {formatCurrency(calcularTotal())}
                </Text>
              </View>
            </View>

            {/* Abono inicial con dictado numérico */}
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
                <Text className="text-sm font-bold" style={{ color: calcularSaldo() > 0 ? colors.error : colors.success }}>
                  {formatCurrency(calcularSaldo())}
                </Text>
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
                  {createMutation.isPending ? "Guardando..." : "Guardar trabajo"}
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
