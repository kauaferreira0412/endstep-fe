import type { RoomSummary } from "@/types/room";
import styles from "./style.module.css";

const FORMAT_LABEL: Record<string, string> = {
  commander: "Commander",
  brawl: "Brawl",
  oathbreaker: "Oathbreaker",
  standard: "Standard",
  pioneer: "Pioneer",
  modern: "Modern",
  legacy: "Legacy",
  vintage: "Vintage",
  pauper: "Pauper",
  casual: "Casual",
};

export interface RoomRowViewProps {
  room: RoomSummary;
  full: boolean;
  onOpen: () => void;
}

export function RoomRowView({ room, full, onOpen }: RoomRowViewProps) {
  return (
    <li>
      <button onClick={onOpen} className={`group ${styles.button}`}>
        <div className={styles.body}>
          <div className={styles.titleRow}>
            <span className={styles.name}>{room.name}</span>
            {room.hasPassword && <span className={styles.lock}>🔒</span>}
          </div>
          <div className={styles.metaRow}>
            <span className={styles.format}>{FORMAT_LABEL[room.format] ?? room.format}</span>
            <span className={styles.seats}>
              {Array.from({ length: room.maxPlayers }).map((_, i) => (
                <span
                  key={i}
                  className={`${styles.seat} ${i < room.players ? styles.seatTaken : ""}`}
                />
              ))}
              <span className={styles.count}>
                {room.players}/{room.maxPlayers}
              </span>
            </span>
          </div>
        </div>
        <span className={full ? styles.ctaFull : styles.cta}>{full ? "cheia" : "entrar"}</span>
      </button>
    </li>
  );
}
