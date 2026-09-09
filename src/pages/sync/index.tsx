import { useEffect, useRef } from "react";
import type { CardSyncRun, SyncLogLine } from "@/types/card";
import styles from "./style.module.css";

const CHIP: Record<string, string> = {
  RUNNING: styles.chipRunning,
  COMPLETED: styles.chipDone,
  FAILED: styles.chipFailed,
};

const HEADERS = [
  "#",
  "Bulk",
  "Status",
  "Processadas",
  "Novas",
  "Atualizadas",
  "Erros",
  "Início",
  "Fim",
];

function fmt(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("pt-BR");
}

function hhmmss(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("pt-BR");
}

function SyncConsole({ lines, anyRunning }: { lines: SyncLogLine[]; anyRunning: boolean }) {
  const boxRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <div className={styles.consoleWrap}>
      <div className={styles.consoleHead}>
        <span className={styles.consoleTitle}>Log do backend</span>
        {anyRunning && (
          <span className={styles.live}>
            <span className={styles.liveDot} />
            ao vivo
          </span>
        )}
      </div>
      <pre className={styles.console} ref={boxRef}>
        {lines.length === 0
          ? "Sem linhas ainda. Dispare uma sincronização para acompanhar."
          : lines.map((l) => (
              <div
                key={l.seq}
                className={
                  l.level === "ERROR"
                    ? styles.lineError
                    : l.level === "WARN"
                      ? styles.lineWarn
                      : styles.line
                }
              >
                <span className={styles.lineTime}>{hhmmss(l.at)}</span>
                <span className={styles.lineLevel}>{l.level}</span>
                <span>{l.message}</span>
              </div>
            ))}
      </pre>
    </div>
  );
}

export interface SyncViewProps {
  runs: CardSyncRun[];
  error: string | null;
  busy: boolean;
  anyRunning: boolean;
  logLines: SyncLogLine[];
  onTrigger: () => void;
  onRefresh: () => void;
}

export function SyncView({
  runs,
  error,
  busy,
  anyRunning,
  logLines,
  onTrigger,
  onRefresh,
}: SyncViewProps) {
  return (
    <div>
      <h1 className={styles.title}>Sincronização de cartas</h1>
      <p className={styles.intro}>
        Baixa o Bulk Data do Scryfall (<code className={styles.code}>default_cards</code> +{" "}
        <code className={styles.code}>rulings</code>) e grava no PostgreSQL. A primeira execução
        processa ~100 mil cartas.
      </p>

      <div className={styles.actions}>
        <button className={styles.primary} onClick={onTrigger} disabled={busy || anyRunning}>
          {anyRunning ? "Sincronizando…" : "Sincronizar agora"}
        </button>
        <button className={styles.secondary} onClick={onRefresh}>
          Atualizar status
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <SyncConsole lines={logLines} anyRunning={anyRunning} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {HEADERS.map((h) => (
                <th key={h} className={styles.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {runs.length === 0 && (
              <tr>
                <td colSpan={9} className={styles.empty}>
                  Nenhuma execução ainda.
                </td>
              </tr>
            )}
            {runs.map((r) => (
              <tr key={r.id} className={styles.row}>
                <td className={styles.td}>{r.id}</td>
                <td className={styles.td}>{r.bulkType}</td>
                <td className={styles.td}>
                  <span className={`${styles.chip} ${CHIP[r.status] ?? ""}`}>{r.status}</span>
                </td>
                <td className={styles.td}>{r.totalProcessed.toLocaleString("pt-BR")}</td>
                <td className={styles.td}>{r.insertedCount.toLocaleString("pt-BR")}</td>
                <td className={styles.td}>{r.updatedCount.toLocaleString("pt-BR")}</td>
                <td className={styles.td}>{r.errorCount}</td>
                <td className={styles.tdMuted}>{fmt(r.startedAt)}</td>
                <td className={styles.tdMuted}>{fmt(r.finishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
