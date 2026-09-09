import { create } from "zustand";
import { api } from "@/services/api";
import type { CardSummary } from "@/types/card";

interface CardSearchState {
  query: string;
  results: CardSummary[];
  page: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  selectedOracleId: string | null;

  setQuery: (q: string) => void;
  search: (page?: number) => Promise<void>;
  select: (oracleId: string | null) => void;
}

const SIZE = 30;

export const useCardSearchStore = create<CardSearchState>((set, get) => ({
  query: "",
  results: [],
  page: 0,
  totalPages: 0,
  totalElements: 0,
  loading: false,
  error: null,
  selectedOracleId: null,

  setQuery: (q) => set({ query: q }),

  search: async (page = 0) => {
    const q = get().query.trim();
    if (q.length < 2) {
      set({ results: [], totalPages: 0, totalElements: 0, error: null, page: 0 });
      return;
    }
    set({ loading: true, error: null });
    try {
      const res = await api.searchCards(q, page, SIZE);
      set({
        results: res.content,
        page: res.page,
        totalPages: res.totalPages,
        totalElements: res.totalElements,
        loading: false,
      });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof Error ? e.message : "Falha na busca",
        results: [],
      });
    }
  },

  select: (oracleId) => set({ selectedOracleId: oracleId }),
}));
