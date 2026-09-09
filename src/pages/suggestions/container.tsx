import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useDeckStore } from "@/stores/deckStore";
import { useSocialStore } from "@/stores/socialStore";

import type { SuggestionCardLine } from "@/types/social";
import { SuggestionsView } from "./index";

export function SuggestionsPage() {
  const { suggestions, loadingSuggestions, loadSuggestions, dismissSuggestion, markImported } =
    useSocialStore();
  const deckBootstrap = useDeckStore((s) => s.bootstrap);
  const navigate = useNavigate();

  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [openCards, setOpenCards] = useState<SuggestionCardLine[]>([]);

  useEffect(() => {
    void loadSuggestions();
  }, [loadSuggestions]);

  async function onToggleCards(id: number) {
    if (openId === id) {
      setOpenId(null);
      return;
    }
    setOpenId(id);
    setOpenCards([]);
    try {
      setOpenCards(await api.suggestionCards(id));
    } catch {
      setOpenCards([]);
    }
  }

  async function onImport(id: number) {
    setBusyId(id);
    setError(null);
    try {
      const deck = await api.importSuggestion(id);
      markImported(id, deck.id);
      void deckBootstrap();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao importar");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <SuggestionsView
      suggestions={suggestions}
      loading={loadingSuggestions}
      error={error}
      busyId={busyId}
      openId={openId}
      openCards={openCards}
      onToggleCards={(id) => void onToggleCards(id)}
      onImport={(id) => void onImport(id)}
      onDismiss={(id) => void dismissSuggestion(id)}
      onOpenDeck={(deckId) => {
        void useDeckStore.getState().selectDeck(deckId);
        navigate("/decks");
      }}
    />
  );
}
