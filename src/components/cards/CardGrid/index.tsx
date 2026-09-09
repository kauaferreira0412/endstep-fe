import type { CardSummary } from "@/types/card";
import styles from "./style.module.css";

export interface CardGridViewProps {
  cards: CardSummary[];
  onSelect: (oracleId: string) => void;
}

export function CardGridView({ cards, onSelect }: CardGridViewProps) {
  if (cards.length === 0) return null;

  return (
    <div className={styles.root}>
      {cards.map((c) => (
        <button
          key={c.oracleId}
          onClick={() => onSelect(c.oracleId)}
          title={c.name}
          className={styles.card}
        >
          {c.imageNormal ?? c.imageSmall ? (
            <img
              src={c.imageNormal ?? c.imageSmall ?? ""}
              alt={c.name}
              loading="lazy"
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>{c.name}</div>
          )}
          <div className={styles.body}>
            <div className={styles.name}>{c.name}</div>
            <div className={styles.meta}>
              {c.typeLine ?? "—"}
              {c.printingCount > 1 ? ` · ${c.printingCount} impressões` : ""}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
