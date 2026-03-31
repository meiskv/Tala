import { create } from "zustand";
import { storage, StorageKeys } from "@/db/storage";

type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: (storage.getString(StorageKeys.DARK_MODE) as ThemeMode) ?? "system",

  setMode: (mode) => {
    storage.set(StorageKeys.DARK_MODE, mode);
    set({ mode });
  },
}));
