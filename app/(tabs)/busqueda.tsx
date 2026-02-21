import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const CATEGORIAS = [
  { value: "reparacion", label: "Reparación" },
  { value: "confeccion", label: "Confección" },
  { value: "bordado", label: "Bordado" },
  { value: "sublimado", label: "Sublimado" },
  { value: "otros", label: "Otros" },
];

const ESTADOS = [
  { value: "recibido", label: "Recibido" },
  { value: "cortando", label: "Cortando" },
  { value: "cosiendo", label: "Cosiendo" },
  { value: "bordado_personalizado", label: "Bordado/Personalizado" },
  { value: "listo", label: "Listo" },
  { value: "entregado", label: "Entregado" },
];

function getUrgenciaAuto(fechaEntrega: string | Date | null | undefined): "alta" | "media" | "baja" | null {
  if (!fechaEntrega) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const entrega = new Date(fechaEntrega);
  entrega.setHours(0, 0, 0, 0);
  const diffDias = Math.ceil((entrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDias <= 1) return "alta";
  if (diffDias <= 4) return "media";
  return "baja";
}

function getUrgenciaColor(urgencia: "alta" | "media" | "baja" | null): string {
  switch (urgencia) {
    case "alta": return "#FF3B30";
    case "media": return "#FF9500";
    case "baja": return "#34C759";
    default: return "#8E8E93";
  }
}

export default function BusquedaScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string | undefined>(undefined);
  const [estadoFiltro, setEstadoFiltro] = useState<string | undefined>(undefined);

  const { data: resultados, isLoading } = trpc.trabajos.search.useQuery({
    query: searchQuery,
    estado: estadoFiltro,
  });

  const { data: clientes } = trpc.clientes.list.useQuery();

  // Filtrar por categoría en el frontend (ya que el backend no tiene filtro de categoría en search)
  const resultadosFiltrados = categoriaFiltro
    ? resultados?.filter((t: any) => t.categoria === categoriaFiltro)
    : resultados;

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

  const toggleCategoriaFiltro = (cat: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCategoriaFiltro(categoriaFiltro === cat ? undefined : cat);
  };

  const toggleEstadoFiltro = (estado: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setEstadoFiltro(estadoFiltro === estado ? undefined : estado);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="p-6 gap-6">
          {/* Encabezado */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Búsqueda</Text>
            <Text className="text-base text-muted">Encuentra trabajos rápidamente</Text>
          </View>

          {/* Buscador */}
          <View className="bg-surface rounded-2xl border border-border flex-row items-center px-4 py-3">
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              className="flex-1 ml-3 text-base text-foreground"
              placeholder="Buscar por descripción..."
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

          {/* Filtros de categoría */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Categoría</Text>
            <View className="flex-row gap-2 flex-wrap">
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  className="rounded-full px-4 py-2 border"
                  style={{
                    backgroundColor: categoriaFiltro === cat.value ? colors.primary : "transparent",
                    borderColor: categoriaFiltro === cat.value ? colors.primary : colors.border,
                  }}
                  onPress={() => toggleCategoriaFiltro(cat.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: categoriaFiltro === cat.value ? "#FFFFFF" : colors.foreground }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtros de estado */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Estado</Text>
            <View className="flex-row gap-2 flex-wrap">
              {ESTADOS.map((estado) => (
                <TouchableOpacity
                  key={estado.value}
                  className="rounded-full px-4 py-2 border"
                  style={{
                    backgroundColor: estadoFiltro === estado.value ? getEstadoBadgeColor(estado.value) : "transparent",
                    borderColor: estadoFiltro === estado.value ? getEstadoBadgeColor(estado.value) : colors.border,
                  }}
                  onPress={() => toggleEstadoFiltro(estado.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: estadoFiltro === estado.value ? "#FFFFFF" : colors.foreground }}
                  >
                    {estado.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Resultados */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-foreground">Resultados</Text>
              {resultadosFiltrados && resultadosFiltrados.length > 0 && (
                <Text className="text-sm text-muted">{resultadosFiltrados.length} encontrados</Text>
              )}
            </View>

            {isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : resultadosFiltrados && resultadosFiltrados.length > 0 ? (
              resultadosFiltrados.map((trabajo: any) => {
                const urgenciaManual = trabajo.urgencia as "alta" | "media" | "baja" | null;
                const urgenciaAuto = getUrgenciaAuto(trabajo.fechaEntrega);
                const urgenciaFinal = urgenciaManual || urgenciaAuto;
                const urgenciaColor = getUrgenciaColor(urgenciaFinal);

                return (
                  <TouchableOpacity
                    key={trabajo.id}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderLeftWidth: 5,
                      borderLeftColor: urgenciaColor,
                    }}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      router.push(`/trabajo/${trabajo.id}` as any);
                    }}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-start gap-3">
                      <View style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: urgenciaColor + "20",
                        alignItems: "center", justifyContent: "center",
                      }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: urgenciaColor }} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
                          {trabajo.descripcion || "Sin descripción"}
                        </Text>
                        <Text className="text-sm text-muted mt-1">{getClienteNombre(trabajo.clienteId)}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                          <View style={{ backgroundColor: getEstadoBadgeColor(trabajo.estado), borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                            <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "700" }}>{getEstadoLabel(trabajo.estado)}</Text>
                          </View>
                          {trabajo.categoria && (
                            <View style={{ backgroundColor: colors.muted + "20", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
                              <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600" }}>{getCategoriaLabel(trabajo.categoria)}</Text>
                            </View>
                          )}
                          {trabajo.fechaEntrega && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                              <IconSymbol name="calendar" size={12} color={urgenciaColor} />
                              <Text style={{ fontSize: 11, color: urgenciaColor, fontWeight: "600" }}>
                                {new Date(trabajo.fechaEntrega).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className="bg-surface rounded-2xl p-8 border border-border items-center">
                <IconSymbol name="magnifyingglass" size={48} color={colors.muted} />
                <Text className="text-base text-muted mt-3 text-center">
                  {searchQuery || categoriaFiltro || estadoFiltro
                    ? "No se encontraron trabajos con estos criterios"
                    : "Usa los filtros para buscar trabajos"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
