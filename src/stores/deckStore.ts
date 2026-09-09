import { create } from "zustand";
import { api } from "@/services/api";
import type {
  DeckCardChange,
  DeckDetail,
  DeckSummary,
  Folder,
  Format,
} from "@/types/deck";

interface DeckState {
  formats: Format[];
  folders: Folder[];
  decks: DeckSummary[];
  selectedDeckId: number | null;
  detail: DeckDetail | null;
  loadingList: boolean;
  loadingDetail: boolean;
  savingCards: boolean;
  error: string | null;
  loaded: boolean;

  bootstrap: () => Promise<void>;
  refreshList: () => Promise<void>;
  selectDeck: (id: number | null) => Promise<void>;
  setDetail: (d: DeckDetail) => void;

  createFolder: (name: string, parentId?: number | null) => Promise<void>;
  renameFolder: (id: number, name: string) => Promise<void>;
  moveFolder: (id: number, parentId: number | null) => Promise<void>;
  deleteFolder: (id: number) => Promise<void>;

  createDeck: (name: string, format: string, folderId?: number | null) => Promise<number>;
  patchDeck: (id: number, data: Parameters<typeof api.updateDeck>[1]) => Promise<void>;
  deleteDeck: (id: number) => Promise<void>;
  duplicateDeck: (id: number) => Promise<void>;
  moveDeck: (id: number, folderId: number | null) => Promise<void>;

  applyCards: (changes: DeckCardChange[]) => Promise<void>;
}

function msg(e: unknown) {
  return e instanceof Error ? e.message : "Erro inesperado";
}

export const useDeckStore = create<DeckState>((set, get) => ({
  formats: [],
  folders: [],
  decks: [],
  selectedDeckId: null,
  detail: null,
  loadingList: false,
  loadingDetail: false,
  savingCards: false,
  error: null,
  loaded: false,

  bootstrap: async () => {
    if (get().loaded) return;
    set({ loadingList: true, error: null });
    try {
      const [formats, folders, decks] = await Promise.all([
        api.formats(),
        api.folders(),
        api.decks(),
      ]);
      set({ formats, folders, decks, loadingList: false, loaded: true });
    } catch (e) {
      set({ error: msg(e), loadingList: false });
    }
  },

  refreshList: async () => {
    try {
      const [folders, decks] = await Promise.all([api.folders(), api.decks()]);
      set({ folders, decks });
    } catch (e) {
      set({ error: msg(e) });
    }
  },

  selectDeck: async (id) => {
    set({ selectedDeckId: id, detail: null });
    if (id == null) return;
    set({ loadingDetail: true });
    try {
      const detail = await api.deck(id);
      if (get().selectedDeckId === id) set({ detail, loadingDetail: false });
    } catch (e) {
      set({ error: msg(e), loadingDetail: false });
    }
  },

  setDetail: (d) =>
    set((s) => ({
      detail: d,
      decks: s.decks.map((x) =>
        x.id === d.id ? { ...x, cardCount: d.stats.total, colorIdentity: d.colorIdentity } : x,
      ),
    })),

  createFolder: async (name, parentId) => {
    await api.createFolder(name, parentId ?? null);
    await get().refreshList();
  },
  renameFolder: async (id, name) => {
    await api.updateFolder(id, { name });
    await get().refreshList();
  },
  moveFolder: async (id, parentId) => {
    await api.updateFolder(id, { parentId: parentId ?? 0 });
    await get().refreshList();
  },
  deleteFolder: async (id) => {
    await api.deleteFolder(id);
    await get().refreshList();
  },

  createDeck: async (name, format, folderId) => {
    const d = await api.createDeck(name, format, folderId ?? null);
    await get().refreshList();
    return d.id;
  },
  patchDeck: async (id, data) => {
    const d = await api.updateDeck(id, data);
    set((s) => ({ detail: s.detail?.id === id ? d : s.detail }));
    await get().refreshList();
  },
  deleteDeck: async (id) => {
    await api.deleteDeck(id);
    set((s) => (s.selectedDeckId === id ? { selectedDeckId: null, detail: null } : {}));
    await get().refreshList();
  },
  duplicateDeck: async (id) => {
    const d = await api.duplicateDeck(id);
    await get().refreshList();
    await get().selectDeck(d.id);
  },
  moveDeck: async (id, folderId) => {
    await api.updateDeck(id, { folderId: folderId ?? 0 });
    await get().refreshList();
  },

  applyCards: async (changes) => {
    const id = get().selectedDeckId;
    if (id == null) return;
    set({ savingCards: true });
    try {
      const detail = await api.applyDeckCards(id, changes);
      set((s) => ({
        detail,
        savingCards: false,
        decks: s.decks.map((d) =>
          d.id === id
            ? { ...d, cardCount: detail.stats.total, colorIdentity: detail.colorIdentity }
            : d,
        ),
      }));
    } catch (e) {
      set({ error: msg(e), savingCards: false });
    }
  },
}));
