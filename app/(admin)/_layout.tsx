import { Stack } from "expo-router";
import { useColors } from "@/hooks/use-colors";

export default function AdminLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Stack.Screen
        name="whitelist"
        options={{
          title: "Gestión de Whitelist",
        }}
      />
    </Stack>
  );
}
