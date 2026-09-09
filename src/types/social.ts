export interface Friend {
  userId: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  status: string;
  since: string | null;
}

export type SuggestionStatus = "NEW" | "IMPORTED" | "DISMISSED";

export interface DeckSuggestion {
  id: number;
  fromUserId: number;
  fromUsername: string;
  fromDisplayName: string;
  deckName: string;
  format: string;
  message: string | null;
  cardCount: number;
  status: SuggestionStatus;
  importedDeckId: number | null;
  createdAt: string | null;
}

export interface SuggestionCardLine {
  name: string;
  typeLine: string | null;
  manaCost: string | null;
  section: string;
  quantity: number;
}
