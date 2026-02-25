import { ScrollView, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Platform } from "react-native";
import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Contacts from "expo-contacts";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";
import { showAlert } from "@/lib/confirm";

interface ContactoImportar {
  id: string;
  nombre: string;
  telefono: string;
  selected: boolean;
}

export default function ImportarContactosScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();

  const [contactos, setContactos] = useState<ContactoImportar[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const bulkCreateMutation = trpc.clientes.bulkCreate.useMutation({
    onSuccess: async (result) => {
      await utils.clientes.list.invalidate();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setImporting(false);
      const msg = `Se importaron ${result.created} contacto(s).${
        result.skipped > 0 ? `\n${result.skipped} duplicado(s) omitido(s).` : ""
      }`;
      showAlert("Importación completada", msg, () => router.back());
    },
    onError: (error) => {
      setImporting(false);
      showAlert("Error", "No se pudieron importar los contactos: " + error.message);
    },
  });

  const cargarContactos = useCallback(async () => {
    if (Platform.OS === "web") {
      showAlert(
        "No disponible en web",
        "La importación de contactos solo funciona en dispositivos móviles (iOS/Android). Abre la app desde tu celular para usar esta función."
      );
      return;
    }

    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        showAlert("Permiso denegado", "Necesitas permitir el acceso a tus contactos para importarlos.");
        setLoading(false);
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        sort: Contacts.SortTypes.FirstName,
      });

      if (!data || data.length === 0) {
        showAlert("Sin contactos", "No se encontraron contactos en tu dispositivo.");
        setLoading(false);
        return;
      }

      const contactosFormateados: ContactoImportar[] = data
        .filter((c) => c.name && c.name.trim().length > 0)
        .map((c) => {
          const telefono =
            c.phoneNumbers && c.phoneNumbers.length > 0
              ? c.phoneNumbers[0].number || ""
              : "";
          return {
            id: c.id || Math.random().toString(),
            nombre: c.name || "",
            telefono: telefono.replace(/[^\d+\-\s()]/g, ""),
            selected: false,
          };
        })
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      setContactos(contactosFormateados);
      setLoaded(true);
    } catch (error) {
      showAlert("Error", "No se pudieron cargar los contactos: " + String(error));
    }
    setLoading(false);
  }, []);

  const toggleContacto = (id: string) => {
    setContactos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  const toggleSelectAll = () => {
    const newState = !selectAll;
    setSelectAll(newState);
    setContactos((prev) =>
      prev.map((c) => {
        // Solo afectar los filtrados
        if (searchQuery) {
          const matchesSearch =
            c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.telefono.includes(searchQuery);
          return matchesSearch ? { ...c, selected: newState } : c;
        }
        return { ...c, selected: newState };
      })
    );
  };

  const handleImportar = () => {
    const seleccionados = contactos.filter((c) => c.selected);
    if (seleccionados.length === 0) {
      showAlert("Sin selección", "Selecciona al menos un contacto para importar.");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setImporting(true);
    bulkCreateMutation.mutate({
      contactos: seleccionados.map((c) => ({
        nombreCompleto: c.nombre,
        telefono: c.telefono || undefined,
        whatsapp: c.telefono || undefined,
      })),
    });
  };

  const contactosFiltrados = contactos.filter((c) => {
    if (!searchQuery) return true;
    return (
      c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.telefono.includes(searchQuery)
    );
  });

  const seleccionadosCount = contactos.filter((c) => c.selected).length;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}>
        <View className="p-6 gap-5">
          {/* Header */}
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <IconSymbol
                name="chevron.right"
                size={28}
                color={colors.foreground}
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground">Importar Contactos</Text>
              <Text className="text-sm text-muted mt-1">
                Selecciona contactos de tu móvil para agregar como clientes
              </Text>
            </View>
          </View>

          {/* Botón cargar contactos */}
          {!loaded && (
            <TouchableOpacity
              className="rounded-2xl p-6 items-center gap-3"
              style={{ backgroundColor: colors.primary }}
              onPress={cargarContactos}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <>
                  <IconSymbol name="person.crop.circle.badge.plus" size={48} color="#FFFFFF" />
                  <Text className="text-lg font-semibold text-white">Cargar Contactos del Móvil</Text>
                  <Text className="text-sm text-white opacity-80 text-center">
                    Se pedirá permiso para acceder a tus contactos
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Mensaje web */}
          {Platform.OS === "web" && !loaded && (
            <View className="bg-surface rounded-2xl p-5 border border-border items-center gap-3">
              <IconSymbol name="info.circle.fill" size={32} color={colors.warning} />
              <Text className="text-base text-foreground text-center font-medium">
                Función disponible solo en móvil
              </Text>
              <Text className="text-sm text-muted text-center">
                Abre la app desde tu celular (iOS/Android) para importar contactos directamente desde tu agenda.
              </Text>
            </View>
          )}

          {/* Lista de contactos */}
          {loaded && (
            <>
              {/* Buscador */}
              <View className="bg-surface rounded-2xl border border-border flex-row items-center px-4 py-3">
                <IconSymbol name="magnifyingglass" size={20} color={colors.muted} />
                <TextInput
                  className="flex-1 ml-3 text-base text-foreground"
                  placeholder="Buscar contacto..."
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

              {/* Barra de acciones */}
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  className="flex-row items-center gap-2 py-2 px-3 rounded-xl"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
                  onPress={toggleSelectAll}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-5 h-5 rounded items-center justify-center"
                    style={{
                      backgroundColor: selectAll ? colors.primary : "transparent",
                      borderColor: selectAll ? colors.primary : colors.muted,
                      borderWidth: 2,
                    }}
                  >
                    {selectAll && <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "bold" }}>✓</Text>}
                  </View>
                  <Text className="text-sm font-medium text-foreground">
                    {selectAll ? "Deseleccionar todos" : "Seleccionar todos"}
                  </Text>
                </TouchableOpacity>

                <Text className="text-sm text-muted">
                  {seleccionadosCount} de {contactosFiltrados.length} seleccionados
                </Text>
              </View>

              {/* Lista */}
              <View className="gap-1">
                {contactosFiltrados.map((contacto) => (
                  <TouchableOpacity
                    key={contacto.id}
                    className="flex-row items-center gap-3 py-3 px-3 rounded-xl"
                    style={{
                      backgroundColor: contacto.selected ? colors.primary + "10" : "transparent",
                    }}
                    onPress={() => toggleContacto(contacto.id)}
                    activeOpacity={0.7}
                  >
                    {/* Checkbox */}
                    <View
                      className="w-6 h-6 rounded items-center justify-center"
                      style={{
                        backgroundColor: contacto.selected ? colors.primary : "transparent",
                        borderColor: contacto.selected ? colors.primary : colors.muted,
                        borderWidth: 2,
                      }}
                    >
                      {contacto.selected && (
                        <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "bold" }}>✓</Text>
                      )}
                    </View>

                    {/* Avatar */}
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: colors.primary + "20" }}
                    >
                      <Text className="text-sm font-bold" style={{ color: colors.primary }}>
                        {contacto.nombre.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    {/* Info */}
                    <View className="flex-1">
                      <Text className="text-base text-foreground" numberOfLines={1}>
                        {contacto.nombre}
                      </Text>
                      {contacto.telefono ? (
                        <Text className="text-sm text-muted">{contacto.telefono}</Text>
                      ) : (
                        <Text className="text-sm text-muted opacity-50">Sin teléfono</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {contactosFiltrados.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-base text-muted">No se encontraron contactos</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer fijo con botón importar */}
      {loaded && seleccionadosCount > 0 && (
        <View
          className="border-t border-border px-6 py-4 gap-2"
          style={{ backgroundColor: colors.background }}
        >
          <TouchableOpacity
            className="rounded-xl py-4 items-center flex-row justify-center gap-2"
            style={{ backgroundColor: colors.primary }}
            onPress={handleImportar}
            disabled={importing}
            activeOpacity={0.8}
          >
            {importing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <IconSymbol name="square.and.arrow.down" size={20} color="#FFFFFF" />
                <Text className="text-base font-semibold text-white">
                  Importar {seleccionadosCount} contacto{seleccionadosCount !== 1 ? "s" : ""}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <Text className="text-xs text-muted text-center">
            Los contactos duplicados se omitirán automáticamente
          </Text>
        </View>
      )}

      {/* Footer: Ir Atrás (cuando no hay selección) */}
      {(!loaded || seleccionadosCount === 0) && (
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
            <IconSymbol
              name="chevron.right"
              size={18}
              color={colors.foreground}
              style={{ transform: [{ rotate: "180deg" }] }}
            />
            <Text className="text-base font-semibold text-foreground">Ir Atrás</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}
