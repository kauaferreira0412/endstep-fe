export interface Format {
  code: string;
  name: string;
  minDeck: number | null;
  maxDeck: number | null;
  maxCopies: number;
  singleton: boolean;
  usesCommandZone: boolean;
  defaultLife: number;
  enforceColorIdentity: boolean;
  sideboardMax: number;
}

export interface Folder {
  id: number;
  parentId: number | null;
  name: string;
  position: number;
  deckCount: number;
  createdAt: string | null;
}

export interface DeckSummary {
  id: number;
  folderId: number | null;
  name: string;
  format: string;
  visibility: string;
  colorIdentity: string;
  favorite: boolean;
  position: number;
  cardCount: number;
  updatedAt: string | null;
}

export type Section = "COMMANDER" | "MAINBOARD" | "SIDEBOARD" | "MAYBEBOARD";

export interface DeckCardView {
  oracleId: string;
  name: string;
  displayName: string | null;
  manaCost: string | null;
  manaValue: number | null;
  typeLine: string | null;
  colorIdentity: string | null;
  oracleText: string | null;
  section: Section;
  quantity: number;
  printingId: number | null;
  customArtId: number | null;
  imageSmall: string | null;
  imageNormal: string | null;
  imageLarge: string | null;
  formatStatus: string | null;
  commanderStatus: string | null;
}

export interface CurvePoint {
  manaValue: number;
  count: number;
}

export interface DeckStats {
  total: number;
  mainboardCount: number;
  lands: number;
  nonlands: number;
  curve: CurvePoint[];
  colors: Record<string, number>;
  types: Record<string, number>;
}

export type IssueLevel = "ERROR" | "WARNING";

export interface ValidationIssue {
  level: IssueLevel;
  code: string;
  message: string;
  cards: string[];
}

export interface ValidationResult {
  format: string;
  legal: boolean;
  deckSize: number;
  commanderCount: number;
  colorIdentity: string;
  issues: ValidationIssue[];
}

export interface DeckDetail {
  id: number;
  folderId: number | null;
  folderPath: string[];
  name: string;
  format: string;
  description: string | null;
  visibility: string;
  colorIdentity: string;
  favorite: boolean;
  formatRules: Format;
  cards: DeckCardView[];
  stats: DeckStats;
  validation: ValidationResult;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DeckCardChange {
  oracleId: string;
  section: Section;
  quantity: number;
  printingId?: number | null;
}

export interface ImportResult {
  deckId: number;
  importedLines: number;
  importedCards: number;
  notFound: string[];
  ambiguous: string[];
}
