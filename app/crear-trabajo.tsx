import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

// Declaración global para Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function CrearTrabajoScreen() {
  const colors = useColors();
  const router = useRouter();

  // Estado del formulario
  const [clienteId, setClienteId] = useState("");
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
  
  // Agregados
  const [agregados, setAgregados] = useState<Array<{ concepto: string; precio: string }>>([]);
  const [nuevoConcepto, setNuevoConcepto] = useState("");
  const [nuevoPrecio, setNuevoPrecio] = useState("");

  // Voz a texto
  const [grabando, setGrabando] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const { data: clientes, isLoading: loadingClientes } = trpc.clientes.list.useQuery();
  const { data: canRecord } = trpc.superAdmin.audio.canRecord.useQuery();

  const utils = trpc.useUtils();
  const createMutation = trpc.trabajos.create.useMutation({
    onSuccess: async (data) => {
      // Crear agregados
      for (const agregado of agregados) {
        await utils.client.agregados.create.mutate({
          trabajoId: data.id,
          concepto: agregado.concepto,
          precio: agregado.precio,
        });
      }
      
      await utils.trabajos.list.invalidate();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Éxito", "Trabajo creado correctamente", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    },
    onError: (error) => {
      Alert.alert("Error", "No se pudo crear el trabajo: " + error.message);
    },
  });

  // Inicializar Web Speech API
  useEffect(() => {
    if (Platform.OS === "web") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = "es-ES";

        recognitionInstance.onresult = async (event: any) => {
          const transcript = event.results[0][0].transcript;
          setDescripcion((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setGrabando(false);
          
          // Registrar transcripción en el servidor
          try {
            await utils.client.superAdmin.audio.recordTranscription.mutate();
          } catch (error) {
            console.error("Error registrando transcripción:", error);
          }
        };

        recognitionInstance.onerror = () => {
          setGrabando(false);
          Alert.alert("Error", "No se pudo grabar el audio. Asegúrate de dar permisos al micrófono.");
        };

        recognitionInstance.onend = () => {
          setGrabando(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const handleIniciarGrabacion = async () => {
    if (Platform.OS !== "web") {
      Alert.alert("Información", "La grabación de voz solo está disponible en la versión web.");
      return;
    }

    if (!recognition) {
      Alert.alert("Error", "Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    // Verificar límite de transcripciones
    if (canRecord === false) {
      Alert.alert(
        "Límite alcanzado",
        "Has alcanzado el límite de 20 transcripciones este mes. Actualiza tu plan a Mensual para transcripciones ilimitadas."
      );
      return;
    }

    if (grabando) {
      recognition.stop();
      setGrabando(false);
    } else {
      recognition.start();
      setGrabando(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleAgregarItem = () => {
    if (!nuevoConcepto.trim() || !nuevoPrecio.trim()) {
      Alert.alert("Error", "Completa el concepto y precio del agregado");
      return;
    }

    setAgregados([...agregados, { concepto: nuevoConcepto.trim(), precio: nuevoPrecio.trim() }]);
    setNuevoConcepto("");
    setNuevoPrecio("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEliminarItem = (index: number) => {
    setAgregados(agregados.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const calcularTotal = () => {
    const base = parseFloat(precioBase) || 0;
    const totalAgregados = agregados.reduce((sum, item) => sum + (parseFloat(item.precio) || 0), 0);
    return base + totalAgregados;
  };

  const calcularSaldo = () => {
    const total = calcularTotal();
    const abono = parseFloat(abonoInicial) || 0;
    return total - abono;
  };

  const handleGuardar = () => {
    if (!clienteId || !descripcion.trim() || !precioBase) {
      Alert.alert("Error", "Completa los campos obligatorios: cliente, descripción y precio base");
      return;
    }

    const data: any = {
      clienteId: parseInt(clienteId),
      tipo,
      descripcion: descripcion.trim(),
      precioBase: precioBase.trim(),
      abonoInicial: abonoInicial.trim(),
    };

    if (tipo === "arreglo") {
      data.tipoPrenda = tipoPrenda.trim() || undefined;
      data.nivelUrgencia = nivelUrgencia;
    } else if (tipo === "confeccion") {
      data.tipoTela = tipoTela.trim() || undefined;
      data.metrosRequeridos = metrosRequeridos.trim() || undefined;
    } else if (tipo === "personalizacion") {
      data.tipoPersonalizacion = tipoPersonalizacion.trim() || undefined;
    }

    createMutation.mutate(data);
  };

  if (loadingClientes) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <View className="p-6 gap-6">
            {/* Header */}
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <IconSymbol name="chevron.right" size={28} color={colors.foreground} style={{ transform: [{ rotate: "180deg" }] }} />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">Nuevo Trabajo</Text>
              </View>
            </View>

            {/* Selector de cliente */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Cliente *</Text>
              <View className="bg-surface rounded-xl border border-border">
                {clientes && clientes.map((cliente) => (
                  <TouchableOpacity
                    key={cliente.id}
                    className="p-3 border-b border-border"
                    onPress={() => setClienteId(cliente.id.toString())}
                    activeOpacity={0.7}
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: clienteId === cliente.id.toString() ? colors.primary : colors.muted + "30" }}
                      >
                        {clienteId === cliente.id.toString() && (
                          <IconSymbol name="checkmark.circle.fill" size={16} color="#FFFFFF" />
                        )}
                      </View>
                      <Text className="text-base text-foreground">{cliente.nombreCompleto}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tipo de trabajo */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Tipo de trabajo *</Text>
              <View className="flex-row gap-2">
                {[
                  { value: "arreglo", label: "Arreglo", icon: "scissors" },
                  { value: "confeccion", label: "Confección", icon: "tshirt.fill" },
                  { value: "personalizacion", label: "Personalización", icon: "paintbrush.fill" },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    className="flex-1 rounded-xl p-3 border items-center gap-2"
                    style={{
                      backgroundColor: tipo === item.value ? colors.primary + "20" : "transparent",
                      borderColor: tipo === item.value ? colors.primary : colors.border,
                    }}
                    onPress={() => setTipo(item.value as any)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name={item.icon as any} size={24} color={tipo === item.value ? colors.primary : colors.muted} />
                    <Text
                      className="text-xs font-medium text-center"
                      style={{ color: tipo === item.value ? colors.primary : colors.foreground }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Descripción con voz */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">Descripción *</Text>
                <TouchableOpacity
                  className="flex-row items-center gap-2 rounded-full px-3 py-1"
                  style={{ backgroundColor: grabando ? colors.error : colors.primary + "20" }}
                  onPress={handleIniciarGrabacion}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="mic.fill" size={16} color={grabando ? "#FFFFFF" : colors.primary} />
                  <Text className="text-xs font-medium" style={{ color: grabando ? "#FFFFFF" : colors.primary }}>
                    {grabando ? "Grabando..." : "Grabar"}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                placeholder="Describe el trabajo..."
                placeholderTextColor={colors.muted}
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Campos específicos por tipo */}
            {tipo === "arreglo" && (
              <>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Tipo de prenda</Text>
                  <TextInput
                    className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder="Ej: Pantalón, vestido, camisa..."
                    placeholderTextColor={colors.muted}
                    value={tipoPrenda}
                    onChangeText={setTipoPrenda}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Nivel de urgencia</Text>
                  <View className="flex-row gap-2">
                    {["baja", "media", "alta"].map((nivel) => (
                      <TouchableOpacity
                        key={nivel}
                        className="flex-1 rounded-xl p-3 border"
                        style={{
                          backgroundColor: nivelUrgencia === nivel ? colors.primary + "20" : "transparent",
                          borderColor: nivelUrgencia === nivel ? colors.primary : colors.border,
                        }}
                        onPress={() => setNivelUrgencia(nivel as any)}
                        activeOpacity={0.7}
                      >
                        <Text
                          className="text-sm font-medium text-center capitalize"
                          style={{ color: nivelUrgencia === nivel ? colors.primary : colors.foreground }}
                        >
                          {nivel}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            {tipo === "confeccion" && (
              <>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Tipo de tela</Text>
                  <TextInput
                    className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder="Ej: Algodón, seda, lino..."
                    placeholderTextColor={colors.muted}
                    value={tipoTela}
                    onChangeText={setTipoTela}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Metros requeridos</Text>
                  <TextInput
                    className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder="Ej: 2.5"
                    placeholderTextColor={colors.muted}
                    value={metrosRequeridos}
                    onChangeText={setMetrosRequeridos}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}

            {tipo === "personalizacion" && (
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Tipo de personalización</Text>
                <TextInput
                  className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                  placeholder="Ej: Bordado, aplicación, estampado..."
                  placeholderTextColor={colors.muted}
                  value={tipoPersonalizacion}
                  onChangeText={setTipoPersonalizacion}
                />
              </View>
            )}

            {/* Precios */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Precio base *</Text>
              <TextInput
                className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                placeholder="0"
                placeholderTextColor={colors.muted}
                value={precioBase}
                onChangeText={setPrecioBase}
                keyboardType="numeric"
              />
            </View>

            {/* Agregados dinámicos */}
            <View className="gap-3">
              <Text className="text-sm font-semibold text-foreground">Agregados</Text>
              
              {agregados.map((item, index) => (
                <View key={index} className="bg-surface rounded-xl border border-border p-3 flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base text-foreground">{item.concepto}</Text>
                    <Text className="text-sm text-muted mt-1">${item.precio}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleEliminarItem(index)} activeOpacity={0.7}>
                    <IconSymbol name="trash.fill" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}

              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                  placeholder="Concepto"
                  placeholderTextColor={colors.muted}
                  value={nuevoConcepto}
                  onChangeText={setNuevoConcepto}
                />
                <TextInput
                  className="w-24 bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                  placeholder="Precio"
                  placeholderTextColor={colors.muted}
                  value={nuevoPrecio}
                  onChangeText={setNuevoPrecio}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  className="rounded-xl p-3 items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                  onPress={handleAgregarItem}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="plus.circle.fill" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Resumen de precios */}
            <View className="bg-surface rounded-2xl p-4 border border-border gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Precio base</Text>
                <Text className="text-sm font-medium text-foreground">${precioBase || "0"}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">Agregados</Text>
                <Text className="text-sm font-medium text-foreground">
                  ${agregados.reduce((sum, item) => sum + (parseFloat(item.precio) || 0), 0).toFixed(2)}
                </Text>
              </View>
              <View className="h-px bg-border my-1" />
              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-foreground">Total</Text>
                <Text className="text-base font-bold" style={{ color: colors.primary }}>
                  ${calcularTotal().toFixed(2)}
                </Text>
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Abono inicial</Text>
              <TextInput
                className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                placeholder="0"
                placeholderTextColor={colors.muted}
                value={abonoInicial}
                onChangeText={setAbonoInicial}
                keyboardType="numeric"
              />
              <Text className="text-xs text-muted">Saldo pendiente: ${calcularSaldo().toFixed(2)}</Text>
            </View>

            {/* Botones */}
            <View className="gap-3 mt-4">
              <TouchableOpacity
                className="rounded-xl py-4 items-center"
                style={{ backgroundColor: colors.primary }}
                onPress={handleGuardar}
                disabled={createMutation.isPending}
                activeOpacity={0.8}
              >
                <Text className="text-base font-semibold text-white">
                  {createMutation.isPending ? "Guardando..." : "Guardar trabajo"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="rounded-xl py-4 items-center border border-border"
                onPress={() => router.back()}
                disabled={createMutation.isPending}
                activeOpacity={0.7}
              >
                <Text className="text-base font-semibold text-foreground">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
