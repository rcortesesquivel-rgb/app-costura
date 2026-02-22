import { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";
import {
  COUNTRY_PHONE_CONFIGS,
  formatPhoneNumber,
  validatePhoneNumber,
  getCountriesList,
  getDefaultCountryCode,
} from "@/lib/phone-validation";

export interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  countryCode: string;
  onCountryChange: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

export function PhoneInput({
  value,
  onChangeText,
  countryCode,
  onCountryChange,
  placeholder,
  disabled = false,
  error,
}: PhoneInputProps) {
  const colors = useColors();
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const currentConfig = COUNTRY_PHONE_CONFIGS[countryCode];
  const countries = useMemo(() => getCountriesList(), []);
  
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    const query = searchQuery.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query) ||
        c.dialCode.includes(query)
    );
  }, [searchQuery, countries]);

  const handlePhoneChange = (text: string) => {
    if (!currentConfig) return;
    
    // Permitir solo números, espacios, guiones y símbolos de teléfono
    const cleaned = text.replace(/[^\d\s\-+()]/g, "");
    
    // Formatear automáticamente
    const formatted = formatPhoneNumber(cleaned, countryCode);
    onChangeText(formatted);
  };

  const isValid = value.length > 0 ? validatePhoneNumber(value, countryCode) : true;

  const inputStyle = {
    backgroundColor: colors.surface,
    border: `1px solid ${error ? colors.error : isValid ? colors.border : colors.error}`,
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 16,
    color: colors.foreground,
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
    boxSizing: "border-box" as const,
  };

  // Web version with native HTML inputs
  if (Platform.OS === "web") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
          Teléfono (opcional)
        </label>

        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          {/* Country Selector */}
          <div style={{ position: "relative", minWidth: 120 }}>
            <button
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              disabled={disabled}
              style={{
                ...inputStyle,
                backgroundColor: colors.surface,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 12px",
                minHeight: 48,
              }}
            >
              <span style={{ fontSize: 20, marginRight: 8 }}>
                {currentConfig?.flag || "🌍"}
              </span>
              <span style={{ fontSize: 12, color: colors.muted }}>
                {currentConfig?.code || "CR"}
              </span>
            </button>

            {/* Country Picker Dropdown */}
            {showCountryPicker && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  marginTop: 4,
                  zIndex: 1000,
                  maxHeight: 300,
                  overflowY: "auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {/* Search Input */}
                <div style={{ padding: 8, borderBottom: `1px solid ${colors.border}` }}>
                  <input
                    type="text"
                    placeholder="Buscar país..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      ...inputStyle,
                      padding: "8px 12px",
                      fontSize: 14,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>

                {/* Country List */}
                {filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => {
                      onCountryChange(country.code);
                      setShowCountryPicker(false);
                      setSearchQuery("");
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      textAlign: "left",
                      backgroundColor:
                        countryCode === country.code ? `${colors.primary}20` : "transparent",
                      border: "none",
                      borderBottom: `1px solid ${colors.border}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: 14,
                      color: colors.foreground,
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (countryCode !== country.code) {
                        (e.target as HTMLElement).style.backgroundColor = `${colors.primary}10`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (countryCode !== country.code) {
                        (e.target as HTMLElement).style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{country.flag}</span>
                    <span style={{ flex: 1 }}>
                      {country.name} ({country.dialCode})
                    </span>
                    {countryCode === country.code && (
                      <span style={{ color: colors.primary, fontWeight: "bold" }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phone Input */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <input
              type="tel"
              placeholder={placeholder || currentConfig?.dialCode || "+506"}
              value={value}
              onChange={(e) => handlePhoneChange(e.target.value)}
              disabled={disabled}
              style={{
                ...inputStyle,
                opacity: disabled ? 0.6 : 1,
                borderColor: error ? colors.error : isValid ? colors.border : colors.error,
              }}
            />
            {error && (
              <Text style={{ fontSize: 12, color: colors.error, marginTop: -2 }}>
                {error}
              </Text>
            )}
            {value && !isValid && (
              <Text style={{ fontSize: 12, color: colors.warning, marginTop: -2 }}>
                Formato inválido para {currentConfig?.name}
              </Text>
            )}
            {value && isValid && (
              <Text style={{ fontSize: 12, color: colors.success, marginTop: -2 }}>
                ✓ Formato válido
              </Text>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Native version (React Native)
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
        Teléfono (opcional)
      </Text>

      <View style={{ flexDirection: "row", gap: 8 }}>
        {/* Country Selector Button */}
        <Pressable
          onPress={() => setShowCountryPicker(!showCountryPicker)}
          disabled={disabled}
          style={({ pressed }) => [
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 12,
              minWidth: 100,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : disabled ? 0.5 : 1,
            },
          ]}
        >
          <Text style={{ fontSize: 20, marginBottom: 4 }}>
            {currentConfig?.flag || "🌍"}
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
            {currentConfig?.code || "CR"}
          </Text>
        </Pressable>

        {/* Phone Input */}
        <View style={{ flex: 1, gap: 6 }}>
          <TextInput
            placeholder={placeholder || currentConfig?.dialCode || "+506"}
            value={value}
            onChangeText={handlePhoneChange}
            editable={!disabled}
            keyboardType="phone-pad"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: error ? colors.error : isValid ? colors.border : colors.error,
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              fontSize: 16,
              color: colors.foreground,
              opacity: disabled ? 0.5 : 1,
            }}
          />
          {error && (
            <Text style={{ fontSize: 12, color: colors.error }}>
              {error}
            </Text>
          )}
          {value && !isValid && (
            <Text style={{ fontSize: 12, color: colors.warning }}>
              Formato inválido para {currentConfig?.name}
            </Text>
          )}
          {value && isValid && (
            <Text style={{ fontSize: 12, color: colors.success }}>
              ✓ Formato válido
            </Text>
          )}
        </View>
      </View>

      {/* Country Picker Modal */}
      {showCountryPicker && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            marginTop: 8,
            maxHeight: 300,
          }}
        >
          {/* Search Input */}
          <TextInput
            placeholder="Buscar país..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{
              backgroundColor: colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingVertical: 8,
              paddingHorizontal: 12,
              fontSize: 14,
              color: colors.foreground,
            }}
          />

          {/* Country List */}
          <ScrollView style={{ maxHeight: 250 }}>
            {filteredCountries.map((country) => (
              <Pressable
                key={country.code}
                onPress={() => {
                  onCountryChange(country.code);
                  setShowCountryPicker(false);
                  setSearchQuery("");
                }}
                style={({ pressed }) => [
                  {
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor:
                      pressed || countryCode === country.code
                        ? `${colors.primary}20`
                        : "transparent",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{country.flag}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: colors.foreground, fontWeight: "500" }}>
                    {country.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {country.dialCode}
                  </Text>
                </View>
                {countryCode === country.code && (
                  <Text style={{ color: colors.primary, fontWeight: "bold", fontSize: 16 }}>
                    ✓
                  </Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
