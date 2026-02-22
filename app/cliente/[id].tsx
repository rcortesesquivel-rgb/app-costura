import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, ScrollView, ActivityIndicator, Platform, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

export default function ClienteScreen() {
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
    talleDelantero: "",
    alturaButso: "",
    alturaCardera: "",
    siza: "",
    anchoHombro: "",
    notas: "",
  });

  const { data: cliente, isLoading: loadingCliente } = trpc.clientes.getById.useQuery({ id: clienteId });
  const { data: medidasData, isLoading: loadingMedidas, refetch: refetchMedidas } = trpc.medidas.getByClienteId.useQuery({ clienteId });
  const { data: trabajos } = trpc.trabajos.getByClienteId.useQuery({ clienteId });

  const colors = useColors();

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

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const handleEditarMedidas = () => {
    if (medidasData) {
      let camposExtras: any = {
        talleDelantero: "",
        alturaButso: "",
        alturaCardera: "",
        siza: "",
        anchoHombro: "",
        descripcion: "",
      };

      if (medidasData.notas) {
        try {
          const parsed = JSON.parse(medidasData.notas);
          camposExtras = { ...camposExtras, ...parsed };
        } catch (e) {
          camposExtras.descripcion = medidasData.notas;
        }
      }

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
        talleDelantero: camposExtras.talleDelantero || "",
        alturaButso: camposExtras.alturaButso || "",
        alturaCardera: camposExtras.alturaCardera || "",
        siza: camposExtras.siza || "",
        anchoHombro: camposExtras.anchoHombro || "",
        notas: camposExtras.descripcion || "",
      });
    }
    setEditandoMedidas(true);
  };

  const handleGuardarMedidas = () => {
    const camposEstandar = {
      cuello: medidas.cuello,
      hombros: medidas.hombros,
      pecho: medidas.pecho,
      cintura: medidas.cintura,
      cadera: medidas.cadera,
      largoManga: medidas.largoManga,
      largoEspalda: medidas.largoEspalda,
      largoPantalon: medidas.largoPantalon,
      entrepierna: medidas.entrepierna,
      contornoBrazo: medidas.contornoBrazo,
      anchoPecho: medidas.anchoPecho,
      anchoEspalda: medidas.anchoEspalda,
    };

    const camposExtras = {
      talleDelantero: medidas.talleDelantero,
      alturaButso: medidas.alturaButso,
      alturaCardera: medidas.alturaCardera,
      siza: medidas.siza,
      anchoHombro: medidas.anchoHombro,
    };

    const notasConExtras = {
      descripcion: medidas.notas,
      ...camposExtras,
    };

    const datosGuardar = {
      ...camposEstandar,
      notas: JSON.stringify(notasConExtras),
    };

    if (medidasData) {
      updateMedidasMutation.mutate({
        id: medidasData.id,
        data: datosGuardar,
      });
    } else {
      createMedidasMutation.mutate({
        clienteId,
        ...datosGuardar,
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
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-4">
        <View className="gap-6">
          {/* CLIENTE INFO */}
          <View className="bg-surface rounded-lg p-4 gap-3">
            <Text className="text-2xl font-bold text-foreground">{cliente.nombreCompleto}</Text>
            <View className="gap-1">
              <Text className="text-sm text-muted">Teléfono</Text>
              <Text className="text-base text-foreground">{cliente.telefono || "—"}</Text>
            </View>
          </View>

          {/* MEDIDAS SECTION */}
          <View className="bg-surface rounded-lg p-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">Medidas</Text>
              {!editandoMedidas && (
                <Text
                  className="text-primary font-semibold"
                  onPress={handleEditarMedidas}
                >
                  Editar
                </Text>
              )}
            </View>

            {/* CONTORNOS */}
            <View className="pt-2 border-t border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">Contornos (Circunferencias)</Text>
              {[
                { key: "cuello", label: "Contorno de Cuello" },
                { key: "hombros", label: "Contorno de Busto/Pecho" },
                { key: "cintura", label: "Contorno de Cintura" },
                { key: "cadera", label: "Contorno de Cadera" },
                { key: "contornoBrazo", label: "Contorno de Brazo" },
                { key: "pecho", label: "Contorno de Muñeca" },
              ].map(({ key, label }) => (
                <View key={key} className="flex-row items-center justify-between mb-2">
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
            </View>

            {/* LARGOS */}
            <View className="pt-2 border-t border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">Largos (Medidas verticales)</Text>
              {[
                { key: "largoEspalda", label: "Talle Espalda" },
                { key: "talleDelantero", label: "Talle Delantero", isExtra: true },
                { key: "alturaButso", label: "Altura de Busto", isExtra: true },
                { key: "alturaCardera", label: "Altura de Cadera", isExtra: true },
                { key: "largoManga", label: "Largo de Manga" },
                { key: "largoPantalon", label: "Largo de Falda/Pantalón" },
                { key: "entrepierna", label: "Tiro" },
                { key: "siza", label: "Siza", isExtra: true },
              ].map(({ key, label }) => (
                <View key={key} className="flex-row items-center justify-between mb-2">
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
            </View>

            {/* ANCHOS */}
            <View className="pt-2 border-t border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">Anchos</Text>
              {[
                { key: "anchoHombro", label: "Ancho de Hombro", isExtra: true },
                { key: "anchoEspalda", label: "Ancho de Espalda" },
                { key: "anchoPecho", label: "Separación de Busto" },
              ].map(({ key, label }) => (
                <View key={key} className="flex-row items-center justify-between mb-2">
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
            </View>

            {editandoMedidas && (
              <View className="gap-2 mt-2 pt-2 border-t border-border">
                <Text className="text-sm font-semibold text-foreground">Otras</Text>
                <Text className="text-sm text-muted">Descripción adicional</Text>
                <TextInput
                  className="bg-background rounded-lg border border-border px-3 py-2 text-sm text-foreground min-h-20"
                  placeholder="Notas sobre medidas especiales..."
                  placeholderTextColor={colors.muted}
                  value={medidas.notas}
                  onChangeText={(text) => setMedidas({ ...medidas, notas: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}

            {editandoMedidas && (
              <View className="flex-row gap-2 mt-4">
                <Text
                  className="flex-1 bg-primary text-background text-center py-2 rounded-lg font-semibold"
                  onPress={handleGuardarMedidas}
                >
                  Guardar
                </Text>
                <Text
                  className="flex-1 bg-border text-foreground text-center py-2 rounded-lg font-semibold"
                  onPress={() => setEditandoMedidas(false)}
                >
                  Cancelar
                </Text>
              </View>
            )}
          </View>

          {/* TRABAJOS */}
          {trabajos && trabajos.length > 0 && (
            <View className="bg-surface rounded-lg p-4">
              <Text className="text-lg font-bold text-foreground mb-3">Trabajos ({trabajos.length})</Text>
              {trabajos.map((trabajo) => (
                <View key={trabajo.id} className="border-b border-border pb-2 mb-2">
                  <Text className="text-base font-semibold text-foreground">{trabajo.descripcion}</Text>
                  <Text className="text-sm text-muted">Estado: {trabajo.estado}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
