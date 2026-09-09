import type {
  CardDetail,
  CardSummary,
  CardSyncRun,
  CardTranslation,
  PageResponse,
  PrintingView,
  SyncLogResponse,
} from "@/types/card";
import type {
  AuthConfig,
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";
import type {
  DeckCardChange,
  DeckDetail,
  DeckSummary,
  Folder,
  Format,
  ImportResult,
  Section,
} from "@/types/deck";
import type { AdminUser, PermissionCatalogItem } from "@/types/admin";
import type { CustomArt, CustomArtParams } from "@/types/customArt";
import type { DeckSuggestion, Friend, SuggestionCardLine } from "@/types/social";
import type { HomeStats } from "@/types/stats";
import type { CreateRoomInput, Room, RoomSummary } from "@/types/room";
import type { GameSnapshot, LogLine } from "@/types/game";

/** Base vazia: o Vite faz proxy de /api para o backend. */
const BASE = "";

const ACCESS_KEY = "endstep.accessToken";
const REFRESH_KEY = "endstep.refreshToken";

export const tokenStore = {
  access: () => safeGet(ACCESS_KEY),
  refresh: () => safeGet(REFRESH_KEY),
  set(access: string, refresh: string) {
    safeSet(ACCESS_KEY, access);
    safeSet(REFRESH_KEY, refresh);
  },
  clear() {
    safeDel(ACCESS_KEY);
    safeDel(REFRESH_KEY);
  },
};

function safeGet(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}
function safeDel(k: string) {
  try {
    localStorage.removeItem(k);
  } catch {
    /* ignore */
  }
}

/** Chamado quando a sessão expira de vez (refresh falhou). */
let onAuthLost: () => void = () => {};
export function setAuthLostHandler(fn: () => void) {
  onAuthLost = fn;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refresh = tokenStore.refresh();
  if (!refresh) return false;
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const body = (await res.json()) as AuthResponse;
        tokenStore.set(body.accessToken, body.refreshToken);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

async function http<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const isForm = init.body instanceof FormData;
  if (init.body && !isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const access = tokenStore.access();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  if (res.status === 401 && retry && !path.startsWith("/api/auth/")) {
    const ok = await doRefresh();
    if (ok) return http<T>(path, init, false);
    tokenStore.clear();
    onAuthLost();
    throw new ApiError(401, "Sessão expirada");
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* sem corpo JSON */
    }
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // -------- auth --------
  authConfig: (): Promise<AuthConfig> => http("/api/auth/config"),

  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    http("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  login: (payload: LoginPayload): Promise<AuthResponse> =>
    http("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  logout: (): Promise<void> => {
    const refreshToken = tokenStore.refresh();
    return http("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  },

  me: (): Promise<AuthUser> => http("/api/users/me"),

  updateProfile: (data: { displayName?: string; avatarUrl?: string }): Promise<AuthUser> =>
    http("/api/users/me", { method: "PUT", body: JSON.stringify(data) }),

  // -------- cards --------
  searchCards: (q: string, page = 0, size = 30): Promise<PageResponse<CardSummary>> => {
    const qs = new URLSearchParams({ q, page: String(page), size: String(size) });
    return http(`/api/cards/search?${qs.toString()}`);
  },
  getCard: (oracleId: string): Promise<CardDetail> => http(`/api/cards/${oracleId}`),
  getPrintings: (oracleId: string): Promise<PrintingView[]> =>
    http(`/api/cards/${oracleId}/printings`),
  translateCard: (
    ref: { oracleId: string } | { oracleCardId: number },
    lang = "pt",
  ): Promise<CardTranslation> => {
    const qs = new URLSearchParams({ lang });
    if ("oracleId" in ref) qs.set("oracleId", ref.oracleId);
    else qs.set("oracleCardId", String(ref.oracleCardId));
    return http(`/api/translations/card?${qs.toString()}`);
  },

  // -------- admin --------
  triggerSync: (): Promise<{ runId: number; status: string }> =>
    http("/api/admin/cards/sync", { method: "POST" }),
  syncStatus: (): Promise<CardSyncRun[]> => http("/api/admin/cards/sync/status"),
  syncLog: (since = 0): Promise<SyncLogResponse> =>
    http(`/api/admin/cards/sync/log?since=${since}`),

  // -------- admin: usuários / permissões --------
  adminUsers: (): Promise<AdminUser[]> => http("/api/admin/users"),
  adminPermissionCatalog: (): Promise<PermissionCatalogItem[]> =>
    http("/api/admin/users/permissions"),
  setUserPermissions: (userId: number, permissions: string[]): Promise<AdminUser> =>
    http(`/api/admin/users/${userId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissions }),
    }),

  // -------- decks / folders / formats --------
  formats: (): Promise<Format[]> => http("/api/formats"),

  folders: (): Promise<Folder[]> => http("/api/deck-folders"),
  createFolder: (name: string, parentId?: number | null): Promise<Folder> =>
    http("/api/deck-folders", { method: "POST", body: JSON.stringify({ name, parentId: parentId ?? null }) }),
  updateFolder: (
    id: number,
    data: { name?: string; parentId?: number | null; position?: number },
  ): Promise<Folder> =>
    http(`/api/deck-folders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFolder: (id: number): Promise<void> =>
    http(`/api/deck-folders/${id}`, { method: "DELETE" }),

  decks: (): Promise<DeckSummary[]> => http("/api/decks"),
  createDeck: (name: string, format: string, folderId?: number | null): Promise<DeckDetail> =>
    http("/api/decks", { method: "POST", body: JSON.stringify({ name, format, folderId: folderId ?? null }) }),
  deck: (id: number): Promise<DeckDetail> => http(`/api/decks/${id}`),
  updateDeck: (
    id: number,
    data: {
      name?: string;
      format?: string;
      folderId?: number | null;
      description?: string;
      visibility?: string;
      favorite?: boolean;
      position?: number;
    },
  ): Promise<DeckDetail> => http(`/api/decks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDeck: (id: number): Promise<void> => http(`/api/decks/${id}`, { method: "DELETE" }),
  duplicateDeck: (id: number): Promise<DeckDetail> =>
    http(`/api/decks/${id}/duplicate`, { method: "POST" }),
  applyDeckCards: (id: number, changes: DeckCardChange[]): Promise<DeckDetail> =>
    http(`/api/decks/${id}/cards`, { method: "PUT", body: JSON.stringify({ changes }) }),
  importDeck: (data: {
    name?: string;
    format: string;
    folderId?: number | null;
    text: string;
  }): Promise<ImportResult> =>
    http("/api/decks/import", { method: "POST", body: JSON.stringify(data) }),

  setDeckCardArt: (
    deckId: number,
    data: { oracleId: string; section: Section; printingId?: number | null; customArtId?: number | null },
  ): Promise<DeckDetail> =>
    http(`/api/decks/${deckId}/cards/art`, { method: "PUT", body: JSON.stringify(data) }),

  // -------- custom arts --------
  customArts: (oracleId?: string): Promise<CustomArt[]> =>
    http(`/api/custom-arts${oracleId ? `?oracleId=${oracleId}` : ""}`),
  createCustomArt: (
    oracleId: string,
    basePrintingId: number | null,
    params: CustomArtParams,
    file: File,
  ): Promise<CustomArt> => {
    const fd = new FormData();
    fd.set("oracleId", oracleId);
    if (basePrintingId != null) fd.set("basePrintingId", String(basePrintingId));
    if (params.label) fd.set("label", params.label);
    if (params.displayName) fd.set("displayName", params.displayName);
    if (params.overlayText) fd.set("overlayText", params.overlayText);
    fd.set("nameBar", String(params.nameBar));
    fd.set("textBar", String(params.textBar));
    fd.set("zoom", String(params.zoom));
    fd.set("offsetX", String(params.offsetX));
    fd.set("offsetY", String(params.offsetY));
    fd.set("art", file);
    return http("/api/custom-arts", { method: "POST", body: fd });
  },
  deleteCustomArt: (id: number): Promise<void> =>
    http(`/api/custom-arts/${id}`, { method: "DELETE" }),

  // -------- rooms / games --------
  listRooms: (): Promise<RoomSummary[]> => http("/api/rooms"),
  createRoom: (input: CreateRoomInput): Promise<Room> =>
    http("/api/rooms", { method: "POST", body: JSON.stringify(input) }),
  getRoom: (code: string): Promise<Room> => http(`/api/rooms/${code}`),
  joinRoom: (code: string, password?: string, asSpectator = false): Promise<Room> =>
    http(`/api/rooms/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ password: password ?? null, asSpectator }),
    }),
  leaveRoom: (code: string): Promise<void> =>
    http(`/api/rooms/${code}/leave`, { method: "POST" }),
  chooseRoomDeck: (code: string, deckId: number | null): Promise<Room> =>
    http(`/api/rooms/${code}/deck`, { method: "POST", body: JSON.stringify({ deckId }) }),
  startRoom: (code: string): Promise<{ gameId: number }> =>
    http(`/api/rooms/${code}/start`, { method: "POST" }),
  sitAtTable: (code: string): Promise<{ gameId: number | null }> =>
    http(`/api/rooms/${code}/sit`, { method: "POST" }),

  // -------- home / estatísticas --------
  homeStats: (): Promise<HomeStats> => http("/api/stats/home"),

  // -------- amigos / sugestões --------
  friends: (): Promise<Friend[]> => http("/api/friends"),
  addFriend: (query: string): Promise<Friend> =>
    http("/api/friends", { method: "POST", body: JSON.stringify({ query }) }),
  removeFriend: (userId: number): Promise<void> =>
    http(`/api/friends/${userId}`, { method: "DELETE" }),

  suggestions: (): Promise<DeckSuggestion[]> => http("/api/suggestions"),
  suggestionCount: (): Promise<{ unread: number }> => http("/api/suggestions/count"),
  suggestionCards: (id: number): Promise<SuggestionCardLine[]> =>
    http(`/api/suggestions/${id}/cards`),
  suggestDeck: (deckId: number, toUserId: number, message?: string): Promise<void> =>
    http("/api/suggestions", {
      method: "POST",
      body: JSON.stringify({ deckId, toUserId, message: message ?? null }),
    }),
  importSuggestion: (id: number): Promise<DeckDetail> =>
    http(`/api/suggestions/${id}/import`, { method: "POST" }),
  dismissSuggestion: (id: number): Promise<void> =>
    http(`/api/suggestions/${id}`, { method: "DELETE" }),

  gameSnapshot: (id: number): Promise<GameSnapshot> => http(`/api/games/${id}`),
  gameHistory: (id: number, limit = 200): Promise<LogLine[]> =>
    http(`/api/games/${id}/history?limit=${limit}`),
  exportDeckText: async (
    id: number,
    format: "txt" | "csv" | "json" = "txt",
  ): Promise<string> => {
    const res = await fetch(`${BASE}/api/decks/${id}/export?format=${format}`, {
      headers: tokenStore.access() ? { Authorization: `Bearer ${tokenStore.access()}` } : {},
    });
    if (!res.ok) throw new ApiError(res.status, "Falha ao gerar o texto do deck");
    return res.text();
  },
  exportDeck: async (id: number, format: "txt" | "csv" | "json" | "pdf"): Promise<void> => {
    const res = await fetch(`${BASE}/api/decks/${id}/export?format=${format}`, {
      headers: tokenStore.access() ? { Authorization: `Bearer ${tokenStore.access()}` } : {},
    });
    if (!res.ok) throw new ApiError(res.status, "Falha ao exportar");
    const blob = await res.blob();
    const cd = res.headers.get("Content-Disposition") ?? "";
    const match = /filename="?([^"]+)"?/.exec(cd);
    const filename = match?.[1] ?? `deck.${format}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

export { ApiError };
