import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useSocialStore } from "@/stores/socialStore";
import { SuggestDeckModalView } from "./index";

interface Props {
  deckId: number;
  deckName: string;
  onClose: () => void;
}

export function SuggestDeckModal({ deckId, deckName, onClose }: Props) {
  const { friends, loadFriends } = useSocialStore();
  const [friendId, setFriendId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  async function onSubmit() {
    if (!friendId) return;
    setBusy(true);
    setError(null);
    try {
      await api.suggestDeck(deckId, friendId, message.trim() || undefined);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao sugerir");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SuggestDeckModalView
      deckName={deckName}
      friends={friends}
      friendId={friendId}
      message={message}
      busy={busy}
      error={error}
      done={done}
      onFriendChange={setFriendId}
      onMessageChange={setMessage}
      onSubmit={() => void onSubmit()}
      onClose={onClose}
    />
  );
}
