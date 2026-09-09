import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useDeckStore } from "@/stores/deckStore";
import { useRoomStore } from "@/stores/roomStore";
import { dialog } from "@/stores/dialogStore";
import { RoomLobbyView } from "./index";

export function RoomLobby() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { decks, bootstrap } = useDeckStore();
  const { room, open, join, leave, chooseDeck, refresh, error } = useRoomStore();

  const [password, setPassword] = useState("");
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [sitting, setSitting] = useState(false);

  useEffect(() => {
    void bootstrap();
    void open(code);
  }, [code, open, bootstrap]);

  const me = useMemo(
    () => room?.players.find((p) => p.userId === user?.id) ?? null,
    [room, user],
  );
  const isHost = room?.hostUserId === user?.id;
  const inRoom = !!me;

  useEffect(() => {
    if (!room) return;
    const t = setInterval(() => void refresh(code), 2500);
    return () => clearInterval(t);
  }, [room, code, refresh]);

  useEffect(() => {
    if (room?.status !== "IN_GAME" || !room.currentGameId) return;
    if (me && me.role === "PLAYER") {
      navigate(`/game/${room.currentGameId}`, { replace: true });
    }
  }, [room, me, navigate]);

  async function doJoin(asSpectator: boolean) {
    setJoining(true);
    try {
      await join(code, password || undefined, asSpectator);
    } finally {
      setJoining(false);
    }
  }

  async function doStart() {
    setStarting(true);
    try {
      const { gameId } = await api.startRoom(code);
      navigate(`/game/${gameId}`);
    } catch (e) {
      setStarting(false);
      void dialog.alert({
        title: "Não foi possível iniciar",
        message: e instanceof Error ? e.message : "Falha ao iniciar",
      });
    }
  }

  async function doSit() {
    setSitting(true);
    try {
      const { gameId } = await api.sitAtTable(code);
      if (gameId) navigate(`/game/${gameId}`);
      else await refresh(code);
    } catch (e) {
      void dialog.alert({
        title: "Erro",
        message: e instanceof Error ? e.message : "Não foi possível sentar à mesa",
      });
    } finally {
      setSitting(false);
    }
  }

  async function doLeave() {
    await leave(code);
    navigate("/play");
  }

  const players = room?.players.filter((p) => p.role === "PLAYER") ?? [];
  const spectators = room?.players.filter((p) => p.role === "SPECTATOR") ?? [];
  const commanderFormat =
    room?.format === "commander" || room?.format === "brawl" || room?.format === "oathbreaker";
  const myDecks = decks.filter((d) => d.format === room?.format);
  const readyCount = players.filter((p) => p.deckId).length;
  const canStart = !!isHost && players.length >= 2 && readyCount === players.length;
  const chosenDeck = myDecks.find((d) => d.id === me?.deckId);
  const chosenDeckEmpty = !!chosenDeck && chosenDeck.cardCount === 0;

  return (
    <RoomLobbyView
      room={room}
      loadError={error}
      error={error}
      meUserId={user?.id}
      me={me}
      isHost={!!isHost}
      inRoom={inRoom}
      players={players}
      spectators={spectators}
      commanderFormat={!!commanderFormat}
      myDecks={myDecks}
      readyCount={readyCount}
      canStart={canStart}
      chosenDeckEmpty={chosenDeckEmpty}
      password={password}
      joining={joining}
      starting={starting}
      sitting={sitting}
      onBack={() => navigate("/play")}
      onPasswordChange={setPassword}
      onJoin={(asSpectator) => void doJoin(asSpectator)}
      onChooseDeck={(deckId) => void chooseDeck(code, deckId)}
      onSit={() => void doSit()}
      onStart={() => void doStart()}
      onGoToGame={() => room?.currentGameId && navigate(`/game/${room.currentGameId}`)}
      onLeave={() => void doLeave()}
    />
  );
}
