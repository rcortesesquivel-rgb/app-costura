import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from "react-native";
import * as Haptics from "expo-haptics";
import { useState } from "react";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";

export default function AdminScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Verificar si es admin
  if (!user || user.role !== "admin") {
    return (
      <ScreenContainer className="items-center justify-center">
        <View className="gap-4 items-center">
          <View className="bg-error/10 rounded-full p-4">
            <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.error} />
          </View>
          <Text className="text-xl font-bold text-foreground">Acceso Denegado</Text>
          <Text className="text-sm text-muted text-center px-4">
            Solo los administradores pueden acceder a esta sección.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  // Queries
  const { data: users, isLoading: loadingUsers, refetch: refetchUsers } = trpc.admin.users.list.useQuery();
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = trpc.admin.stats.overview.useQuery();
  const { data: trabajosByEstado } = trpc.admin.stats.trabajosByEstado.useQuery();
  const { data: trabajosByTipo } = trpc.admin.stats.trabajosByTipo.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchUsers(), refetchStats()]);
    setRefreshing(false);
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
      case "arreglo": return "Arreglos";
      case "confeccion": return "Confección";
      case "personalizacion": return "Personalización";
      default: return tipo;
    }
  };

  const maxTrabajosEstado = trabajosByEstado ? Math.max(...trabajosByEstado.map(t => t.count), 1) : 1;
  const maxTrabajosTipo = trabajosByTipo ? Math.max(...trabajosByTipo.map(t => t.count), 1) : 1;

  if (loadingUsers || loadingStats) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Administración</Text>
            <Text className="text-base text-muted">Gestión de usuarios y estadísticas</Text>
          </View>

          {/* Estadísticas Rápidas */}
          {stats && (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-muted uppercase tracking-wide">Estadísticas Generales</Text>
              
              <View className="flex-row gap-3">
                <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-2xl font-bold text-foreground">{stats.totalUsers}</Text>
                  <Text className="text-sm text-muted mt-1">Usuarios Totales</Text>
                </View>
                <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-2xl font-bold" style={{ color: colors.success }}>
                    {stats.activeUsers}
                  </Text>
                  <Text className="text-sm text-muted mt-1">Activos</Text>
                </View>
                <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-2xl font-bold" style={{ color: colors.warning }}>
                    {stats.inactiveUsers}
                  </Text>
                  <Text className="text-sm text-muted mt-1">Inactivos</Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-2xl font-bold text-foreground">{stats.totalTrabajos}</Text>
                  <Text className="text-sm text-muted mt-1">Trabajos Totales</Text>
                </View>
                <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
                  <Text className="text-2xl font-bold text-foreground">{stats.totalClientes}</Text>
                  <Text className="text-sm text-muted mt-1">Clientes Totales</Text>
                </View>
              </View>
            </View>
          )}

          {/* Estadísticas de Trabajos */}
          {trabajosByEstado && trabajosByEstado.length > 0 && (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-muted uppercase tracking-wide">Trabajos por Estado</Text>
              <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
                {trabajosByEstado.map((item) => (
                  <View key={item.estado} className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-foreground font-medium">{getEstadoLabel(item.estado)}</Text>
                      <Text className="text-sm font-semibold text-primary">{item.count}</Text>
                    </View>
                    <View className="h-2 bg-surface rounded-full overflow-hidden border border-border">
                      <View
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(item.count / maxTrabajosEstado) * 100}%`,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {trabajosByTipo && trabajosByTipo.length > 0 && (
            <View className="gap-3">
              <Text className="text-sm font-semibold text-muted uppercase tracking-wide">Trabajos por Tipo</Text>
              <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
                {trabajosByTipo.map((item) => (
                  <View key={item.tipo} className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-foreground font-medium">{getTipoLabel(item.tipo)}</Text>
                      <Text className="text-sm font-semibold text-primary">{item.count}</Text>
                    </View>
                    <View className="h-2 bg-surface rounded-full overflow-hidden border border-border">
                      <View
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(item.count / maxTrabajosTipo) * 100}%`,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Lista de Usuarios */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted uppercase tracking-wide">Usuarios Registrados</Text>
            
            {users && users.length > 0 ? (
              <View className="gap-2">
                {users.map((u) => (
                  <UserCard key={u.id} user={u} onStatusChange={refetchUsers} colors={colors} />
                ))}
              </View>
            ) : (
              <View className="bg-surface rounded-2xl p-6 border border-border items-center">
                <Text className="text-base text-muted">No hay usuarios registrados</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

interface UserCardProps {
  user: any;
  onStatusChange: () => void;
  colors: any;
}

function UserCard({ user, onStatusChange, colors }: UserCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const updateStatusMutation = trpc.admin.users.updateStatus.useMutation();

  const handleToggleStatus = () => {
    const newStatus = user.isActive === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activar" : "desactivar";

    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} usuario`,
      `¿Estás seguro de que deseas ${action} a ${user.email}?`,
      [
        { text: "Cancelar", onPress: () => {}, style: "cancel" },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              setIsLoading(true);
              await updateStatusMutation.mutateAsync({
                id: user.id,
                isActive: newStatus,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onStatusChange();
            } catch (error) {
              Alert.alert("Error", "No se pudo actualizar el estado del usuario");
            } finally {
              setIsLoading(false);
            }
          },
          style: newStatus === "inactive" ? "destructive" : "default",
        },
      ]
    );
  };

  const isActive = user.isActive === "active";
  const statusColor = isActive ? colors.success : colors.error;
  const statusLabel = isActive ? "Activo" : "Inactivo";

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-foreground flex-1">{user.email}</Text>
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: statusColor }}>
              <Text className="text-xs font-semibold text-white">{statusLabel}</Text>
            </View>
          </View>
          
          {user.name && (
            <Text className="text-sm text-muted">{user.name}</Text>
          )}
          
          {/* Plan y Prioridad */}
          <View className="flex-row items-center gap-2 mt-2">
            <View className="flex-row items-center gap-1 flex-1">
              <IconSymbol name="creditcard.fill" size={14} color={colors.primary} />
              <Text className="text-xs font-medium text-primary">
                {user.plan === "monthly" ? "Mensual" : "Lifetime"}
              </Text>
            </View>
            {user.isPriority === 1 && (
              <View className="flex-row items-center gap-1 bg-warning/10 rounded-full px-2 py-1">
                <Text style={{ fontSize: 12 }}>⭐</Text>
                <Text className="text-xs font-semibold text-warning">Prioridad</Text>
              </View>
            )}
          </View>
          
          <View className="flex-row items-center gap-2 mt-1">
            <View className="flex-row items-center gap-1 flex-1">
              <IconSymbol name="person.fill" size={14} color={colors.muted} />
              <Text className="text-xs text-muted">
                {user.role === "admin" ? "Administrador" : "Usuario"}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <IconSymbol name="clock.fill" size={14} color={colors.muted} />
              <Text className="text-xs text-muted">
                {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleToggleStatus}
          disabled={isLoading}
          style={{
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View className="bg-primary/10 rounded-full p-2">
              <IconSymbol
                name={isActive ? "checkmark.circle.fill" : "xmark.circle.fill"}
                size={24}
                color={isActive ? colors.success : colors.error}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
