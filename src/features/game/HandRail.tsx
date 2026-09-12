import { useEffect, useRef, useState } from "react";
import type { GameCard } from "@/types/game";
import { dialog } from "@/stores/dialogStore";
import { useGameStore } from "@/stores/gameStore";
import { useHoverStore } from "@/stores/hoverStore";

interface Props {
  cards: GameCard[];
  onContextMenu: (e: React.MouseEvent, card: GameCard) => void;
  selectedId: number | null;
  onSelect: (card: GameCard) => void;
}

export function HandRail({ cards, onContextMenu, selectedId, onSelect }: Props) {
  const {
    draw,
    drawHand,
    mulligan,
    cascade,
    discover,
    mill,
    scry,
    surveil,
    setTokenModalOpen,
    setAddCardModalOpen,
    reorderHand,
    untapAll,
    passTurn,
  } = useGameStore();
  const previewShow = useHoverStore((s) => s.show);
  const sorted = [...cards].sort((a, b) => a.position - b.position);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const DRAG_OVER_CLASSES = ["outline", "outline-2", "outline-gold"];
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menuOpen]);

  // o auto-scroll nativo do navegador durante um drag em cima de um container
  // com overflow-x pode travar a aba inteira (bug conhecido do Chromium com
  // muitos elementos). Desliga o scroll enquanto qualquer carta esta sendo
  // arrastada e volta a ligar assim que o drag termina.
  useEffect(() => {
    function disableScroll() {
      rowRef.current?.classList.remove("overflow-x-auto");
      rowRef.current?.classList.add("overflow-x-hidden");
    }
    function enableScroll() {
      rowRef.current?.classList.remove("overflow-x-hidden");
      rowRef.current?.classList.add("overflow-x-auto");
    }
    document.addEventListener("dragstart", disableScroll);
    document.addEventListener("dragend", enableScroll);
    document.addEventListener("drop", enableScroll);
    return () => {
      document.removeEventListener("dragstart", disableScroll);
      document.removeEventListener("dragend", enableScroll);
      document.removeEventListener("drop", enableScroll);
    };
  }, []);

  async function askNumber(title: string, message: string, def: string) {
    const v = await dialog.prompt({ title, message, defaultValue: def, placeholder: `ex.: ${def}` });
    const n = Number(v);
    return v != null && v.trim() !== "" && !Number.isNaN(n) && n > 0 ? n : null;
  }

  async function run(fn: (n: number) => void, title: string, message: string, def: string) {
    setMenuOpen(false);
    const n = await askNumber(title, message, def);
    if (n != null) fn(n);
  }

  return (
    <div className="flex h-full items-end gap-3 border-t border-line bg-bg/90 px-4 pb-2 pt-1 backdrop-blur">
      <div className="relative flex shrink-0 flex-col gap-1" ref={menuRef}>
        <button className="btn btn-ghost !px-2 !py-0.5 text-xs" onClick={() => draw(1)}>
          Comprar 1
        </button>
        <button className="btn btn-ghost !px-2 !py-0.5 text-xs" onClick={() => drawHand(7)}>
          Mão inicial (7)
        </button>
        <button className="btn btn-ghost !px-2 !py-0.5 text-xs" onClick={() => mulligan()}>
          Mulligan
        </button>
        <button
          className="btn btn-ghost !px-2 !py-0.5 text-xs"
          onClick={() => setMenuOpen((o) => !o)}
        >
          Ações ▾
        </button>
        <span className="text-center text-[10px] text-ink-faint">{sorted.length} na mão</span>

        {menuOpen && (
          <div className="absolute bottom-full left-0 z-[90] mb-1 w-44 rounded-lg border border-line bg-bg-elev p-1 shadow-xl">
            {[
              ["Cascata", () => run((n) => cascade({ maxMv: n }), "Cascata", "VM da magia com cascata (exila até achar não-terreno com VM menor):", "3")],
              ["Descobrir N", () => run((n) => discover(n), "Descobrir", "Valor N da descoberta (exila até achar não-terreno com VM ≤ N):", "3")],
              ["Scry N", () => run((n) => scry(n), "Scry", "Quantas cartas do topo olhar (mandar cada uma p/ topo ou fundo):", "1")],
              ["Surveil N", () => run((n) => surveil(n), "Surveil", "Quantas cartas do topo olhar (mandar cada uma p/ topo ou cemitério):", "1")],
              ["Moer (mill) N", () => run((n) => mill(n), "Moer", "Quantas cartas do topo do grimório vão pro cemitério:", "1")],
            ].map(([label, onClick]) => (
              <button
                key={label as string}
                className="block w-full rounded px-2 py-1.5 text-left text-xs text-ink hover:bg-brand-soft"
                onClick={onClick as () => void}
              >
                {label as string}
              </button>
            ))}
            <div className="my-1 border-t border-line-soft" />
            <button
              className="block w-full rounded px-2 py-1.5 text-left text-xs text-ink hover:bg-brand-soft"
              onClick={() => {
                setMenuOpen(false);
                setTokenModalOpen(true);
              }}
            >
              Criar ficha…
            </button>
            <button
              className="block w-full rounded px-2 py-1.5 text-left text-xs text-ink hover:bg-brand-soft"
              onClick={() => {
                setMenuOpen(false);
                setAddCardModalOpen(true);
              }}
            >
              Adicionar carta (do banco)…
            </button>
          </div>
        )}
      </div>

      <div ref={rowRef} className="flex flex-1 items-end gap-1.5 overflow-x-auto pb-1">
        {sorted.length === 0 && <span className="py-8 text-xs text-ink-faint">mão vazia</span>}
        {sorted.map((c) => {
          const img =
            c.identity?.imageNormal ?? c.identity?.imageLarge ?? c.identity?.imageSmall ?? null;
          return (
            <img
              key={c.id}
              src={img ?? ""}
              alt={c.identity?.name ?? ""}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/card-id", String(c.id))}
              onClick={(e) => {
                if (e.altKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  previewShow(c);
                } else {
                  onSelect(c);
                }
              }}
              onContextMenu={(e) => onContextMenu(e, c)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={(e) => e.currentTarget.classList.add(...DRAG_OVER_CLASSES)}
              onDragLeave={(e) => e.currentTarget.classList.remove(...DRAG_OVER_CLASSES)}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(...DRAG_OVER_CLASSES);
                const draggedId = Number(e.dataTransfer.getData("text/card-id"));
                if (!draggedId || draggedId === c.id) return;
                const ids = sorted.map((x) => x.id);
                const from = ids.indexOf(draggedId);
                const to = ids.indexOf(c.id);
                if (from === -1 || to === -1) return;
                const next = ids.slice();
                next.splice(from, 1);
                // arrastando pra direita: entra depois do alvo; pra esquerda: entra antes
                next.splice(to, 0, draggedId);
                reorderHand(next);
              }}
              className={`h-[132px] shrink-0 cursor-grab rounded-md object-contain transition-transform hover:-translate-y-2 ${
                selectedId === c.id ? "-translate-y-2 ring-2 ring-brand" : ""
              }`}
            />
          );
        })}
      </div>

      <div className="flex shrink-0 flex-col gap-1 self-center">
        <button
          className="btn btn-ghost !py-1 text-[11px]"
          onClick={untapAll}
          title="Desvirar todas as suas cartas"
        >
          ⟳ Desvirar tudo
        </button>
        <button className="btn btn-primary !py-1 text-[11px]" onClick={passTurn} title="Passar o turno">
          ⏭ Passar turno
        </button>
      </div>
    </div>
  );
}
