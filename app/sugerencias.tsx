import { Text, View, ScrollView, TouchableOpacity, TextInput, Platform, ActivityIndicator, KeyboardAvoidingView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import { showAlert } from "@/lib/confirm";

export default function BuzonSugerenciasScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();

  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);

  const enviarMutation = trpc.sugerencias.enviar.useMutation({
    onSuccess: () => {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setEnviado(true);
      setAsunto("");
      setMensaje("");
    },
    onError: (error) => {
      showAlert("Error", error.message || "No se pudo enviar la sugerencia. Intenta de nuevo.");
    },
  });

  const handleEnviar = () => {
    if (!asunto.trim()) {
      showAlert("Campo requerido", "Por favor ingresa un asunto para tu sugerencia.");
      return;
    }
    if (!mensaje.trim()) {
      showAlert("Campo requerido", "Por favor escribe tu sugerencia o comentario.");
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    enviarMutation.mutate({
      asunto: asunto.trim(),
      mensaje: mensaje.trim(),
    });
  };

  const handleNuevaSugerencia = () => {
    setEnviado(false);
    setAsunto("");
    setMensaje("");
  };

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          <View className="p-6 gap-5">
            {/* Header */}
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <IconSymbol name="chevron.right" size={28} color={colors.foreground} style={{ transform: [{ rotate: "180deg" }] }} />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">Buzón de Sugerencias</Text>
                <Text className="text-sm text-muted mt-1">Tu opinión nos ayuda a mejorar</Text>
              </View>
            </View>

            {enviado ? (
              /* Pantalla de éxito */
              <View className="items-center gap-5 mt-8">
                <View style={{ backgroundColor: `${colors.success}15`, borderRadius: 999, padding: 24 }}>
                  <IconSymbol name="checkmark.circle.fill" size={64} color={colors.success} />
                </View>
                <Text className="text-2xl font-bold text-foreground text-center">
                  ¡Gracias por tu sugerencia!
                </Text>
                <Text className="text-base text-muted text-center" style={{ maxWidth: 300 }}>
                  Tu mensaje ha sido enviado correctamente. Lo revisaremos pronto y tomaremos en cuenta tus ideas.
                </Text>
                <View className="gap-3 w-full mt-4">
                  <TouchableOpacity
                    className="rounded-xl py-4 items-center"
                    style={{ backgroundColor: colors.primary }}
                    onPress={handleNuevaSugerencia}
                    activeOpacity={0.8}
                  >
                    <Text className="text-base font-semibold text-white">Enviar otra sugerencia</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="rounded-xl py-4 items-center"
                    style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                  >
                    <Text className="text-base font-semibold text-foreground">Volver</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Formulario */
              <>
                {/* Info card */}
                <View className="bg-surface rounded-2xl p-4 border border-border">
                  <View className="flex-row items-start gap-3">
                    <View style={{ backgroundColor: `${colors.primary}15`, borderRadius: 999, padding: 8 }}>
                      <IconSymbol name="envelope.fill" size={20} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-foreground font-medium">
                        ¿Tienes una idea para mejorar la app?
                      </Text>
                      <Text className="text-xs text-muted mt-1">
                        Escríbenos tu sugerencia, reporte de error, o cualquier comentario. Tu mensaje será enviado directamente al equipo de desarrollo.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Usuario */}
                {user && (
                  <View className="bg-surface rounded-2xl p-4 border border-border">
                    <View className="flex-row items-center gap-3">
                      <View style={{ backgroundColor: colors.primary, borderRadius: 999, padding: 8 }}>
                        <IconSymbol name="person.fill" size={18} color="#FFFFFF" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-foreground">{user.name || "Usuario"}</Text>
                        <Text className="text-xs text-muted">{user.email || ""}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Tipo de sugerencia (asunto) */}
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Asunto <Text style={{ color: colors.error }}>*</Text></Text>
                  <View className="flex-row flex-wrap gap-2 mb-2">
                    {[
                      "Nueva función",
                      "Mejora de diseño",
                      "Reporte de error",
                      "Otro",
                    ].map((tipo) => (
                      <TouchableOpacity
                        key={tipo}
                        className="rounded-full px-4 py-2"
                        style={{
                          backgroundColor: asunto === tipo ? colors.primary : colors.surface,
                          borderColor: asunto === tipo ? colors.primary : colors.border,
                          borderWidth: 1,
                        }}
                        onPress={() => {
                          setAsunto(tipo);
                          if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text
                          className="text-sm font-medium"
                          style={{ color: asunto === tipo ? "#FFFFFF" : colors.foreground }}
                        >
                          {tipo}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    className="border rounded-xl px-4 py-3"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      color: colors.foreground,
                      fontSize: 15,
                    }}
                    placeholder="O escribe tu propio asunto..."
                    placeholderTextColor={colors.muted}
                    value={asunto}
                    onChangeText={setAsunto}
                    maxLength={500}
                    returnKeyType="next"
                  />
                </View>

                {/* Mensaje */}
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Tu sugerencia <Text style={{ color: colors.error }}>*</Text></Text>
                  <TextInput
                    className="border rounded-xl px-4 py-3"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      color: colors.foreground,
                      fontSize: 15,
                      minHeight: 150,
                      textAlignVertical: "top",
                    }}
                    placeholder="Describe tu idea, sugerencia o problema con el mayor detalle posible..."
                    placeholderTextColor={colors.muted}
                    value={mensaje}
                    onChangeText={setMensaje}
                    multiline
                    numberOfLines={6}
                    maxLength={5000}
                  />
                  <Text className="text-xs text-muted text-right">{mensaje.length}/5000</Text>
                </View>

                {/* Botón enviar */}
                <TouchableOpacity
                  className="rounded-xl py-4 items-center flex-row justify-center gap-2"
                  style={{
                    backgroundColor: colors.primary,
                    opacity: enviarMutation.isPending ? 0.6 : 1,
                  }}
                  onPress={handleEnviar}
                  disabled={enviarMutation.isPending}
                  activeOpacity={0.8}
                >
                  {enviarMutation.isPending ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text className="text-base font-semibold text-white">Enviando...</Text>
                    </>
                  ) : (
                    <>
                      <IconSymbol name="paperplane.fill" size={18} color="#FFFFFF" />
                      <Text className="text-base font-semibold text-white">Enviar Sugerencia</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
