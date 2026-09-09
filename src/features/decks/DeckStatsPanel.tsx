import type { DeckStats } from "@/types/deck";

const COLOR_BAR: Record<string, string> = {
  W: "bg-mana-w",
  U: "bg-mana-u",
  B: "bg-mana-b",
  R: "bg-mana-r",
  G: "bg-mana-g",
  C: "bg-mana-c",
};

export function DeckStatsPanel({ stats }: { stats: DeckStats }) {
  const maxCurve = Math.max(1, ...stats.curve.map((c) => c.count));
  const colorEntries = Object.entries(stats.colors).filter(([, n]) => n > 0);
  const typeEntries = Object.entries(stats.types).sort((a, b) => b[1] - a[1]);

  return (
    <div className="card space-y-4 p-3">
      <div className="flex gap-4 text-sm">
        <Stat label="Cartas" value={stats.total} />
        <Stat label="Terrenos" value={stats.lands} />
        <Stat label="Feitiços" value={stats.nonlands} />
      </div>

      {stats.curve.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Curva de mana
          </p>
          <div className="flex items-end gap-1.5">
            {stats.curve.map((c) => (
              <div key={c.manaValue} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-ink-faint">{c.count}</span>
                <div
                  className="w-full rounded-t bg-brand/60"
                  style={{ height: `${8 + (c.count / maxCurve) * 56}px` }}
                />
                <span className="text-[10px] text-ink-dim">
                  {c.manaValue}
                  {c.manaValue === 7 ? "+" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {colorEntries.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Cores
          </p>
          <div className="flex h-2.5 overflow-hidden rounded-full">
            {colorEntries.map(([c, n]) => (
              <div
                key={c}
                className={COLOR_BAR[c] ?? "bg-line"}
                style={{ width: `${(n / stats.total) * 100}%` }}
                title={`${c}: ${n}`}
              />
            ))}
          </div>
        </div>
      )}

      {typeEntries.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Tipos
          </p>
          <div className="space-y-1 text-[13px]">
            {typeEntries.map(([t, n]) => (
              <div key={t} className="flex justify-between">
                <span className="text-ink-dim">{t}</span>
                <span className="text-ink-faint">{n}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-lg font-semibold text-ink">{value}</div>
      <div className="text-[11px] text-ink-faint">{label}</div>
    </div>
  );
}
