import { useGameStore } from "@/stores/gameStore";
import type { Zone } from "@/types/game";

/** Mostra a carta achada pela cascata / descoberta e deixa o jogador escolher o que fazer com ela. */
export function CascadeModal() {
  const hit = useGameStore((s) => s.cascadeHit);
  const card = useGameStore((s) => (hit ? s.cards[hit.cardId] : null));
  const moveCard = useGameStore((s) => s.moveCard);
  const clear = useGameStore((s) => s.clearCascadeHit);

  if (!hit) return null;

  const discover = !!hit.discover;
  const term = discover ? "Descoberta" : "Cascata";
  const img =
    card?.identity?.imageLarge ?? card?.identity?.imageNormal ?? card?.identity?.imageSmall ?? null;
  const name = card?.identity?.name ?? hit.name ?? "carta";
  const typeLine = card?.identity?.typeLine ?? "";

  function place(zone: Zone, placement?: "TOP" | "BOTTOM") {
    moveCard(hit!.cardId, zone, placement);
    clear();
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-sm animate-fade-in p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">{term}</h2>
          <button className="text-xs text-ink-faint hover:text-ink" onClick={clear}>
            fechar
          </button>
        </div>
        <p className="mt-0.5 text-xs text-ink-dim">
          Exilou {hit.exiledCount} carta{hit.exiledCount === 1 ? "" : "s"} e parou em:
        </p>

        <div className="mt-3 flex gap-3">
          {img ? (
            <img src={img} alt={name} className="w-[45%] shrink-0 rounded-lg ring-1 ring-white/10" />
          ) : (
            <div className="grid aspect-[488/680] w-[45%] shrink-0 place-items-center rounded-lg border border-line text-ink-faint">
              ◈
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-ink">{name}</div>
            {typeLine && <div className="mt-0.5 text-[11px] text-ink-faint">{typeLine}</div>}
            <p className="mt-2 text-[11px] text-ink-dim">
              {discover ? (
                <>
                  A descoberta deixa você <b>conjurar esta carta de graça</b> agora, ou <b>pôr na mão</b>.
                </>
              ) : (
                <>
                  A cascata deixa você conjurar <b>esta carta</b> de graça agora (é só ela, só agora).
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="btn btn-primary" onClick={() => place("BATTLEFIELD")}>
            Jogar no campo
          </button>
          {!discover && (
            <button className="btn" onClick={() => place("STACK")}>
              Pôr na pilha
            </button>
          )}
          <button className="btn" onClick={() => place("HAND")}>
            Pôr na mão
          </button>
          <button className="btn btn-ghost" onClick={() => place("LIBRARY", "BOTTOM")}>
            Fundo do grimório
          </button>
        </div>
      </div>
    </div>
  );
}
