import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface PaymentConditionsModalProps {
  visible: boolean;
  conditions: string;
  onChangeConditions: (text: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function PaymentConditionsModal({
  visible,
  conditions,
  onChangeConditions,
  onClose,
  onConfirm,
}: PaymentConditionsModalProps) {
  const colors = useColors();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <View
          className="rounded-t-3xl p-6 gap-4"
          style={{ backgroundColor: colors.background }}
        >
          {/* Header */}
          <View className="gap-2 mb-2">
            <Text className="text-2xl font-bold text-foreground">
              Condiciones de Pago
            </Text>
            <Text className="text-sm text-muted">
              Escribe los términos y condiciones de pago para esta cotización
            </Text>
          </View>

          {/* Text Input */}
          <TextInput
            className="border rounded-lg p-4 text-foreground min-h-32"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
              color: colors.foreground,
            }}
            placeholder="Ej: 50% al confirmar, 50% a la entrega. Plazo de entrega: 7 días..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={6}
            value={conditions}
            onChangeText={onChangeConditions}
            textAlignVertical="top"
          />

          {/* Botones */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              className="flex-1 rounded-lg py-3 items-center"
              style={{ backgroundColor: colors.surface }}
              onPress={onClose}
            >
              <Text className="text-base font-semibold text-foreground">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 rounded-lg py-3 items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={onConfirm}
            >
              <Text className="text-base font-semibold text-white">
                Confirmar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
