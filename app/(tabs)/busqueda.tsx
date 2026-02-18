import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function BusquedaScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string | undefined>(undefined);
  const [estadoFiltro, setEstadoFiltro] = useState<string | undefined>(undefined);

  const { data: resultados, isLoading } = trpc.trabajos.search.useQuery({
    query: searchQuery,
    estado: estadoFiltro,
  });

  const { data: clientes } = trpc.clientes.list.useQuery();

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

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "arreglo": return "scissors";
      case "confeccion": return "tshirt.fill";
      case "personalizacion": return "paintbrush.fill";
      default: return "scissors";
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

  const toggleTipoFiltro = (tipo: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTipoFiltro(tipoFiltro === tipo ? undefined : tipo);
  };

  const toggleEstadoFiltro = (estado: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEstadoFiltro(estadoFiltro === estado ? undefined : estado);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
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

          {/* Filtros de tipo */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Tipo de trabajo</Text>
            <View className="flex-row gap-2 flex-wrap">
              {["arreglo", "confeccion", "personalizacion"].map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  className="rounded-full px-4 py-2 border"
                  style={{
                    backgroundColor: tipoFiltro === tipo ? colors.primary : "transparent",
                    borderColor: tipoFiltro === tipo ? colors.primary : colors.border,
                  }}
                  onPress={() => toggleTipoFiltro(tipo)}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: tipoFiltro === tipo ? "#FFFFFF" : colors.foreground }}
                  >
                    {getTipoLabel(tipo)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Filtros de estado */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Estado</Text>
            <View className="flex-row gap-2 flex-wrap">
              {["en_espera", "cortando", "cosiendo", "listo", "entregado"].map((estado) => (
                <TouchableOpacity
                  key={estado}
                  className="rounded-full px-4 py-2 border"
                  style={{
                    backgroundColor: estadoFiltro === estado ? getEstadoBadgeColor(estado) : "transparent",
                    borderColor: estadoFiltro === estado ? getEstadoBadgeColor(estado) : colors.border,
                  }}
                  onPress={() => toggleEstadoFiltro(estado)}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: estadoFiltro === estado ? "#FFFFFF" : colors.foreground }}
                  >
                    {getEstadoLabel(estado)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Resultados */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-foreground">Resultados</Text>
              {resultados && resultados.length > 0 && (
                <Text className="text-sm text-muted">{resultados.length} encontrados</Text>
              )}
            </View>

            {isLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : resultados && resultados.length > 0 ? (
              resultados.map((trabajo) => (
                <TouchableOpacity
                  key={trabajo.id}
                  className="bg-surface rounded-2xl p-4 border border-border"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/trabajo/${trabajo.id}` as any);
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-start gap-3">
                    <View className="bg-primary/10 rounded-full p-3">
                      <IconSymbol name="paperplane.fill" size={24} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
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
              <View className="bg-surface rounded-2xl p-8 border border-border items-center">
                <IconSymbol name="magnifyingglass" size={48} color={colors.muted} />
                <Text className="text-base text-muted mt-3 text-center">
                  {searchQuery || tipoFiltro || estadoFiltro
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
