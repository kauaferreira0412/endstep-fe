import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { CardSummary } from "@/types/card";
import type { Section } from "@/types/deck";
import { ManaCost } from "./ManaCost";

const SECTIONS: { value: Section; label: string }[] = [
  { value: "MAINBOARD", label: "Deck" },
  { value: "COMMANDER", label: "Comandante" },
  { value: "SIDEBOARD", label: "Sideboard" },
  { value: "MAYBEBOARD", label: "Talvez" },
];

export function AddCardsPanel({
  onAdd,
  usesCommandZone,
}: {
  onAdd: (oracleId: string, section: Section) => void;
  usesCommandZone: boolean;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState<Section>("MAINBOARD");

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.searchCards(q.trim(), 0, 24);
        setResults(res.content);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const sections = usesCommandZone ? SECTIONS : SECTIONS.filter((s) => s.value !== "COMMANDER");

  return (
    <div className="card flex h-full flex-col p-3">
      <div className="flex items-center gap-2">
        <input
          className="input !py-2"
          placeholder="Adicionar cartas — busque pelo nome"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input !w-auto !py-2"
          value={target}
          onChange={(e) => setTarget(e.target.value as Section)}
        >
          {sections.map((s) => (
            <option key={s.value} value={s.value}>
              → {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto">
        {loading && <p className="p-2 text-xs text-ink-faint">Buscando…</p>}
        {!loading && q.trim().length >= 2 && results.length === 0 && (
          <p className="p-2 text-xs text-ink-faint">Nada encontrado.</p>
        )}
        <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
          {results.map((c) => (
            <button
              key={c.oracleId}
              onClick={() => onAdd(c.oracleId, target)}
              title={`${c.name}\n${c.typeLine ?? ""}`}
              className="flex items-center gap-2 rounded-lg border border-line bg-bg-elev p-1.5 text-left transition hover:border-brand/60"
            >
              {c.imageSmall ? (
                <img
                  src={c.imageSmall}
                  alt=""
                  className="h-11 w-8 shrink-0 rounded object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="h-11 w-8 shrink-0 rounded bg-bg-soft" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] text-ink">{c.name}</span>
                <span className="mt-0.5 flex items-center gap-1">
                  <ManaCost cost={c.manaCost} />
                </span>
              </span>
              <span className="text-ink-faint">＋</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
