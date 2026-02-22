import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Modal } from "react-native";
import { useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { confirmDestructive, showAlert } from "@/lib/confirm";
import * as ImagePicker from "expo-image-picker";

export interface ImageItem {
  id: number;
  url: string;
  tipo?: string;
}

interface ImageGalleryWidgetProps {
  images: ImageItem[];
  onDelete: (id: number) => void | Promise<void>;
  onAdd?: (files: { uri: string; name: string; type: "image" | "document" }[]) => void | Promise<any>;
  isLoading?: boolean;
  canEdit?: boolean;
}

export function ImageGalleryWidget({
  images,
  onDelete,
  onAdd,
  isLoading = false,
  canEdit = true,
}: ImageGalleryWidgetProps) {
  const colors = useColors();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingImages, setIsAddingImages] = useState(false);

  const handleDeleteImage = async (id: number, index: number) => {
    confirmDestructive(
      "Eliminar imagen",
      "¿Estás seguro de que deseas eliminar esta imagen?",
      async () => {
        try {
          setIsDeleting(true);
          await onDelete(id);
          showAlert("Éxito", "Imagen eliminada correctamente");
          setSelectedImageIndex(null);
        } catch (error) {
          showAlert("Error", "No se pudo eliminar la imagen");
          console.error(error);
        } finally {
          setIsDeleting(false);
        }
      }
    );
  };

  const handleAddImages = async () => {
    if (!onAdd) return;

    try {
      setIsAddingImages(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newFiles = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image-${Date.now()}`,
          type: "image" as const,
        }));

        await onAdd(newFiles);
        showAlert("Éxito", "Imágenes agregadas correctamente");
      }
    } catch (error) {
      showAlert("Error", "No se pudo agregar las imágenes");
      console.error(error);
    } finally {
      setIsAddingImages(false);
    }
  };

  if (images.length === 0) {
    return (
      <View className="gap-3">
        <Text className="text-sm font-semibold text-foreground">Imágenes adjuntas</Text>
        <View className="bg-surface rounded-xl border border-border p-4 items-center justify-center py-6">
          <IconSymbol name="paperplane.fill" size={32} color={colors.muted} />
          <Text className="text-sm text-muted mt-2">Sin imágenes adjuntas</Text>
          {canEdit && onAdd && (
            <TouchableOpacity
              className="mt-3 bg-primary rounded-lg px-4 py-2"
              onPress={handleAddImages}
              disabled={isAddingImages}
              activeOpacity={0.7}
            >
              {isAddingImages ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-sm font-semibold text-white">Agregar imágenes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">
          Imágenes adjuntas ({images.length})
        </Text>
        {canEdit && onAdd && (
          <TouchableOpacity
            className="bg-primary rounded-lg px-3 py-1.5"
            onPress={handleAddImages}
            disabled={isAddingImages}
            activeOpacity={0.7}
          >
            {isAddingImages ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-xs font-semibold text-white">+ Agregar</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Galería de miniaturas */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="gap-2"
        contentContainerStyle={{ paddingHorizontal: 0 }}
      >
        {images.map((image, index) => (
          <TouchableOpacity
            key={image.id}
            className="relative bg-surface rounded-xl overflow-hidden border border-border"
            style={{ width: 100, height: 100 }}
            onPress={() => setSelectedImageIndex(index)}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: image.url }}
              className="w-full h-full"
              resizeMode="cover"
            />

            {/* Overlay al pasar hover/press */}
            <View className="absolute inset-0 bg-black/20 items-center justify-center opacity-0 hover:opacity-100">
              <IconSymbol name="paperplane.fill" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal de vista previa */}
      {selectedImageIndex !== null && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedImageIndex(null)}
        >
          <View className="flex-1 bg-black/90 items-center justify-center">
            {/* Botón cerrar */}
            <TouchableOpacity
              className="absolute top-6 right-6 z-10 bg-white/20 rounded-full p-2"
              onPress={() => setSelectedImageIndex(null)}
              activeOpacity={0.7}
            >
              <Text className="text-white text-xl font-bold">✕</Text>
            </TouchableOpacity>

            {/* Imagen ampliada */}
            <Image
              source={{ uri: images[selectedImageIndex].url }}
              className="w-full h-3/4"
              resizeMode="contain"
            />

            {/* Botones de acción */}
            {canEdit && (
              <View className="absolute bottom-6 left-0 right-0 flex-row items-center justify-center gap-4 px-6">
                <TouchableOpacity
                  className="bg-error rounded-lg px-6 py-3 flex-row items-center gap-2"
                  onPress={() => {
                    setSelectedImageIndex(null);
                    handleDeleteImage(images[selectedImageIndex].id, selectedImageIndex);
                  }}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <IconSymbol name="paperplane.fill" size={18} color="#FFFFFF" />
                      <Text className="text-sm font-semibold text-white">Eliminar</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-primary rounded-lg px-6 py-3"
                  onPress={() => setSelectedImageIndex(null)}
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-semibold text-white">Cerrar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      )}
    </View>
  );
}
