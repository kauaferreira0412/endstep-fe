export interface CustomArt {
  id: number;
  oracleId: string | null;
  cardName: string;
  basePrintingId: number | null;
  label: string;
  displayName: string | null;
  overlayText: string | null;
  imageUrl: string;
  thumbUrl: string | null;
  artZoom: number;
  artOffsetX: number;
  artOffsetY: number;
  nameBar: boolean;
  textBar: boolean;
  createdAt: string | null;
}

/** Frações do frame moderno normal — DEVEM bater com ImageCompositor no backend. */
export const FRAME = {
  art: [0.066, 0.108, 0.868, 0.418] as const,
  name: [0.06, 0.052, 0.88, 0.055] as const,
  text: [0.062, 0.6, 0.876, 0.3] as const,
};

export interface CustomArtParams {
  label?: string;
  displayName?: string;
  overlayText?: string;
  nameBar: boolean;
  textBar: boolean;
  zoom: number;
  offsetX: number;
  offsetY: number;
}
