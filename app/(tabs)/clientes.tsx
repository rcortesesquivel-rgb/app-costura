import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function ClientesScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: clientes, isLoading } = trpc.clientes.list.useQuery();

  const clientesFiltrados = clientes?.filter(cliente =>
    cliente.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cliente.telefono?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getInitials = (nombre: string) => {
    const words = nombre.split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  const handleNuevoCliente = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/crear-cliente" as any);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Clientes</Text>
            <Text className="text-base text-muted">Gestiona tu base de clientes</Text>
          </View>

          {/* Botón Importar Contactos */}
          <TouchableOpacity
            className="flex-row items-center gap-3 rounded-2xl p-4 border border-border"
            style={{ backgroundColor: colors.primary + "10", borderColor: colors.primary + "40" }}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push("/importar-contactos" as any);
            }}
            activeOpacity={0.7}
          >
            <IconSymbol name="person.crop.circle.badge.plus" size={28} color={colors.primary} />
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.primary }}>Importar Contactos</Text>
              <Text className="text-xs text-muted">Desde la agenda de tu móvil</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.primary} />
          </TouchableOpacity>

          {/* Buscador */}
          <View className="bg-surface rounded-2xl border border-border flex-row items-center px-4 py-3">
            <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
            <TextInput
              className="flex-1 ml-3 text-base text-foreground"
              placeholder="Buscar por nombre o teléfono..."
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

          {/* Lista de clientes */}
          <View className="gap-3">
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <TouchableOpacity
                  key={cliente.id}
                  className="bg-surface rounded-2xl p-4 border border-border"
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.push(`/cliente/${cliente.id}` as any);
                  }}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center gap-4">
                    {/* Avatar con iniciales */}
                    <View 
                      className="w-14 h-14 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                        {getInitials(cliente.nombreCompleto)}
                      </Text>
                    </View>

                    {/* Información */}
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                        {cliente.nombreCompleto}
                      </Text>
                      {cliente.telefono && (
                        <View className="flex-row items-center gap-1 mt-1">
                          <IconSymbol name="phone.fill" size={14} color={colors.muted} />
                          <Text className="text-sm text-muted">{cliente.telefono}</Text>
                        </View>
                      )}
                      {cliente.direccion && (
                        <View className="flex-row items-center gap-1 mt-1">
                          <IconSymbol name="location.fill" size={14} color={colors.muted} />
                          <Text className="text-sm text-muted" numberOfLines={1}>{cliente.direccion}</Text>
                        </View>
                      )}
                    </View>

                    <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-surface rounded-2xl p-8 border border-border items-center">
                <IconSymbol name="person.fill" size={48} color={colors.muted} />
                <Text className="text-base text-muted mt-3 text-center">
                  {searchQuery ? "No se encontraron clientes" : "No hay clientes registrados"}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    className="mt-4 rounded-full px-6 py-3"
                    style={{ backgroundColor: colors.primary }}
                    onPress={handleNuevoCliente}
                    activeOpacity={0.8}
                  >
                    <Text className="text-base font-semibold text-white">Agregar primer cliente</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Botón flotante */}
      {clientes && clientes.length > 0 && (
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
            onPress={handleNuevoCliente}
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
            onPress={handleNuevoCliente}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus.circle.fill" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}
