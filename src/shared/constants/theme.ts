export const COLORS = {
  light: {
    background: "#FFF",
    surface: "#FAFAFA",
    card: "#F5F5F5",
    text: "#333",
    textSecondary: "#666",
    textTertiary: "#999",
    border: "#E0E0E0",
    accent: "#4FC3F7",
    success: "#4CAF50",
    warning: "#FF9800",
    danger: "#F44336",
  },
  dark: {
    background: "#121212",
    surface: "#1E1E1E",
    card: "#2A2A2A",
    text: "#E0E0E0",
    textSecondary: "#AAAAAA",
    textTertiary: "#777",
    border: "#333333",
    accent: "#4FC3F7",
    success: "#66BB6A",
    warning: "#FFA726",
    danger: "#EF5350",
  },
} as const;

export type ColorScheme = keyof typeof COLORS;
