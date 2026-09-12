import { useEffect, useRef } from "react";
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
  onSelect?: (card: GameCard, e: React.MouseEvent) => void;
  multiSelected?: Set<number>;
  /** deslocamento (pan) em px de tela aplicado à camada de cartas. */
  pan?: { x: number; y: number };
  /** arrastar o fundo => pedir pan (dx/dy em px de tela). */
  onPan?: (dx: number, dy: number) => void;
}

/**
 * Campo de batalha: SEMPRE ocupa 100% da área, de ponta a ponta, em qualquer
 * zoom (o mapeamento de fração 0..1 pro pixel nunca muda com o zoom — só o
 * tamanho da carta muda). Isso garante que dá pra soltar uma carta em
 * qualquer canto do campo, mesmo com zoom bem baixo ou bem alto.
 */
export function Battlefield({
  cards,
  cardWidth,
  interactive,
  onContextMenu,
  onDropCard,
  selectedId,
  onSelect,
  multiSelected,
  pan = { x: 0, y: 0 },
  onPan,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ x: number; y: number } | null>(null);

  // expõe o onPan no próprio elemento DOM, pra que o arraste vindo de fora
  // (ex.: HandRail, que acha este elemento via elementsFromPoint) também
  // consiga fazer auto-pan nas bordas ao soltar uma carta ali.
  useEffect(() => {
    if (ref.current) (ref.current as unknown as { __endstepOnPan?: typeof onPan }).__endstepOnPan = onPan;
  }, [onPan]);

  function frac(e: { clientX: number; clientY: number }) {
    const r = ref.current!.getBoundingClientRect();
    return {
      x: Math.max(0.02, Math.min(0.98, (e.clientX - r.left - pan.x) / r.width)),
      y: Math.max(0.03, Math.min(0.97, (e.clientY - r.top - pan.y) / r.height)),
    };
  }

  const EDGE_ZONE = 44;
  const EDGE_PAN_SPEED = 16;

  function onFieldDragOver(e: React.DragEvent) {
    if (!onDropCard) return;
    e.preventDefault();
    if (!onPan || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    let dx = 0;
    let dy = 0;
    if (e.clientX - r.left < EDGE_ZONE) dx = EDGE_PAN_SPEED;
    else if (r.right - e.clientX < EDGE_ZONE) dx = -EDGE_PAN_SPEED;
    if (e.clientY - r.top < EDGE_ZONE) dy = EDGE_PAN_SPEED;
    else if (r.bottom - e.clientY < EDGE_ZONE) dy = -EDGE_PAN_SPEED;
    if (dx || dy) onPan(dx, dy);
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
      data-battlefield-mine={interactive ? "true" : undefined}
      data-pan-x={pan.x}
      data-pan-y={pan.y}
      className={`relative h-full w-full overflow-hidden rounded-lg border border-line bg-bg-elev/40 ${
        onPan ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      onPointerDown={onBgPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDragOver={onFieldDragOver}
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
              multiSelected={multiSelected?.has(c.id)}
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
