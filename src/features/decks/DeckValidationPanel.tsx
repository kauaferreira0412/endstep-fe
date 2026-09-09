import type { ValidationResult } from "@/types/deck";

export function DeckValidationPanel({ v }: { v: ValidationResult }) {
  const errors = v.issues.filter((i) => i.level === "ERROR");
  const warnings = v.issues.filter((i) => i.level === "WARNING");

  return (
    <div className="card p-3">
      <div className="flex items-center gap-2">
        <span
          className={`chip ${
            v.legal ? "border-ok/50 text-ok" : "border-danger/50 text-danger"
          }`}
        >
          {v.legal ? "✓ Legal" : "✗ Ilegal"}
        </span>
        <span className="text-xs text-ink-faint">
          {v.deckSize} cartas
          {v.commanderCount > 0 && ` · ${v.commanderCount} comandante${v.commanderCount > 1 ? "s" : ""}`}
        </span>
      </div>

      {(errors.length > 0 || warnings.length > 0) && (
        <ul className="mt-2.5 space-y-1.5 text-[13px]">
          {errors.map((i, idx) => (
            <IssueItem key={`e${idx}`} tone="danger" text={i.message} cards={i.cards} />
          ))}
          {warnings.map((i, idx) => (
            <IssueItem key={`w${idx}`} tone="warn" text={i.message} cards={i.cards} />
          ))}
        </ul>
      )}
    </div>
  );
}

function IssueItem({
  tone,
  text,
  cards,
}: {
  tone: "danger" | "warn";
  text: string;
  cards: string[];
}) {
  return (
    <li className={tone === "danger" ? "text-danger" : "text-warn"}>
      <span className="mr-1">{tone === "danger" ? "●" : "▲"}</span>
      {text}
      {cards.length > 0 && (
        <span className="text-ink-faint"> — {cards.slice(0, 6).join(", ")}</span>
      )}
    </li>
  );
}
