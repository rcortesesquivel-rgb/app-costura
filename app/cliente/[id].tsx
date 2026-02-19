import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, TextInput, Alert, Platform } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { confirmDestructive, showAlert } from "@/lib/confirm";

export default function ClienteDetalleScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const clienteId = parseInt(id as string);

  const [editandoMedidas, setEditandoMedidas] = useState(false);
  const [medidas, setMedidas] = useState({
    cuello: "",
    hombros: "",
    pecho: "",
    cintura: "",
    cadera: "",
    largoManga: "",
    largoEspalda: "",
    largoPantalon: "",
    entrepierna: "",
    contornoBrazo: "",
    anchoPecho: "",
    anchoEspalda: "",
    notas: "",
  });

  const { data: cliente, isLoading: loadingCliente } = trpc.clientes.getById.useQuery({ id: clienteId });
  const { data: medidasData, isLoading: loadingMedidas, refetch: refetchMedidas } = trpc.medidas.getByClienteId.useQuery({ clienteId });
  const { data: trabajos } = trpc.trabajos.getByClienteId.useQuery({ clienteId });

  const utils = trpc.useUtils();

  const deleteClienteMutation = trpc.clientes.delete.useMutation({
    onSuccess: async () => {
      await utils.clientes.list.invalidate();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert("Eliminado", "El cliente ha sido eliminado", () => router.replace("/(tabs)/clientes" as any));
    },
    onError: (error) => showAlert("Error", "No se pudo eliminar: " + error.message),
  });

  const createMedidasMutation = trpc.medidas.create.useMutation({
    onSuccess: () => {
      refetchMedidas();
      setEditandoMedidas(false);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert("Éxito", "Medidas guardadas correctamente");
    },
  });

  const updateMedidasMutation = trpc.medidas.update.useMutation({
    onSuccess: () => {
      refetchMedidas();
      setEditandoMedidas(false);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert("Éxito", "Medidas actualizadas correctamente");
    },
  });

  const handleEditarMedidas = () => {
    if (medidasData) {
      setMedidas({
        cuello: medidasData.cuello || "",
        hombros: medidasData.hombros || "",
        pecho: medidasData.pecho || "",
        cintura: medidasData.cintura || "",
        cadera: medidasData.cadera || "",
        largoManga: medidasData.largoManga || "",
        largoEspalda: medidasData.largoEspalda || "",
        largoPantalon: medidasData.largoPantalon || "",
        entrepierna: medidasData.entrepierna || "",
        contornoBrazo: medidasData.contornoBrazo || "",
        anchoPecho: medidasData.anchoPecho || "",
        anchoEspalda: medidasData.anchoEspalda || "",
        notas: medidasData.notas || "",
      });
    }
    setEditandoMedidas(true);
  };

  const handleGuardarMedidas = () => {
    if (medidasData) {
      updateMedidasMutation.mutate({
        id: medidasData.id,
        data: medidas,
      });
    } else {
      createMedidasMutation.mutate({
        clienteId,
        ...medidas,
      });
    }
  };

  if (loadingCliente || loadingMedidas) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!cliente) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-base text-muted">Cliente no encontrado</Text>
      </ScreenContainer>
    );
  }

  const redesSociales = cliente.redesSociales ? JSON.parse(cliente.redesSociales) : {};

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              activeOpacity={0.7}
            >
              <IconSymbol name="chevron.right" size={28} color={colors.foreground} style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">{cliente.nombreCompleto}</Text>
            </View>
          </View>

          {/* Información del cliente */}
          <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
            {cliente.telefono && (
              <View className="flex-row items-center gap-3">
                <IconSymbol name="phone.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground">{cliente.telefono}</Text>
              </View>
            )}
            {cliente.direccion && (
              <View className="flex-row items-start gap-3">
                <IconSymbol name="location.fill" size={20} color={colors.primary} />
                <Text className="text-base text-foreground flex-1">{cliente.direccion}</Text>
              </View>
            )}
            {(redesSociales.instagram || redesSociales.facebook) && (
              <View className="gap-2 mt-2">
                {redesSociales.instagram && (
                  <Text className="text-sm text-muted">Instagram: {redesSociales.instagram}</Text>
                )}
                {redesSociales.facebook && (
                  <Text className="text-sm text-muted">Facebook: {redesSociales.facebook}</Text>
                )}
              </View>
            )}
          </View>

          {/* Medidas */}
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-foreground">Ficha de medidas</Text>
              <TouchableOpacity
                onPress={editandoMedidas ? handleGuardarMedidas : handleEditarMedidas}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-2">
                  <IconSymbol
                    name={editandoMedidas ? "checkmark.circle.fill" : "pencil"}
                    size={20}
                    color={colors.primary}
                  />
                  <Text className="text-sm font-medium" style={{ color: colors.primary }}>
                    {editandoMedidas ? "Guardar" : "Editar"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              {[
                { key: "cuello", label: "Cuello" },
                { key: "hombros", label: "Hombros" },
                { key: "pecho", label: "Pecho" },
                { key: "cintura", label: "Cintura" },
                { key: "cadera", label: "Cadera" },
                { key: "largoManga", label: "Largo de manga" },
                { key: "largoEspalda", label: "Largo de espalda" },
                { key: "largoPantalon", label: "Largo de pantalón" },
                { key: "entrepierna", label: "Entrepierna" },
                { key: "contornoBrazo", label: "Contorno de brazo" },
                { key: "anchoPecho", label: "Ancho de pecho" },
                { key: "anchoEspalda", label: "Ancho de espalda" },
              ].map(({ key, label }) => (
                <View key={key} className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">{label}</Text>
                  {editandoMedidas ? (
                    <TextInput
                      className="bg-background rounded-lg border border-border px-3 py-2 text-sm text-foreground w-24 text-right"
                      placeholder="0 cm"
                      placeholderTextColor={colors.muted}
                      value={medidas[key as keyof typeof medidas]}
                      onChangeText={(text) => setMedidas({ ...medidas, [key]: text })}
                      keyboardType="numeric"
                    />
                  ) : (
                    <Text className="text-sm font-medium text-foreground">
                      {(medidasData?.[key as keyof typeof medidasData] as string) || "—"}
                    </Text>
                  )}
                </View>
              ))}

              {editandoMedidas && (
                <View className="gap-2 mt-2">
                  <Text className="text-sm text-muted">Notas adicionales</Text>
                  <TextInput
                    className="bg-background rounded-lg border border-border px-3 py-2 text-sm text-foreground"
                    placeholder="Notas sobre las medidas..."
                    placeholderTextColor={colors.muted}
                    value={medidas.notas}
                    onChangeText={(text) => setMedidas({ ...medidas, notas: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              )}

              {!editandoMedidas && medidasData?.notas && (
                <View className="gap-2 mt-2 pt-2 border-t border-border">
                  <Text className="text-sm text-muted">Notas</Text>
                  <Text className="text-sm text-foreground">{medidasData.notas}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Historial de trabajos */}
          <View className="gap-3">
            <Text className="text-xl font-semibold text-foreground">Historial de trabajos</Text>
            {trabajos && trabajos.length > 0 ? (
              trabajos.map((trabajo) => (
                <TouchableOpacity
                  key={trabajo.id}
                  className="bg-surface rounded-2xl p-4 border border-border"
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/trabajo/${trabajo.id}` as any);
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                    {trabajo.descripcion}
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    {new Date(trabajo.createdAt).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <View className="bg-surface rounded-2xl p-6 border border-border items-center">
                <Text className="text-base text-muted">No hay trabajos registrados</Text>
              </View>
            )}
          </View>

          {/* Eliminar cliente */}
          <TouchableOpacity
            className="rounded-xl py-4 items-center flex-row justify-center gap-2 mt-2"
            style={{ backgroundColor: colors.error }}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              confirmDestructive(
                "Eliminar cliente",
                "¿Estás seguro de que deseas borrar este cliente y todos sus datos? Esta acción no se puede deshacer.",
                () => deleteClienteMutation.mutate({ id: clienteId })
              );
            }}
            disabled={deleteClienteMutation.isPending}
            activeOpacity={0.8}
          >
            <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
            <Text className="text-base font-semibold text-white">
              {deleteClienteMutation.isPending ? "Eliminando..." : "Eliminar cliente"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer fijo: Ir Atrás */}
      <View
        className="border-t border-border px-6 py-3"
        style={{ backgroundColor: colors.background }}
      >
        <TouchableOpacity
          className="rounded-xl py-3 items-center flex-row justify-center gap-2"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol name="chevron.right" size={18} color={colors.foreground} style={{ transform: [{ rotate: "180deg" }] }} />
          <Text className="text-base font-semibold text-foreground">Ir Atrás</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
