import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/services/api";
import type { CardSyncRun, SyncLogLine } from "@/types/card";
import { SyncView } from "./index";

const MAX_LOG_LINES = 600;

export function SyncPage() {
  const [runs, setRuns] = useState<CardSyncRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [logLines, setLogLines] = useState<SyncLogLine[]>([]);
  const statusTimer = useRef<number | null>(null);
  const logTimer = useRef<number | null>(null);
  const logSeq = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const data = await api.syncStatus();
      setRuns(data);
      setError(null);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao consultar status");
      return [];
    }
  }, []);

  const pullLog = useCallback(async () => {
    try {
      const res = await api.syncLog(logSeq.current);
      if (res.lines.length > 0) {
        logSeq.current = res.lastSeq;
        setLogLines((prev) => [...prev, ...res.lines].slice(-MAX_LOG_LINES));
      } else if (res.lastSeq < logSeq.current) {
        logSeq.current = 0;
      }
    } catch {
      /* silencioso: o log é secundário */
    }
  }, []);

  useEffect(() => {
    void refresh();
    void pullLog();
    return () => {
      if (statusTimer.current) window.clearInterval(statusTimer.current);
      if (logTimer.current) window.clearInterval(logTimer.current);
    };
  }, [refresh, pullLog]);

  useEffect(() => {
    const running = runs.some((r) => r.status === "RUNNING");

    if (running && !statusTimer.current) {
      statusTimer.current = window.setInterval(() => void refresh(), 3000);
    } else if (!running && statusTimer.current) {
      window.clearInterval(statusTimer.current);
      statusTimer.current = null;
    }

    if (running && !logTimer.current) {
      logTimer.current = window.setInterval(() => void pullLog(), 1500);
    } else if (!running && logTimer.current) {
      window.clearInterval(logTimer.current);
      logTimer.current = null;
      void pullLog();
    }
  }, [runs, refresh, pullLog]);

  async function trigger() {
    setBusy(true);
    setError(null);
    try {
      await api.triggerSync();
      await refresh();
      await pullLog();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao disparar sincronização");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SyncView
      runs={runs}
      error={error}
      busy={busy}
      anyRunning={runs.some((r) => r.status === "RUNNING")}
      logLines={logLines}
      onTrigger={() => void trigger()}
      onRefresh={() => {
        void refresh();
        void pullLog();
      }}
    />
  );
}
