import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useRouter } from "expo-router";
import { confirmAction, confirmDestructive, showAlert } from "@/lib/confirm";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";

export default function SuperAdminScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "metrics" | "payments">("users");

  // Verificar si es Super Admin
  const isSuperAdmin = user?.email === process.env.EXPO_PUBLIC_SUPER_ADMIN_EMAIL;

  if (!user || !isSuperAdmin) {
    return (
      <ScreenContainer className="items-center justify-center">
        <View className="gap-4 items-center">
          <View className="bg-error/10 rounded-full p-4">
            <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.error} />
          </View>
          <Text className="text-xl font-bold text-foreground">Acceso Denegado</Text>
          <Text className="text-sm text-muted text-center px-4">
            Solo el Super Administrador puede acceder a esta sección.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-primary px-6 py-3 rounded-full"
          >
            <Text className="text-background font-semibold">Volver</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // Queries
  const { data: users, isLoading: loadingUsers, refetch: refetchUsers } = trpc.superAdmin.users.list.useQuery();
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = trpc.superAdmin.metrics.overview.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchUsers(), refetchMetrics()]);
    setRefreshing(false);
  };

  const filteredUsers = users?.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loadingUsers || loadingMetrics) {
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
            <Text className="text-3xl font-bold text-foreground">Super Admin</Text>
            <Text className="text-base text-muted">Panel de control exclusivo</Text>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2 bg-surface rounded-xl p-1 border border-border">
            <TouchableOpacity
              onPress={() => setActiveTab("users")}
              className={`flex-1 py-2 rounded-lg ${activeTab === "users" ? "bg-primary" : ""}`}
            >
              <Text className={`text-center font-semibold text-xs ${activeTab === "users" ? "text-background" : "text-foreground"}`}>
                Usuarios
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("metrics")}
              className={`flex-1 py-2 rounded-lg ${activeTab === "metrics" ? "bg-primary" : ""}`}
            >
              <Text className={`text-center font-semibold text-xs ${activeTab === "metrics" ? "text-background" : "text-foreground"}`}>
                Métricas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("payments")}
              className={`flex-1 py-2 rounded-lg ${activeTab === "payments" ? "bg-primary" : ""}`}
            >
              <Text className={`text-center font-semibold text-xs ${activeTab === "payments" ? "text-background" : "text-foreground"}`}>
                Pagos
              </Text>
            </TouchableOpacity>
          </View>

          {/* Métricas Tab */}
          {activeTab === "metrics" && metrics && (
            <View className="gap-4">
              <View className="grid grid-cols-2 gap-3">
                <MetricCard
                  label="Usuarios Activos"
                  value={metrics.activeUsers}
                  icon="person.fill"
                  color={colors.success}
                />
                <MetricCard
                  label="Usuarios Inactivos"
                  value={metrics.inactiveUsers}
                  icon="person.slash.fill"
                  color={colors.error}
                />
                <MetricCard
                  label="Imágenes Subidas"
                  value={metrics.totalImages}
                  icon="photo.fill"
                  color={colors.primary}
                />
                <MetricCard
                  label="Transcripciones"
                  value={metrics.totalAudio}
                  icon="waveform.circle.fill"
                  color="#FF9500"
                />
              </View>

              <View className="gap-3">
                <Text className="text-sm font-semibold text-muted uppercase tracking-wide">Planes</Text>
                <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-foreground font-medium">Plan Basico ($12)</Text>
                    <Text className="text-2xl font-bold text-primary">{metrics.basicPlanUsers}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-foreground font-medium">Plan VIP ($14)</Text>
                    <Text className="text-2xl font-bold text-primary">{metrics.vipPlanUsers}</Text>
                  </View>
                  <View className="h-2 bg-surface rounded-full overflow-hidden border border-border">
                    <View
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${(((metrics.basicPlanUsers + metrics.vipPlanUsers) / (metrics.basicPlanUsers + metrics.vipPlanUsers + metrics.lifetimePlanUsers)) * 100) || 0}%`,
                      }}
                    />
                  </View>

                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-base text-foreground font-medium">Plan Lifetime</Text>
                    <Text className="text-2xl font-bold text-primary">{metrics.lifetimePlanUsers}</Text>
                  </View>
                  <View className="h-2 bg-surface rounded-full overflow-hidden border border-border">
                    <View
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${((metrics.lifetimePlanUsers / (metrics.basicPlanUsers + metrics.vipPlanUsers + metrics.lifetimePlanUsers)) * 100) || 0}%`,
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Pagos Tab */}
          {activeTab === "payments" && metrics && (
            <View className="gap-4">
              <View className="bg-success/10 rounded-2xl p-4 border border-success/30 gap-2">
                <Text className="text-sm font-semibold text-muted uppercase tracking-wide">Ingresos Totales</Text>
                <Text className="text-4xl font-bold text-success">${metrics.totalRevenue || 0}</Text>
                <Text className="text-xs text-muted">Desde el inicio de la plataforma</Text>
              </View>

              <View className="gap-3">
                <Text className="text-sm font-semibold text-muted uppercase tracking-wide">Últimas Transacciones</Text>
                {metrics.recentPayments && metrics.recentPayments.length > 0 ? (
                  <View className="gap-2">
                    {metrics.recentPayments.map((payment: any, idx: number) => (
                      <View key={idx} className="bg-surface rounded-xl p-3 border border-border flex-row items-center justify-between">
                        <View className="flex-1 gap-1">
                          <Text className="text-sm font-semibold text-foreground">{payment.email}</Text>
                          <Text className="text-xs text-muted">{new Date(payment.date).toLocaleDateString()}</Text>
                        </View>
                        <View className="items-end gap-1">
                          <Text className="text-sm font-bold text-success">${payment.amount}</Text>
                          <Text className="text-xs text-muted capitalize">{payment.plan}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="bg-surface rounded-2xl p-6 border border-border items-center">
                    <Text className="text-base text-muted">No hay transacciones registradas</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Usuarios Tab */}
          {activeTab === "users" && (
            <View className="gap-4">
              {/* Buscador */}
              <View className="flex-row items-center gap-2 bg-surface rounded-xl px-4 py-3 border border-border">
                <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
                <TextInput
                  placeholder="Buscar usuario..."
                  placeholderTextColor={colors.muted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 text-foreground"
                />
              </View>

              {/* Lista de Usuarios */}
              {filteredUsers.length > 0 ? (
                <View className="gap-2">
                  {filteredUsers.map((u) => (
                    <UserManagementCard
                      key={u.id}
                      user={u}
                      onStatusChange={refetchUsers}
                      onPlanChange={refetchUsers}
                      colors={colors}
                    />
                  ))}
                </View>
              ) : (
                <View className="bg-surface rounded-2xl p-6 border border-border items-center">
                  <Text className="text-base text-muted">
                    {searchQuery ? "No hay usuarios que coincidan" : "No hay usuarios registrados"}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
      <View style={{ backgroundColor: color + "20" }} className="rounded-full p-2 w-10 h-10 items-center justify-center">
        <IconSymbol name={icon as any} size={20} color={color} />
      </View>
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}

interface UserManagementCardProps {
  user: any;
  onStatusChange: () => void;
  onPlanChange: () => void;
  colors: any;
}

function UserManagementCard({ user, onStatusChange, onPlanChange, colors }: UserManagementCardProps) {
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const updateStatusMutation = trpc.superAdmin.users.updateStatus.useMutation();
  const updatePlanMutation = trpc.superAdmin.users.updatePlan.useMutation();

  const handleToggleStatus = () => {
    const newStatus = user.isActive === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activar" : "desactivar";

    confirmAction(
      `${action.charAt(0).toUpperCase() + action.slice(1)} usuario`,
      `¿Estás seguro de que deseas ${action} a ${user.email}?`,
      async () => {
        try {
          setIsLoadingStatus(true);
          await updateStatusMutation.mutateAsync({
            id: user.id,
            isActive: newStatus,
          });
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onStatusChange();
        } catch (error) {
          showAlert("Error", "No se pudo actualizar el estado del usuario");
        } finally {
          setIsLoadingStatus(false);
        }
      }
    );
  };

  const handleChangePlan = () => {
    const planOptions: Array<"basic" | "vip" | "lifetime"> = ["basic", "vip", "lifetime"];
    const currentIndex = planOptions.indexOf(user.plan as "basic" | "vip" | "lifetime");
    const newPlan = planOptions[(currentIndex + 1) % planOptions.length];
    const planLabels: Record<string, string> = { basic: "Básico ($12)", vip: "VIP ($14)", lifetime: "Lifetime" };
    const planLabel = planLabels[newPlan] || "Desconocido";

    confirmAction(
      "Cambiar Plan",
      `¿Cambiar plan de ${user.email} a ${planLabel}?`,
      async () => {
        try {
          setIsLoadingPlan(true);
          await updatePlanMutation.mutateAsync({
            id: user.id,
            plan: newPlan,
          });
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onPlanChange();
        } catch (error) {
          showAlert("Error", "No se pudo cambiar el plan del usuario");
        } finally {
          setIsLoadingPlan(false);
        }
      }
    );
  };

  const isActive = user.isActive === "active";
  const statusColor = isActive ? colors.success : colors.error;
  const statusLabel = isActive ? "Activo" : "Inactivo";
  const planLabel = user.plan === "monthly" ? "Mensual" : "Lifetime";

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
      <View className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1 gap-1">
            <Text className="text-base font-semibold text-foreground">{user.email}</Text>
            {user.name && <Text className="text-sm text-muted">{user.name}</Text>}
          </View>
          <View className="rounded-full px-3 py-1" style={{ backgroundColor: statusColor }}>
            <Text className="text-xs font-semibold text-white">{statusLabel}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 text-xs text-muted">
          <IconSymbol name="clock.fill" size={12} color={colors.muted} />
          <Text className="text-xs text-muted">
            Registrado: {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={handleToggleStatus}
          disabled={isLoadingStatus}
          className="flex-1 bg-primary/10 rounded-lg py-2 items-center"
          style={{ opacity: isLoadingStatus ? 0.5 : 1 }}
        >
          {isLoadingStatus ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text className="text-sm font-semibold text-primary">
              {isActive ? "Desactivar" : "Activar"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleChangePlan}
          disabled={isLoadingPlan}
          className="flex-1 bg-primary/10 rounded-lg py-2 items-center"
          style={{ opacity: isLoadingPlan ? 0.5 : 1 }}
        >
          {isLoadingPlan ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text className="text-sm font-semibold text-primary">
              Plan: {planLabel}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {user.plan === "lifetime" && (
        <View className="bg-warning/10 rounded-lg px-3 py-2 flex-row items-center gap-2">
          <IconSymbol name="info.circle.fill" size={16} color={colors.warning} />
          <Text className="text-xs text-warning flex-1">
            {user.audioTranscriptionsThisMonth}/20 transcripciones este mes
          </Text>
        </View>
      )}
    </View>
  );
}
