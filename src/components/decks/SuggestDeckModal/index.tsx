import { Link } from "react-router-dom";
import type { Friend } from "@/types/social";
import styles from "./style.module.css";

export interface SuggestDeckModalViewProps {
  deckName: string;
  friends: Friend[];
  friendId: number | null;
  message: string;
  busy: boolean;
  error: string | null;
  done: boolean;
  onFriendChange: (id: number) => void;
  onMessageChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export function SuggestDeckModalView({
  deckName,
  friends,
  friendId,
  message,
  busy,
  error,
  done,
  onFriendChange,
  onMessageChange,
  onSubmit,
  onClose,
}: SuggestDeckModalViewProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2 className={styles.title}>Sugerir deck</h2>
          <button className={styles.close} onClick={onClose}>
            fechar
          </button>
        </div>
        <p className={styles.deckName}>{deckName}</p>

        {friends.length === 0 ? (
          <div className={styles.noFriends}>
            Você não tem amigos ainda.{" "}
            <Link to="/friends" className="text-brand">
              Adicionar amigo
            </Link>
          </div>
        ) : (
          <>
            <label className={styles.label} htmlFor="sug-friend">
              Para qual amigo
            </label>
            <select
              id="sug-friend"
              className={styles.select}
              value={friendId ?? ""}
              onChange={(e) => onFriendChange(Number(e.target.value))}
            >
              <option value="" disabled>
                — escolher —
              </option>
              {friends.map((f) => (
                <option key={f.userId} value={f.userId}>
                  {f.displayName} (@{f.username})
                </option>
              ))}
            </select>

            <label className={styles.label} htmlFor="sug-msg">
              Recado (opcional)
            </label>
            <textarea
              id="sug-msg"
              className={styles.textarea}
              rows={2}
              maxLength={500}
              placeholder="ex.: acho que esse combo combina com o seu comandante"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
            />
          </>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {done && <div className={styles.ok}>Sugestão enviada ✓</div>}

        <div className={styles.actions}>
          <button className={styles.ghost} onClick={onClose}>
            {done ? "Fechar" : "Cancelar"}
          </button>
          {!done && friends.length > 0 && (
            <button className={styles.primary} disabled={busy || !friendId} onClick={onSubmit}>
              {busy ? "Enviando…" : "Sugerir"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
