import styles from "./style.module.css";

const SOURCE_LABEL: Record<string, string> = {
  scryfall: "impressão oficial PT-BR",
  google: "tradução automática",
  none: "sem tradução oficial — texto em inglês",
};

export interface CardOracleTextViewProps {
  enabled: boolean;
  loading: boolean;
  source: "scryfall" | "google" | "none" | null;
  body: string | null | undefined;
  className?: string;
  hideToggle?: boolean;
  onToggle: () => void;
}

export function CardOracleTextView({
  enabled,
  loading,
  source,
  body,
  className,
  hideToggle,
  onToggle,
}: CardOracleTextViewProps) {
  if (body == null) return null;

  return (
    <div>
      {!hideToggle && (
        <div className={styles.bar}>
          <button
            onClick={onToggle}
            className={`${styles.toggle} ${enabled ? styles.toggleOff : styles.toggleOn}`}
            title={
              enabled
                ? "Mostrar o texto original em inglês"
                : "Traduzir esta carta para português"
            }
          >
            {enabled ? "Ver em inglês" : "🌐 Ver em português"}
          </button>
          {loading && <span className={styles.loading}>traduzindo…</span>}
          {enabled && source && (
            <span
              className={`${styles.source} ${source === "none" ? styles.sourceNone : ""}`}
              title={
                source === "google"
                  ? "Traduzido por máquina (Google). Pode conter imprecisões."
                  : source === "scryfall"
                    ? "Texto da impressão oficial em português."
                    : "Esta carta não tem impressão oficial em português."
              }
            >
              {SOURCE_LABEL[source] ?? ""}
            </span>
          )}
        </div>
      )}
      <div className={className}>{body}</div>
    </div>
  );
}
