import type { HomeStats } from "@/types/stats";
import styles from "./style.module.css";

function nf(n: number): string {
  return n.toLocaleString("pt-BR");
}

export interface HomeViewProps {
  data: HomeStats | null;
  loading: boolean;
  error: string | null;
}

export function HomeView({ data, loading, error }: HomeViewProps) {
  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Endstep</h1>
        <p className={styles.heroText}>
          Mesa virtual de Magic. Veja abaixo o que a comunidade está jogando — atualiza sozinho.
        </p>

        {data && (
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>{nf(data.overview.cards)}</div>
              <div className={styles.statLabel}>Cartas no banco</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{nf(data.overview.printings)}</div>
              <div className={styles.statLabel}>Impressões</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{nf(data.overview.games)}</div>
              <div className={styles.statLabel}>Partidas</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{nf(data.overview.decks)}</div>
              <div className={styles.statLabel}>Decks montados</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{nf(data.overview.players)}</div>
              <div className={styles.statLabel}>Jogadores</div>
            </div>
          </div>
        )}
      </section>

      {error && <div className={styles.empty}>{error}</div>}
      {loading && !data && <div className={styles.empty}>Carregando…</div>}

      {data && (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Comandantes mais jogados</h2>
              <span className={styles.sectionHint}>por nº de partidas</span>
            </div>
            {data.topCommanders.length === 0 ? (
              <div className={styles.empty}>Ainda não há partidas registradas.</div>
            ) : (
              <div className={styles.cmdGrid}>
                {data.topCommanders.map((c) => (
                  <div key={c.oracleId} className={styles.cmd} title={c.name}>
                    {c.image ? (
                      <img src={c.image} alt={c.name} loading="lazy" className={styles.cmdImg} />
                    ) : (
                      <div className={styles.cmdImg} />
                    )}
                    <div className={styles.cmdBody}>
                      <div className={styles.cmdName}>{c.name}</div>
                      <div className={styles.cmdGames}>{nf(c.games)} partida(s)</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Cartas mais presentes nas partidas</h2>
            </div>
            {data.topCards.length === 0 ? (
              <div className={styles.empty}>Sem dados ainda.</div>
            ) : (
              <div className={styles.cardList}>
                {data.topCards.map((c, i) => (
                  <div key={c.oracleId} className={styles.cardRow}>
                    <span className={styles.rank}>{i + 1}</span>
                    {c.image && <img src={c.image} alt="" loading="lazy" className={styles.cardThumb} />}
                    <span className={styles.cardName}>{c.name}</span>
                    <span className={styles.cardGames}>{nf(c.games)} partida(s)</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {data.recentSets.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Lançamentos recentes</h2>
              </div>
              <div className={styles.setList}>
                {data.recentSets.map((s) => (
                  <div key={s.code} className={styles.set}>
                    {s.iconSvgUri && <img src={s.iconSvgUri} alt="" className={styles.setIcon} />}
                    <span>
                      <span className={styles.setName}>{s.name}</span>
                      <div className={styles.setDate}>
                        {s.code.toUpperCase()}
                        {s.releasedAt ? ` · ${s.releasedAt}` : ""}
                      </div>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className={styles.footer}>
            {data.overview.lastSync
              ? `Última sincronização de cartas: ${data.overview.lastSync}. `
              : ""}
            Atualizado em {new Date(data.generatedAt).toLocaleString("pt-BR")}.
          </div>
        </>
      )}
    </div>
  );
}
