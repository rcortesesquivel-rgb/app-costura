import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/format-currency";

export default function TrabajoDetalleScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const trabajoId = parseInt(id as string);

  const { data: trabajo, isLoading: loadingTrabajo, refetch } = trpc.trabajos.getById.useQuery({ id: trabajoId });
  const { data: cliente } = trpc.clientes.getById.useQuery(
    { id: trabajo?.clienteId || 0 },
    { enabled: !!trabajo }
  );

  const utils = trpc.useUtils();
  const updateEstadoMutation = trpc.trabajos.updateEstado.useMutation({
    onSuccess: () => {
      refetch();
      utils.trabajos.list.invalidate();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo cambiar el estado: " + error.message);
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

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "en_espera": return "#8E8E93";
      case "cortando": return "#FF9500";
      case "cosiendo": return "#007AFF";
      case "listo": return "#34C759";
      case "entregado": return "#5856D6";
      default: return "#8E8E93";
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case "en_espera": return "En espera";
      case "cortando": return "Cortando";
      case "cosiendo": return "Cosiendo";
      case "listo": return "Listo";
      case "entregado": return "Entregado";
      default: return estado;
    }
  };

  const handleCambiarEstado = (nuevoEstado: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "Cambiar estado",
      `¿Cambiar el estado a "${getEstadoLabel(nuevoEstado)}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => {
            updateEstadoMutation.mutate({
              id: trabajoId,
              estadoAnterior: trabajo?.estado,
              estadoNuevo: nuevoEstado,
            });
          },
        },
      ]
    );
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

  // Calcular totales desde los datos del trabajo
  const precioBase = parseFloat(trabajo.precioBase || "0");
  const impuestosVal = parseFloat(trabajo.impuestos || "0");
  const variosVal = parseFloat(trabajo.varios || "0");
  const granTotal = precioBase + impuestosVal + variosVal;
  const abonoInicial = parseFloat(trabajo.abonoInicial || "0");
  const saldoPendiente = granTotal - abonoInicial;

  const estados = ["en_espera", "cortando", "cosiendo", "listo", "entregado"];

  // Calcular días restantes
  const diasRestantes = trabajo.fechaEntrega ? (() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(trabajo.fechaEntrega);
    entrega.setHours(0, 0, 0, 0);
    const diffMs = entrega.getTime() - hoy.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDias;
  })() : null;

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
              <Text className="text-2xl font-bold text-foreground">Detalle del trabajo</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push(`/editar-trabajo?id=${trabajoId}` as any);
              }}
              activeOpacity={0.7}
              className="bg-surface rounded-xl px-4 py-2 border border-border"
            >
              <Text className="text-sm font-semibold" style={{ color: colors.primary }}>Editar</Text>
            </TouchableOpacity>
          </View>

          {/* Estado actual */}
          <View className="bg-surface rounded-2xl p-4 border border-border items-center gap-3">
            <View className="rounded-full px-6 py-2" style={{ backgroundColor: getEstadoBadgeColor(trabajo.estado) }}>
              <Text className="text-lg font-bold text-white">{getEstadoLabel(trabajo.estado)}</Text>
            </View>
            <Text className="text-sm text-muted">Estado actual del trabajo</Text>
          </View>

          {/* Información del cliente */}
          {cliente && (
            <View className="gap-2">
              <Text className="text-lg font-semibold text-foreground">Cliente</Text>
              <TouchableOpacity
                className="bg-surface rounded-2xl p-4 border border-border"
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push(`/cliente/${cliente.id}` as any);
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-semibold text-foreground">{cliente.nombreCompleto}</Text>
                    {cliente.telefono && (
                      <Text className="text-sm text-muted mt-1">{cliente.telefono}</Text>
                    )}
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Detalles del trabajo */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Detalles</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <View>
                <Text className="text-xs text-muted">Descripción</Text>
                <Text className="text-base text-foreground mt-1">{trabajo.descripcion || 'Sin descripción'}</Text>
              </View>

              {trabajo.fechaEntrega && (
                <View>
                  <Text className="text-xs text-muted">Fecha de entrega</Text>
                  <Text className="text-base text-foreground mt-1">
                    {new Date(trabajo.fechaEntrega).toLocaleDateString()}
                  </Text>
                  {diasRestantes !== null && (
                    <Text className="text-sm font-semibold mt-1" style={{ color: diasRestantes <= 1 ? colors.error : diasRestantes <= 4 ? colors.warning : colors.success }}>
                      {diasRestantes === 0 ? "Entrega hoy" : diasRestantes === 1 ? "Entrega mañana" : `Entrega en ${diasRestantes} días`}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Desglose de precios */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Precios</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Precio base</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(precioBase)}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Impuestos</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(impuestosVal)}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Varios</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(variosVal)}</Text>
              </View>

              <View className="h-px bg-border" />

              <View className="flex-row justify-between">
                <Text className="text-base font-bold text-foreground">Gran Total</Text>
                <Text className="text-base font-bold" style={{ color: colors.primary }}>
                  {formatCurrency(granTotal)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Abono inicial</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(abonoInicial)}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-foreground">Saldo pendiente</Text>
                <Text className="text-base font-bold" style={{ color: saldoPendiente > 0 ? colors.error : colors.success }}>
                  {formatCurrency(Math.max(saldoPendiente, 0))}
                </Text>
              </View>
            </View>
          </View>

          {/* Botón generar recibo */}
          <TouchableOpacity
            className="rounded-xl py-4 items-center flex-row justify-center gap-2"
            style={{ backgroundColor: colors.primary }}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              if (Platform.OS === "web") {
                const url = `${process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:3000"}/api/recibo/${trabajoId}`;
                window.open(url, "_blank");
              } else {
                Alert.alert(
                  "Generar recibo",
                  "La generación de recibos en móvil estará disponible próximamente. Por ahora, usa la versión web.",
                  [{ text: "OK" }]
                );
              }
            }}
            activeOpacity={0.8}
          >
            <IconSymbol name="doc.fill" size={20} color="#FFFFFF" />
            <Text className="text-base font-semibold text-white">Generar recibo</Text>
          </TouchableOpacity>

          {/* Cambiar estado */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Cambiar estado</Text>
            <View className="gap-2">
              {estados.map((estado) => (
                <TouchableOpacity
                  key={estado}
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: trabajo.estado === estado ? getEstadoBadgeColor(estado) + "20" : "transparent",
                    borderColor: trabajo.estado === estado ? getEstadoBadgeColor(estado) : colors.border,
                    opacity: updateEstadoMutation.isPending ? 0.6 : 1,
                  }}
                  onPress={() => handleCambiarEstado(estado)}
                  disabled={trabajo.estado === estado || updateEstadoMutation.isPending}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-base font-medium"
                      style={{ color: trabajo.estado === estado ? getEstadoBadgeColor(estado) : colors.foreground }}
                    >
                      {getEstadoLabel(estado)}
                    </Text>
                    {trabajo.estado === estado && (
                      <IconSymbol name="checkmark.circle.fill" size={20} color={getEstadoBadgeColor(estado)} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Botón eliminar */}
          <TouchableOpacity
            className="rounded-xl py-4 items-center flex-row justify-center gap-2 mt-4"
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
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
