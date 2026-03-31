import { create } from "zustand";
import type { Board, Button, Category } from "../types";

interface BoardState {
  currentBoard: Board | null;
  buttons: Button[];
  categories: Category[];
  selectedCategoryId: string | null;
  isLoading: boolean;

  setCurrentBoard: (board: Board, buttons: Button[]) => void;
  setCategories: (categories: Category[]) => void;
  selectCategory: (categoryId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  currentBoard: null,
  buttons: [],
  categories: [],
  selectedCategoryId: null,
  isLoading: true,

  setCurrentBoard: (board, buttons) =>
    set({ currentBoard: board, buttons, isLoading: false }),
  setCategories: (categories) => set({ categories }),
  selectCategory: (categoryId) => set({ selectedCategoryId: categoryId }),
  setLoading: (isLoading) => set({ isLoading }),
}));
