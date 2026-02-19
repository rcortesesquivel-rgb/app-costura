import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/format-currency";

const ESTADO_LABELS: Record<string, string> = {
  recibido: "Recibido",
  cortando: "Cortando",
  cosiendo: "Cosiendo",
  bordado_personalizado: "Bordado/Personalizado",
  listo: "Listo",
  entregado: "Entregado",
};

const ESTADO_COLORS: Record<string, string> = {
  recibido: "#8E8E93",
  cortando: "#FF9500",
  cosiendo: "#007AFF",
  bordado_personalizado: "#AF52DE",
  listo: "#34C759",
  entregado: "#5856D6",
};

const URGENCIA_LABELS: Record<string, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const URGENCIA_COLORS: Record<string, string> = {
  alta: "#FF3B30",
  media: "#FF9500",
  baja: "#34C759",
};

export default function EstadisticasScreen() {
  const colors = useColors();
  const { data: stats, isLoading } = trpc.trabajos.misEstadisticas.useQuery();

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const totalTrabajos = stats?.totalTrabajos ?? 0;

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        <View className="gap-6">
          <Text className="text-2xl font-bold text-foreground">Mis Estadísticas</Text>

          {/* Resumen general */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center">
              <Text className="text-3xl font-bold" style={{ color: colors.primary }}>{stats?.totalClientes ?? 0}</Text>
              <Text className="text-xs text-muted mt-1">Clientes</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center">
              <Text className="text-3xl font-bold" style={{ color: colors.primary }}>{totalTrabajos}</Text>
              <Text className="text-xs text-muted mt-1">Trabajos</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center">
              <Text className="text-xl font-bold" style={{ color: colors.success }}>{formatCurrency(stats?.ingresosTotales ?? 0)}</Text>
              <Text className="text-xs text-muted mt-1">Ingresos</Text>
            </View>
          </View>

          {/* Trabajos por estado */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Trabajos por estado</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              {Object.entries(ESTADO_LABELS).map(([key, label]) => {
                const count = (stats?.trabajosPorEstado as Record<string, number>)?.[key] ?? 0;
                const pct = totalTrabajos > 0 ? (count / totalTrabajos) * 100 : 0;
                return (
                  <View key={key} className="gap-1">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-foreground">{label}</Text>
                      <Text className="text-sm font-semibold text-foreground">{count}</Text>
                    </View>
                    <View className="h-2 bg-background rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: ESTADO_COLORS[key] || "#8E8E93" }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Trabajos por urgencia */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Trabajos por urgencia</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              {Object.entries(URGENCIA_LABELS).map(([key, label]) => {
                const count = (stats?.trabajosPorUrgencia as Record<string, number>)?.[key] ?? 0;
                const pct = totalTrabajos > 0 ? (count / totalTrabajos) * 100 : 0;
                return (
                  <View key={key} className="gap-1">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center gap-2">
                        <View className="w-3 h-3 rounded-full" style={{ backgroundColor: URGENCIA_COLORS[key] }} />
                        <Text className="text-sm text-foreground">{label}</Text>
                      </View>
                      <Text className="text-sm font-semibold text-foreground">{count}</Text>
                    </View>
                    <View className="h-2 bg-background rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: URGENCIA_COLORS[key] || "#FF9500" }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Ingresos */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Ingresos totales</Text>
            <View className="bg-surface rounded-2xl p-6 border border-border items-center">
              <Text className="text-xs text-muted mb-2">Suma de trabajos entregados</Text>
              <Text className="text-3xl font-bold" style={{ color: colors.success }}>{formatCurrency(stats?.ingresosTotales ?? 0)}</Text>
              <Text className="text-xs text-muted mt-2">
                {(stats?.trabajosPorEstado as Record<string, number>)?.entregado ?? 0} trabajos entregados
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
