import { create } from "zustand";
import { api } from "@/services/api";
import type { CreateRoomInput, Room, RoomSummary } from "@/types/room";

function msg(e: unknown) {
  return e instanceof Error ? e.message : "Erro inesperado";
}

interface RoomState {
  publicRooms: RoomSummary[];
  room: Room | null;
  loading: boolean;
  error: string | null;

  loadPublic: () => Promise<void>;
  create: (input: CreateRoomInput) => Promise<Room>;
  open: (code: string) => Promise<void>;
  join: (code: string, password?: string, asSpectator?: boolean) => Promise<void>;
  leave: (code: string) => Promise<void>;
  chooseDeck: (code: string, deckId: number | null) => Promise<void>;
  refresh: (code: string) => Promise<void>;
  clear: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  publicRooms: [],
  room: null,
  loading: false,
  error: null,

  loadPublic: async () => {
    try {
      set({ publicRooms: await api.listRooms() });
    } catch (e) {
      set({ error: msg(e) });
    }
  },

  create: async (input) => {
    set({ loading: true, error: null });
    try {
      const room = await api.createRoom(input);
      set({ room, loading: false });
      return room;
    } catch (e) {
      set({ error: msg(e), loading: false });
      throw e;
    }
  },

  open: async (code) => {
    set({ loading: true, error: null });
    try {
      set({ room: await api.getRoom(code), loading: false });
    } catch (e) {
      set({ error: msg(e), loading: false });
    }
  },

  join: async (code, password, asSpectator) => {
    set({ error: null });
    try {
      set({ room: await api.joinRoom(code, password, asSpectator) });
    } catch (e) {
      set({ error: msg(e) });
      throw e;
    }
  },

  leave: async (code) => {
    try {
      await api.leaveRoom(code);
    } finally {
      set({ room: null });
    }
  },

  chooseDeck: async (code, deckId) => {
    set({ error: null });
    try {
      set({ room: await api.chooseRoomDeck(code, deckId) });
    } catch (e) {
      set({ error: msg(e) });
      throw e;
    }
  },

  refresh: async (code) => {
    try {
      set({ room: await api.getRoom(code) });
    } catch {
      /* silencioso no polling */
    }
  },

  clear: () => set({ room: null, error: null }),
}));
