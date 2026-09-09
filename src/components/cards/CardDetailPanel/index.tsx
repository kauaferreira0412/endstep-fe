import { CardOracleText } from "@/components/common/CardOracleText/container";
import type { CardDetail } from "@/types/card";
import styles from "./style.module.css";

export interface CardDetailPanelViewProps {
  oracleId: string;
  card: CardDetail | null;
  error: string | null;
  image: string | null;
  onClose: () => void;
}

export function CardDetailPanelView({
  oracleId,
  card,
  error,
  image,
  onClose,
}: CardDetailPanelViewProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>
          ← Fechar
        </button>

        {error && <div className={styles.error}>{error}</div>}
        {!card && !error && <p className={styles.loading}>Carregando…</p>}

        {card && (
          <>
            <h2 className={styles.name}>
              {card.name} {card.manaCost && <span className={styles.mana}>{card.manaCost}</span>}
            </h2>
            <div className={styles.typeLine}>{card.typeLine}</div>

            <div className={styles.row}>
              {image && <img src={image} alt={card.name} className={styles.art} />}
              <div className={styles.col}>
                <CardOracleText
                  reference={{ oracleId }}
                  original={card.oracleText}
                  className={styles.oracle}
                />

                {card.faces.length > 0 && (
                  <>
                    <div className={styles.section}>Faces</div>
                    {card.faces.map((f) => (
                      <div key={f.faceIndex} className={styles.face}>
                        <span className={styles.faceName}>{f.name}</span>{" "}
                        <span className={styles.faceMana}>{f.manaCost}</span>
                        <div className={styles.faceType}>{f.typeLine}</div>
                        {f.oracleText && <div className={styles.faceText}>{f.oracleText}</div>}
                      </div>
                    ))}
                  </>
                )}

                <div className={styles.section}>Legalidades</div>
                <div className={styles.legalities}>
                  {card.legalities.map((l) => (
                    <span
                      key={l.format}
                      className={`${styles.chip} ${
                        l.status === "legal"
                          ? styles.chipLegal
                          : l.status === "banned"
                            ? styles.chipBanned
                            : ""
                      }`}
                    >
                      {l.format}: {l.status}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.section}>Impressões ({card.printings.length})</div>
            <div className={styles.printings}>
              {card.printings.map((p) => (
                <div key={p.id} className={styles.printingRow}>
                  <span>
                    {(p.setCode ?? "?").toUpperCase()} · #{p.collectorNumber} · {p.rarity}
                  </span>
                  <span className={styles.printingMeta}>
                    {p.artist} {p.releasedAt ? `· ${p.releasedAt}` : ""}
                  </span>
                </div>
              ))}
            </div>

            {card.rulings.length > 0 && (
              <>
                <div className={styles.section}>Rulings ({card.rulings.length})</div>
                {card.rulings.map((r, i) => (
                  <p key={i} className={styles.ruling}>
                    <span className={styles.rulingDate}>{r.publishedAt} — </span>
                    {r.comment}
                  </p>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
