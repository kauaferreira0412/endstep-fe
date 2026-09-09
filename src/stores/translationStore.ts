import { create } from "zustand";
import { api } from "@/services/api";
import type { CardTranslation } from "@/types/card";

const PREF_KEY = "endstep.showTranslation";

type Entry = { status: "loading" } | { status: "error" } | { status: "ok"; data: CardTranslation };

type Ref = { oracleId: string } | { oracleCardId: number };

function keyOf(ref: Ref): string {
  return "oracleId" in ref ? `u:${ref.oracleId}` : `o:${ref.oracleCardId}`;
}

interface TState {
  /** preferência global: exibir a tradução PT-BR. Persistida no localStorage. */
  enabled: boolean;
  cache: Record<string, Entry>;
  setEnabled: (v: boolean) => void;
  toggle: () => void;
  /** dispara a tradução (se ainda não pedida) e devolve a entrada atual. */
  ensure: (ref: Ref) => Entry | undefined;
  get: (ref: Ref) => Entry | undefined;
}

function readPref(): boolean {
  try {
    return localStorage.getItem(PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export const useTranslationStore = create<TState>((set, get) => ({
  enabled: readPref(),
  cache: {},

  setEnabled: (v) => {
    try {
      localStorage.setItem(PREF_KEY, v ? "on" : "off");
    } catch {
      /* ignore */
    }
    set({ enabled: v });
  },
  toggle: () => get().setEnabled(!get().enabled),

  get: (ref) => get().cache[keyOf(ref)],

  ensure: (ref) => {
    const k = keyOf(ref);
    const existing = get().cache[k];
    if (existing) return existing;

    set((st) => ({ cache: { ...st.cache, [k]: { status: "loading" } } }));
    api
      .translateCard(ref)
      .then((data) =>
        set((st) => ({ cache: { ...st.cache, [k]: { status: "ok", data } } })),
      )
      .catch(() => set((st) => ({ cache: { ...st.cache, [k]: { status: "error" } } })));
    return { status: "loading" };
  },
}));
