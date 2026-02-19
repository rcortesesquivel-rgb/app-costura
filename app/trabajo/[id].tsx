import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput, Linking } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/format-currency";
import { getApiBaseUrl } from "@/constants/oauth";

const ESTADOS_ORDEN = ["recibido", "cortando", "cosiendo", "bordado_personalizado", "listo", "entregado"] as const;

const ESTADO_LABELS: Record<string, string> = {
  recibido: "Recibido",
  cortando: "Cortando",
  cosiendo: "Cosiendo",
  bordado_personalizado: "Bordado/Personalizado",
  listo: "Listo",
  entregado: "Entregado",
  en_espera: "En espera",
};

const ESTADO_COLORS: Record<string, string> = {
  recibido: "#8E8E93",
  cortando: "#FF9500",
  cosiendo: "#007AFF",
  bordado_personalizado: "#AF52DE",
  listo: "#34C759",
  entregado: "#5856D6",
  en_espera: "#8E8E93",
};

const CATEGORIA_LABELS: Record<string, string> = {
  arreglo: "Arreglo",
  confeccion: "Confección",
  bordado: "Bordado",
  sublimado: "Sublimado",
  otros: "Otros",
};

export default function TrabajoDetalleScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const trabajoId = parseInt(id as string);
  const [showDividir, setShowDividir] = useState(false);
  const [cantidadDividir, setCantidadDividir] = useState("");

  const { data: trabajo, isLoading: loadingTrabajo, refetch } = trpc.trabajos.getById.useQuery({ id: trabajoId });
  const { data: cliente } = trpc.clientes.getById.useQuery(
    { id: trabajo?.clienteId || 0 },
    { enabled: !!trabajo }
  );

  const utils = trpc.useUtils();

  const updateEstadoMutation = trpc.trabajos.updateEstado.useMutation({
    onSuccess: () => {
      refetch();
      utils.trabajos.list.invalidate();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => Alert.alert("Error", "No se pudo cambiar el estado: " + error.message),
  });

  const dividirMutation = trpc.trabajos.dividir.useMutation({
    onSuccess: (data) => {
      refetch();
      utils.trabajos.list.invalidate();
      setShowDividir(false);
      setCantidadDividir("");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Dividido", `Se creó un nuevo trabajo con la cantidad separada. Nuevo ID: #${data.nuevoId}`);
    },
    onError: (error) => Alert.alert("Error", error.message),
  });

  const deleteMutation = trpc.trabajos.delete.useMutation({
    onSuccess: async () => {
      await utils.trabajos.list.invalidate();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Eliminado", "El trabajo ha sido eliminado", [
        { text: "OK", onPress: () => router.replace("/(tabs)") },
      ]);
    },
    onError: (error) => Alert.alert("Error", "No se pudo eliminar: " + error.message),
  });

  const handleCambiarEstado = (nuevoEstado: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Cambiar estado",
      `¿Estás seguro de cambiar a ${ESTADO_LABELS[nuevoEstado] || nuevoEstado}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => updateEstadoMutation.mutate({
            id: trabajoId,
            estadoAnterior: trabajo?.estado,
            estadoNuevo: nuevoEstado,
          }),
        },
      ]
    );
  };

  const handleDividir = () => {
    const cant = parseInt(cantidadDividir);
    if (!cant || cant < 1) {
      Alert.alert("Error", "Ingresa una cantidad válida");
      return;
    }
    const cantidadActual = (trabajo as any)?.cantidad ?? 1;
    if (cant >= cantidadActual) {
      Alert.alert("Error", `La cantidad a separar debe ser menor a ${cantidadActual}`);
      return;
    }
    Alert.alert("Dividir trabajo", `¿Separar ${cant} unidades del trabajo actual?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Dividir", onPress: () => dividirMutation.mutate({ id: trabajoId, cantidadSeparar: cant }) },
    ]);
  };

  const handleEliminar = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Eliminar trabajo",
      "¿Estás seguro de que deseas borrar este registro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteMutation.mutate({ id: trabajoId }) },
      ]
    );
  };

  const enviarWhatsApp = (tipo: "recibido" | "listo" | "entregado") => {
    if (!cliente) return;
    const nombre = cliente.nombreCompleto;
    const cat = CATEGORIA_LABELS[(trabajo as any)?.categoria || "otros"] || "Costura";
    const telefono = (cliente as any).whatsapp || cliente.telefono || "";
    const telLimpio = telefono.replace(/[^0-9]/g, "");

    let mensaje = "";
    if (tipo === "recibido") {
      mensaje = `Hola ${nombre}, hemos recibido su trabajo de ${cat}. Y necesito preguntarle`;
    } else if (tipo === "listo") {
      const sinpe = (trabajo as any)?.sinpeTelefono || "";
      const sinpeTexto = sinpe ? ` Si el pago es por SINPE Móvil al número: ${sinpe}.` : "";
      mensaje = `Hola ${nombre}, su trabajo de ${cat} está LISTO.${sinpeTexto} Gracias.`;
    } else if (tipo === "entregado") {
      mensaje = `Hola ${nombre}, su trabajo de ${cat} ha sido entregado. ¿Todo estuvo bien?`;
    }

    const url = `https://wa.me/${telLimpio}?text=${encodeURIComponent(mensaje)}`;
    Linking.openURL(url);
  };

  const handleCompartirRecibo = () => {
    if (!cliente) return;
    const telefono = (cliente as any).whatsapp || cliente.telefono || "";
    const telLimpio = telefono.replace(/[^0-9]/g, "");
    const apiBase = getApiBaseUrl();
    const reciboUrl = `${apiBase}/api/recibo/${trabajoId}`;
    const mensaje = `Hola ${cliente.nombreCompleto}, aquí le paso su recibo: ${reciboUrl}`;
    const url = `https://wa.me/${telLimpio}?text=${encodeURIComponent(mensaje)}`;
    Linking.openURL(url);
  };

  const handleVerRecibo = () => {
    const apiBase = getApiBaseUrl();
    const url = `${apiBase}/api/recibo/${trabajoId}`;
    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url);
    }
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

  const precioBase = parseFloat(trabajo.precioBase || "0");
  const impuestosVal = parseFloat(trabajo.impuestos || "0");
  const variosVal = parseFloat(trabajo.varios || "0");
  const granTotal = precioBase + impuestosVal + variosVal;
  const abonoInicial = parseFloat(trabajo.abonoInicial || "0");
  const saldoPendiente = granTotal - abonoInicial;
  const cantidadTrabajo = (trabajo as any)?.cantidad ?? 1;

  const diasRestantes = trabajo.fechaEntrega ? (() => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const entrega = new Date(trabajo.fechaEntrega); entrega.setHours(0, 0, 0, 0);
    return Math.ceil((entrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  })() : null;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View className="p-6 gap-5">
          {/* Header */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <IconSymbol name="chevron.right" size={28} color={colors.foreground} style={{ transform: [{ rotate: "180deg" }] }} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Trabajo #{trabajo.id}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/editar-trabajo?id=${trabajoId}` as any)}
              activeOpacity={0.7}
              className="bg-surface rounded-xl px-4 py-2 border border-border"
            >
              <Text className="text-sm font-semibold" style={{ color: colors.primary }}>Editar</Text>
            </TouchableOpacity>
          </View>

          {/* Estado actual */}
          <View className="bg-surface rounded-2xl p-4 border border-border items-center gap-2">
            <View className="rounded-full px-6 py-2" style={{ backgroundColor: ESTADO_COLORS[trabajo.estado] || "#8E8E93" }}>
              <Text className="text-lg font-bold text-white">{ESTADO_LABELS[trabajo.estado] || trabajo.estado}</Text>
            </View>
            {diasRestantes !== null && (
              <Text className="text-sm font-semibold" style={{ color: diasRestantes <= 1 ? colors.error : diasRestantes <= 4 ? colors.warning : colors.success }}>
                {diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` : diasRestantes === 0 ? "Entrega hoy" : diasRestantes === 1 ? "Entrega mañana" : `Entrega en ${diasRestantes} días`}
              </Text>
            )}
          </View>

          {/* Cliente */}
          {cliente && (
            <View className="gap-2">
              <Text className="text-lg font-semibold text-foreground">Cliente</Text>
              <TouchableOpacity
                className="bg-surface rounded-2xl p-4 border border-border"
                onPress={() => router.push(`/cliente/${cliente.id}` as any)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-semibold text-foreground">{cliente.nombreCompleto}</Text>
                    {cliente.telefono && <Text className="text-sm text-muted mt-1">{cliente.telefono}</Text>}
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Detalles */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Detalles</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Categoría</Text>
                <Text className="text-sm font-medium text-foreground">{CATEGORIA_LABELS[(trabajo as any)?.categoria] || "Otros"}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Cantidad</Text>
                <Text className="text-sm font-medium text-foreground">{cantidadTrabajo}</Text>
              </View>
              <View>
                <Text className="text-xs text-muted">Descripción</Text>
                <Text className="text-base text-foreground mt-1">{trabajo.descripcion || "Sin descripción"}</Text>
              </View>
              {trabajo.fechaEntrega && (
                <View>
                  <Text className="text-xs text-muted">Fecha de entrega</Text>
                  <Text className="text-base text-foreground mt-1">{new Date(trabajo.fechaEntrega).toLocaleDateString("es-CR")}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Dividir trabajo (solo si cantidad > 1) */}
          {cantidadTrabajo > 1 && (
            <View className="gap-2">
              {!showDividir ? (
                <TouchableOpacity
                  className="rounded-xl py-3 items-center border"
                  style={{ borderColor: colors.warning, backgroundColor: colors.warning + "15" }}
                  onPress={() => setShowDividir(true)}
                  activeOpacity={0.7}
                >
                  <Text className="text-base font-semibold" style={{ color: colors.warning }}>Dividir trabajo ({cantidadTrabajo} unidades)</Text>
                </TouchableOpacity>
              ) : (
                <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
                  <Text className="text-sm font-semibold text-foreground">¿Cuántas unidades separar?</Text>
                  <Text className="text-xs text-muted">Máximo: {cantidadTrabajo - 1} (se creará un nuevo registro con estado "Recibido")</Text>
                  <TextInput
                    className="bg-background rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder={`1 - ${cantidadTrabajo - 1}`}
                    placeholderTextColor={colors.muted}
                    value={cantidadDividir}
                    onChangeText={setCantidadDividir}
                    keyboardType="numeric"
                  />
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      className="flex-1 rounded-xl py-3 items-center border border-border"
                      onPress={() => { setShowDividir(false); setCantidadDividir(""); }}
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm font-semibold text-foreground">Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 rounded-xl py-3 items-center"
                      style={{ backgroundColor: colors.warning }}
                      onPress={handleDividir}
                      disabled={dividirMutation.isPending}
                      activeOpacity={0.7}
                    >
                      <Text className="text-sm font-semibold text-white">{dividirMutation.isPending ? "Dividiendo..." : "Confirmar"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Precios */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Precios</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Precio base</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(precioBase)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Impuestos</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(impuestosVal)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Varios</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(variosVal)}</Text>
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row justify-between">
                <Text className="text-base font-bold text-foreground">Gran Total</Text>
                <Text className="text-base font-bold" style={{ color: colors.primary }}>{formatCurrency(granTotal)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Abono inicial</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(abonoInicial)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-foreground">Saldo pendiente</Text>
                <Text className="text-base font-bold" style={{ color: saldoPendiente > 0 ? colors.error : colors.success }}>
                  {formatCurrency(Math.max(saldoPendiente, 0))}
                </Text>
              </View>
            </View>
          </View>

          {/* Recibo */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Recibo</Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 rounded-xl py-3 items-center flex-row justify-center gap-2"
                style={{ backgroundColor: colors.primary }}
                onPress={handleVerRecibo}
                activeOpacity={0.8}
              >
                <IconSymbol name="doc.fill" size={18} color="#FFFFFF" />
                <Text className="text-sm font-semibold text-white">Ver recibo</Text>
              </TouchableOpacity>
              {cliente && (
                <TouchableOpacity
                  className="flex-1 rounded-xl py-3 items-center flex-row justify-center gap-2"
                  style={{ backgroundColor: "#25D366" }}
                  onPress={handleCompartirRecibo}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="paperplane.fill" size={18} color="#FFFFFF" />
                  <Text className="text-sm font-semibold text-white">Enviar por WhatsApp</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* WhatsApp dinámico por estado */}
          {cliente && (
            <View className="gap-2">
              <Text className="text-lg font-semibold text-foreground">Mensajes WhatsApp</Text>
              <View className="gap-2">
                <TouchableOpacity
                  className="rounded-xl py-3 px-4 flex-row items-center gap-3"
                  style={{ backgroundColor: "#25D366" + "20", borderColor: "#25D366", borderWidth: 1, borderRadius: 12 }}
                  onPress={() => enviarWhatsApp("recibido")}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="paperplane.fill" size={18} color="#25D366" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold" style={{ color: "#25D366" }}>Mensaje: Recibido</Text>
                    <Text className="text-xs text-muted mt-1" numberOfLines={1}>Hola {cliente.nombreCompleto}, hemos recibido su trabajo...</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-xl py-3 px-4 flex-row items-center gap-3"
                  style={{ backgroundColor: "#25D366" + "20", borderColor: "#25D366", borderWidth: 1, borderRadius: 12 }}
                  onPress={() => enviarWhatsApp("listo")}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="paperplane.fill" size={18} color="#25D366" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold" style={{ color: "#25D366" }}>Mensaje: Listo</Text>
                    <Text className="text-xs text-muted mt-1" numberOfLines={1}>Hola {cliente.nombreCompleto}, su trabajo está LISTO...</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-xl py-3 px-4 flex-row items-center gap-3"
                  style={{ backgroundColor: "#25D366" + "20", borderColor: "#25D366", borderWidth: 1, borderRadius: 12 }}
                  onPress={() => enviarWhatsApp("entregado")}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="paperplane.fill" size={18} color="#25D366" />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold" style={{ color: "#25D366" }}>Mensaje: Entregado</Text>
                    <Text className="text-xs text-muted mt-1" numberOfLines={1}>Hola {cliente.nombreCompleto}, su trabajo ha sido entregado...</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Cambiar estado */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Cambiar estado</Text>
            <View className="gap-2">
              {ESTADOS_ORDEN.map((estado) => (
                <TouchableOpacity
                  key={estado}
                  className="rounded-xl p-4 border"
                  style={{
                    backgroundColor: trabajo.estado === estado ? (ESTADO_COLORS[estado] || "#8E8E93") + "20" : "transparent",
                    borderColor: trabajo.estado === estado ? ESTADO_COLORS[estado] || "#8E8E93" : colors.border,
                    opacity: updateEstadoMutation.isPending ? 0.6 : 1,
                  }}
                  onPress={() => handleCambiarEstado(estado)}
                  disabled={trabajo.estado === estado || updateEstadoMutation.isPending}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-medium" style={{ color: trabajo.estado === estado ? ESTADO_COLORS[estado] : colors.foreground }}>
                      {ESTADO_LABELS[estado]}
                    </Text>
                    {trabajo.estado === estado && (
                      <IconSymbol name="checkmark.circle.fill" size={20} color={ESTADO_COLORS[estado]} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Eliminar */}
          <TouchableOpacity
            className="rounded-xl py-4 items-center flex-row justify-center gap-2 mt-2"
            style={{ backgroundColor: colors.error }}
            onPress={handleEliminar}
            disabled={deleteMutation.isPending}
            activeOpacity={0.8}
          >
            <IconSymbol name="trash.fill" size={18} color="#FFFFFF" />
            <Text className="text-base font-semibold text-white">{deleteMutation.isPending ? "Eliminando..." : "Eliminar trabajo"}</Text>
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
