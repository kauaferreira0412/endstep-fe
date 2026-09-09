import { useState } from "react";
import { FRAME } from "@/types/customArt";

const CARD_AR = 488 / 680; // largura / altura da carta

interface Props {
  baseImageUrl: string;
  artUrl?: string | null;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  nameBar?: boolean;
  textBar?: boolean;
  displayName?: string;
  overlayText?: string;
  className?: string;
}

function pct(frac: readonly number[]) {
  return {
    left: `${frac[0] * 100}%`,
    top: `${frac[1] * 100}%`,
    width: `${frac[2] * 100}%`,
    height: `${frac[3] * 100}%`,
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/** Preview "carta com molde": imagem real + arte do usuário na janela + faixas opcionais. */
export function CardFrame({
  baseImageUrl,
  artUrl,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
  nameBar = false,
  textBar = false,
  displayName,
  overlayText,
  className = "",
}: Props) {
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);

  // Espelha exatamente o ImageCompositor do backend: escala "cover" (nunca < 1),
  // deslocamento em fração da janela e travado nas bordas (a arte do usuário
  // jamais deixa aparecer a arte original por baixo).
  let artStyle: React.CSSProperties | null = null;
  if (artUrl && nat) {
    const [, , fw, fh] = FRAME.art;
    const winAR = (fw / fh) * CARD_AR; // largura/altura da janela de arte, em px
    const natAR = nat.w / nat.h;
    // dimensões da arte relativas à janela, no "cover" base
    let relW = natAR >= winAR ? natAR / winAR : 1;
    let relH = natAR >= winAR ? 1 : winAR / natAR;
    const s = clamp(zoom, 1, 6);
    relW *= s;
    relH *= s;
    let left = (1 - relW) / 2 + clamp(offsetX, -1, 1);
    let top = (1 - relH) / 2 + clamp(offsetY, -1, 1);
    left = clamp(left, 1 - relW, 0);
    top = clamp(top, 1 - relH, 0);
    artStyle = {
      position: "absolute",
      left: `${left * 100}%`,
      top: `${top * 100}%`,
      width: `${relW * 100}%`,
      height: `${relH * 100}%`,
      objectFit: "fill",
    };
  }

  return (
    <div className={`relative aspect-[488/680] w-full select-none ${className}`}>
      <img src={baseImageUrl} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />

      {artUrl && (
        <div className="absolute overflow-hidden bg-black" style={pct(FRAME.art)}>
          <img
            src={artUrl}
            alt=""
            draggable={false}
            onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            className={artStyle ? "" : "h-full w-full object-cover"}
            style={artStyle ?? undefined}
          />
        </div>
      )}

      {nameBar && displayName && (
        <div
          className="absolute flex items-center justify-center rounded-[3px] px-2 text-center text-[13px] font-bold leading-none text-[#141210]"
          style={{ ...pct(FRAME.name), background: "rgba(232,224,208,0.94)" }}
        >
          <span className="truncate">{displayName}</span>
        </div>
      )}

      {textBar && overlayText && (
        <div
          className="absolute overflow-hidden whitespace-pre-wrap rounded-[4px] px-1.5 py-1 text-[9px] leading-tight text-[#141210]"
          style={{ ...pct(FRAME.text), background: "rgba(240,236,228,0.94)" }}
        >
          {overlayText}
        </div>
      )}
    </div>
  );
}
