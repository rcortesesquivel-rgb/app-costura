import { Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform, TextInput, Linking, Switch, Modal } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ImageGalleryWidget } from "@/components/image-gallery-widget";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { formatCurrency } from "@/lib/format-currency";
import { getApiBaseUrl } from "@/constants/oauth";
import { confirmAction, confirmDestructive, showAlert } from "@/lib/confirm";
import { AudioRecorderWidget } from "@/components/audio-recorder";
import { useAuth } from "@/lib/auth-context";
import { generateCotizacionText } from "@/lib/generate-cotizacion-text";
import { PaymentConditionsModal } from "@/components/payment-conditions-modal";
import { ConversionPopup } from "@/components/conversion-popup";
import { useWhatsAppReturn, useWindowFocus } from "@/hooks/use-app-state";


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
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const trabajoId = parseInt(id as string);
  const [showDividir, setShowDividir] = useState(false);
  const [cantidadDividir, setCantidadDividir] = useState("");
  const [showPaymentConditions, setShowPaymentConditions] = useState(false);
  const [paymentConditions, setPaymentConditions] = useState("");
  const [showCotizacionModal, setShowCotizacionModal] = useState(false);
  const [cotizacionGenerada, setCotizacionGenerada] = useState("");
  const [showFacturacionModal, setShowFacturacionModal] = useState(false);
  const [contadorWhatsApp, setContadorWhatsApp] = useState("");
  const [mensajeFacturacion, setMensajeFacturacion] = useState("");
  const [showConversionPopup, setShowConversionPopup] = useState(false);
  const [shouldShowPopupOnReturn, setShouldShowPopupOnReturn] = useState(false);

  // Detectar retorno de WhatsApp
  useWhatsAppReturn(() => {
    if (shouldShowPopupOnReturn) {
      setShowConversionPopup(true);
      setShouldShowPopupOnReturn(false);
    }
  });

  // Detectar focus en web
  useWindowFocus(() => {
    if (shouldShowPopupOnReturn) {
      setShowConversionPopup(true);
      setShouldShowPopupOnReturn(false);
    }
  });

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
    onError: (error) => showAlert("Error", "No se pudo cambiar el estado: " + error.message),
  });

  const dividirMutation = trpc.trabajos.dividir.useMutation({
    onSuccess: (data) => {
      refetch();
      utils.trabajos.list.invalidate();
      setShowDividir(false);
      setCantidadDividir("");
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert("Dividido", `Se creó un nuevo trabajo con la cantidad separada. Nuevo ID: #${data.nuevoId}`);
    },
    onError: (error) => showAlert("Error", error.message),
  });

  const deleteMutation = trpc.trabajos.delete.useMutation({
    onSuccess: async () => {
      await utils.trabajos.list.invalidate();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert("Eliminado", "El trabajo ha sido eliminado", () => router.replace("/(tabs)"));
    },
    onError: (error) => showAlert("Error", "No se pudo eliminar: " + error.message),
  });

  const deleteImageMutation = trpc.imagenes.delete.useMutation({
    onSuccess: () => {
      refetch();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => showAlert("Error", "No se pudo eliminar la imagen: " + error.message),
  });

  const addImagesMutation = trpc.imagenes.addToTrabajo.useMutation({
    onSuccess: () => {
      refetch();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => showAlert("Error", "No se pudieron agregar las imagenes: " + error.message),
  });

  const togglePagadoMutation = trpc.trabajos.togglePagado.useMutation({
    onSuccess: () => {
      refetch();
      utils.trabajos.list.invalidate();
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => showAlert("Error", "No se pudo actualizar: " + error.message),
  });

  const handleGenerarCotizacion = async () => {
    if (!trabajo || !cliente) return;
    setShowPaymentConditions(true);
  };

  const handleConfirmPaymentConditions = async () => {
    if (!trabajo || !cliente) return;

    try {
      const cotizacionText = generateCotizacionText({
        clienteName: cliente.nombreCompleto,
        clientePhone: cliente.telefono,
        clienteEmail: cliente.email,
        descripcion: trabajo.descripcion,
        precioUnitario: parseFloat(trabajo.precioUnitario),
        cantidad: trabajo.cantidad,
        impuestos: parseFloat(trabajo.impuestos),
        varios: parseFloat(trabajo.varios),
        abonoInicial: parseFloat(trabajo.abonoInicial),
        fechaEntrega: trabajo.fechaEntrega ? new Date(trabajo.fechaEntrega).toLocaleDateString("es-CR") : undefined,
        tallerName: "Taller de Costura",
        condicionesPago: paymentConditions,
      });

      setShowPaymentConditions(false);
      setCotizacionGenerada(cotizacionText);
      setShowCotizacionModal(true);
    } catch (error) {
      setShowPaymentConditions(false);
      showAlert("Error", `No se pudo generar la cotización: ${error instanceof Error ? error.message : "Error desconocido"}`);
    }
  };

  const handleCopiarCotizacion = async () => {
    try {
      if (Platform.OS === "web" && navigator.clipboard) {
        await navigator.clipboard.writeText(cotizacionGenerada);
      }
      showAlert("Éxito", "Cotización copiada al portapapeles");
    } catch {
      showAlert("Error", "No se pudo copiar la cotización");
    }
  };

  const handleCompartirCotizacionWhatsApp = () => {
    if (!cliente) return;
    const telefono = (cliente as any).whatsapp || cliente.telefono || "";
    const telLimpio = telefono.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${telLimpio}?text=${encodeURIComponent(cotizacionGenerada)}`;
    Linking.openURL(url);
    setShowCotizacionModal(false);
    
    // Marcar para mostrar pop-up cuando regrese
    setShouldShowPopupOnReturn(true);
  };

  const generarMensajeFacturacion = () => {
    if (!trabajo || !cliente) return "";
    const precioUnit = parseFloat(trabajo.precioUnitario || "0");
    const cant = (trabajo as any)?.cantidad ?? 1;
    const imp = parseFloat(trabajo.impuestos || "0");
    const var_ = parseFloat(trabajo.varios || "0");
    const sub = precioUnit * cant;
    const tot = sub + imp + var_;
    const abono = parseFloat(trabajo.abonoInicial || "0");
    const saldo = Math.max(0, tot - abono);
    const cat = CATEGORIA_LABELS[(trabajo as any)?.categoria || "otros"] || "Costura";
    const fecha = trabajo.fechaEntrega ? new Date(trabajo.fechaEntrega).toLocaleDateString("es-CR") : "No definida";

    let msg = `📋 *DATOS PARA FACTURACIÓN*\n\n`;
    msg += `👤 Cliente: ${cliente.nombreCompleto}\n`;
    if (cliente.telefono) msg += `📱 Tel: ${cliente.telefono}\n`;
    if (cliente.email) msg += `📧 Email: ${cliente.email}\n`;
    msg += `\n🧵 Trabajo #${trabajo.id} - ${cat}\n`;
    msg += `📝 ${trabajo.descripcion}\n`;
    msg += `\n💰 *Desglose:*\n`;
    msg += `  Precio unitario: ₡${precioUnit.toFixed(2)}\n`;
    msg += `  Cantidad: ${cant}\n`;
    msg += `  Subtotal: ₡${sub.toFixed(2)}\n`;
    if (imp > 0) msg += `  Impuestos: ₡${imp.toFixed(2)}\n`;
    if (var_ > 0) msg += `  Varios: ₡${var_.toFixed(2)}\n`;
    msg += `  *TOTAL: ₡${tot.toFixed(2)}*\n`;
    msg += `  Abono: ₡${abono.toFixed(2)}\n`;
    msg += `  *Saldo pendiente: ₡${saldo.toFixed(2)}*\n`;
    msg += `\n📅 Fecha entrega: ${fecha}\n`;
    msg += `📊 Estado: ${ESTADO_LABELS[trabajo.estado] || trabajo.estado}\n`;
    msg += `💳 Pagado: ${(trabajo as any).pagado ? "Sí" : "No"}\n`;
    if (mensajeFacturacion.trim()) {
      msg += `\n📌 *Nota:* ${mensajeFacturacion.trim()}\n`;
    }
    msg += `\n_Generado: ${new Date().toLocaleDateString("es-CR")} ${new Date().toLocaleTimeString("es-CR")}_`;
    return msg;
  };

  const handleAbrirFacturacion = () => {
    if (!trabajo || !cliente) {
      showAlert("Error", "No se pudo cargar los datos del trabajo");
      return;
    }
    setShowFacturacionModal(true);
  };

  const handleEnviarFacturacion = () => {
    const telLimpio = contadorWhatsApp.replace(/[^0-9]/g, "");
    if (!telLimpio || telLimpio.length < 8) {
      showAlert("Error", "Ingresa un número de WhatsApp válido para el contador");
      return;
    }
    const mensaje = generarMensajeFacturacion();
    const url = `https://wa.me/${telLimpio}?text=${encodeURIComponent(mensaje)}`;
    Linking.openURL(url);
    setShowFacturacionModal(false);
    
    // Marcar para mostrar pop-up cuando regrese
    setShouldShowPopupOnReturn(true);
  };

  const handleCambiarEstado = (nuevoEstado: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const doUpdate = () => {
      updateEstadoMutation.mutate({
        id: trabajoId,
        estadoAnterior: trabajo?.estado,
        estadoNuevo: nuevoEstado,
      });
    };
    confirmAction(
      "Cambiar estado",
      `¿Estás seguro de cambiar a ${ESTADO_LABELS[nuevoEstado] || nuevoEstado}?`,
      () => {
        doUpdate();
        
        // Mostrar pop-up cuando se cambia a "listo" o "entregado"
        if (nuevoEstado === "listo" || nuevoEstado === "entregado") {
          setTimeout(() => {
            setShouldShowPopupOnReturn(true);
            setShowConversionPopup(true);
          }, 800);
        }
        
        if (nuevoEstado === "listo" && cliente) {
          setTimeout(() => {
            confirmAction(
              "Enviar WhatsApp",
              `¿Deseas enviar el mensaje de cobro por WhatsApp a ${cliente.nombreCompleto}?`,
              () => enviarWhatsApp("listo")
            );
          }, 500);
        }
      }
    );
  };

  const handleDividir = () => {
    const cant = parseInt(cantidadDividir);
    if (!cant || cant < 1) {
      showAlert("Error", "Ingresa una cantidad válida");
      return;
    }
    const cantidadActual = (trabajo as any)?.cantidad ?? 1;
    if (cant >= cantidadActual) {
      showAlert("Error", `La cantidad a separar debe ser menor a ${cantidadActual}`);
      return;
    }
    confirmAction("Dividir trabajo", `¿Separar ${cant} unidades del trabajo actual?`, () =>
      dividirMutation.mutate({ id: trabajoId, cantidadSeparar: cant })
    );
  };

  const handleEliminar = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    confirmDestructive(
      "Eliminar trabajo",
      "¿Estás seguro de que deseas borrar este registro? Esta acción no se puede deshacer.",
      () => deleteMutation.mutate({ id: trabajoId })
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
      const telefono = (user as any)?.sinpeTelefono || "";
      mensaje = `Hola ${nombre} su trabajo de: ${cat} está listo, puede pasar o pedir envío por mensajero (costo adicional), si paga a mi numero telefónico es ${telefono}, muchas gracias.`;
    } else if (tipo === "entregado") {
      mensaje = `Hola ${nombre}, su trabajo de ${cat} ha sido entregado. ¿Todo estuvo bien?`;
    }

    const url = `https://wa.me/${telLimpio}?text=${encodeURIComponent(mensaje)}`;
    Linking.openURL(url);
    
    // Marcar para mostrar pop-up cuando regrese
    setShouldShowPopupOnReturn(true);
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
    
    // Marcar para mostrar pop-up cuando regrese
    setShouldShowPopupOnReturn(true);
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

  const precioUnitario = parseFloat(trabajo.precioUnitario || "0");
  const impuestosVal = parseFloat(trabajo.impuestos || "0");
  const variosVal = parseFloat(trabajo.varios || "0");
  const cantidadTrabajo = (trabajo as any)?.cantidad ?? 1;
  const subtotal = precioUnitario * cantidadTrabajo;
  const granTotal = subtotal + impuestosVal + variosVal;
  const abonoInicial = parseFloat(trabajo.abonoInicial || "0");
  const saldoPendiente = granTotal - abonoInicial;

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

          {/* Galería de imágenes */}
          {trabajo && (
            <ImageGalleryWidget
              images={(trabajo as any)?.imagenes || []}
              onDelete={(id) => deleteImageMutation.mutate({ id })}
              onAdd={(files) =>
                addImagesMutation.mutateAsync({
                  trabajoId: trabajoId,
                  attachments: files,
                })
              }
              isLoading={deleteImageMutation.isPending || addImagesMutation.isPending}
              canEdit={true}
            />
          )}

          {/* Audios */}
          <AudioRecorderWidget trabajoId={trabajoId} />

          {/* Pagado */}
          <View className="bg-surface rounded-2xl p-4 border border-border">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-base font-semibold text-foreground">¿Pagado?</Text>
                <Text className="text-xs text-muted">{(trabajo as any)?.pagado ? "Sí" : "No"}</Text>
              </View>
              <Switch
                value={!!((trabajo as any)?.pagado)}
                onValueChange={(val) => togglePagadoMutation.mutate({ id: trabajoId, pagado: val ? 1 : 0 })}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={"#FFFFFF"}
                disabled={togglePagadoMutation.isPending}
              />
            </View>
          </View>

          {/* Precios */}
          <View className="gap-2">
            <Text className="text-lg font-semibold text-foreground">Precios</Text>
            <View className="bg-surface rounded-2xl p-4 border border-border gap-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Subtotal (unitario × cantidad)</Text>
                <Text className="text-sm font-medium text-foreground">{formatCurrency(subtotal)}</Text>
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

          {/* Generar Cotización */}
          <TouchableOpacity
            className="rounded-xl py-4 items-center flex-row justify-center gap-2 mt-2"
            style={{ backgroundColor: colors.primary }}
            onPress={handleGenerarCotizacion}
            activeOpacity={0.8}
          >
            <IconSymbol name="doc.text.fill" size={18} color="#FFFFFF" />
            <Text className="text-base font-semibold text-white">Generar Cotización</Text>
          </TouchableOpacity>

          {/* Enviar Facturación al Contador */}
          <TouchableOpacity
            className="rounded-xl py-4 items-center flex-row justify-center gap-2 mt-2"
            style={{ backgroundColor: "#25D366" }}
            onPress={handleAbrirFacturacion}
            activeOpacity={0.8}
          >
            <IconSymbol name="dollarsign.circle.fill" size={18} color="#FFFFFF" />
            <Text className="text-base font-semibold text-white">Enviar Facturación al Contador</Text>
          </TouchableOpacity>

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

      {/* Modal de Condiciones de Pago */}
      <PaymentConditionsModal
        visible={showPaymentConditions}
        conditions={paymentConditions}
        onChangeConditions={setPaymentConditions}
        onClose={() => setShowPaymentConditions(false)}
        onConfirm={handleConfirmPaymentConditions}
      />

      {/* Modal de Cotización Generada */}
      <Modal
        visible={showCotizacionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCotizacionModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="rounded-t-3xl p-6 gap-4" style={{ backgroundColor: colors.background, maxHeight: "80%" }}>
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-foreground">Cotización Generada</Text>
              <TouchableOpacity onPress={() => setShowCotizacionModal(false)}>
                <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 300 }}>
              <View className="bg-surface rounded-xl p-4 border border-border">
                <Text className="text-sm text-foreground" style={{ fontFamily: Platform.OS === "web" ? "monospace" : undefined }}>
                  {cotizacionGenerada}
                </Text>
              </View>
            </ScrollView>
            <View className="gap-3">
              <TouchableOpacity
                className="rounded-xl py-3 items-center flex-row justify-center gap-2"
                style={{ backgroundColor: colors.primary }}
                onPress={handleCopiarCotizacion}
                activeOpacity={0.8}
              >
                <IconSymbol name="doc.fill" size={18} color="#FFFFFF" />
                <Text className="text-base font-semibold text-white">Copiar al Portapapeles</Text>
              </TouchableOpacity>
              {cliente && (
                <TouchableOpacity
                  className="rounded-xl py-3 items-center flex-row justify-center gap-2"
                  style={{ backgroundColor: "#25D366" }}
                  onPress={handleCompartirCotizacionWhatsApp}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="paperplane.fill" size={18} color="#FFFFFF" />
                  <Text className="text-base font-semibold text-white">Enviar por WhatsApp</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                className="rounded-xl py-3 items-center"
                style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
                onPress={() => setShowCotizacionModal(false)}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-foreground">Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Facturación al Contador */}
      <Modal
        visible={showFacturacionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFacturacionModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View className="rounded-t-3xl p-6 gap-4" style={{ backgroundColor: colors.background }}>
            <View className="gap-2 mb-2">
              <Text className="text-xl font-bold text-foreground">Enviar Facturación al Contador</Text>
              <Text className="text-sm text-muted">Envía los datos del trabajo por WhatsApp a tu contador para facturación</Text>
            </View>

            {/* Número del contador */}
            <View className="gap-1">
              <Text className="text-sm font-semibold text-foreground">WhatsApp del Contador</Text>
              <TextInput
                className="border rounded-lg px-4 py-3 text-foreground"
                style={{ borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground }}
                placeholder="Ej: 50670460451"
                placeholderTextColor={colors.muted}
                value={contadorWhatsApp}
                onChangeText={setContadorWhatsApp}
                keyboardType="phone-pad"
              />
            </View>

            {/* Mensaje personalizado */}
            <View className="gap-1">
              <Text className="text-sm font-semibold text-foreground">Mensaje adicional (opcional)</Text>
              <TextInput
                className="border rounded-lg px-4 py-3 text-foreground"
                style={{ borderColor: colors.border, backgroundColor: colors.surface, color: colors.foreground, minHeight: 80 }}
                placeholder="Ej: Favor facturar a nombre de..."
                placeholderTextColor={colors.muted}
                value={mensajeFacturacion}
                onChangeText={setMensajeFacturacion}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Preview del mensaje */}
            <View className="bg-surface rounded-xl p-3 border border-border">
              <Text className="text-xs text-muted mb-1">Vista previa del mensaje:</Text>
              <Text className="text-xs text-foreground" numberOfLines={6}>
                {generarMensajeFacturacion()}
              </Text>
            </View>

            {/* Botones */}
            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                className="flex-1 rounded-lg py-3 items-center"
                style={{ backgroundColor: colors.surface }}
                onPress={() => setShowFacturacionModal(false)}
              >
                <Text className="text-base font-semibold text-foreground">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 rounded-lg py-3 items-center"
                style={{ backgroundColor: "#25D366" }}
                onPress={handleEnviarFacturacion}
              >
                <Text className="text-base font-semibold text-white">Enviar por WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Pop-up de conversión */}
      <ConversionPopup
        visible={showConversionPopup}
        onClose={() => setShowConversionPopup(false)}
        userName={user?.name || "Costurera"}
        onActivate={() => {
          setShowConversionPopup(false);
          const checkoutUrl = process.env.EXPO_PUBLIC_HOTMART_CHECKOUT_URL || "https://pay.hotmart.com/T104497671V";
          if (Platform.OS === "web") {
            window.open(checkoutUrl, "_blank");
          } else {
            Linking.openURL(checkoutUrl);
          }
        }}
      />
    </ScreenContainer>
  );
}
