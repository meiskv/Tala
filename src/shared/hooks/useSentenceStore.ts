import { create } from "zustand";
import type { SentenceSymbol } from "../types";

interface SentenceState {
  symbols: SentenceSymbol[];
  addSymbol: (symbol: SentenceSymbol) => void;
  removeLastSymbol: () => void;
  removeAtIndex: (index: number) => void;
  clear: () => void;
  getSentenceText: () => string;
}

export const useSentenceStore = create<SentenceState>((set, get) => ({
  symbols: [],

  addSymbol: (symbol) =>
    set((state) => ({ symbols: [...state.symbols, symbol] })),

  removeLastSymbol: () =>
    set((state) => ({ symbols: state.symbols.slice(0, -1) })),

  removeAtIndex: (index) =>
    set((state) => ({
      symbols: state.symbols.filter((_, i) => i !== index),
    })),

  clear: () => set({ symbols: [] }),

  getSentenceText: () =>
    get()
      .symbols.map((s) => s.vocalization)
      .join(" "),
}));
