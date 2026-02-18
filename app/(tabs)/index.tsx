import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";

const ESTADOS = [
  { value: "todos", label: "Todos" },
  { value: "en_espera", label: "En espera" },
  { value: "cortando", label: "Cortando" },
  { value: "cosiendo", label: "Cosiendo" },
  { value: "listo", label: "Listo" },
  { value: "entregado", label: "Entregado" },
] as const;

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isSignedIn, user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState("todos");

  const { data: trabajosVencenHoy, isLoading: loadingVencen, refetch: refetchVencen } = trpc.trabajos.getVencenHoy.useQuery();
  const { data: todosTrabajos, isLoading: loadingTodos, refetch: refetchTodos } = trpc.trabajos.list.useQuery();
  const { data: clientes } = trpc.clientes.list.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchVencen(), refetchTodos()]);
    setRefreshing(false);
  };

  const trabajosPendientes = todosTrabajos?.filter(t => t.estado !== "entregado") || [];
  const trabajosActivos = todosTrabajos?.filter(t => t.estado === "cortando" || t.estado === "cosiendo") || [];

  // Filtrar trabajos según el estado seleccionado
  const trabajosFiltrados = estadoFiltro === "todos"
    ? trabajosPendientes
    : (todosTrabajos || []).filter(t => t.estado === estadoFiltro);

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes?.find(c => c.id === clienteId);
    return cliente?.nombreCompleto || `Cliente #${clienteId}`;
  };

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

  const handleNuevoTrabajo = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/crear-trabajo" as any);
  };

  const handleFiltro = (estado: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEstadoFiltro(estado);
  };

  if (loadingVencen || loadingTodos) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Mis Trabajos</Text>
            <Text className="text-base text-muted">
              {isSignedIn && user?.name
                ? `Bienvenido/a, ${user.name}`
                : "Gestión del taller de costura"}
            </Text>
          </View>

          {/* Estadísticas */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-2xl font-bold text-foreground">{trabajosPendientes.length}</Text>
              <Text className="text-sm text-muted mt-1">Pendientes</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-2xl font-bold text-foreground">{trabajosActivos.length}</Text>
              <Text className="text-sm text-muted mt-1">En proceso</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-2xl font-bold text-foreground">{clientes?.length || 0}</Text>
              <Text className="text-sm text-muted mt-1">Clientes</Text>
            </View>
          </View>

          {/* Trabajos que vencen hoy */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-foreground">Listos para entrega</Text>
              {trabajosVencenHoy && trabajosVencenHoy.length > 0 && (
                <View className="bg-error rounded-full px-3 py-1">
                  <Text className="text-xs font-semibold text-white">{trabajosVencenHoy.length}</Text>
                </View>
              )}
            </View>

            {trabajosVencenHoy && trabajosVencenHoy.length > 0 ? (
              trabajosVencenHoy.map((trabajo) => (
                <TouchableOpacity
                  key={trabajo.id}
                  className="bg-surface rounded-2xl p-4 border border-border"
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.push(`/trabajo/${trabajo.id}` as any);
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-start gap-3">
                    <View className="bg-primary/10 rounded-full p-3">
                      <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                        {trabajo.descripcion}
                      </Text>
                      <Text className="text-sm text-muted mt-1">{getClienteNombre(trabajo.clienteId)}</Text>
                      <View className="flex-row items-center gap-2 mt-2">
                        <View className="rounded-full px-3 py-1" style={{ backgroundColor: getEstadoBadgeColor(trabajo.estado) }}>
                          <Text className="text-xs font-semibold text-white">{getEstadoLabel(trabajo.estado)}</Text>
                        </View>
                        {trabajo.fechaEntrega && (
                          <View className="flex-row items-center gap-1">
                            <IconSymbol name="clock.fill" size={14} color={colors.muted} />
                            <Text className="text-xs text-muted">
                              {new Date(trabajo.fechaEntrega).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-surface rounded-2xl p-6 border border-border items-center">
                <IconSymbol name="checkmark.circle.fill" size={48} color={colors.success} />
                <Text className="text-base text-muted mt-3 text-center">
                  No hay trabajos listos para entrega
                </Text>
              </View>
            )}
          </View>

          {/* Filtros de estado */}
          <View className="gap-3">
            <Text className="text-xl font-semibold text-foreground">Trabajos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {ESTADOS.map((estado) => {
                const isActive = estadoFiltro === estado.value;
                const count = estado.value === "todos"
                  ? trabajosPendientes.length
                  : (todosTrabajos || []).filter(t => t.estado === estado.value).length;
                return (
                  <TouchableOpacity
                    key={estado.value}
                    onPress={() => handleFiltro(estado.value)}
                    activeOpacity={0.7}
                    style={{
                      backgroundColor: isActive ? colors.primary : "transparent",
                      borderColor: isActive ? colors.primary : colors.border,
                      borderWidth: 1,
                      borderRadius: 20,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: isActive ? "#FFFFFF" : colors.foreground,
                        fontWeight: "600",
                        fontSize: 13,
                      }}
                    >
                      {estado.label}
                    </Text>
                    <View
                      style={{
                        backgroundColor: isActive ? "rgba(255,255,255,0.3)" : colors.muted + "30",
                        borderRadius: 10,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        minWidth: 22,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: isActive ? "#FFFFFF" : colors.muted,
                          fontWeight: "700",
                          fontSize: 11,
                        }}
                      >
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Lista filtrada de trabajos */}
          <View className="gap-3">
            {trabajosFiltrados.length > 0 ? (
              trabajosFiltrados.map((trabajo) => (
                <TouchableOpacity
                  key={trabajo.id}
                  className="bg-surface rounded-2xl p-4 border border-border"
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.push(`/trabajo/${trabajo.id}` as any);
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-start gap-3">
                    <View className="bg-primary/10 rounded-full p-3">
                      <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                        {trabajo.descripcion}
                      </Text>
                      <Text className="text-sm text-muted mt-1">{getClienteNombre(trabajo.clienteId)}</Text>
                      <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                        <View className="rounded-full px-3 py-1" style={{ backgroundColor: getEstadoBadgeColor(trabajo.estado) }}>
                          <Text className="text-xs font-semibold text-white">{getEstadoLabel(trabajo.estado)}</Text>
                        </View>
                        {trabajo.fechaEntrega && (
                          <View className="flex-row items-center gap-1">
                            <IconSymbol name="clock.fill" size={14} color={colors.muted} />
                            <Text className="text-xs text-muted">
                              {new Date(trabajo.fechaEntrega).toLocaleDateString()}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-surface rounded-2xl p-6 border border-border items-center">
                <Text className="text-base text-muted text-center">
                  {estadoFiltro === "todos" ? "No hay trabajos pendientes" : `No hay trabajos "${getEstadoLabel(estadoFiltro)}"`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Botón flotante */}
      <View className="absolute bottom-24 right-6">
        <TouchableOpacity
          className="rounded-full p-4 shadow-lg"
          style={{
            backgroundColor: colors.primary,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={handleNuevoTrabajo}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus.circle.fill" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
