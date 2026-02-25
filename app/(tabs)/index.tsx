import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl, Platform } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";

const ESTADOS = [
  { value: "todos", label: "Todos" },
  { value: "recibido", label: "Recibido" },
  { value: "cortando", label: "Cortando" },
  { value: "cosiendo", label: "Cosiendo" },
  { value: "bordado_personalizado", label: "Bordado/Personalizado" },
  { value: "listo", label: "Listo" },
  { value: "entregado", label: "Entregado" },
] as const;

// Calcula urgencia automática basada en fechaEntrega
function getUrgenciaAuto(fechaEntrega: string | Date | null | undefined): "alta" | "media" | "baja" | null {
  if (!fechaEntrega) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const entrega = new Date(fechaEntrega);
  entrega.setHours(0, 0, 0, 0);
  const diffDias = Math.ceil((entrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDias <= 1) return "alta";     // Hoy o mañana → Rojo
  if (diffDias <= 4) return "media";    // 2-4 días → Amarillo
  return "baja";                         // 5+ días → Verde
}

function getUrgenciaColor(urgencia: "alta" | "media" | "baja" | null): string {
  switch (urgencia) {
    case "alta": return "#FF3B30";    // Rojo
    case "media": return "#FF9500";   // Amarillo/Naranja
    case "baja": return "#34C759";    // Verde
    default: return "#8E8E93";        // Gris
  }
}

function getUrgenciaLabel(urgencia: "alta" | "media" | "baja" | null): string {
  switch (urgencia) {
    case "alta": return "Urgente";
    case "media": return "Media";
    case "baja": return "Baja";
    default: return "Sin fecha";
  }
}

export default function MisTrabajosScreen() {
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

  const trabajosPendientes = useMemo(() => todosTrabajos?.filter(t => t.estado !== "entregado") || [], [todosTrabajos]);
  const trabajosActivos = useMemo(() => todosTrabajos?.filter(t => t.estado === "cortando" || t.estado === "cosiendo") || [], [todosTrabajos]);

  // Filtrar trabajos según el estado seleccionado
  const trabajosFiltrados = useMemo(() => {
    if (estadoFiltro === "todos") return trabajosPendientes;
    return (todosTrabajos || []).filter(t => t.estado === estadoFiltro);
  }, [estadoFiltro, trabajosPendientes, todosTrabajos]);

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes?.find(c => c.id === clienteId);
    return cliente?.nombreCompleto || `Cliente #${clienteId}`;
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case "recibido": return "#8E8E93";
      case "cortando": return "#FF9500";
      case "cosiendo": return "#007AFF";
      case "bordado_personalizado": return "#AF52DE";
      case "listo": return "#34C759";
      case "entregado": return "#5856D6";
      case "en_espera": return "#8E8E93";
      default: return "#8E8E93";
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case "recibido": return "Recibido";
      case "cortando": return "Cortando";
      case "cosiendo": return "Cosiendo";
      case "bordado_personalizado": return "Bordado/Personalizado";
      case "listo": return "Listo";
      case "entregado": return "Entregado";
      case "en_espera": return "En espera";
      default: return estado;
    }
  };

  const getCategoriaLabel = (cat: string | null) => {
    switch (cat) {
      case "reparacion": return "Reparación";
      case "confeccion": return "Confección";
      case "bordado": return "Bordado";
      case "sublimado": return "Sublimado";
      case "otros": return "Otros";
      default: return "";
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

  const renderTrabajoCard = (trabajo: any) => {
    // Urgencia: manual si existe, sino automática por fecha
    const urgenciaManual = (trabajo as any).urgencia as "alta" | "media" | "baja" | null;
    const urgenciaAuto = getUrgenciaAuto(trabajo.fechaEntrega);
    const urgenciaFinal = urgenciaManual || urgenciaAuto;
    const urgenciaColorBorder = getUrgenciaColor(urgenciaFinal);

    return (
      <TouchableOpacity
        key={trabajo.id}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          borderWidth: 2,
          borderColor: urgenciaColorBorder,
          borderLeftWidth: 5,
        }}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          router.push(`/trabajo/${trabajo.id}` as any);
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          {/* Indicador de urgencia */}
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: urgenciaColorBorder + "20",
            alignItems: "center", justifyContent: "center",
          }}>
            <View style={{
              width: 12, height: 12, borderRadius: 6,
              backgroundColor: urgenciaColorBorder,
            }} />
          </View>
          <View style={{ flex: 1 }}>
            <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
              {trabajo.descripcion || "Sin descripción"}
            </Text>
            <Text className="text-sm text-muted" style={{ marginTop: 2 }}>{getClienteNombre(trabajo.clienteId)}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {/* Badge de estado */}
              <View style={{ backgroundColor: getEstadoBadgeColor(trabajo.estado), borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>{getEstadoLabel(trabajo.estado)}</Text>
              </View>
              {/* Badge de urgencia */}
              <View style={{ backgroundColor: urgenciaColorBorder + "20", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text style={{ color: urgenciaColorBorder, fontSize: 11, fontWeight: "700" }}>{getUrgenciaLabel(urgenciaFinal)}</Text>
              </View>
              {/* Badge de categoría */}
              {(trabajo as any).categoria && (
                <View style={{ backgroundColor: colors.muted + "20", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                  <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600" }}>{getCategoriaLabel((trabajo as any).categoria)}</Text>
                </View>
              )}
              {/* Fecha de entrega */}
              {trabajo.fechaEntrega && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <IconSymbol name="calendar" size={12} color={urgenciaColorBorder} />
                  <Text style={{ fontSize: 11, color: urgenciaColorBorder, fontWeight: "600" }}>
                    {new Date(trabajo.fechaEntrega).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View className="p-6 gap-6">
          {/* Encabezado */}
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

          {/* Acceso rápido a Cotizaciones */}
          <TouchableOpacity
            style={{
              backgroundColor: "#FF9500",
              borderRadius: 16,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push("/cotizaciones" as any);
            }}
            activeOpacity={0.8}
          >
            <IconSymbol name="doc.text.fill" size={20} color="#FFFFFF" />
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 15 }}>Ver Cotizaciones</Text>
          </TouchableOpacity>

          {/* Leyenda de colores de urgencia */}
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>Urgencia:</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF3B30" }} />
              <Text style={{ fontSize: 11, color: colors.muted }}>Hoy/Mañana</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#FF9500" }} />
              <Text style={{ fontSize: 11, color: colors.muted }}>3-4 días</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#34C759" }} />
              <Text style={{ fontSize: 11, color: colors.muted }}>5+ días</Text>
            </View>
          </View>

          {/* Trabajos que vencen hoy */}
          {trabajosVencenHoy && trabajosVencenHoy.length > 0 && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xl font-semibold text-foreground">Listos para entrega</Text>
                <View className="bg-error rounded-full px-3 py-1">
                  <Text className="text-xs font-semibold text-white">{trabajosVencenHoy.length}</Text>
                </View>
              </View>
              {trabajosVencenHoy.map(renderTrabajoCard)}
            </View>
          )}

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
              trabajosFiltrados.map(renderTrabajoCard)
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
      <View className="absolute bottom-24 right-6 gap-2 items-center">
        <TouchableOpacity
          className="rounded-full px-4 py-2 bg-white shadow-md flex-row items-center gap-2"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
          onPress={handleNuevoTrabajo}
          activeOpacity={0.8}
        >
          <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
            Crear
          </Text>
        </TouchableOpacity>
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
