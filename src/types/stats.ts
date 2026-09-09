export interface StatEntry {
  oracleId: string;
  name: string;
  games: number;
  image: string | null;
}

export interface RecentSet {
  code: string;
  name: string;
  releasedAt: string | null;
  iconSvgUri: string | null;
}

export interface HomeStats {
  overview: {
    cards: number;
    printings: number;
    games: number;
    decks: number;
    players: number;
    seatsPlayed: number;
    lastSync: string | null;
  };
  topCommanders: StatEntry[];
  topCards: StatEntry[];
  recentSets: RecentSet[];
  generatedAt: string;
}
