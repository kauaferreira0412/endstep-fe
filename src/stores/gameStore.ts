import { create } from "zustand";
import { GameSocket } from "@/services/gameSocket";
import { dialog } from "@/stores/dialogStore";
import type {
  ChatMessage,
  GameCard,
  GamePlayer,
  GameSnapshot,
  LogLine,
  Phase,
  ServerEnvelope,
  TurnView,
  Zone,
} from "@/types/game";

type Conn = "idle" | "connecting" | "connected" | "disconnected";

interface GameState {
  socket: GameSocket | null;
  gameId: number | null;
  status: GameSnapshot["status"] | null;
  meUserId: number | null;
  roomCode: string | null;
  format: string | null;
  lastSequence: number;
  turn: TurnView | null;
  players: Record<number, GamePlayer>;
  cards: Record<number, GameCard>;
  log: LogLine[];
  chat: ChatMessage[];
  conn: Conn;
  error: string | null;
  /** resultado da última cascata/descoberta (carta achada) esperando decisão do jogador */
  cascadeHit: { cardId: number; name?: string; exiledCount: number; discover?: boolean } | null;
  /** topo do grimório revelado p/ Scry / Surveil / Look aguardando decisão */
  lookTop: { mode: "scry" | "surveil" | "free"; cardIds: number[] } | null;
  /** modal "criar ficha" aberto */
  tokenModalOpen: boolean;

  connect: (gameId: number) => void;
  disconnect: () => void;
  clearCascadeHit: () => void;
  clearLookTop: () => void;
  setTokenModalOpen: (open: boolean) => void;

  // acoes
  draw: (count?: number) => void;
  drawHand: (count?: number) => void;
  mulligan: () => void;
  playCard: (cardId: number, x: number, y: number, faceDown?: boolean) => void;
  moveCard: (cardId: number, toZone: Zone, placement?: "TOP" | "BOTTOM") => void;
  setPosition: (cardId: number, x: number, y: number) => void;
  setTapped: (cardId: number, tapped: boolean) => void;
  untapAll: () => void;
  rotate: (cardId: number, rotation: number) => void;
  setFaceDown: (cardId: number, faceDown: boolean) => void;
  cardCounter: (cardId: number, kind: string, delta: number) => void;
  playerCounter: (targetUserId: number, kind: string, delta: number) => void;
  changeLife: (targetUserId: number, delta: number) => void;
  setLife: (targetUserId: number, absolute: number) => void;
  commanderDamage: (fromUserId: number, toUserId: number, delta: number) => void;
  shuffleLibrary: () => void;
  peekLibrary: (count: number) => void;
  searchToHand: (cardId: number) => void;
  cascade: (opts: { cardId?: number; maxMv?: number }) => void;
  discover: (n: number) => void;
  mill: (count: number) => void;
  scry: (count: number) => void;
  surveil: (count: number) => void;
  lookTopResolve: (
    decisions: { cardId: number; dest: "TOP" | "BOTTOM" | "GRAVEYARD" }[],
  ) => void;
  createToken: (opts: {
    name: string;
    pt?: string;
    colors?: string;
    text?: string;
    count?: number;
  }) => void;
  copyCard: (cardId: number, count?: number) => void;
  revealCard: (cardId: number) => void;
  hideCard: (cardId: number) => void;
  passTurn: () => void;
  setPhase: (phase: Phase) => void;
  surrender: () => void;
  sendChat: (text: string) => void;
}

function byId<T extends { userId?: number; id?: number }>(list: T[], key: "userId" | "id"): Record<number, T> {
  const out: Record<number, T> = {};
  for (const item of list) {
    const k = item[key];
    if (typeof k === "number") out[k] = item;
  }
  return out;
}

