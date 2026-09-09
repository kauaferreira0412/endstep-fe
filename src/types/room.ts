export interface RoomPlayer {
  userId: number;
  username: string;
  role: "PLAYER" | "SPECTATOR";
  deckId: number | null;
  deckName: string | null;
  seat: number | null;
  status: "JOINED" | "READY" | "LEFT";
  isHost: boolean;
}

export interface Room {
  id: number;
  code: string;
  name: string;
  format: string;
  maxPlayers: number;
  hasPassword: boolean;
  visibility: "PRIVATE" | "PUBLIC";
  allowSpectators: boolean;
  status: "OPEN" | "IN_GAME" | "CLOSED";
  hostUserId: number;
  currentGameId: number | null;
  players: RoomPlayer[];
  createdAt: string;
}

export interface RoomSummary {
  code: string;
  name: string;
  format: string;
  players: number;
  maxPlayers: number;
  hasPassword: boolean;
  status: string;
}

export interface CreateRoomInput {
  name: string;
  format: string;
  maxPlayers: number;
  allowSpectators: boolean;
  isPublic: boolean;
  password?: string;
}
