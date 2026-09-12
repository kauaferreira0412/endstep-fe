export type Zone =
  | "LIBRARY"
  | "HAND"
  | "BATTLEFIELD"
  | "GRAVEYARD"
  | "EXILE"
  | "COMMAND"
  | "STACK";

export type Phase =
  | "UNTAP"
  | "UPKEEP"
  | "DRAW"
  | "MAIN1"
  | "COMBAT_BEGIN"
  | "ATTACKERS"
  | "BLOCKERS"
  | "COMBAT_DAMAGE"
  | "COMBAT_END"
  | "MAIN2"
  | "END"
  | "CLEANUP";

/** rótulo curto de cada fase para a barra de turno */
export const PHASE_LABEL: Record<Phase, string> = {
  UNTAP: "Desvirar",
  UPKEEP: "Manutenção",
  DRAW: "Compra",
  MAIN1: "Principal 1",
  COMBAT_BEGIN: "Combate: início",
  ATTACKERS: "Atacantes",
  BLOCKERS: "Bloqueadores",
  COMBAT_DAMAGE: "Dano",
  COMBAT_END: "Combate: fim",
  MAIN2: "Principal 2",
  END: "Final",
  CLEANUP: "Limpeza",
};

export const PHASES: Phase[] = [
  "UNTAP",
  "UPKEEP",
  "DRAW",
  "MAIN1",
  "COMBAT_BEGIN",
  "ATTACKERS",
  "BLOCKERS",
  "COMBAT_DAMAGE",
  "COMBAT_END",
  "MAIN2",
  "END",
  "CLEANUP",
];

export interface CardIdentity {
  oracleCardId: number | null;
  printingId: number | null;
  customArtId: number | null;
  name: string;
  displayName: string | null;
  typeLine: string | null;
  manaCost: string | null;
  manaValue: number | null;
  oracleText: string | null;
  colorIdentity: string | null;
  imageSmall: string | null;
  imageNormal: string | null;
  imageLarge: string | null;
  isToken: boolean;
  tokenPt: string | null;
  tokenColors: string | null;
  hasBackFace: boolean;
  backName: string | null;
  backTypeLine: string | null;
  backManaCost: string | null;
  backOracleText: string | null;
  backImageSmall: string | null;
  backImageNormal: string | null;
  backImageLarge: string | null;
}

export interface GameCard {
  id: number;
  ownerUserId: number;
  controllerUserId: number;
  zone: Zone;
  position: number;
  x: number | null;
  y: number | null;
  tapped: boolean;
  faceDown: boolean;
  rotation: number;
  transformed: boolean;
  counters: Record<string, number>;
  identity: CardIdentity | null;
}

export interface GamePlayer {
  userId: number;
  username: string;
  seat: number;
  life: number;
  connected: boolean;
  status: "PLAYING" | "LOST" | "LEFT";
  commanderDamage: Record<string, number>;
  counters: Record<string, number>;
  libraryCount: number;
  handCount: number;
  graveyardCount: number;
  exileCount: number;
  commandCount: number;
  battlefieldCount: number;
}

export interface TurnView {
  turnNumber: number;
  activeSeat: number;
  phase: Phase;
  activeUserId: number | null;
}

export interface LogLine {
  sequence: number;
  line: string;
  at: string;
}

export interface GameSnapshot {
  gameId: number;
  roomCode: string | null;
  format: string;
  status: "ACTIVE" | "FINISHED" | "ABANDONED";
  meUserId: number;
  lastSequence: number;
  turn: TurnView;
  players: GamePlayer[];
  cards: GameCard[];
  log: LogLine[];
}

export interface GamePatch {
  sequence: number;
  cards: GameCard[];
  removed: number[];
  players: GamePlayer[];
  turn: TurnView | null;
  log: LogLine | null;
}

export interface ChatMessage {
  id: number;
  userId: number | null;
  username: string;
  body: string;
  kind: "USER" | "SYSTEM";
  at: string;
}

/** NOTICE enviado só ao ator: resultado de uma cascata ou descoberta. */
export interface CascadeNotice {
  kind: "CASCADE" | "DISCOVER";
  hitCardId?: number;
  hitName?: string;
  exiledCount: number;
}

/** NOTICE enviado só ao ator: cartas do topo do grimório reveladas p/ Scry/Surveil/Look. */
export interface LookTopNotice {
  kind: "LOOKTOP";
  mode: "scry" | "surveil" | "free";
  cardIds: number[];
}

export type GameNotice = CascadeNotice | LookTopNotice;

export type ServerEnvelope =
  | { type: "GAME_STATE"; data: GameSnapshot }
  | { type: "PATCH"; data: GamePatch }
  | { type: "CHAT"; data: ChatMessage }
  | { type: "PRESENCE"; data: unknown }
  | { type: "NOTICE"; data: GameNotice }
  | { type: "SEARCHING"; data: { userId: number; active: boolean } }
  | { type: "ERROR"; data: { message: string } };
