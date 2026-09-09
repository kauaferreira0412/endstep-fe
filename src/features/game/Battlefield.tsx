import { useRef } from "react";
import type { GameCard } from "@/types/game";
import { GameCardView } from "./GameCardView";

interface Props {
  cards: GameCard[];
  cardWidth: number;
  interactive: boolean;
  onContextMenu?: (e: React.MouseEvent, card: GameCard) => void;
  /** carta solta no campo (fração 0..1). O pai decide reposicionar ou trazer de outra zona. */
  onDropCard?: (cardId: number, x: number, y: number) => void;
  selectedId?: number | null;
  onSelect?: (card: GameCard) => void;
  /** deslocamento (pan) em px de tela aplicado à camada de cartas. */
  pan?: { x: number; y: number };
  /** arrastar o fundo => pedir pan (dx/dy em px de tela). */
  onPan?: (dx: number, dy: number) => void;
}

/**
 * Campo de batalha: SEMPRE ocupa 100% da área. As cartas são posicionadas por
 * x/y (fração 0..1); o "zoom" muda só o tamanho das cartas (cardWidth), nunca
 * o tamanho do campo. O pan desloca a camada de cartas.
 */
export function Battlefield({
  cards,
  cardWidth,
  interactive,
  onContextMenu,
  onDropCard,
  selectedId,
  onSelect,
  pan = { x: 0, y: 0 },
  onPan,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ x: number; y: number } | null>(null);

  function frac(e: { clientX: number; clientY: number }) {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: Math.max(0.02, Math.min(0.98, (e.clientX - r.left - pan.x) / r.width)),
      y: Math.max(0.03, Math.min(0.97, (e.clientY - r.top - pan.y) / r.height)),
    };
  }

  function onBgPointerDown(e: React.PointerEvent) {
    if (e.target !== e.currentTarget || !onPan) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    panRef.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!panRef.current || !onPan) return;
    onPan(e.clientX - panRef.current.x, e.clientY - panRef.current.y);
    panRef.current = { x: e.clientX, y: e.clientY };
  }
  function onPointerUp() {
    panRef.current = null;
  }

  return (
    <div
      ref={ref}
      className={`relative h-full w-full overflow-hidden rounded-lg border border-line bg-bg-elev/40 ${
        onPan ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      onPointerDown={onBgPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDragOver={(e) => onDropCard && e.preventDefault()}
      onDrop={(e) => {
        if (!onDropCard) return;
        const id = Number(e.dataTransfer.getData("text/card-id"));
        if (id) {
          const f = frac(e);
          onDropCard(id, f.x, f.y);
        }
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
      >
        {cards.map((c) => (
          <div
            key={c.id}
            className="pointer-events-auto absolute"
            style={{
              left: `${(c.x ?? 0.45) * 100}%`,
              top: `${(c.y ?? 0.5) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <GameCardView
              card={c}
              width={cardWidth}
              selected={selectedId === c.id}
              onContextMenu={onContextMenu}
              onClick={onSelect}
              onDragStart={
                interactive ? (e) => e.dataTransfer.setData("text/card-id", String(c.id)) : undefined
              }
            />
          </div>
        ))}
      </div>
      {cards.length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs text-ink-faint">
          campo vazio
        </div>
      )}
    </div>
  );
}
