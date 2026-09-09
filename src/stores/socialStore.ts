import { create } from "zustand";
import { api } from "@/services/api";
import type { DeckSuggestion, Friend } from "@/types/social";

interface SocialState {
  friends: Friend[];
  suggestions: DeckSuggestion[];
  unread: number;
  loadingFriends: boolean;
  loadingSuggestions: boolean;

  loadFriends: () => Promise<void>;
  loadSuggestions: () => Promise<void>;
  refreshCount: () => Promise<void>;
  addFriend: (query: string) => Promise<void>;
  removeFriend: (userId: number) => Promise<void>;
  dismissSuggestion: (id: number) => Promise<void>;
  markImported: (id: number, deckId: number) => void;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  friends: [],
  suggestions: [],
  unread: 0,
  loadingFriends: false,
  loadingSuggestions: false,

  loadFriends: async () => {
    set({ loadingFriends: true });
    try {
      set({ friends: await api.friends() });
    } finally {
      set({ loadingFriends: false });
    }
  },

  loadSuggestions: async () => {
    set({ loadingSuggestions: true });
    try {
      const suggestions = await api.suggestions();
      set({ suggestions, unread: suggestions.filter((s) => s.status === "NEW").length });
    } finally {
      set({ loadingSuggestions: false });
    }
  },

  refreshCount: async () => {
    try {
      const { unread } = await api.suggestionCount();
      set({ unread });
    } catch {
      /* ignore */
    }
  },

  addFriend: async (query) => {
    const f = await api.addFriend(query.trim());
    set((s) => ({ friends: [...s.friends.filter((x) => x.userId !== f.userId), f] }));
  },

  removeFriend: async (userId) => {
    await api.removeFriend(userId);
    set((s) => ({ friends: s.friends.filter((f) => f.userId !== userId) }));
  },

  dismissSuggestion: async (id) => {
    await api.dismissSuggestion(id);
    set((s) => ({
      suggestions: s.suggestions.map((x) => (x.id === id ? { ...x, status: "DISMISSED" } : x)),
      unread: Math.max(0, s.unread - (s.suggestions.find((x) => x.id === id)?.status === "NEW" ? 1 : 0)),
    }));
  },

  markImported: (id, deckId) => {
    set((s) => ({
      suggestions: s.suggestions.map((x) =>
        x.id === id ? { ...x, status: "IMPORTED", importedDeckId: deckId } : x,
      ),
      unread: Math.max(0, s.unread - (s.suggestions.find((x) => x.id === id)?.status === "NEW" ? 1 : 0)),
    }));
    void get().refreshCount();
  },
}));
