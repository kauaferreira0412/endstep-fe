const COLOR: Record<string, string> = {
  W: "bg-mana-w text-black",
  U: "bg-mana-u text-white",
  B: "bg-mana-b text-white",
  R: "bg-mana-r text-white",
  G: "bg-mana-g text-white",
  C: "bg-mana-c text-black",
};

/** Renderiza "{2}{G}{W}" como pips. Genérico o bastante para custos comuns. */
export function ManaCost({ cost }: { cost: string | null | undefined }) {
  if (!cost) return null;
  const symbols = cost.match(/\{([^}]+)\}/g)?.map((s) => s.slice(1, -1)) ?? [];
  if (symbols.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5 align-middle">
      {symbols.map((sym, i) => {
        const key = sym.toUpperCase();
        const cls = COLOR[key] ?? "bg-bg-elev text-ink-dim border border-line";
        return (
          <span
            key={i}
            className={`inline-grid h-4 min-w-4 place-items-center rounded-full px-[3px] text-[10px] font-bold leading-none ${cls}`}
          >
            {sym.replace("/", "")}
          </span>
        );
      })}
    </span>
  );
}

const CI_LABEL: Record<string, string> = {
  W: "bg-mana-w",
  U: "bg-mana-u",
  B: "bg-mana-b",
  R: "bg-mana-r",
  G: "bg-mana-g",
};

export function ColorIdentity({ ci }: { ci: string | null | undefined }) {
  const chars = (ci ?? "").toUpperCase().split("").filter((c) => "WUBRG".includes(c));
  if (chars.length === 0) {
    return <span className="text-[11px] text-ink-faint">incolor</span>;
  }
  return (
    <span className="inline-flex gap-0.5">
      {chars.map((c) => (
        <span key={c} className={`h-3 w-3 rounded-full ${CI_LABEL[c]}`} />
      ))}
    </span>
  );
}
