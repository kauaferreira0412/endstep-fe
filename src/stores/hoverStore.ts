import { create } from "zustand";
import type { GameCard } from "@/types/game";

interface PreviewState {
  card: GameCard | null;
  /** Alt (segurado) + clique numa carta: mostra o preview grande. */
  show: (card: GameCard) => void;
  clear: () => void;
}

/** Carta no preview grande. Aparece com Alt+clique e some ao soltar o Alt. */
export const useHoverStore = create<PreviewState>((set) => ({
  card: null,
  show: (card) => set({ card }),
  clear: () => set({ card: null }),
}));
