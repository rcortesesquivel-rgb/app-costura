import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

import * as Haptics from "expo-haptics";

export default function WhitelistScreen() {
  const colors = useColors();
  const [emails, setEmails] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"prueba" | "pagado" | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Formulario
  const [form, setForm] = useState({
    email: "",
    nombre: "",
    plan: "basic" as "basic" | "vip" | "lifetime",
    status: "prueba" as "prueba" | "pagado",
    diasExpiracion: 2,
    expiresAt: "",
  });

  // Cargar lista
  const { data: whitelistData, refetch } = trpc.superAdmin.whitelist.list.useQuery();

  useEffect(() => {
    if (whitelistData) {
      setEmails(whitelistData);
    }
  }, [whitelistData]);

  // Crear
  const createMutation = trpc.superAdmin.whitelist.create.useMutation({
    onSuccess: () => {
      Alert.alert("Éxito", "Usuario agregado correctamente");
      resetForm();
      refetch();
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  // Actualizar
  const updateMutation = trpc.superAdmin.whitelist.update.useMutation({
    onSuccess: () => {
      Alert.alert("Éxito", "Usuario actualizado correctamente");
      resetForm();
      refetch();
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  // Eliminar
  const deleteMutation = trpc.superAdmin.whitelist.delete.useMutation({
    onSuccess: () => {
      Alert.alert("Éxito", "Usuario eliminado correctamente");
      refetch();
    },
    onError: (err: any) => Alert.alert("Error", err.message),
  });

  const resetForm = () => {
    setForm({
      email: "",
      nombre: "",
      plan: "basic",
      status: "prueba",
      diasExpiracion: 2,
      expiresAt: "",
    });
    setEditingEmail(null);
    setShowModal(false);
  };

  const handleSave = async () => {
    if (!form.email || !form.nombre) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    // Usar fecha específica si se proporciona, sino usar diasExpiracion
    const diasAUsar = form.expiresAt ? undefined : form.diasExpiracion;

    setLoading(true);
    try {
      if (editingEmail) {
        await updateMutation.mutateAsync({
          email: editingEmail,
          nombre: form.nombre,
          plan: form.plan,
          status: form.status,
          diasExpiracion: diasAUsar,
        });
      } else {
        await createMutation.mutateAsync({
          email: form.email,
          nombre: form.nombre,
          plan: form.plan,
          status: form.status,
          diasExpiracion: diasAUsar || form.diasExpiracion,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setForm({
      email: item.email,
      nombre: item.nombre,
      plan: item.plan,
      status: item.status,
      diasExpiracion: 2,
      expiresAt: item.expiresAt ? new Date(item.expiresAt).toISOString().split("T")[0] : "",
    });
    setEditingEmail(item.email);
    setShowModal(true);
  };

  const handleDelete = (email: string) => {
    Alert.alert("Confirmar", `¿Eliminar a ${email}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => deleteMutation.mutate({ email }),
      },
    ]);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView className="flex-1">
        <View className="p-4 gap-4">
          {/* Encabezado */}
          <View>
            <Text className="text-2xl font-bold text-foreground">Gestión de Whitelist</Text>
            <Text className="text-sm text-muted mt-1">Administra usuarios autorizados</Text>
          </View>

          {/* Botón Agregar */}
          <TouchableOpacity
            onPress={() => {
              resetForm();
              setShowModal(true);
            }}
            style={{ backgroundColor: colors.primary }}
            className="p-3 rounded-lg"
          >
            <Text className="text-white font-semibold text-center">+ Agregar Usuario</Text>
          </TouchableOpacity>

          {/* Filtros */}
          <View className="gap-2">
            <TextInput
              placeholder="Buscar por email o nombre..."
              value={search}
              onChangeText={setSearch}
              className="border border-border p-2 rounded-lg text-foreground"
              placeholderTextColor={colors.muted}
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setStatusFilter(undefined)}
                style={{ backgroundColor: !statusFilter ? colors.primary : colors.surface }}
                className="flex-1 p-2 rounded-lg"
              >
                <Text className="text-center text-sm font-semibold" style={{ color: !statusFilter ? "white" : colors.foreground }}>
                  Todos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatusFilter("prueba")}
                style={{ backgroundColor: statusFilter === "prueba" ? colors.primary : colors.surface }}
                className="flex-1 p-2 rounded-lg"
              >
                <Text className="text-center text-sm font-semibold" style={{ color: statusFilter === "prueba" ? "white" : colors.foreground }}>
                  Prueba
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStatusFilter("pagado")}
                style={{ backgroundColor: statusFilter === "pagado" ? colors.primary : colors.surface }}
                className="flex-1 p-2 rounded-lg"
              >
                <Text className="text-center text-sm font-semibold" style={{ color: statusFilter === "pagado" ? "white" : colors.foreground }}>
                  Pagado
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de Usuarios */}
          <View className="gap-2">
            {emails.length === 0 ? (
              <Text className="text-center text-muted py-8">No hay usuarios en la whitelist</Text>
            ) : (
              emails.map((item) => (
                <View key={item.email} style={{ backgroundColor: colors.surface }} className="p-3 rounded-lg gap-2">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{item.nombre}</Text>
                      <Text className="text-xs text-muted">{item.email}</Text>
                      <View className="flex-row gap-2 mt-1">
                        <Text className="text-xs bg-primary text-white px-2 py-1 rounded">
                          {item.plan}
                        </Text>
                        <Text className="text-xs" style={{ color: item.status === "prueba" ? colors.warning : colors.success }}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                    <View className="gap-1">
                      <TouchableOpacity
                        onPress={() => handleEdit(item)}
                        style={{ backgroundColor: colors.primary }}
                        className="px-3 py-1 rounded"
                      >
                        <Text className="text-white text-xs font-semibold">Editar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(item.email)}
                        style={{ backgroundColor: colors.error }}
                        className="px-3 py-1 rounded"
                      >
                        <Text className="text-white text-xs font-semibold">Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  {item.expiresAt && (
                    <Text className="text-xs text-muted">
                      Expira: {new Date(item.expiresAt).toLocaleDateString("es-CR")}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Formulario */}
      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View style={{ backgroundColor: colors.background }} className="p-4 rounded-t-2xl gap-4">
            <Text className="text-xl font-bold text-foreground">
              {editingEmail ? "Editar Usuario" : "Agregar Usuario"}
            </Text>

            <TextInput
              placeholder="Email"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
              editable={!editingEmail}
              className="border border-border p-2 rounded-lg text-foreground"
              placeholderTextColor={colors.muted}
            />

            <TextInput
              placeholder="Nombre"
              value={form.nombre}
              onChangeText={(text) => setForm({ ...form, nombre: text })}
              className="border border-border p-2 rounded-lg text-foreground"
              placeholderTextColor={colors.muted}
            />

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Plan</Text>
              <View className="flex-row gap-2">
                {(["basic", "vip", "lifetime"] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setForm({ ...form, plan: p })}
                    style={{ backgroundColor: form.plan === p ? colors.primary : colors.surface }}
                    className="flex-1 p-2 rounded-lg"
                  >
                    <Text className="text-center text-xs font-semibold" style={{ color: form.plan === p ? "white" : colors.foreground }}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Status</Text>
              <View className="flex-row gap-2">
                {(["prueba", "pagado"] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setForm({ ...form, status: s })}
                    style={{ backgroundColor: form.status === s ? colors.primary : colors.surface }}
                    className="flex-1 p-2 rounded-lg"
                  >
                    <Text className="text-center text-xs font-semibold" style={{ color: form.status === s ? "white" : colors.foreground }}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Opción 1: Días de expiración</Text>
              <TextInput
                placeholder="2"
                value={String(form.diasExpiracion)}
                onChangeText={(text) => setForm({ ...form, diasExpiracion: parseInt(text) || 2 })}
                keyboardType="number-pad"
                className="border border-border p-2 rounded-lg text-foreground"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Opción 2: Fecha específica (YYYY-MM-DD)</Text>
              <TextInput
                placeholder="2026-03-24"
                value={form.expiresAt}
                onChangeText={(text) => setForm({ ...form, expiresAt: text })}
                className="border border-border p-2 rounded-lg text-foreground"
                placeholderTextColor={colors.muted}
              />
              <Text className="text-xs text-muted">Si ingresas una fecha, se usará esta en lugar de los días</Text>
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={resetForm}
                style={{ backgroundColor: colors.surface }}
                className="flex-1 p-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-foreground">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                style={{ backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }}
                className="flex-1 p-3 rounded-lg"
              >
                <Text className="text-center font-semibold text-white">
                  {loading ? "Guardando..." : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
