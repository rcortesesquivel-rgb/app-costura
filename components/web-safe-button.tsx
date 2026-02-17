import { Platform, TouchableOpacity, ActivityIndicator, Text, StyleSheet } from "react-native";

interface WebSafeButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  isLoading?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
}

/**
 * A button component that uses native HTML <button> on web
 * and TouchableOpacity on native platforms.
 * This ensures click events work correctly on all platforms.
 */
export function WebSafeButton({
  onPress,
  title,
  disabled = false,
  isLoading = false,
  backgroundColor = "#C9A96E",
  textColor = "#FFFFFF",
  borderRadius = 12,
}: WebSafeButtonProps) {
  if (Platform.OS === "web") {
    return (
      <button
        onClick={onPress}
        disabled={disabled || isLoading}
        style={{
          backgroundColor,
          color: textColor,
          border: "none",
          borderRadius,
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 24,
          paddingRight: 24,
          fontSize: 16,
          fontWeight: "600",
          cursor: disabled || isLoading ? "not-allowed" : "pointer",
          opacity: disabled || isLoading ? 0.7 : 1,
          width: "100%",
          fontFamily: "inherit",
          transition: "opacity 0.2s",
        }}
      >
        {isLoading ? "Cargando..." : title}
      </button>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.button,
        { backgroundColor, borderRadius },
        (disabled || isLoading) && styles.disabled,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
