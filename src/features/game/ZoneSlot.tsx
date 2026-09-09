import { useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useHoverStore } from "@/stores/hoverStore";
import type { GameCard, Zone } from "@/types/game";
import { ZoneIcon } from "./ZoneIcon";

interface Props {
  zone: Zone;
  label: string;
  cards: GameCard[];
  mine: boolean;
  /** coluna larga (modo foco): mostra o nome da zona e ícone maior. */
  big?: boolean;
  onOpen: () => void;
}

/** Espaço de uma zona-pilha na coluna ao lado do campo, no tamanho de uma carta. Aceita drag/drop. */
export function ZoneSlot({ zone, label, cards, mine, big, onOpen }: Props) {
  const s = useGameStore();
  const previewShow = useHoverStore((st) => st.show);
  const [over, setOver] = useState(false);

  const sorted = [...cards].sort((a, b) => a.position - b.position);
  const top = zone === "LIBRARY" ? null : sorted[sorted.length - 1];
  const topImg =
    top?.identity?.imageNormal ?? top?.identity?.imageLarge ?? top?.identity?.imageSmall ?? null;

  function onDrop(e: React.DragEvent) {
    setOver(false);
    if (!mine) return;
    const id = Number(e.dataTransfer.getData("text/card-id"));
    if (!id) return;
    e.preventDefault();
    s.moveCard(id, zone, zone === "LIBRARY" ? "TOP" : undefined);
  }

  return (
    <div
      className={`flex shrink-0 flex-col overflow-hidden rounded-lg border transition ${
        over ? "border-brand bg-brand/15" : "border-line/60 bg-bg-elev/40"
      }`}
      onDragOver={(e) => {
        if (mine) {
          e.preventDefault();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      {/* cabeçalho: ícone da zona + nome + contador */}
      <div className="flex items-center gap-1.5 px-1.5 py-1 text-ink-dim">
        <span className="text-brand" title={label}>
          <ZoneIcon zone={zone} size={big ? 16 : 14} />
        </span>
        <span className="flex-1 truncate text-[10px] uppercase tracking-wide">{label}</span>
        <span className="ml-auto text-[11px] font-bold leading-none text-ink">{sorted.length}</span>
      </div>

      {/* corpo: carta do topo (ou verso / marca d'água da zona), no formato de carta */}
      <button
        onClick={onOpen}
        className="relative w-full overflow-hidden bg-bg-input/50"
        style={{ aspectRatio: "488 / 680" }}
        title={`${label} — abrir`}
      >
        {top && topImg ? (
          <img
            src={topImg}
            alt={top.identity?.name ?? ""}
            draggable={mine}
            onDragStart={(e) => e.dataTransfer.setData("text/card-id", String(top.id))}
            onClick={(e) => {
              if (e.altKey) {
                e.stopPropagation();
                previewShow(top);
              }
            }}
            className="h-full w-full object-contain"
          />
        ) : sorted.length > 0 && zone === "LIBRARY" ? (
          <div
            draggable={mine}
            onDragStart={(e) => e.dataTransfer.setData("text/card-id", String(sorted[0].id))}
            className="grid h-full w-full place-items-center bg-bg-elev/60 text-ink-faint"
          >
            <ZoneIcon zone={zone} size={34} />
          </div>
        ) : (
          <div className="grid h-full w-full place-items-center text-line">
            <ZoneIcon zone={zone} size={34} />
          </div>
        )}
      </button>
    </div>
  );
}
