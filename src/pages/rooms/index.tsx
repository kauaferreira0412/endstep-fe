import { type FormEvent } from "react";
import { CreateRoomModal } from "@/components/rooms/CreateRoomModal/container";
import { RoomRow } from "@/components/rooms/RoomRow/container";
import type { RoomSummary } from "@/types/room";
import styles from "./style.module.css";

export interface RoomsViewProps {
  publicRooms: RoomSummary[];
  error: string | null;
  createOpen: boolean;
  joinCode: string;
  codeReady: boolean;
  onJoinCodeChange: (v: string) => void;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onSubmitJoin: (e: FormEvent) => void;
  onOpenRoom: (code: string) => void;
  onCreated: (code: string) => void;
}

export function RoomsView({
  publicRooms,
  error,
  createOpen,
  joinCode,
  codeReady,
  onJoinCodeChange,
  onOpenCreate,
  onCloseCreate,
  onSubmitJoin,
  onOpenRoom,
  onCreated,
}: RoomsViewProps) {
  return (
    <div className={styles.root}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div>
            <span className={styles.pill}>◈ Mesa virtual</span>
            <h1 className={styles.heroTitle}>Jogar Magic com os amigos</h1>
            <p className={styles.heroText}>
              Crie uma sala, escolha seu deck e mande o link. Até 6 jogadores por mesa, com
              reconexão e chat.
            </p>
          </div>
          <button className={styles.createButton} onClick={onOpenCreate}>
            ＋ Criar sala
          </button>
        </div>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.columns}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            <span className={styles.cardIconBrand}>↳</span>
            Entrar por código
          </div>
          <p className={styles.cardHint}>Recebeu um link ou um código de 6 letras?</p>
          <form className={styles.joinForm} onSubmit={onSubmitJoin}>
            <input
              className={styles.codeInput}
              placeholder="ABC123"
              maxLength={6}
              value={joinCode}
              onChange={(e) =>
                onJoinCodeChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
              }
              autoComplete="off"
            />
            <button className={styles.primary} disabled={!codeReady} type="submit">
              Entrar na sala
            </button>
          </form>
        </div>

        <div className={styles.card}>
          <div className={styles.publicHead}>
            <div className={styles.cardTitle}>
              <span className={styles.cardIconGold}>◎</span>
              Salas públicas
            </div>
            <span className={styles.live}>
              <span className={styles.liveDot} />
              ao vivo · {publicRooms.length}
            </span>
          </div>

          {publicRooms.length === 0 ? (
            <div className={styles.emptyBox}>
              <div className={styles.emptyIcon}>🪑</div>
              <p className={styles.emptyText}>Nenhuma sala pública aberta.</p>
              <button className={styles.emptyLink} onClick={onOpenCreate}>
                Criar a primeira →
              </button>
            </div>
          ) : (
            <ul className={styles.list}>
              {publicRooms.map((r) => (
                <RoomRow key={r.code} room={r} onOpen={() => onOpenRoom(r.code)} />
              ))}
            </ul>
          )}
        </div>
      </div>

      {createOpen && <CreateRoomModal onClose={onCloseCreate} onCreated={onCreated} />}
    </div>
  );
}
