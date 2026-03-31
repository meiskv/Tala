import { useColorScheme } from "react-native";
import { COLORS } from "../constants/theme";
import { useThemeStore } from "./useThemeStore";

export function useColors() {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);

  const resolvedScheme =
    mode === "system" ? (systemScheme ?? "light") : mode;

  return COLORS[resolvedScheme];
}

export function useIsDark() {
  const systemScheme = useColorScheme();
  const mode = useThemeStore((s) => s.mode);

  if (mode === "system") return systemScheme === "dark";
  return mode === "dark";
}
