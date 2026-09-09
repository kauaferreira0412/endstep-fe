import { useMemo, useState } from "react";
import { useGameStore } from "@/stores/gameStore";

type Dest = "TOP" | "BOTTOM" | "GRAVEYARD";

const TITLE: Record<string, string> = {
  scry: "Scry",
  surveil: "Surveil",
  free: "Olhar o topo",
};

/** Scry/Surveil/Look: mostra as cartas reveladas do topo e coleta o destino de cada uma. */
export function LookTopModal() {
  const look = useGameStore((s) => s.lookTop);
  const cards = useGameStore((s) => s.cards);
  const resolve = useGameStore((s) => s.lookTopResolve);
  const clear = useGameStore((s) => s.clearLookTop);

  const options: { dest: Dest; label: string }[] = useMemo(() => {
    if (look?.mode === "scry") {
      return [
        { dest: "TOP", label: "Topo" },
        { dest: "BOTTOM", label: "Fundo" },
      ];
    }
    if (look?.mode === "surveil") {
      return [
        { dest: "TOP", label: "Topo" },
        { dest: "GRAVEYARD", label: "Cemitério" },
      ];
    }
    return [
      { dest: "TOP", label: "Topo" },
      { dest: "BOTTOM", label: "Fundo" },
      { dest: "GRAVEYARD", label: "Cemitério" },
    ];
  }, [look?.mode]);

  const [choice, setChoice] = useState<Record<number, Dest>>({});

  if (!look) return null;

  const list = look.cardIds;

  function confirm() {
    const decisions = list.map((id, i) => ({
      cardId: id,
      // cartas sem escolha ficam no topo, na ordem revelada (topo = índice 0)
      dest: choice[id] ?? ("TOP" as Dest),
      order: i,
    }));
    // topo deve respeitar a ordem em que aparecem aqui
    resolve(decisions.map(({ cardId, dest }) => ({ cardId, dest })));
    clear();
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-2xl animate-fade-in p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">
            {TITLE[look.mode] ?? "Topo do grimório"} — {list.length} carta{list.length === 1 ? "" : "s"}
          </h2>
          <button className="text-xs text-ink-faint hover:text-ink" onClick={clear}>
            cancelar
          </button>
        </div>
        <p className="mt-0.5 text-[11px] text-ink-dim">
          A carta mais acima é o topo atual. Escolha o destino de cada uma; o que ficar em “Topo”
          volta na ordem mostrada.
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          {list.map((id) => {
            const c = cards[id];
            const img =
              c?.identity?.imageNormal ?? c?.identity?.imageLarge ?? c?.identity?.imageSmall ?? null;
            const name = c?.identity?.name ?? "carta";
            const cur = choice[id] ?? "TOP";
            return (
              <div key={id} className="w-[150px]">
                {img ? (
                  <img src={img} alt={name} className="w-full rounded-lg ring-1 ring-white/10" />
                ) : (
                  <div className="grid aspect-[488/680] w-full place-items-center rounded-lg border border-line text-ink-faint">
                    ◈
                  </div>
                )}
                <div className="mt-1 truncate text-[11px] text-ink-dim" title={name}>
                  {name}
                </div>
                <div className="mt-1 flex gap-1">
                  {options.map((o) => (
                    <button
                      key={o.dest}
                      onClick={() => setChoice((m) => ({ ...m, [id]: o.dest }))}
                      className={`flex-1 rounded px-1 py-1 text-[10px] ${
                        cur === o.dest
                          ? "bg-brand text-white"
                          : "bg-bg-elev text-ink-dim hover:bg-brand-soft"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={clear}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={confirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
