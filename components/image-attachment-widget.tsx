import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState, useCallback } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { showAlert } from "@/lib/confirm";

export interface AttachedFile {
  id: string;
  uri: string;
  name: string;
  type: "image" | "document";
  size: number;
}

interface ImageAttachmentWidgetProps {
  attachments: AttachedFile[];
  onAttach: (files: AttachedFile[]) => void;
  onRemove: (id: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function ImageAttachmentWidget({
  attachments,
  onAttach,
  onRemove,
  maxFiles = 5,
  maxSizeMB = 10,
}: ImageAttachmentWidgetProps) {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = useCallback(async () => {
    if (attachments.length >= maxFiles) {
      showAlert("Límite alcanzado", `Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    try {
      setIsLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newFiles: AttachedFile[] = [];

        for (const asset of result.assets) {
          // Validar tamaño (aproximado basado en URI)
          // En web, no podemos obtener el tamaño exacto, así que usamos una estimación
          const sizeEstimate = Math.ceil((asset.uri.length * 0.75) / (1024 * 1024)); // Estimación

          if (sizeEstimate > maxSizeMB) {
            showAlert("Archivo muy grande", `Máximo ${maxSizeMB}MB por archivo`);
            continue;
          }

          newFiles.push({
            id: `${Date.now()}-${Math.random()}`,
            uri: asset.uri,
            name: asset.fileName || `image-${Date.now()}`,
            type: "image",
            size: sizeEstimate,
          });
        }

        if (newFiles.length > 0) {
          const remaining = maxFiles - attachments.length;
          const toAdd = newFiles.slice(0, remaining);
          onAttach([...attachments, ...toAdd]);
        }
      }
    } catch (error) {
      showAlert("Error", "No se pudo seleccionar la imagen");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [attachments.length, maxFiles, onAttach]);

  const takePhoto = useCallback(async () => {
    if (attachments.length >= maxFiles) {
      showAlert("Límite alcanzado", `Máximo ${maxFiles} archivos permitidos`);
      return;
    }

    try {
      setIsLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        showAlert("Permiso denegado", "Se necesita acceso a la cámara");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        const sizeEstimate = Math.ceil((asset.uri.length * 0.75) / (1024 * 1024));

        if (sizeEstimate > maxSizeMB) {
          showAlert("Archivo muy grande", `Máximo ${maxSizeMB}MB por archivo`);
          return;
        }

        const newFile: AttachedFile = {
          id: `${Date.now()}-${Math.random()}`,
          uri: asset.uri,
          name: asset.fileName || `photo-${Date.now()}`,
          type: "image",
          size: sizeEstimate,
        };

        onAttach([...attachments, newFile]);
      }
    } catch (error) {
      showAlert("Error", "No se pudo capturar la foto");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [attachments.length, maxFiles, onAttach]);

  return (
    <View className="gap-3">
      {/* Botones de acción */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="flex-1 bg-surface rounded-xl border border-border p-3 flex-row items-center justify-center gap-2"
          onPress={pickImage}
          disabled={isLoading || attachments.length >= maxFiles}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <IconSymbol name="paperplane.fill" size={18} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground">Galería</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-surface rounded-xl border border-border p-3 flex-row items-center justify-center gap-2"
          onPress={takePhoto}
          disabled={isLoading || attachments.length >= maxFiles}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <IconSymbol name="paperplane.fill" size={18} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground">Cámara</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Contador de archivos */}
      <Text className="text-xs text-muted">
        {attachments.length} de {maxFiles} archivos
      </Text>

      {/* Vista previa de archivos */}
      {attachments.length > 0 && (
        <View className="gap-2">
          <Text className="text-sm font-semibold text-foreground">Archivos adjuntos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
            {attachments.map((file) => (
              <View
                key={file.id}
                className="relative bg-surface rounded-xl overflow-hidden border border-border"
                style={{ width: 100, height: 100 }}
              >
                <Image
                  source={{ uri: file.uri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                {/* Botón eliminar */}
                <TouchableOpacity
                  className="absolute top-1 right-1 bg-error rounded-full p-1"
                  onPress={() => onRemove(file.id)}
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-xs font-bold">✕</Text>
                </TouchableOpacity>

                {/* Nombre del archivo */}
                <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <Text className="text-xs text-white truncate">{file.name}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
