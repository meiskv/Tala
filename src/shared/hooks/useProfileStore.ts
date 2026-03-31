import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "@/db/storage";
import type { UserProfile, ComplexityLevel } from "../types";
import { GRID_PRESETS } from "../constants/grid";

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

interface ProfileState {
  activeProfile: UserProfile | null;
  setActiveProfile: (profile: UserProfile) => void;
  updateComplexity: (level: ComplexityLevel) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      activeProfile: null,

      setActiveProfile: (profile) => set({ activeProfile: profile }),

      updateComplexity: (level) =>
        set((state) => {
          if (!state.activeProfile) return state;
          const gridSize = GRID_PRESETS[level];
          return {
            activeProfile: {
              ...state.activeProfile,
              complexityLevel: level,
              gridRows: gridSize.rows,
              gridCols: gridSize.cols,
            },
          };
        }),
    }),
    {
      name: "profile-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
