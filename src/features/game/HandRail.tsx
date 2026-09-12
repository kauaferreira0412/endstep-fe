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

const DRAG_THRESHOLD = 6;
const DRAG_OVER_CLASSES = ["outline", "outline-2", "outline-gold"];

interface DragState {
  cardId: number;
  img: string;
  startX: number;
  startY: number;
  active: boolean;
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
    playCard,
  } = useGameStore();
  const previewShow = useHoverStore((s) => s.show);
  const sorted = [...cards].sort((a, b) => a.position - b.position);
  const sortedRef = useRef(sorted);
  sortedRef.current = sorted;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const lastTargetRef = useRef<HTMLElement | null>(null);
  const suppressClickRef = useRef(false);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menuOpen]);

  // Arraste da mão feito na mão (pointer events), sem depender do drag-and-drop
  // nativo do HTML5 — em alguns navegadores (Edge/Chromium) esse arraste nativo
  // trava a aba inteira ao soltar uma carta da mão no campo (bug do navegador,
  // não de tamanho de mão). Isto substitui inteiramente aquele mecanismo.
  useEffect(() => {
    function clearHighlight() {
      if (lastTargetRef.current) {
        lastTargetRef.current.classList.remove(...DRAG_OVER_CLASSES);
        lastTargetRef.current = null;
      }
    }

    function endDrag() {
      clearHighlight();
      dragRef.current = null;
      if (ghostRef.current) ghostRef.current.style.display = "none";
    }

    function onMove(e: PointerEvent) {
      const d = dragRef.current;
      if (!d) return;
      if (!d.active) {
        if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < DRAG_THRESHOLD) return;
        d.active = true;
        suppressClickRef.current = true;
        if (ghostRef.current) {
          ghostRef.current.style.display = "block";
          ghostRef.current.style.backgroundImage = d.img ? `url(${d.img})` : "none";
        }
      }
      if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX}px`;
        ghostRef.current.style.top = `${e.clientY}px`;
      }
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target =
        (el?.closest("[data-hand-card-id]") as HTMLElement | null) ??
        (el?.closest('[data-battlefield-mine="true"]') as HTMLElement | null) ??
        null;
      if (target !== lastTargetRef.current) {
        clearHighlight();
        if (target) {
          target.classList.add(...DRAG_OVER_CLASSES);
          lastTargetRef.current = target;
        }
      }
    }

    function onUp(e: PointerEvent) {
      const d = dragRef.current;
      if (!d) return;
      if (d.active) {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const handTarget = el?.closest("[data-hand-card-id]") as HTMLElement | null;
        const bfTarget = el?.closest('[data-battlefield-mine="true"]') as HTMLElement | null;
        if (handTarget) {
          const targetId = Number(handTarget.dataset.handCardId);
          if (targetId && targetId !== d.cardId) {
            const ids = sortedRef.current.map((x) => x.id);
            const from = ids.indexOf(d.cardId);
            const to = ids.indexOf(targetId);
            if (from !== -1 && to !== -1) {
              const next = ids.slice();
              next.splice(from, 1);
              // arrastando pra direita: entra depois do alvo; pra esquerda: entra antes
              next.splice(to, 0, d.cardId);
              reorderHand(next);
            }
          }
        } else if (bfTarget) {
          const r = bfTarget.getBoundingClientRect();
          const x = Math.max(0.02, Math.min(0.98, (e.clientX - r.left) / r.width));
          const y = Math.max(0.03, Math.min(0.97, (e.clientY - r.top) / r.height));
          playCard(d.cardId, x, y);
        }
      }
      endDrag();
      setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }

    function onCancel() {
      endDrag();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [reorderHand, playCard]);

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
      <div
        ref={ghostRef}
        className="pointer-events-none fixed z-[100] hidden w-[90px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-cover bg-center opacity-90 shadow-2xl"
        style={{ aspectRatio: "488 / 680" }}
      />

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

      <div className="flex flex-1 items-end gap-1.5 overflow-x-auto pb-1">
        {sorted.length === 0 && <span className="py-8 text-xs text-ink-faint">mão vazia</span>}
        {sorted.map((c) => {
          const img =
            c.identity?.imageNormal ?? c.identity?.imageLarge ?? c.identity?.imageSmall ?? null;
          return (
            <img
              key={c.id}
              src={img ?? ""}
              alt={c.identity?.name ?? ""}
              draggable={false}
              data-hand-card-id={c.id}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                dragRef.current = {
                  cardId: c.id,
                  img: img ?? "",
                  startX: e.clientX,
                  startY: e.clientY,
                  active: false,
                };
              }}
              onClick={(e) => {
                if (suppressClickRef.current) return;
                if (e.altKey) {
                  e.preventDefault();
                  e.stopPropagation();
                  previewShow(c);
                } else {
                  onSelect(c);
                }
              }}
              onContextMenu={(e) => onContextMenu(e, c)}
              className={`h-[132px] shrink-0 cursor-grab select-none rounded-md object-contain transition-transform hover:-translate-y-2 ${
                selectedId === c.id ? "-translate-y-2 ring-2 ring-brand" : ""
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
