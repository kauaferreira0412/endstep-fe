import { useEffect, useState, type FormEvent } from "react";
import { useSocialStore } from "@/stores/socialStore";
import { FriendsView } from "./index";

export function FriendsPage() {
  const { friends, loadingFriends, loadFriends, addFriend, removeFriend } = useSocialStore();
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadFriends();
  }, [loadFriends]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await addFriend(query);
      setQuery("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível adicionar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <FriendsView
      friends={friends}
      loading={loadingFriends}
      query={query}
      busy={busy}
      error={error}
      onQueryChange={setQuery}
      onSubmit={onSubmit}
      onRemove={(id) => void removeFriend(id)}
    />
  );
}
