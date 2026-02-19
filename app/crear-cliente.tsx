import { ScrollView, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { confirmAction, confirmDestructive, showAlert } from "@/lib/confirm";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

const COUNTRY_CODES = [
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+1", flag: "🇺🇸", name: "Estados Unidos" },
  { code: "+52", flag: "🇲🇽", name: "México" },
  { code: "+57", flag: "🇨🇴", name: "Colombia" },
  { code: "+34", flag: "🇪🇸", name: "España" },
  { code: "+507", flag: "🇵🇦", name: "Panamá" },
  { code: "+503", flag: "🇸🇻", name: "El Salvador" },
  { code: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "+504", flag: "🇭🇳", name: "Honduras" },
  { code: "+505", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+51", flag: "🇵🇪", name: "Perú" },
  { code: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+58", flag: "🇻🇪", name: "Venezuela" },
  { code: "+55", flag: "🇧🇷", name: "Brasil" },
  { code: "+1809", flag: "🇩🇴", name: "Rep. Dominicana" },
];

export default function CrearClienteScreen() {
  const colors = useColors();
  const router = useRouter();
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [codigoPais, setCodigoPais] = useState("+506");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [direccion, setDireccion] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const utils = trpc.useUtils();
  const createMutation = trpc.clientes.create.useMutation({
    onSuccess: async () => {
      await utils.clientes.list.invalidate();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      if (Platform.OS === "web") {
        window.alert("Cliente creado correctamente");
        router.back();
      } else {
        showAlert("Éxito", "Cliente creado correctamente", () => router.back());
      }
    },
    onError: (error) => {
      if (Platform.OS === "web") {
        window.alert("No se pudo crear el cliente: " + error.message);
      } else {
        showAlert("Error", "No se pudo crear el cliente: " + error.message);
      }
    },
  });

  const handleCopiarTelefono = () => {
    setWhatsapp(telefono);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleGuardar = () => {
    if (!nombreCompleto.trim()) {
      if (Platform.OS === "web") {
        window.alert("El nombre completo es obligatorio");
      } else {
        showAlert("Error", "El nombre completo es obligatorio");
      }
      return;
    }

    const redesSociales = JSON.stringify({
      instagram: instagram.trim(),
      facebook: facebook.trim(),
    });

    createMutation.mutate({
      nombreCompleto: nombreCompleto.trim(),
      telefono: telefono.trim() || undefined,
      codigoPais: codigoPais,
      whatsapp: whatsapp.trim() || undefined,
      direccion: direccion.trim() || undefined,
      redesSociales: redesSociales,
    });
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === codigoPais) || COUNTRY_CODES[0];

  return (
    <ScreenContainer className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
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
                <Text className="text-2xl font-bold text-foreground">Nuevo Cliente</Text>
              </View>
            </View>

            {/* Formulario */}
            <View className="gap-4">
              {/* Nombre completo */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Nombre completo *</Text>
                <TextInput
                  className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                  placeholder="Ej: María García López"
                  placeholderTextColor={colors.muted}
                  value={nombreCompleto}
                  onChangeText={setNombreCompleto}
                  returnKeyType="next"
                />
              </View>

              {/* Teléfono con selector de país */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Teléfono</Text>
                <View className="flex-row gap-2">
                  {/* Selector de bandera */}
                  <TouchableOpacity
                    onPress={() => setShowCountryPicker(!showCountryPicker)}
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                      minWidth: 90,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 20 }}>{selectedCountry.flag}</Text>
                    <Text className="text-sm text-foreground">{codigoPais}</Text>
                    <Text style={{ fontSize: 10, color: colors.muted }}>▼</Text>
                  </TouchableOpacity>
                  {/* Input teléfono */}
                  <TextInput
                    className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground flex-1"
                    placeholder="Número de teléfono"
                    placeholderTextColor={colors.muted}
                    value={telefono}
                    onChangeText={setTelefono}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                </View>
                {/* Picker de países */}
                {showCountryPicker && (
                  <View className="bg-surface rounded-xl border border-border" style={{ maxHeight: 200, overflow: "hidden" }}>
                    <ScrollView nestedScrollEnabled>
                      {COUNTRY_CODES.map((country) => (
                        <TouchableOpacity
                          key={country.code}
                          onPress={() => {
                            setCodigoPais(country.code);
                            setShowCountryPicker(false);
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 10,
                            padding: 12,
                            borderBottomWidth: 0.5,
                            borderBottomColor: colors.border,
                            backgroundColor: country.code === codigoPais ? `${colors.primary}15` : "transparent",
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={{ fontSize: 18 }}>{country.flag}</Text>
                          <Text className="text-sm text-foreground flex-1">{country.name}</Text>
                          <Text className="text-sm text-muted">{country.code}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* WhatsApp con botón copiar */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">WhatsApp (opcional)</Text>
                <View className="flex-row gap-2">
                  <TextInput
                    className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground flex-1"
                    placeholder="Número de WhatsApp"
                    placeholderTextColor={colors.muted}
                    value={whatsapp}
                    onChangeText={setWhatsapp}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={handleCopiarTelefono}
                    style={{
                      backgroundColor: telefono ? `${colors.primary}15` : `${colors.muted}15`,
                      borderWidth: 1,
                      borderColor: telefono ? `${colors.primary}40` : colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 14,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    activeOpacity={0.7}
                    disabled={!telefono}
                  >
                    <Text style={{ fontSize: 12, color: telefono ? colors.primary : colors.muted, fontWeight: "600" }}>
                      Copiar Tel.
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-muted">Si el WhatsApp es igual al teléfono, usa el botón "Copiar Tel."</Text>
              </View>

              {/* Dirección */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Dirección</Text>
                <TextInput
                  className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                  placeholder="Ej: San José, Costa Rica"
                  placeholderTextColor={colors.muted}
                  value={direccion}
                  onChangeText={setDireccion}
                  returnKeyType="next"
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Redes sociales */}
              <View className="gap-3">
                <Text className="text-sm font-semibold text-foreground">Redes sociales</Text>
                
                <View className="gap-2">
                  <Text className="text-xs text-muted">Instagram</Text>
                  <TextInput
                    className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder="@usuario"
                    placeholderTextColor={colors.muted}
                    value={instagram}
                    onChangeText={setInstagram}
                    returnKeyType="next"
                    autoCapitalize="none"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-xs text-muted">Facebook</Text>
                  <TextInput
                    className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
                    placeholder="Usuario de Facebook"
                    placeholderTextColor={colors.muted}
                    value={facebook}
                    onChangeText={setFacebook}
                    returnKeyType="done"
                    autoCapitalize="none"
                  />
                </View>
              </View>
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
                  {createMutation.isPending ? "Guardando..." : "Guardar cliente"}
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
