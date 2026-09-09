import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { dialog } from "@/stores/dialogStore";
import { useGameStore } from "@/stores/gameStore";
import type { GameCard, Zone } from "@/types/game";

interface Props {
  x: number;
  y: number;
  card: GameCard;
  onClose: () => void;
}

const MOVES: { label: string; zone: Zone; placement?: "TOP" | "BOTTOM" }[] = [
  { label: "→ Campo de batalha", zone: "BATTLEFIELD" },
  { label: "→ Mão", zone: "HAND" },
  { label: "→ Cemitério", zone: "GRAVEYARD" },
  { label: "→ Exílio", zone: "EXILE" },
  { label: "→ Command zone", zone: "COMMAND" },
  { label: "→ Topo do grimório", zone: "LIBRARY", placement: "TOP" },
  { label: "→ Fundo do grimório", zone: "LIBRARY", placement: "BOTTOM" },
  { label: "→ Pilha (stack)", zone: "STACK" },
];

const MARGIN = 8;

export function CardContextMenu({ x, y, card, onClose }: Props) {
  const s = useGameStore();
  const mine = card.ownerUserId === s.meUserId || card.controllerUserId === s.meUserId;

  const ref = useRef<HTMLDivElement>(null);
  // posiciona no clique; depois de medir, encaixa 100% dentro da janela
  const [pos, setPos] = useState<{ left: number; top: number; maxHeight: number; ready: boolean }>({
    left: x,
    top: y,
    maxHeight: window.innerHeight - MARGIN * 2,
    ready: false,
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = el.offsetWidth;
    const maxHeight = vh - MARGIN * 2;
    const h = Math.min(el.scrollHeight, maxHeight);
    // prefere abrir para baixo/direita a partir do clique; se não couber, empurra pra dentro
    const left = Math.max(MARGIN, Math.min(x, vw - w - MARGIN));
    const top = Math.max(MARGIN, Math.min(y, vh - h - MARGIN));
    setPos({ left, top, maxHeight, ready: true });
  }, [x, y, card.id, mine]);

  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("click", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", close);
    };
  }, [onClose]);

  function act(fn: () => void) {
    fn();
    onClose();
  }

  const Item = ({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) => (
    <button
      className={`block w-full rounded px-2.5 py-1.5 text-left text-xs hover:bg-bg ${
        danger ? "text-danger" : "text-ink-dim hover:text-ink"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      ref={ref}
      className="fixed z-[60] w-52 overflow-y-auto rounded-lg border border-line bg-bg-elev p-1 shadow-pop"
      style={{
        left: pos.left,
        top: pos.top,
        maxHeight: pos.maxHeight,
        visibility: pos.ready ? "visible" : "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {!mine ? (
        <div className="px-2.5 py-2 text-xs text-ink-faint">Carta de outro jogador</div>
      ) : (
        <>
          <Item label={card.tapped ? "Desvirar" : "Virar (tap)"} onClick={() => act(() => s.setTapped(card.id, !card.tapped))} />
          <Item label="Girar 180°" onClick={() => act(() => s.rotate(card.id, (card.rotation || 0) + 180))} />
          <Item
            label={card.faceDown ? "Virar para cima" : "Virar para baixo"}
            onClick={() => act(() => s.setFaceDown(card.id, !card.faceDown))}
          />
          <div className="my-1 h-px bg-line" />
          <Item label="+1  marcador +1/+1" onClick={() => act(() => s.cardCounter(card.id, "+1/+1", 1))} />
          <Item label="−1  marcador +1/+1" onClick={() => act(() => s.cardCounter(card.id, "+1/+1", -1))} />
          <Item label="+1  marcador −1/−1" onClick={() => act(() => s.cardCounter(card.id, "-1/-1", 1))} />
          <Item label="+1  lealdade" onClick={() => act(() => s.cardCounter(card.id, "loyalty", 1))} />
          <Item label="−1  lealdade" onClick={() => act(() => s.cardCounter(card.id, "loyalty", -1))} />
          <Item label="+1  atordoamento (stun)" onClick={() => act(() => s.cardCounter(card.id, "stun", 1))} />
          <Item
            label="Marcador personalizado…"
            onClick={() => {
              onClose();
              void dialog
                .prompt({
                  title: "Marcador personalizado",
                  message: "Nome do marcador (ex.: loyalty, charge):",
                  defaultValue: "loyalty",
                })
                .then((kind) => {
                  if (kind && kind.trim()) s.cardCounter(card.id, kind.trim(), 1);
                });
            }}
          />
          <div className="my-1 h-px bg-line" />
          {MOVES.map((m) => (
            <Item
              key={m.label}
              label={m.label}
              onClick={() => act(() => s.moveCard(card.id, m.zone, m.placement))}
            />
          ))}
          {card.zone === "BATTLEFIELD" && (
            <>
              <div className="my-1 h-px bg-line" />
              <Item label="Copiar (cria ficha)" onClick={() => act(() => s.copyCard(card.id, 1))} />
              {card.identity?.isToken && (
                <Item
                  label="Remover ficha"
                  danger
                  onClick={() => act(() => s.moveCard(card.id, "EXILE"))}
                />
              )}
            </>
          )}
          <div className="my-1 h-px bg-line" />
          <Item label="Revelar a todos" onClick={() => act(() => s.revealCard(card.id))} />
          <Item label="Esconder" onClick={() => act(() => s.hideCard(card.id))} />
          <div className="my-1 h-px bg-line" />
          <Item
            label={
              card.identity?.manaValue != null
                ? `Cascata (VM < ${card.identity.manaValue})`
                : "Cascata (a partir desta carta)"
            }
            onClick={() => act(() => s.cascade({ cardId: card.id }))}
          />
        </>
      )}
    </div>
  );
}
