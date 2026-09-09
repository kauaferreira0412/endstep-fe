import { type FormEvent } from "react";
import type { Friend } from "@/types/social";
import styles from "./style.module.css";

function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export interface FriendsViewProps {
  friends: Friend[];
  loading: boolean;
  query: string;
  busy: boolean;
  error: string | null;
  myUsername?: string;
  myId?: number;
  onQueryChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onRemove: (userId: number) => void;
}

export function FriendsView({
  friends,
  loading,
  query,
  busy,
  error,
  myUsername,
  myId,
  onQueryChange,
  onSubmit,
  onRemove,
}: FriendsViewProps) {
  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Amigos</h1>
      <p className={styles.intro}>
        Adicione por <b>@username</b> ou pelo <b>ID</b> do usuário. Depois você pode sugerir decks
        para eles.
      </p>
      <div className={styles.me}>
        Para te adicionarem, passe: <b>@{myUsername}</b> ou <b>ID #{myId}</b>
      </div>

      <form className={styles.form} onSubmit={onSubmit}>
        <input
          className={styles.input}
          placeholder="@username ou ID"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
        <button className={styles.add} disabled={busy || !query.trim()} type="submit">
          {busy ? "Adicionando…" : "Adicionar"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {!loading && friends.length === 0 && (
        <div className={styles.empty}>Você ainda não adicionou ninguém.</div>
      )}

      <ul className={styles.list}>
        {friends.map((f) => (
          <li key={f.userId} className={styles.row}>
            {f.avatarUrl ? (
              <img src={f.avatarUrl} alt="" className={styles.avatarImg} />
            ) : (
              <span className={styles.avatar}>{initialsOf(f.displayName)}</span>
            )}
            <span>
              <span className={styles.name}>{f.displayName}</span>
              <div className={styles.handle}>
                @{f.username} · #{f.userId}
              </div>
            </span>
            <button className={styles.remove} onClick={() => onRemove(f.userId)}>
              remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
