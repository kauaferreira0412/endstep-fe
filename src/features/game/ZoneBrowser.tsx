import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useHoverStore } from "@/stores/hoverStore";
import type { GameCard, Zone } from "@/types/game";

interface Props {
  zone: Zone;
  ownerUserId: number;
  onClose: () => void;
}

const ZONE_LABEL: Record<Zone, string> = {
  LIBRARY: "Grimório",
  HAND: "Mão",
  BATTLEFIELD: "Campo",
  GRAVEYARD: "Cemitério",
  EXILE: "Exílio",
  COMMAND: "Command zone",
  STACK: "Pilha",
};

export function ZoneBrowser({ zone, ownerUserId, onClose }: Props) {
  const s = useGameStore();
  const previewShow = useHoverStore((st) => st.show);
  const mine = ownerUserId === s.meUserId;
  const [q, setQ] = useState("");

  useEffect(() => {
    if (mine && zone === "LIBRARY") {
      s.setSearching(true);
      return () => s.setSearching(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine, zone]);

  const all = useMemo(() => {
    const list = Object.values(s.cards).filter((c) => c.zone === zone && c.ownerUserId === ownerUserId);
    list.sort((a, b) => a.position - b.position);
    return list;
  }, [s.cards, zone, ownerUserId]);

  const revealedCount = all.filter((c) => c.identity).length;
  const hiddenZone = zone === "LIBRARY" || zone === "HAND";
  // busca só faz sentido se dá pra ver alguma carta
  const canSearch = revealedCount > 0 || !hiddenZone;
  const opponentBlind = !mine && hiddenZone && revealedCount === 0;

  const cards = useMemo(() => {
    if (!q.trim()) return all;
    const needle = q.trim().toLowerCase();
    return all.filter((c) => (c.identity?.name ?? "").toLowerCase().includes(needle));
  }, [all, q]);

  function moveTo(card: GameCard, to: Zone, placement?: "TOP" | "BOTTOM") {
    if (to === "HAND" && card.zone === "LIBRARY") s.searchToHand(card.id);
    else s.moveCard(card.id, to, placement);
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="card flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-line/70 px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">
            {ZONE_LABEL[zone]}
            {!mine && <span className="ml-1 text-ink-faint">(oponente)</span>}
            <span className="ml-2 text-ink-faint">· {all.length}</span>
          </h2>
          <button className="text-xs text-ink-faint hover:text-ink" onClick={onClose}>
            fechar ✕
          </button>
        </div>

        {/* barra de ferramentas */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line/60 px-4 py-2.5">
          <input
            className="input min-w-[160px] flex-1 !py-1.5 text-xs"
            placeholder={canSearch ? "Buscar por nome…" : "Cartas ocultas"}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            disabled={!canSearch}
          />
          {mine && zone === "LIBRARY" && (
            <>
              <button className="btn btn-ghost !py-1 text-xs" onClick={() => s.peekLibrary(all.length)}>
                Revelar p/ mim
              </button>
              <button className="btn btn-ghost !py-1 text-xs" onClick={() => s.peekLibrary(5)}>
                Ver topo 5
              </button>
              <button className="btn btn-ghost !py-1 text-xs" onClick={() => s.shuffleLibrary()}>
                Embaralhar
              </button>
            </>
          )}
        </div>

        {/* grade */}
        {opponentBlind ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
            <span className="text-3xl opacity-40">◈</span>
            <p className="text-sm text-ink-dim">{all.length} cartas · ocultas</p>
            <p className="text-xs text-ink-faint">Você não pode ver o {ZONE_LABEL[zone].toLowerCase()} do oponente.</p>
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2.5 overflow-y-auto p-4">
            {cards.map((c) => {
              const img =
                c.identity?.imageNormal ?? c.identity?.imageLarge ?? c.identity?.imageSmall ?? null;
              return (
                <div key={c.id} className="group flex flex-col items-center gap-1">
                  <div className="relative w-full" style={{ aspectRatio: "488 / 680" }}>
                    {img ? (
                      <img
                        src={img}
                        alt={c.identity?.name ?? ""}
                        className="h-full w-full cursor-pointer rounded-md object-cover ring-1 ring-white/5"
                        onClick={(e) => {
                          if (e.altKey) previewShow(c);
                        }}
                        title="Alt+clique para ver de perto"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center rounded-md border border-line/60 bg-bg-elev">
                        <span className="text-xl text-ink-faint opacity-50">◈</span>
                      </div>
                    )}
                    {mine && (
                      <div className="absolute inset-x-0 bottom-0 hidden flex-col gap-px rounded-b-md bg-black/85 p-1 text-[10px] group-hover:flex">
                        <button className="text-ok hover:brightness-125" onClick={() => moveTo(c, "HAND")}>
                          → mão
                        </button>
                        {zone !== "BATTLEFIELD" && (
                          <button className="text-ink-dim hover:text-ink" onClick={() => moveTo(c, "BATTLEFIELD")}>
                            → campo
                          </button>
                        )}
                        {zone !== "GRAVEYARD" && (
                          <button className="text-ink-dim hover:text-ink" onClick={() => moveTo(c, "GRAVEYARD")}>
                            → cemitério
                          </button>
                        )}
                        {zone !== "EXILE" && (
                          <button className="text-ink-dim hover:text-ink" onClick={() => moveTo(c, "EXILE")}>
                            → exílio
                          </button>
                        )}
                        {zone !== "LIBRARY" && (
                          <button className="text-ink-dim hover:text-ink" onClick={() => moveTo(c, "LIBRARY", "TOP")}>
                            → topo grimório
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="w-full truncate text-center text-[10px] leading-tight text-ink-dim">
                    {c.identity?.displayName ?? c.identity?.name ?? "oculta"}
                  </span>
                </div>
              );
            })}
            {cards.length === 0 && (
              <p className="col-span-full py-10 text-center text-xs text-ink-faint">
                {q.trim()
                  ? "Nenhuma carta com esse nome."
                  : mine && zone === "LIBRARY"
                    ? "Grimório oculto — use “Revelar p/ mim” para ver e buscar."
                    : "vazio"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
