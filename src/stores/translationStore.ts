import { create } from "zustand";
import { api } from "@/services/api";
import type { CardTranslation } from "@/types/card";

type Entry = { status: "loading" } | { status: "error" } | { status: "ok"; data: CardTranslation };

type Ref = { oracleId: string } | { oracleCardId: number };

function keyOf(ref: Ref): string {
  return "oracleId" in ref ? `u:${ref.oracleId}` : `o:${ref.oracleCardId}`;
}

interface TState {
  /** cache das traduções já buscadas nesta sessão (o backend também cacheia no banco). */
  cache: Record<string, Entry>;
  /** dispara a tradução (se ainda não pedida) e devolve a entrada atual. */
  ensure: (ref: Ref) => Entry | undefined;
  get: (ref: Ref) => Entry | undefined;
}

export const useTranslationStore = create<TState>((set, get) => ({
  cache: {},

  get: (ref) => get().cache[keyOf(ref)],

  ensure: (ref) => {
    const k = keyOf(ref);
    const existing = get().cache[k];
    if (existing) return existing;

    set((st) => ({ cache: { ...st.cache, [k]: { status: "loading" } } }));
    api
      .translateCard(ref)
      .then((data) => set((st) => ({ cache: { ...st.cache, [k]: { status: "ok", data } } })))
      .catch(() => set((st) => ({ cache: { ...st.cache, [k]: { status: "error" } } })));
    return { status: "loading" };
  },
}));
