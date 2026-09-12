import { useGameStore } from "@/stores/gameStore";
import { PHASE_LABEL, type Phase } from "@/types/game";

const COMBAT_PHASES: Phase[] = [
  "COMBAT_BEGIN",
  "ATTACKERS",
  "BLOCKERS",
  "COMBAT_DAMAGE",
  "COMBAT_END",
];

export function TurnBar() {
  const { turn, players, setPhase } = useGameStore();
  if (!turn) return null;
  const active = Object.values(players).find((p) => p.userId === turn.activeUserId);

  function step(p: Phase, label: string, combat = false) {
    return (
      <button
        key={p}
        title={PHASE_LABEL[p]}
        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${
          turn!.phase === p
            ? "bg-brand text-white"
            : combat
              ? "text-brand/70 hover:text-brand"
              : "text-ink-faint hover:text-ink"
        }`}
        onClick={() => setPhase(p)}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex w-max items-center gap-2 rounded-lg border border-line bg-bg-elev/60 px-3 py-1.5 text-xs">
      <span className="shrink-0 font-semibold text-ink">Turno {turn.turnNumber}</span>
      <span className="shrink-0 text-ink-dim">· {active?.username ?? "?"}</span>
      <div className="mx-1 flex shrink-0 items-center gap-0.5">
        {step("UNTAP", "Desv.")}
        {step("UPKEEP", "Manut.")}
        {step("DRAW", "Compra")}
        {step("MAIN1", "Princ.1")}
        <span className="mx-0.5 rounded bg-brand/10 px-1 py-0.5 text-[9px] uppercase text-brand/80">
          combate
        </span>
        {COMBAT_PHASES.map((p) =>
          step(p, PHASE_LABEL[p].replace(/^Combate: /, "").replace("Dano", "Dano"), true),
        )}
        <span className="mx-0.5 h-3 w-px bg-line" />
        {step("MAIN2", "Princ.2")}
        {step("END", "Final")}
        {step("CLEANUP", "Limpeza")}
      </div>
    </div>
  );
}
