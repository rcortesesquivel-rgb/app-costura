import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
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
  const { data: agregados } = trpc.agregados.getByTrabajoId.useQuery({ trabajoId });
  const { data: totales } = trpc.trabajos.calcularTotal.useQuery({ trabajoId });

  const utils = trpc.useUtils();
  const updateEstadoMutation = trpc.trabajos.updateEstado.useMutation({
    onSuccess: () => {
      refetch();
      utils.trabajos.list.invalidate();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "arreglo": return "Arreglo";
      case "confeccion": return "Confección";
      case "personalizacion": return "Personalización";
      default: return tipo;
    }
  };

  const handleCambiarEstado = (nuevoEstado: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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

  const estados = ["en_espera", "cortando", "cosiendo", "listo", "entregado"];

  return (
    <ScreenContainer className="bg-background">
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
              <Text className="text-2xl font-bold text-foreground">Detalle del trabajo</Text>
            </View>
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
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                <Text className="text-xs text-muted">Tipo</Text>
                <Text className="text-base text-foreground mt-1">{getTipoLabel(trabajo.tipo)}</Text>
              </View>

              <View>
                <Text className="text-xs text-muted">Descripción</Text>
                <Text className="text-base text-foreground mt-1">{trabajo.descripcion}</Text>
              </View>

              {trabajo.tipo === "arreglo" && trabajo.tipoPrenda && (
                <View>
                  <Text className="text-xs text-muted">Tipo de prenda</Text>
                  <Text className="text-base text-foreground mt-1">{trabajo.tipoPrenda}</Text>
                </View>
              )}

              {trabajo.tipo === "confeccion" && (
                <>
                  {trabajo.tipoTela && (
                    <View>
                      <Text className="text-xs text-muted">Tipo de tela</Text>
                      <Text className="text-base text-foreground mt-1">{trabajo.tipoTela}</Text>
                    </View>
                  )}
                  {trabajo.metrosRequeridos && (
                    <View>
                      <Text className="text-xs text-muted">Metros requeridos</Text>
                      <Text className="text-base text-foreground mt-1">{trabajo.metrosRequeridos} m</Text>
                    </View>
                  )}
                </>
              )}

              {trabajo.tipo === "personalizacion" && trabajo.tipoPersonalizacion && (
                <View>
                  <Text className="text-xs text-muted">Tipo de personalización</Text>
                  <Text className="text-base text-foreground mt-1">{trabajo.tipoPersonalizacion}</Text>
                </View>
              )}

              {trabajo.fechaEntrega && (
                <View>
                  <Text className="text-xs text-muted">Fecha de entrega</Text>
                  <Text className="text-base text-foreground mt-1">
                    {new Date(trabajo.fechaEntrega).toLocaleDateString()}
                  </Text>
                </View>
              )}

              {trabajo.notasVoz && (
                <View>
                  <Text className="text-xs text-muted">Notas de voz</Text>
                  <Text className="text-base text-foreground mt-1">{trabajo.notasVoz}</Text>
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
                <Text className="text-sm font-medium text-foreground">{formatCurrency(trabajo.precioBase)}</Text>
              </View>

              {agregados && agregados.length > 0 && (
                <>
                  <View className="h-px bg-border" />
                  <Text className="text-xs font-semibold text-muted uppercase">Agregados</Text>
                  {agregados.map((agregado) => (
                    <View key={agregado.id} className="flex-row justify-between">
                      <Text className="text-sm text-muted">{agregado.concepto}</Text>
                      <Text className="text-sm font-medium text-foreground">{formatCurrency(agregado.precio)}</Text>
                    </View>
                  ))}
                </>
              )}

              <View className="h-px bg-border" />

              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-foreground">Total</Text>
                <Text className="text-base font-bold" style={{ color: colors.primary }}>
                  {formatCurrency(totales?.total)}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Abono inicial</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(trabajo.abonoInicial)}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-foreground">Saldo pendiente</Text>
                <Text className="text-base font-bold" style={{ color: colors.error }}>
                  {formatCurrency(totales?.saldo)}
                </Text>
              </View>
            </View>
          </View>

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
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
