import { InviteLink } from "@/components/rooms/InviteLink/container";
import type { DeckSummary } from "@/types/deck";
import type { Room, RoomPlayer } from "@/types/room";
import styles from "./style.module.css";

export interface RoomLobbyViewProps {
  room: Room | null;
  loadError: string | null;
  error: string | null;
  meUserId: number | undefined;
  me: RoomPlayer | null;
  isHost: boolean;
  inRoom: boolean;
  players: RoomPlayer[];
  spectators: RoomPlayer[];
  commanderFormat: boolean;
  myDecks: DeckSummary[];
  readyCount: number;
  canStart: boolean;
  chosenDeckEmpty: boolean;
  password: string;
  joining: boolean;
  starting: boolean;
  sitting: boolean;
  onBack: () => void;
  onPasswordChange: (v: string) => void;
  onJoin: (asSpectator: boolean) => void;
  onChooseDeck: (deckId: number | null) => void;
  onSit: () => void;
  onStart: () => void;
  onGoToGame: () => void;
  onLeave: () => void;
}

export function RoomLobbyView(props: RoomLobbyViewProps) {
  const {
    room,
    loadError,
    error,
    meUserId,
    me,
    isHost,
    inRoom,
    players,
    spectators,
    commanderFormat,
    myDecks,
    readyCount,
    canStart,
    chosenDeckEmpty,
    password,
    joining,
    starting,
    sitting,
    onBack,
    onPasswordChange,
    onJoin,
    onChooseDeck,
    onSit,
    onStart,
    onGoToGame,
    onLeave,
  } = props;

  if (!room) {
    return (
      <div className={styles.loading}>
        {loadError ? <span className={styles.loadingError}>{loadError}</span> : "Carregando sala…"}
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <button className={styles.back} onClick={onBack}>
        ← Salas
      </button>

      <div className={styles.card}>
        <div className={styles.headRow}>
          <div>
            <h1 className={styles.title}>{room.name}</h1>
            <p className={styles.subtitle}>
              {room.format} · {players.length}/{room.maxPlayers} jogadores
              {room.hasPassword ? " · 🔒" : ""}
            </p>
          </div>
          <InviteLink code={room.code} />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {!inRoom ? (
          <div className={styles.joinBox}>
            {room.hasPassword && (
              <input
                className={styles.control}
                type="password"
                placeholder="Senha da sala"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
              />
            )}
            <div className={styles.joinButtons}>
              <button
                className={`${styles.primary} ${styles.primaryFlex}`}
                disabled={joining}
                onClick={() => onJoin(false)}
              >
                Entrar como jogador
              </button>
              {room.allowSpectators && (
                <button className={styles.secondary} disabled={joining} onClick={() => onJoin(true)}>
                  Assistir
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <ul className={styles.list}>
              {players.map((p) => (
                <li key={p.userId} className={styles.playerRow}>
                  <span className={styles.playerName}>
                    {p.username}
                    {p.isHost && <span className={styles.chip}>host</span>}
                    {p.userId === meUserId && <span className={styles.chip}>você</span>}
                  </span>
                  <span className={p.deckId ? styles.deckStateReady : styles.deckState}>
                    {p.deckId ? `✓ ${p.deckName}` : "sem deck"}
                  </span>
                </li>
              ))}
              {spectators.map((p) => (
                <li key={p.userId} className={styles.spectatorRow}>
                  👁 {p.username} (espectador)
                </li>
              ))}
            </ul>

            {me && (
              <div className={styles.deckPicker}>
                <label className={styles.deckLabel}>
                  Seu deck ({room.format})
                  {me.role === "SPECTATOR" && (
                    <span className={styles.deckLabelNote}>— você está assistindo</span>
                  )}
                </label>
                <select
                  className={styles.controlSpaced}
                  value={me.deckId ?? ""}
                  onChange={(e) => onChooseDeck(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">— escolher —</option>
                  {myDecks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.cardCount} cartas)
                    </option>
                  ))}
                </select>
                {myDecks.length === 0 && (
                  <p className={styles.warn}>
                    Você não tem decks no formato {room.format}. Crie um em “Decks”.
                  </p>
                )}
                {chosenDeckEmpty && (
                  <p className={styles.warn}>
                    Esse deck está vazio. Adicione cartas em “Decks” antes de iniciar.
                  </p>
                )}
                {commanderFormat && (
                  <p className={styles.note}>
                    O comandante vai pra command zone automaticamente.
                  </p>
                )}

                {me.role === "SPECTATOR" && (
                  <button
                    className={`${styles.primary} ${styles.primaryFull}`}
                    disabled={!me.deckId || sitting}
                    onClick={onSit}
                  >
                    {sitting
                      ? "Entrando…"
                      : me.deckId
                        ? "Sentar à mesa (jogar)"
                        : "Escolha um deck para jogar"}
                  </button>
                )}
              </div>
            )}

            <div className={styles.footer}>
              {room.status === "IN_GAME" && room.currentGameId ? (
                <button className={`${styles.primary} ${styles.primaryFlex}`} onClick={onGoToGame}>
                  {me?.role === "SPECTATOR" ? "Assistir a partida" : "Voltar para a partida"}
                </button>
              ) : isHost ? (
                <button
                  className={`${styles.primary} ${styles.primaryFlex}`}
                  disabled={!canStart || starting}
                  onClick={onStart}
                >
                  {starting
                    ? "Iniciando…"
                    : canStart
                      ? "Iniciar partida"
                      : `Aguardando decks (${readyCount}/${players.length})`}
                </button>
              ) : (
                <div className={styles.waiting}>Aguardando o host iniciar…</div>
              )}
              <button className={styles.secondary} onClick={onLeave}>
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
