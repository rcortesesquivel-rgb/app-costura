import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Modal } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import {
  COUNTRY_PHONE_CONFIGS,
  formatPhoneNumber,
  getCountriesList,
} from "@/lib/phone-validation";

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  countryCode: string;
  onCountryChange: (code: string) => void;
  disabled?: boolean;
  error?: string;
}

export function PhoneInput({
  value,
  onChangeText,
  countryCode,
  onCountryChange,
  disabled = false,
  error,
}: PhoneInputProps) {
  const colors = useColors();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const countries = getCountriesList();
  const currentCountry = COUNTRY_PHONE_CONFIGS[countryCode];

  const handlePhoneChange = (text: string) => {
    // Solo permitir números, guiones, espacios y signos +
    const cleaned = text.replace(/[^\d\s\-+]/g, "");
    onChangeText(cleaned);
  };

  const handleCountrySelect = (code: string) => {
    onCountryChange(code);
    setShowCountryPicker(false);
  };

  const displayValue = value ? formatPhoneNumber(value, countryCode) : value;

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-foreground">Teléfono (Opcional)</Text>

      <View className="flex-row gap-2">
        {/* Country Selector */}
        <Pressable
          onPress={() => !disabled && setShowCountryPicker(true)}
          disabled={disabled}
          className={cn(
            "flex-row items-center justify-center gap-2 rounded-lg border px-3 py-3",
            error ? "border-error bg-red-50" : "border-border bg-surface",
            disabled && "opacity-50"
          )}
        >
          <Text className="text-lg">{currentCountry?.flag}</Text>
          <Text className="text-sm font-medium text-foreground">{countryCode}</Text>
        </Pressable>

        {/* Phone Input */}
        <TextInput
          value={displayValue}
          onChangeText={handlePhoneChange}
          placeholder="8765-4321"
          placeholderTextColor={colors.muted}
          editable={!disabled}
          className={cn(
            "flex-1 rounded-lg border px-4 py-3 text-base font-medium text-foreground",
            error ? "border-error bg-red-50" : "border-border bg-surface"
          )}
          style={{
            color: colors.foreground,
            borderColor: error ? "#EF4444" : colors.border,
            backgroundColor: error ? "#FEE2E2" : colors.surface,
          }}
        />
      </View>

      {/* Error Message */}
      {error && <Text className="text-xs font-medium text-error">{error}</Text>}

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View className="flex-1 bg-black/50">
          <View
            className="mt-auto rounded-t-2xl bg-background p-4"
            style={{ backgroundColor: colors.background }}
          >
            <View className="mb-4 items-center">
              <View className="h-1 w-12 rounded-full bg-border" />
            </View>

            <Text className="mb-4 text-lg font-bold text-foreground">Selecciona tu país</Text>

            <ScrollView className="max-h-96">
              {countries.map((country) => (
                <Pressable
                  key={country.code}
                  onPress={() => handleCountrySelect(country.code)}
                  className="flex-row items-center gap-3 border-b border-border px-4 py-3"
                >
                  <Text className="text-2xl">{country.flag}</Text>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{country.name}</Text>
                    <Text className="text-xs text-muted">{country.dialCode}</Text>
                  </View>
                  {countryCode === country.code && (
                    <View className="h-5 w-5 rounded-full bg-primary" />
                  )}
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              onPress={() => setShowCountryPicker(false)}
              className="mt-4 rounded-lg bg-primary py-3"
            >
              <Text className="text-center font-semibold text-background">Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
