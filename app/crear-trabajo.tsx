import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { confirmAction, confirmDestructive, showAlert } from "@/lib/confirm";

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
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [impuestos, setImpuestos] = useState("");
  const [varios, setVarios] = useState("");
  const [abonoInicial, setAbonoInicial] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [categoria, setCategoria] = useState("reparacion");
  const [urgencia, setUrgencia] = useState<string | undefined>("baja");

  const { data: clientes, isLoading: loadingClientes } = trpc.clientes.list.useQuery();

  const utils = trpc.useUtils();
  const createMutation = trpc.trabajos.create.useMutation({
    onSuccess: async () => {
      await utils.trabajos.list.invalidate();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showAlert("Éxito", "Trabajo creado correctamente", () => router.back());
    },
    onError: (error) => {
      showAlert("Error", "No se pudo crear el trabajo: " + error.message);
    },
  });

  // Cálculos en tiempo real con useMemo
  const subtotal = useMemo(() => {
    const unitario = parseFloat(precioUnitario) || 0;
    const cant = parseFloat(cantidad) || 1;
    return unitario * cant;
  }, [precioUnitario, cantidad]);

  const totalImpuestos = useMemo(() => parseFloat(impuestos) || 0, [impuestos]);
  const totalVarios = useMemo(() => parseFloat(varios) || 0, [varios]);

  const granTotal = useMemo(() => {
    return subtotal + totalImpuestos + totalVarios;
  }, [subtotal, totalImpuestos, totalVarios]);

  const saldoPendiente = useMemo(() => {
    const abono = parseFloat(abonoInicial) || 0;
    return granTotal - abono;
  }, [granTotal, abonoInicial]);

  const handleGuardar = () => {
    if (!clienteId || !descripcion.trim() || !precioUnitario) {
      showAlert("Error", "Completa los campos obligatorios: cliente, descripción y precio unitario");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const data: any = {
      clienteId: parseInt(clienteId),
      descripcion: descripcion.trim(),
      precioUnitario: precioUnitario,
      cantidad: parseInt(cantidad) || 1,
      abonoInicial: (parseFloat(abonoInicial) || 0).toFixed(2),
      impuestos: totalImpuestos.toFixed(2),
      varios: totalVarios.toFixed(2),
      categoria: categoria,
      urgencia: urgencia || undefined,
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
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

            {/* Categoría */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Categoría</Text>
              <View className="flex-row gap-2 flex-wrap">
                {(["reparacion", "confeccion", "bordado", "sublimado", "otros"] as const).map((cat) => {
                  const labels: Record<string, string> = { reparacion: "Reparación", confeccion: "Confección", bordado: "Bordado", sublimado: "Sublimado", otros: "Otros" };
                  const isActive = categoria === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={{
                        backgroundColor: isActive ? colors.primary : "transparent",
                        borderColor: isActive ? colors.primary : colors.border,
                        borderWidth: 1,
                        borderRadius: 20,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                      }}
                      onPress={() => setCategoria(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: isActive ? "#FFFFFF" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                        {labels[cat]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Urgencia manual (opcional) */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Urgencia (opcional)</Text>
              <Text className="text-xs text-muted">Se calcula automáticamente por fecha. Usa esto para forzar un nivel.</Text>
              <View className="flex-row gap-2">
                {(["baja", "media", "alta"] as const).map((u) => {
                  const labels: Record<string, string> = { baja: "Baja", media: "Media", alta: "Urgente" };
                  const colores: Record<string, string> = { baja: "#34C759", media: "#FF9500", alta: "#FF3B30" };
                  const isActive = urgencia === u;
                  return (
                    <TouchableOpacity
                      key={u}
                      style={{
                        backgroundColor: isActive ? colores[u] : "transparent",
                        borderColor: isActive ? colores[u] : colors.border,
                        borderWidth: 1,
                        borderRadius: 20,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                      }}
                      onPress={() => setUrgencia(urgencia === u ? undefined : u)}
                      activeOpacity={0.7}
                    >
                      <Text style={{ color: isActive ? "#FFFFFF" : colors.foreground, fontWeight: "600", fontSize: 13 }}>
                        {labels[u]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
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

            {/* Precio base y Cantidad en la misma fila */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Precio y Cantidad *</Text>
              <View className="flex-row gap-3">
                <View className="flex-1 gap-1">
                  <Text className="text-xs text-muted">Precio unitario (₡)</Text>
                  <View className="flex-row items-center gap-1">
                    <TextInput
                      className="flex-1 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                      placeholder="0.00"
                      placeholderTextColor={colors.muted}
                      value={precioUnitario}
                      onChangeText={setPrecioUnitario}
                      keyboardType="decimal-pad"
                    />
                    <VoiceInput mode="numeric" onResult={setPrecioUnitario} size={28} />
                  </View>
                </View>
                <View className="w-24 gap-1">
                  <Text className="text-xs text-muted">Cantidad</Text>
                  <View className="flex-row items-center gap-1">
                    <TextInput
                      className="flex-1 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                      placeholder="1"
                      placeholderTextColor={colors.muted}
                      value={cantidad}
                      onChangeText={setCantidad}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
              {/* Subtotal en tiempo real */}
              <View className="flex-row justify-between mt-1">
                <Text className="text-sm text-muted">Subtotal (Precio × Cantidad)</Text>
                <Text className="text-sm font-semibold text-foreground">{formatCurrency(subtotal)}</Text>
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
              {Platform.OS === "web" ? (
                <input
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    fontSize: 16,
                    color: colors.foreground,
                  }}
                />
              ) : (
                <TextInput
                  className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                  placeholder="AAAA-MM-DD (ej: 2026-03-15)"
                  placeholderTextColor={colors.muted}
                  value={fechaEntrega}
                  onChangeText={setFechaEntrega}
                />
              )}
            </View>

            {/* Resumen de totales en tiempo real */}
            <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
              <Text className="text-sm font-semibold text-foreground mb-1">Resumen</Text>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Subtotal (Precio × Cantidad)</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(subtotal)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Impuestos</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(totalImpuestos)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Varios</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(totalVarios)}</Text>
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

      {/* Footer fijo: Ir Atrás */}
      <View
        className="border-t border-border px-6 py-3"
        style={{ backgroundColor: colors.background }}
      >
        <TouchableOpacity
          className="rounded-xl py-3 items-center flex-row justify-center gap-2"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.right" size={18} color={colors.foreground} style={{ transform: [{ rotate: "180deg" }] }} />
          <Text className="text-base font-semibold text-foreground">Ir Atrás</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