export const useGameStore = create<GameState>((set, get) => {
  const send = (type: string, payload: Record<string, unknown> = {}) => get().socket?.send(type, payload);

  const applyEnvelope = (env: ServerEnvelope) => {
    switch (env.type) {
      case "GAME_STATE": {
        const s = env.data;
        set({
          status: s.status,
          meUserId: s.meUserId,
          roomCode: s.roomCode,
          format: s.format,
          lastSequence: s.lastSequence,
          turn: s.turn,
          players: byId(s.players, "userId"),
          cards: byId(s.cards, "id"),
          log: s.log,
        });
        break;
      }
      case "PATCH": {
        const p = env.data;
        set((st) => {
          const cards = { ...st.cards };
          for (const c of p.cards) cards[c.id] = c;
          for (const id of p.removed ?? []) delete cards[id];
          const players = { ...st.players };
          for (const pl of p.players) players[pl.userId] = pl;
          const log = p.log && !st.log.some((l) => l.sequence === p.log!.sequence)
            ? [...st.log, p.log].slice(-200)
            : st.log;
          return {
            cards,
            players,
            turn: p.turn ?? st.turn,
            log,
            lastSequence: Math.max(st.lastSequence, p.sequence),
          };
        });
        break;
      }
      case "CHAT": {
        set((st) => ({ chat: [...st.chat, env.data].slice(-200) }));
        break;
      }
      case "ERROR": {
        set({ error: env.data.message });
        setTimeout(() => set((st) => (st.error === env.data.message ? { error: null } : {})), 4000);
        break;
      }
      case "NOTICE": {
        const n = env.data;
        if (n.kind === "CASCADE" || n.kind === "DISCOVER") {
          const discover = n.kind === "DISCOVER";
          const term = discover ? "Descoberta" : "Cascata";
          if (n.hitCardId) {
            set({
              cascadeHit: { cardId: n.hitCardId, name: n.hitName, exiledCount: n.exiledCount, discover },
            });
          } else {
            void dialog.alert({
              title: term,
              message: `Revelou ${n.exiledCount} carta(s), nenhuma elegível — tudo foi pro fundo do grimório.`,
            });
          }
        } else if (n.kind === "LOOKTOP") {
          set({ lookTop: { mode: n.mode, cardIds: n.cardIds } });
        }
        break;
      }
      default:
        break;
    }
  };

  return {
    socket: null,
    gameId: null,
    status: null,
    meUserId: null,
    roomCode: null,
    format: null,
    lastSequence: 0,
    turn: null,
    players: {},
    cards: {},
    log: [],
    chat: [],
    conn: "idle",
    error: null,
    cascadeHit: null,
    lookTop: null,
    tokenModalOpen: false,

    clearCascadeHit: () => set({ cascadeHit: null }),
    clearLookTop: () => set({ lookTop: null }),
    setTokenModalOpen: (open) => set({ tokenModalOpen: open }),

    connect: (gameId) => {
      get().socket?.disconnect();
      const socket = new GameSocket(gameId, {
        onEnvelope: applyEnvelope,
        onStatus: (s) => set({ conn: s }),
      });
      set({
        socket,
        gameId,
        conn: "connecting",
        players: {},
        cards: {},
        log: [],
        chat: [],
        cascadeHit: null,
        lookTop: null,
        tokenModalOpen: false,
        lastSequence: 0,
        turn: null,
      });
      socket.connect();
    },
    disconnect: () => {
      get().socket?.disconnect();
      set({ socket: null, gameId: null, conn: "idle" });
    },

    draw: (count = 1) => send("DRAW", { count }),
    drawHand: (count = 7) => send("DRAW_HAND", { count }),
    mulligan: () => send("MULLIGAN"),
    playCard: (cardId, x, y, faceDown = false) => send("PLAY_CARD", { cardId, x, y, faceDown }),
    moveCard: (cardId, toZone, placement) => send("MOVE_CARD", { cardId, toZone, placement }),
    setPosition: (cardId, x, y) => send("SET_POSITION", { cardId, x, y }),
    setTapped: (cardId, tapped) => send("SET_TAPPED", { cardId, tapped }),
    untapAll: () => send("UNTAP_ALL"),
    rotate: (cardId, rotation) => send("ROTATE", { cardId, rotation }),
    setFaceDown: (cardId, faceDown) => send("SET_FACE_DOWN", { cardId, faceDown }),
    cardCounter: (cardId, kind, delta) => send("CARD_COUNTER", { cardId, kind, delta }),
    playerCounter: (targetUserId, kind, delta) => send("PLAYER_COUNTER", { targetUserId, kind, delta }),
    changeLife: (targetUserId, delta) => send("CHANGE_LIFE", { targetUserId, delta }),
    setLife: (targetUserId, absolute) => send("CHANGE_LIFE", { targetUserId, absolute }),
    commanderDamage: (fromUserId, toUserId, delta) =>
      send("COMMANDER_DAMAGE", { fromUserId, toUserId, delta }),
    shuffleLibrary: () => send("SHUFFLE_LIBRARY"),
    peekLibrary: (count) => send("PEEK_LIBRARY", { count }),
    searchToHand: (cardId) => send("SEARCH_TO_HAND", { cardId }),
    cascade: (opts) => send("CASCADE", opts),
    discover: (n) => send("DISCOVER", { maxMv: n, inclusive: true }),
    mill: (count) => send("MILL", { count }),
    scry: (count) => send("LOOK_TOP", { count, mode: "scry" }),
    surveil: (count) => send("LOOK_TOP", { count, mode: "surveil" }),
    lookTopResolve: (decisions) => send("LOOK_TOP_RESOLVE", { decisions }),
    createToken: (opts) => send("CREATE_TOKEN", { count: 1, ...opts }),
    copyCard: (cardId, count = 1) => send("COPY_CARD", { cardId, count }),
    revealCard: (cardId) => send("REVEAL_CARD", { cardId }),
    hideCard: (cardId) => send("HIDE_CARD", { cardId }),
    passTurn: () => send("PASS_TURN"),
    setPhase: (phase) => send("SET_PHASE", { phase }),
    surrender: () => send("SURRENDER"),
    sendChat: (text) => get().socket?.chat(text),
  };
});
