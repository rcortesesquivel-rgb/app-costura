import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Platform, Modal } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/format-currency";
import { showAlert, confirmAction } from "@/lib/confirm";

const estadoLabels: Record<string, string> = {
  pendiente: "Pendiente",
  aceptada: "Aceptada",
  rechazada: "Rechazada",
  vencida: "Vencida",
};

const estadoColors: Record<string, string> = {
  pendiente: "#FF9500",
  aceptada: "#34C759",
  rechazada: "#FF3B30",
  vencida: "#8E8E93",
};

const categoriaLabels: Record<string, string> = {
  arreglo: "Reparación",
  confeccion: "Confección",
  bordado: "Bordado",
  sublimado: "Sublimado",
  otros: "Otros",
};

export default function CotizacionesScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [convertirModal, setConvertirModal] = useState<number | null>(null);
  const [abonoInicial, setAbonoInicial] = useState("");

  const { data: cotizaciones, isLoading } = trpc.cotizaciones.list.useQuery();
  const { data: clientes } = trpc.clientes.list.useQuery();

  const deleteMutation = trpc.cotizaciones.delete.useMutation({
    onSuccess: async () => {
      await utils.cotizaciones.list.invalidate();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showAlert("Eliminada", "Cotización eliminada correctamente");
    },
  });

  const convertirMutation = trpc.cotizaciones.convertirEnTrabajo.useMutation({
    onSuccess: async (result) => {
      await utils.cotizaciones.list.invalidate();
      await utils.trabajos.list.invalidate();
      setConvertirModal(null);
      setAbonoInicial("");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showAlert("Convertida", "La cotización se convirtió en trabajo exitosamente.", () => {
        router.push(`/trabajo/${result.trabajoId}` as any);
      });
    },
    onError: (error) => {
      showAlert("Error", error.message);
    },
  });

  const rechazarMutation = trpc.cotizaciones.update.useMutation({
    onSuccess: async () => {
      await utils.cotizaciones.list.invalidate();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showAlert("Actualizada", "Cotización marcada como rechazada");
    },
  });

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes?.find((c) => c.id === clienteId);
    return cliente?.nombreCompleto || "Cliente desconocido";
  };

  const cotizacionesFiltradas = (cotizaciones || []).filter((c) => {
    const matchEstado = filtroEstado === "todos" || c.estado === filtroEstado;
    const clienteNombre = getClienteNombre(c.clienteId).toLowerCase();
    const matchSearch =
      !searchQuery ||
      clienteNombre.includes(searchQuery.toLowerCase()) ||
      (c.descripcion || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchEstado && matchSearch;
  });

  const handleEliminar = (id: number) => {
    confirmAction(
      "Eliminar cotización",
      "¿Estás seguro de que deseas eliminar esta cotización?",
      () => deleteMutation.mutate({ id })
    );
  };

  const handleRechazar = (id: number) => {
    confirmAction(
      "Rechazar cotización",
      "¿Marcar esta cotización como rechazada?",
      () => rechazarMutation.mutate({ id, data: { estado: "rechazada" } })
    );
  };

  const handleConvertir = () => {
    if (convertirModal === null) return;
    convertirMutation.mutate({
      cotizacionId: convertirModal,
      abonoInicial: abonoInicial || "0.00",
    });
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
        <View className="p-6 gap-5">
          {/* Header */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <IconSymbol
                name="chevron.right"
                size={28}
                color={colors.foreground}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Cotizaciones</Text>
              <Text className="text-sm text-muted">
                {cotizaciones?.length || 0} cotización(es) en total
              </Text>
            </View>
          </View>

          {/* Filtros de estado */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {["todos", "pendiente", "aceptada", "rechazada", "vencida"].map((estado) => {
                const isActive = filtroEstado === estado;
                const label = estado === "todos" ? "Todas" : estadoLabels[estado];
                const color = estado === "todos" ? colors.primary : estadoColors[estado];
                return (
                  <TouchableOpacity
                    key={estado}
                    style={{
                      backgroundColor: isActive ? color : "transparent",
                      borderColor: isActive ? color : colors.border,
                      borderWidth: 1,
                      borderRadius: 20,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                    onPress={() => setFiltroEstado(estado)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        color: isActive ? "#FFFFFF" : colors.foreground,
                        fontWeight: "600",
                        fontSize: 13,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Buscador */}
          <View className="bg-surface rounded-2xl border border-border flex-row items-center px-4 py-3">
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              className="flex-1 ml-3 text-base text-foreground"
              placeholder="Buscar por cliente o descripción..."
              placeholderTextColor={colors.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <IconSymbol name="xmark.circle.fill" size={20} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Lista de cotizaciones */}
          <View className="gap-3">
            {cotizacionesFiltradas.length > 0 ? (
              cotizacionesFiltradas.map((cotizacion) => {
                const precio = parseFloat(cotizacion.precioUnitario || "0");
                const cant = cotizacion.cantidad || 1;
                const imp = parseFloat(cotizacion.impuestos || "0");
                const var_ = parseFloat(cotizacion.varios || "0");
                const total = precio * cant + imp + var_;
                const isPendiente = cotizacion.estado === "pendiente";

                return (
                  <View
                    key={cotizacion.id}
                    className="bg-surface rounded-2xl p-4 border border-border gap-3"
                  >
                    {/* Encabezado */}
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 gap-1">
                        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                          {getClienteNombre(cotizacion.clienteId)}
                        </Text>
                        <Text className="text-sm text-muted" numberOfLines={2}>
                          {cotizacion.descripcion || "Sin descripción"}
                        </Text>
                      </View>
                      <View
                        className="rounded-full px-3 py-1"
                        style={{ backgroundColor: estadoColors[cotizacion.estado] + "20" }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: estadoColors[cotizacion.estado] }}
                        >
                          {estadoLabels[cotizacion.estado]}
                        </Text>
                      </View>
                    </View>

                    {/* Detalles */}
                    <View className="flex-row flex-wrap gap-3">
                      <View className="flex-row items-center gap-1">
                        <IconSymbol name="tag.fill" size={14} color={colors.muted} />
                        <Text className="text-xs text-muted">
                          {categoriaLabels[cotizacion.categoria] || cotizacion.categoria}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <IconSymbol name="dollarsign.circle.fill" size={14} color={colors.primary} />
                        <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                          {formatCurrency(total)}
                        </Text>
                      </View>
                      {cotizacion.fechaEntrega && (
                        <View className="flex-row items-center gap-1">
                          <IconSymbol name="calendar" size={14} color={colors.muted} />
                          <Text className="text-xs text-muted">
                            {new Date(cotizacion.fechaEntrega).toLocaleDateString("es-CR")}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Fecha de creación */}
                    <Text className="text-xs text-muted">
                      Creada: {new Date(cotizacion.createdAt).toLocaleDateString("es-CR")}
                    </Text>

                    {/* Botones de acción */}
                    {isPendiente && (
                      <View className="flex-row gap-2 mt-1">
                        <TouchableOpacity
                          className="flex-1 rounded-xl py-3 items-center flex-row justify-center gap-2"
                          style={{ backgroundColor: "#34C759" }}
                          onPress={() => {
                            setAbonoInicial("");
                            setConvertirModal(cotizacion.id);
                          }}
                          activeOpacity={0.8}
                        >
                          <IconSymbol name="checkmark.circle.fill" size={16} color="#FFFFFF" />
                          <Text className="text-sm font-semibold text-white">Convertir en Trabajo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="rounded-xl py-3 px-4 items-center"
                          style={{ backgroundColor: "#FF3B30" + "15" }}
                          onPress={() => handleRechazar(cotizacion.id)}
                          activeOpacity={0.7}
                        >
                          <IconSymbol name="xmark.circle.fill" size={16} color="#FF3B30" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="rounded-xl py-3 px-4 items-center"
                          style={{ backgroundColor: colors.error + "15" }}
                          onPress={() => handleEliminar(cotizacion.id)}
                          activeOpacity={0.7}
                        >
                          <IconSymbol name="trash.fill" size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Si fue convertida, mostrar enlace al trabajo */}
                    {cotizacion.convertidaEnTrabajoId && (
                      <TouchableOpacity
                        className="flex-row items-center gap-2 mt-1"
                        onPress={() => router.push(`/trabajo/${cotizacion.convertidaEnTrabajoId}` as any)}
                        activeOpacity={0.7}
                      >
                        <IconSymbol name="arrow.triangle.2.circlepath" size={14} color={colors.primary} />
                        <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                          Ver trabajo #{cotizacion.convertidaEnTrabajoId}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            ) : (
              <View className="bg-surface rounded-2xl p-8 border border-border items-center">
                <IconSymbol name="doc.text.fill" size={48} color={colors.muted} />
                <Text className="text-base text-muted mt-3 text-center">
                  {searchQuery || filtroEstado !== "todos"
                    ? "No se encontraron cotizaciones"
                    : "No hay cotizaciones aún"}
                </Text>
                {!searchQuery && filtroEstado === "todos" && (
                  <Text className="text-sm text-muted mt-2 text-center">
                    Crea una cotización desde el formulario de nuevo trabajo
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal para convertir en trabajo */}
      <Modal visible={convertirModal !== null} transparent animationType="fade">
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View
            className="w-11/12 max-w-sm rounded-2xl p-6 gap-4"
            style={{ backgroundColor: colors.background }}
          >
            <Text className="text-xl font-bold text-foreground">Convertir en Trabajo</Text>
            <Text className="text-sm text-muted">
              Esta cotización se convertirá en un trabajo activo. Puedes agregar un abono inicial.
            </Text>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Abono inicial (₡)</Text>
              <TextInput
                className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                value={abonoInicial}
                onChangeText={setAbonoInicial}
                keyboardType="decimal-pad"
              />
            </View>

            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                className="flex-1 rounded-xl py-3 items-center"
                style={{ backgroundColor: colors.border }}
                onPress={() => {
                  setConvertirModal(null);
                  setAbonoInicial("");
                }}
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-foreground">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-xl py-3 items-center"
                style={{ backgroundColor: "#34C759" }}
                onPress={handleConvertir}
                disabled={convertirMutation.isPending}
                activeOpacity={0.8}
              >
                <Text className="text-sm font-semibold text-white">
                  {convertirMutation.isPending ? "Convirtiendo..." : "Confirmar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer: Ir Atrás */}
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
          <IconSymbol
            name="chevron.right"
            size={18}
            color={colors.foreground}
            style={{ transform: [{ rotate: "180deg" }] }}
          />
          <Text className="text-base font-semibold text-foreground">Ir Atrás</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
