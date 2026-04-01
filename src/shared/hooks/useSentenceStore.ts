import { create } from "zustand";
import type { SentenceSymbol } from "../types";
import { saveSentenceHistory } from "@/db/queries/sentenceHistoryQueries";

interface SentenceState {
  symbols: SentenceSymbol[];
  addSymbol: (symbol: SentenceSymbol) => void;
  removeLastSymbol: () => void;
  removeAtIndex: (index: number) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  clear: () => void;
  getSentenceText: () => string;
  saveToHistory: () => void;
  loadFromHistory: (symbols: SentenceSymbol[]) => void;
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

  reorder: (fromIndex, toIndex) =>
    set((state) => {
      const newSymbols = [...state.symbols];
      const [moved] = newSymbols.splice(fromIndex, 1);
      newSymbols.splice(toIndex, 0, moved);
      return { symbols: newSymbols };
    }),

  clear: () => set({ symbols: [] }),

  getSentenceText: () =>
    get()
      .symbols.map((s) => s.vocalization)
      .join(" "),

  saveToHistory: () => {
    const symbols = get().symbols;
    if (symbols.length === 0) return;
    const id = `sh-${Date.now()}`;
    const json = JSON.stringify(symbols);
    saveSentenceHistory(id, json).catch(console.warn);
  },

  loadFromHistory: (symbols) => set({ symbols }),
}));
