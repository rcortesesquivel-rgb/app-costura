import { ScrollView, Text, View, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useRouter } from "expo-router";
import { confirmAction, confirmDestructive, showAlert } from "@/lib/confirm";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";

export default function AdminScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  if (!user || user.role !== "admin") {
    return (
      <ScreenContainer className="items-center justify-center">
        <View className="gap-4 items-center">
          <IconSymbol name="shield.fill" size={48} color={colors.error} />
          <Text className="text-xl font-bold text-foreground">Acceso Denegado</Text>
          <Text className="text-sm text-muted text-center px-4">
            Solo los administradores pueden acceder a esta sección.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  const { data: users, isLoading, refetch } = trpc.admin.users.list.useQuery();
  const { data: stats, refetch: refetchStats } = trpc.admin.stats.overview.useQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchStats()]);
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const totalUsers = stats?.totalUsers ?? 0;
  const activeUsers = stats?.activeUsers ?? 0;
  const inactiveUsers = totalUsers - activeUsers;

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
            <Text className="text-3xl font-bold text-foreground">Gestión de Usuarios</Text>
            <Text className="text-base text-muted">Administra suscripciones y accesos</Text>
          </View>

          {/* Boton Whitelist / Pruebas 48h */}
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(admin)/whitelist" as any);
            }}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
            activeOpacity={0.8}
          >
            <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, padding: 10 }}>
              <IconSymbol name="person.badge.plus" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>Whitelist / Pruebas 48h</Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 }}>Agregar pruebas y gestionar accesos</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>

          {/* Resumen */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold text-foreground">{totalUsers}</Text>
              <Text className="text-xs text-muted mt-1">Total</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold" style={{ color: colors.success }}>{activeUsers}</Text>
              <Text className="text-xs text-muted mt-1">Activos</Text>
            </View>
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border items-center">
              <Text className="text-2xl font-bold" style={{ color: colors.error }}>{inactiveUsers}</Text>
              <Text className="text-xs text-muted mt-1">Inactivos</Text>
            </View>
          </View>

          {/* Lista de Usuarios */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-muted uppercase tracking-wide">Usuarios Registrados</Text>
            {users && users.length > 0 ? (
              users.map((u) => (
                <UserCard key={u.id} userData={u} currentUserId={user.id} onRefresh={onRefresh} colors={colors} />
              ))
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

function UserCard({ userData, currentUserId, onRefresh, colors }: { userData: any; currentUserId: number; onRefresh: () => void; colors: any }) {
  const [busy, setBusy] = useState(false);
  const updateStatus = trpc.admin.users.updateStatus.useMutation();
  const deleteUser = trpc.admin.users.delete.useMutation();

  const isActive = userData.isActive === "active";
  const isSelf = userData.id === currentUserId;

  const doConfirmAction = (title: string, message: string, action: () => Promise<void>, destructive = false) => {
    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n\n${message}`)) {
        action();
      }
    } else {
      if (destructive) {
        confirmDestructive(title, message, action);
      } else {
        confirmAction(title, message, action);
      }
    }
  };

  const handleToggle = () => {
    const newStatus = isActive ? "inactive" : "active";
    const label = isActive ? "desactivar" : "activar";
    doConfirmAction(
      `${label.charAt(0).toUpperCase() + label.slice(1)} usuario`,
      `¿Estás seguro de que deseas ${label} a ${userData.name || userData.email}?`,
      async () => {
        try {
          setBusy(true);
          await updateStatus.mutateAsync({ id: userData.id, isActive: newStatus });
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onRefresh();
        } catch { 
          if (Platform.OS === "web") window.alert("Error al actualizar estado");
          else showAlert("Error", "No se pudo actualizar el estado");
        } finally { setBusy(false); }
      }
    );
  };

  const handleDelete = () => {
    doConfirmAction(
      "Eliminar usuario",
      `¿Estás seguro de que deseas borrar este registro?\n\n${userData.name || userData.email}\n\nEsta acción no se puede deshacer.`,
      async () => {
        try {
          setBusy(true);
          await deleteUser.mutateAsync({ id: userData.id });
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onRefresh();
        } catch {
          if (Platform.OS === "web") window.alert("Error al eliminar usuario");
          else showAlert("Error", "No se pudo eliminar el usuario");
        } finally { setBusy(false); }
      },
      true
    );
  };

  return (
    <View className="bg-surface rounded-2xl p-4 border border-border">
      <View className="flex-row items-center gap-3">
        {/* Avatar */}
        <View style={{ backgroundColor: isActive ? `${colors.success}20` : `${colors.error}20`, borderRadius: 999, padding: 10 }}>
          <IconSymbol name="person.fill" size={24} color={isActive ? colors.success : colors.error} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className="text-base font-semibold text-foreground flex-1" numberOfLines={1}>
              {userData.name || "Sin nombre"}
            </Text>
            <View style={{ backgroundColor: isActive ? colors.success : colors.error, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "700" }}>{isActive ? "Activo" : "Inactivo"}</Text>
            </View>
          </View>
          <Text className="text-sm text-muted" numberOfLines={1}>{userData.email}</Text>
          <View className="flex-row items-center gap-3 mt-1">
            <Text className="text-xs text-muted">
              {userData.role === "admin" ? "Admin" : "Usuario"}
            </Text>
            <Text className="text-xs text-muted">
              Registro: {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}
            </Text>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      {!isSelf && (
        <View className="flex-row gap-2 mt-3" style={{ justifyContent: "flex-end" }}>
          <TouchableOpacity
            onPress={handleToggle}
            disabled={busy}
            style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              backgroundColor: isActive ? `${colors.warning}15` : `${colors.success}15`,
              borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
              opacity: busy ? 0.5 : 1,
            }}
            activeOpacity={0.7}
          >
            <IconSymbol name={isActive ? "xmark.circle.fill" : "checkmark.circle.fill"} size={16} color={isActive ? colors.warning : colors.success} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: isActive ? colors.warning : colors.success }}>
              {isActive ? "Desactivar" : "Activar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDelete}
            disabled={busy}
            style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              backgroundColor: `${colors.error}15`,
              borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
              opacity: busy ? 0.5 : 1,
            }}
            activeOpacity={0.7}
          >
            <IconSymbol name="trash.fill" size={16} color={colors.error} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.error }}>Borrar</Text>
          </TouchableOpacity>
        </View>
      )}

      {isSelf && (
        <View className="mt-2" style={{ alignItems: "flex-end" }}>
          <Text className="text-xs text-muted" style={{ fontStyle: "italic" }}>Tu cuenta (no editable)</Text>
        </View>
      )}
    </View>
  );
}
