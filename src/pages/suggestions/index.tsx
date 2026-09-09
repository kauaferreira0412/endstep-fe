import type { DeckSuggestion, SuggestionCardLine } from "@/types/social";
import styles from "./style.module.css";

const SECTION_LABEL: Record<string, string> = {
  COMMANDER: "Comandante",
  MAINBOARD: "Deck",
  SIDEBOARD: "Sideboard",
  MAYBEBOARD: "Talvez",
};

function groupCards(cards: SuggestionCardLine[]) {
  const order = ["COMMANDER", "MAINBOARD", "SIDEBOARD", "MAYBEBOARD"];
  const map = new Map<string, SuggestionCardLine[]>();
  for (const c of cards) {
    const k = c.section || "MAINBOARD";
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(c);
  }
  return [...map.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
}

export interface SuggestionsViewProps {
  suggestions: DeckSuggestion[];
  loading: boolean;
  error: string | null;
  busyId: number | null;
  openId: number | null;
  openCards: SuggestionCardLine[];
  onToggleCards: (id: number) => void;
  onImport: (id: number) => void;
  onDismiss: (id: number) => void;
  onOpenDeck: (deckId: number) => void;
}

export function SuggestionsView({
  suggestions,
  loading,
  error,
  busyId,
  openId,
  openCards,
  onToggleCards,
  onImport,
  onDismiss,
  onOpenDeck,
}: SuggestionsViewProps) {
  const visible = suggestions.filter((s) => s.status !== "DISMISSED");

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Sugeridos</h1>
      <p className={styles.intro}>
        Decks que seus amigos sugeriram. Importe para editar, exportar e usar como qualquer deck
        seu.
      </p>

      {error && <div className={styles.error}>{error}</div>}

      {!loading && visible.length === 0 && (
        <div className={styles.empty}>Nenhuma sugestão por enquanto.</div>
      )}

      <div className={styles.list}>
        {visible.map((s) => (
          <div
            key={s.id}
            className={`${styles.card} ${s.status !== "NEW" ? styles.cardDone : ""}`}
          >
            <div className={styles.head}>
              <div>
                <div className={styles.deckName}>{s.deckName}</div>
                <div className={styles.meta}>
                  de <span className={styles.from}>{s.fromDisplayName}</span> (@{s.fromUsername}) ·{" "}
                  {s.format} · {s.cardCount} cartas
                </div>
              </div>
              <span
                className={`${styles.badge} ${
                  s.status === "NEW"
                    ? styles.badgeNew
                    : s.status === "IMPORTED"
                      ? styles.badgeImported
                      : styles.badgeDismissed
                }`}
              >
                {s.status === "NEW" ? "novo" : s.status === "IMPORTED" ? "importado" : "dispensado"}
              </span>
            </div>

            {s.message && <div className={styles.message}>“{s.message}”</div>}

            {openId === s.id && (
              <div className={styles.cardsBox}>
                {groupCards(openCards).map(([section, list]) => (
                  <div key={section}>
                    <div className={styles.groupTitle}>{SECTION_LABEL[section] ?? section}</div>
                    {list.map((c, i) => (
                      <div key={i} className={styles.cardLine}>
                        <span className={styles.qty}>{c.quantity}×</span>
                        <span>{c.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div className={styles.actions}>
              {s.status === "IMPORTED" && s.importedDeckId ? (
                <button className={styles.primary} onClick={() => onOpenDeck(s.importedDeckId!)}>
                  Abrir deck
                </button>
              ) : (
                <button
                  className={styles.primary}
                  disabled={busyId === s.id}
                  onClick={() => onImport(s.id)}
                >
                  {busyId === s.id ? "Importando…" : "Importar para meus decks"}
                </button>
              )}
              <button className={styles.secondary} onClick={() => onToggleCards(s.id)}>
                {openId === s.id ? "Ocultar cartas" : "Ver cartas"}
              </button>
              {s.status === "NEW" && (
                <button className={styles.ghost} onClick={() => onDismiss(s.id)}>
                  Dispensar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
