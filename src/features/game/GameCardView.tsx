import type { CSSProperties } from "react";
import { useHoverStore } from "@/stores/hoverStore";
import type { GameCard } from "@/types/game";

const CARD_BACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 340">
       <rect width="244" height="340" rx="16" fill="#1a1420"/>
       <rect x="12" y="12" width="220" height="316" rx="10" fill="none" stroke="#4b3b63" stroke-width="6"/>
       <circle cx="122" cy="170" r="52" fill="none" stroke="#6b5891" stroke-width="6"/>
       <text x="122" y="182" font-family="Georgia, serif" font-size="30" fill="#8f79bd" text-anchor="middle">E</text>
     </svg>`,
  );

/** cor de borda por identidade de cor da ficha (WUBRG); multicolor = dourado. */
function tintFor(colors: string): string {
  const c = (colors || "").toUpperCase().replace(/[^WUBRG]/g, "");
  if (c.length > 1) return "#f0c869";
  const map: Record<string, string> = {
    W: "#e9e3c8",
    U: "#4f9fe0",
    B: "#6b5b8a",
    R: "#e0623f",
    G: "#4fae6a",
  };
  return map[c] ?? "#7d78a2";
}

interface Props {
  card: GameCard;
  width: number;
  onContextMenu?: (e: React.MouseEvent, card: GameCard) => void;
  onClick?: (card: GameCard) => void;
  onPointerDown?: (e: React.PointerEvent, card: GameCard) => void;
  onDragStart?: (e: React.DragEvent, card: GameCard) => void;
  style?: CSSProperties;
  selected?: boolean;
}

/** Uma carta na mesa. Alt+clique abre o preview grande (CardPreview). */
export function GameCardView({
  card,
  width,
  onContextMenu,
  onClick,
  onPointerDown,
  onDragStart,
  style,
  selected,
}: Props) {
  const img = card.identity?.imageNormal ?? card.identity?.imageLarge ?? card.identity?.imageSmall ?? null;
  const isToken = !!card.identity?.isToken;
  const show = !card.faceDown && img;
  const showTokenCard = !card.faceDown && !img && isToken;
  const rot = (card.tapped ? 90 : 0) + (card.rotation || 0);
  const counters = Object.entries(card.counters ?? {}).filter(([, v]) => v);

  const tokenBorder = tintFor(card.identity?.tokenColors ?? card.identity?.colorIdentity ?? "");

  const previewShow = useHoverStore((s) => s.show);

  function handleClick(e: React.MouseEvent) {
    if (e.altKey) {
      e.preventDefault();
      e.stopPropagation();
      previewShow(card);
      return;
    }
    onClick?.(card);
  }

  return (
    <div
      className={`group relative select-none rounded-[4.5%] shadow-md transition-transform hover:z-10 ${
        selected ? "ring-2 ring-brand" : ""
      }`}
      style={{ width, aspectRatio: "488 / 680", transform: `rotate(${rot}deg)`, ...style }}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, card)}
      onContextMenu={(e) => onContextMenu?.(e, card)}
      onClick={handleClick}
      onPointerDown={(e) => onPointerDown?.(e, card)}
      title={card.identity?.displayName ?? card.identity?.name ?? "Carta"}
    >
      {showTokenCard ? (
        <div
          className="flex h-full w-full flex-col items-center justify-between rounded-[4.5%] border-2 bg-gradient-to-b from-bg-elev to-bg-soft p-1.5 text-center"
          style={{ borderColor: tokenBorder }}
        >
          <span className="rounded bg-black/60 px-1 text-[8px] font-bold uppercase tracking-wide text-gold">
            ficha
          </span>
          <span className="line-clamp-3 text-[10px] font-semibold leading-tight text-ink">
            {card.identity?.name}
          </span>
          <span className="text-[11px] font-bold text-ink-dim">
            {card.identity?.tokenPt ?? ""}
          </span>
        </div>
      ) : (
        <img
          src={show ? (img as string) : CARD_BACK}
          alt=""
          draggable={false}
          className="h-full w-full rounded-[4.5%] object-cover"
        />
      )}
      {counters.length > 0 && (
        <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
          {counters.map(([k, v]) => (
            <span
              key={k}
              className="rounded bg-black/80 px-1 text-[9px] font-bold leading-tight text-white"
              title={k}
            >
              {v}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
