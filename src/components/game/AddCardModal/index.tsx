import type { CardSummary } from "@/types/card";
import styles from "./style.module.css";

export interface AddCardModalViewProps {
  query: string;
  results: CardSummary[];
  loading: boolean;
  picked: CardSummary | null;
  count: number;
  onQueryChange: (v: string) => void;
  onPick: (c: CardSummary) => void;
  onCountChange: (n: number) => void;
  onAdd: (zone: "BATTLEFIELD" | "HAND") => void;
  onClose: () => void;
}

export function AddCardModalView({
  query,
  results,
  loading,
  picked,
  count,
  onQueryChange,
  onPick,
  onCountChange,
  onAdd,
  onClose,
}: AddCardModalViewProps) {
  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <div>
            <h2 className={styles.title}>Adicionar carta</h2>
            <p className={styles.hint}>Qualquer carta do banco, direto pro campo ou pra mão.</p>
          </div>
          <button className={styles.close} onClick={onClose}>
            fechar
          </button>
        </div>

        <div className={styles.searchRow}>
          <input
            autoFocus
            className={styles.input}
            placeholder="Nome ou tipo (ex.: Goblin, Island, Instant)…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>

        <div className={styles.status}>
          {loading
            ? "Buscando…"
            : query.trim().length < 2
              ? "Digite ao menos 2 caracteres."
              : `${results.length} resultado(s)`}
        </div>

        <div className={styles.results}>
          {results.map((c) => (
            <button
              key={c.oracleId}
              onClick={() => onPick(c)}
              title={c.name}
              className={`${styles.card} ${picked?.oracleId === c.oracleId ? styles.cardActive : ""}`}
            >
              {c.imageNormal ?? c.imageSmall ? (
                <img
                  src={c.imageNormal ?? c.imageSmall ?? ""}
                  alt={c.name}
                  loading="lazy"
                  className={styles.cardImg}
                />
              ) : (
                <div className={styles.cardImg} />
              )}
              <div className={styles.cardName}>{c.name}</div>
            </button>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.picked}>
            {picked ? picked.name : "Selecione uma carta acima"}
          </span>
          <input
            type="number"
            min={1}
            max={20}
            className={styles.count}
            value={count}
            onChange={(e) => onCountChange(Number(e.target.value) || 1)}
          />
          <button
            className={styles.toField}
            disabled={!picked}
            onClick={() => onAdd("BATTLEFIELD")}
          >
            ↳ Campo
          </button>
          <button className={styles.toHand} disabled={!picked} onClick={() => onAdd("HAND")}>
            ↳ Mão
          </button>
        </div>
      </div>
    </div>
  );
}
