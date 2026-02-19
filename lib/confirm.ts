import { Alert, Platform } from "react-native";

/**
 * Cross-platform confirm dialog.
 * On web, uses window.confirm (Alert.alert does NOT work on web).
 * On native, uses Alert.alert with Cancel/Confirm buttons.
 */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void
) {
  if (Platform.OS === "web") {
    const ok = window.confirm(`${title}\n\n${message}`);
    if (ok) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: onConfirm },
    ]);
  }
}

/**
 * Cross-platform destructive confirm dialog.
 * On web, uses window.confirm.
 * On native, uses Alert.alert with destructive style.
 */
export function confirmDestructive(
  title: string,
  message: string,
  onConfirm: () => void,
  confirmText = "Eliminar"
) {
  if (Platform.OS === "web") {
    const ok = window.confirm(`${title}\n\n${message}`);
    if (ok) onConfirm();
  } else {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel" },
      { text: confirmText, style: "destructive", onPress: onConfirm },
    ]);
  }
}

/**
 * Cross-platform alert (info only).
 * On web, uses window.alert.
 * On native, uses Alert.alert.
 */
export function showAlert(title: string, message: string, onDismiss?: () => void) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    if (onDismiss) onDismiss();
  } else {
    Alert.alert(title, message, [
      { text: "OK", onPress: onDismiss },
    ]);
  }
}
