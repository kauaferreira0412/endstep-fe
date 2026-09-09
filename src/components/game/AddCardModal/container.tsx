import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useGameStore } from "@/stores/gameStore";
import type { CardSummary } from "@/types/card";
import { AddCardModalView } from "./index";

export function AddCardModal() {
  const open = useGameStore((s) => s.addCardModalOpen);
  const setOpen = useGameStore((s) => s.setAddCardModalOpen);
  const addCard = useGameStore((s) => s.addCard);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<CardSummary | null>(null);
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setPicked(null);
      setCount(1);
    }
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      api
        .searchCards(query.trim(), 0, 40)
        .then((r) => alive && setResults(r.content))
        .catch(() => alive && setResults([]))
        .finally(() => alive && setLoading(false));
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [open, query]);

  if (!open) return null;

  function onAdd(zone: "BATTLEFIELD" | "HAND") {
    if (!picked) return;
    addCard(picked.oracleId, zone, Math.max(1, Math.min(20, count)));
    setOpen(false);
  }

  return (
    <AddCardModalView
      query={query}
      results={results}
      loading={loading}
      picked={picked}
      count={count}
      onQueryChange={setQuery}
      onPick={setPicked}
      onCountChange={setCount}
      onAdd={onAdd}
      onClose={() => setOpen(false)}
    />
  );
}
