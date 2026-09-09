export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CardSummary {
  oracleId: string;
  name: string;
  manaCost: string | null;
  manaValue: number | null;
  typeLine: string | null;
  colorIdentity: string | null;
  printingCount: number;
  representativePrintingId: number | null;
  setCode: string | null;
  imageSmall: string | null;
  imageNormal: string | null;
}

export interface PrintingView {
  id: number;
  scryfallId: string;
  setCode: string | null;
  setName: string | null;
  collectorNumber: string | null;
  rarity: string | null;
  artist: string | null;
  lang: string | null;
  releasedAt: string | null;
  imageSmall: string | null;
  imageNormal: string | null;
  imageLarge: string | null;
  imagePng: string | null;
  scryfallUri: string | null;
}

export interface FaceView {
  faceIndex: number;
  name: string;
  manaCost: string | null;
  typeLine: string | null;
  oracleText: string | null;
  imageNormal: string | null;
  imageLarge: string | null;
}

export interface LegalityView {
  format: string;
  status: string;
}

export interface RulingView {
  publishedAt: string | null;
  comment: string;
}

export interface CardDetail {
  oracleId: string;
  name: string;
  manaCost: string | null;
  manaValue: number | null;
  typeLine: string | null;
  oracleText: string | null;
  colors: string | null;
  colorIdentity: string | null;
  power: string | null;
  toughness: string | null;
  loyalty: string | null;
  keywords: string | null;
  layout: string | null;
  legalities: LegalityView[];
  rulings: RulingView[];
  printings: PrintingView[];
  faces: FaceView[];
}

export interface CardTranslation {
  oracleCardId: number;
  oracleId: string;
  lang: string;
  name: string | null;
  typeLine: string | null;
  oracleText: string | null;
  /** "scryfall" (impressão oficial), "google" (tradução de máquina) ou "none". */
  source: "scryfall" | "google" | "none";
}

export interface CardSyncRun {
  id: number;
  source: string;
  bulkType: string | null;
  status: "RUNNING" | "COMPLETED" | "FAILED" | string;
  startedAt: string | null;
  finishedAt: string | null;
  downloadBytes: number | null;
  totalProcessed: number;
  insertedCount: number;
  updatedCount: number;
  errorCount: number;
  message: string | null;
}

export interface SyncLogLine {
  seq: number;
  at: string;
  level: string;
  message: string;
}

export interface SyncLogResponse {
  lastSeq: number;
  lines: SyncLogLine[];
}
