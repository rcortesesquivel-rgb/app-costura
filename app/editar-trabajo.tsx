import { Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/format-currency";

export default function EditarTrabajoScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const trabajoId = parseInt(id as string);

  // Estado del formulario
  const [tipo, setTipo] = useState<"arreglo" | "confeccion" | "personalizacion">("arreglo");
  const [descripcion, setDescripcion] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [abonoInicial, setAbonoInicial] = useState("0");
  
  // Campos específicos
  const [tipoPrenda, setTipoPrenda] = useState("");
  const [nivelUrgencia, setNivelUrgencia] = useState<"baja" | "media" | "alta">("media");
  const [tipoTela, setTipoTela] = useState("");
  const [metrosRequeridos, setMetrosRequeridos] = useState("");
  const [tipoPersonalizacion, setTipoPersonalizacion] = useState("");

  const { data: trabajo, isLoading: loadingTrabajo } = trpc.trabajos.getById.useQuery({ id: trabajoId });

  const utils = trpc.useUtils();
  const updateMutation = trpc.trabajos.update.useMutation({
    onSuccess: async () => {
      await utils.trabajos.list.invalidate();
      await utils.trabajos.getById.invalidate({ id: trabajoId });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Éxito", "Trabajo actualizado correctamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo actualizar el trabajo: " + error.message);
    },
  });

  // Cargar datos del trabajo cuando se obtienen
  useEffect(() => {
    if (trabajo) {
      setTipo(trabajo.tipo as any);
      setDescripcion(trabajo.descripcion || "");
      setPrecioBase(trabajo.precioBase || "");
      setAbonoInicial(trabajo.abonoInicial || "0");
      setTipoPrenda(trabajo.tipoPrenda || "");
      setNivelUrgencia((trabajo.nivelUrgencia as any) || "media");
      setTipoTela(trabajo.tipoTela || "");
      setMetrosRequeridos(trabajo.metrosRequeridos || "");
      setTipoPersonalizacion(trabajo.tipoPersonalizacion || "");
    }
  }, [trabajo]);

  const handleGuardar = () => {
    if (!descripcion.trim()) {
      Alert.alert("Error", "La descripción es obligatoria");
      return;
    }

    if (!precioBase || parseFloat(precioBase) <= 0) {
      Alert.alert("Error", "El precio base debe ser mayor a 0");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const data: any = {
      tipo,
      descripcion: descripcion.trim(),
      precioBase,
      abonoInicial: abonoInicial || "0",
      nivelUrgencia,
    };

    // Campos específicos por tipo
    if (tipo === "arreglo") {
      data.tipoPrenda = tipoPrenda || null;
    } else if (tipo === "confeccion") {
      data.tipoTela = tipoTela || null;
      data.metrosRequeridos = metrosRequeridos || null;
    } else if (tipo === "personalizacion") {
      data.tipoPersonalizacion = tipoPersonalizacion || null;
    }

    updateMutation.mutate({ id: trabajoId, data });
  };

  if (loadingTrabajo) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!trabajo) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-base text-muted">Trabajo no encontrado</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              activeOpacity={0.7}
            >
              <IconSymbol name="chevron.right" size={28} color={colors.foreground} style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Editar trabajo</Text>
            </View>
          </View>

          {/* Tipo de trabajo */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Tipo de trabajo</Text>
            <View className="flex-row gap-2">
              {(["arreglo", "confeccion", "personalizacion"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  className="flex-1 rounded-xl py-3 border"
                  style={{
                    backgroundColor: tipo === t ? colors.primary + "20" : "transparent",
                    borderColor: tipo === t ? colors.primary : colors.border,
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTipo(t);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-center text-sm font-medium"
                    style={{ color: tipo === t ? colors.primary : colors.foreground }}
                  >
                    {t === "arreglo" ? "Arreglo" : t === "confeccion" ? "Confección" : "Personalización"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Descripción */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Descripción</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-base border"
              style={{ color: colors.foreground, borderColor: colors.border }}
              placeholder="Describe el trabajo a realizar"
              placeholderTextColor={colors.muted}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Campos específicos por tipo */}
          {tipo === "arreglo" && (
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">Tipo de prenda</Text>
              <TextInput
                className="bg-surface rounded-xl p-4 text-base border"
                style={{ color: colors.foreground, borderColor: colors.border }}
                placeholder="Ej: Pantalón, camisa, vestido"
                placeholderTextColor={colors.muted}
                value={tipoPrenda}
                onChangeText={setTipoPrenda}
              />
            </View>
          )}

          {tipo === "confeccion" && (
            <>
              <View className="gap-2">
                <Text className="text-base font-semibold text-foreground">Tipo de tela</Text>
                <TextInput
                  className="bg-surface rounded-xl p-4 text-base border"
                  style={{ color: colors.foreground, borderColor: colors.border }}
                  placeholder="Ej: Algodón, lino, seda"
                  placeholderTextColor={colors.muted}
                  value={tipoTela}
                  onChangeText={setTipoTela}
                />
              </View>
              <View className="gap-2">
                <Text className="text-base font-semibold text-foreground">Metros requeridos</Text>
                <TextInput
                  className="bg-surface rounded-xl p-4 text-base border"
                  style={{ color: colors.foreground, borderColor: colors.border }}
                  placeholder="Ej: 2.5"
                  placeholderTextColor={colors.muted}
                  value={metrosRequeridos}
                  onChangeText={setMetrosRequeridos}
                  keyboardType="decimal-pad"
                />
              </View>
            </>
          )}

          {tipo === "personalizacion" && (
            <View className="gap-2">
              <Text className="text-base font-semibold text-foreground">Tipo de personalización</Text>
              <TextInput
                className="bg-surface rounded-xl p-4 text-base border"
                style={{ color: colors.foreground, borderColor: colors.border }}
                placeholder="Ej: Bordado, estampado"
                placeholderTextColor={colors.muted}
                value={tipoPersonalizacion}
                onChangeText={setTipoPersonalizacion}
              />
            </View>
          )}

          {/* Nivel de urgencia */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Nivel de urgencia</Text>
            <View className="flex-row gap-2">
              {(["baja", "media", "alta"] as const).map((nivel) => (
                <TouchableOpacity
                  key={nivel}
                  className="flex-1 rounded-xl py-3 border"
                  style={{
                    backgroundColor: nivelUrgencia === nivel ? colors.primary + "20" : "transparent",
                    borderColor: nivelUrgencia === nivel ? colors.primary : colors.border,
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setNivelUrgencia(nivel);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    className="text-center text-sm font-medium"
                    style={{ color: nivelUrgencia === nivel ? colors.primary : colors.foreground }}
                  >
                    {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Precio base */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Precio base</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-base border"
              style={{ color: colors.foreground, borderColor: colors.border }}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              value={precioBase}
              onChangeText={setPrecioBase}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Abono inicial */}
          <View className="gap-2">
            <Text className="text-base font-semibold text-foreground">Abono inicial</Text>
            <TextInput
              className="bg-surface rounded-xl p-4 text-base border"
              style={{ color: colors.foreground, borderColor: colors.border }}
              placeholder="0.00"
              placeholderTextColor={colors.muted}
              value={abonoInicial}
              onChangeText={setAbonoInicial}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Botón guardar */}
          <TouchableOpacity
            className="rounded-xl py-4 items-center"
            style={{ backgroundColor: colors.primary }}
            onPress={handleGuardar}
            disabled={updateMutation.isPending}
            activeOpacity={0.8}
          >
            {updateMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-base font-semibold text-white">Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
