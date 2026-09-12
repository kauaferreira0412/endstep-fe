import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useGameStore } from "@/stores/gameStore";
import { dialog } from "@/stores/dialogStore";
import type { GameCard, Zone } from "@/types/game";
import { CardContextMenu } from "./CardContextMenu";
import { CardPreview } from "./CardPreview";
import { CascadeModal } from "./CascadeModal";
import { GameChat } from "./GameChat";
import { HandRail } from "./HandRail";
import { LookTopModal } from "./LookTopModal";
import { PlayerMat } from "./PlayerMat";
import { TokenModal } from "./TokenModal";
import { AddCardModal } from "@/components/game/AddCardModal/container";
import { TurnBar } from "./TurnBar";
import { ZoneBrowser } from "./ZoneBrowser";
import { playTurnChime } from "./turnSound";
import { useGameShortcuts } from "./useGameShortcuts";

const SOUND_KEY = "endstep.turnSound";
const HAND_ACTIONS_WIDTH = 132;

/** Colunas/linhas do grid de mesas conforme o nº de jogadores. */
function gridShape(n: number): { cols: number; rows: number } {
  if (n <= 1) return { cols: 1, rows: 1 };
  if (n === 2) return { cols: 1, rows: 2 };
  if (n <= 4) return { cols: 2, rows: 2 };
  return { cols: 3, rows: 2 };
}

export function GameTable() {
  const { id = "" } = useParams();
  const gameId = Number(id);
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);

  const {
    connect,
    disconnect,
    conn,
    error,
    players,
    cards,
    meUserId,
    roomCode,
    status,
    turn,
    leaveGame,
    surrender,
    setTapped,
    untapAll,
    passTurn,
  } = useGameStore();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set());
  const [menu, setMenu] = useState<{ x: number; y: number; card: GameCard } | null>(null);
  const [browse, setBrowse] = useState<{ zone: Zone; ownerUserId: number } | null>(null);
  const [chatOpen, setChatOpen] = useState(true);
  const [focusedUserId, setFocusedUserId] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(() => {
    try {
      return localStorage.getItem(SOUND_KEY) !== "off";
    } catch {
      return true;
    }
  });
  const [myTurnToast, setMyTurnToast] = useState(false);

  useEffect(() => {
    if (gameId) connect(gameId);
    return () => disconnect();
  }, [gameId, connect, disconnect]);

  const me = meUserId ?? authUser?.id ?? null;
  const myPlayer = me != null ? players[me] : undefined;
  const iAmOut = !!myPlayer && myPlayer.status !== "PLAYING";
  const iAmEliminated = !!myPlayer && myPlayer.status === "LOST" && myPlayer.life <= 0;
  const selected = selectedId != null ? cards[selectedId] ?? null : null;
  useGameShortcuts(selected, iAmOut);

  useEffect(() => {
    if (multiSelected.size === 0) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMultiSelected(new Set());
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [multiSelected.size]);

  // aviso (som + toast) quando VIRA a vez do jogador
  const prevActive = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    const active = turn?.activeUserId ?? null;
    const was = prevActive.current;
    prevActive.current = active;
    if (was === undefined) return; // 1ª render / reconexão: não dispara
    if (active != null && active === me && was !== me) {
      if (soundOn) playTurnChime();
      setMyTurnToast(true);
      const t = window.setTimeout(() => setMyTurnToast(false), 3500);
      return () => window.clearTimeout(t);
    }
  }, [turn?.activeUserId, me, soundOn]);

  function toggleSound() {
    setSoundOn((on) => {
      const next = !on;
      try {
        localStorage.setItem(SOUND_KEY, next ? "on" : "off");
      } catch {
        /* ignore */
      }
      if (next) playTurnChime(); // feedback de que ligou
      return next;
    });
  }

  const playerList = useMemo(
    () => Object.values(players).sort((a, b) => a.seat - b.seat),
    [players],
  );
  const iAmPlayer = me != null && playerList.some((p) => p.userId === me);
  const myCardTotal = me == null ? 0 : Object.values(cards).filter((c) => c.ownerUserId === me).length;

  const cardsOf = useMemo(() => {
    return (ownerId: number, zone: Zone) =>
      Object.values(cards)
        .filter((c) => c.ownerUserId === ownerId && c.zone === zone)
        .sort((a, b) => a.position - b.position);
  }, [cards]);

  function openMenu(e: React.MouseEvent, card: GameCard) {
    e.preventDefault();
    if (iAmOut) return;
    setSelectedId(card.id);
    setMenu({ x: e.clientX, y: e.clientY, card });
  }

  if (!me || (!turn && conn !== "connected")) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-sm text-ink-faint">
        {conn === "disconnected" ? "Reconectando à partida…" : "Entrando na partida…"}
      </div>
    );
  }

  // "me" por último no grid (fica no canto inferior)
  const ordered = [...playerList.filter((p) => p.userId !== me), ...playerList.filter((p) => p.userId === me)];
  // modo foco: só o quadrante escolhido, em tela cheia
  const focusValid = focusedUserId != null && ordered.some((p) => p.userId === focusedUserId);
  const visibleMats = focusValid ? ordered.filter((p) => p.userId === focusedUserId) : ordered;
  const { cols, rows } = gridShape(visibleMats.length);
  const focusedName = focusValid
    ? playerList.find((p) => p.userId === focusedUserId)?.username
    : null;

  const BANNER_H = 26;
  const banner: { text: string; tone: "warn" | "info" | "danger" } | null = iAmOut
    ? {
        text: iAmEliminated
          ? "☠ Você foi eliminado — agora só assiste à partida."
          : myPlayer?.status === "LEFT"
            ? "Você saiu da partida — agora só assiste."
            : "Você desistiu — agora só assiste à partida.",
        tone: "danger",
      }
    : !iAmPlayer
      ? {
          text: "👁 Você está assistindo · para jogar, volte ao lobby e clique em “Sentar à mesa”.",
          tone: "info",
        }
      : myCardTotal === 0
        ? {
            text: "Sua partida entrou sem cartas — o deck escolhido está vazio. Volte ao lobby e escolha um deck com cartas.",
            tone: "warn",
          }
        : null;
  const topOffset = 36 + (banner ? BANNER_H : 0);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-bg text-ink">
      {/* topo */}
      <div className="absolute inset-x-0 top-0 z-40 flex h-9 items-center gap-3 border-b border-line bg-bg/90 px-3 text-xs backdrop-blur">
        <button
          className="shrink-0 text-ink-faint hover:text-ink"
          onClick={() => {
            if (iAmPlayer && status !== "FINISHED") leaveGame();
            navigate("/play");
          }}
        >
          ← sair
        </button>
        {iAmPlayer && !iAmOut && status !== "FINISHED" && (
          <button
            className="shrink-0 text-danger/80 hover:text-danger"
            onClick={async () => {
              const ok = await dialog.confirm({
                title: "Conceder a partida",
                message: "Você vai desistir e sair de jogo — os outros continuam. Confirma?",
                okLabel: "Conceder",
                danger: true,
              });
              if (ok) surrender();
            }}
          >
            Conceder
          </button>
        )}
        <span className="shrink-0 font-semibold">Mesa {roomCode}</span>
        <span className={`shrink-0 ${conn === "connected" ? "text-ok" : "text-warn"}`}>
          {conn === "connected" ? "conectado" : conn}
        </span>
        {status === "FINISHED" && <span className="shrink-0 text-warn">encerrada</span>}
        {focusedName && (
          <button
            className="shrink-0 rounded border border-brand/50 bg-brand/15 px-2 py-0.5 text-brand"
            onClick={() => setFocusedUserId(null)}
            title="Sair do foco"
          >
            ⛶ {focusedName} · voltar
          </button>
        )}
        <div className="ml-auto min-w-0 flex-1 overflow-x-auto">
          <TurnBar />
        </div>
        <button
          className="shrink-0 rounded border border-line px-1.5 py-0.5 text-ink-faint hover:text-ink"
          onClick={toggleSound}
          title={soundOn ? "Som da sua vez: ligado" : "Som da sua vez: desligado"}
        >
          {soundOn ? "🔔" : "🔕"}
        </button>
        <button
          className="shrink-0 rounded border border-line px-2 py-0.5 text-ink-faint hover:text-ink"
          onClick={() => setChatOpen((o) => !o)}
        >
          {chatOpen ? "ocultar chat" : "chat"}
        </button>
      </div>

      {myTurnToast && (
        <div className="pointer-events-none absolute left-1/2 top-14 z-[75] -translate-x-1/2 animate-fade-in rounded-full border border-brand/50 bg-brand/20 px-4 py-1.5 text-sm font-semibold text-brand shadow-glow">
          🔔 Sua vez!
        </div>
      )}

      {banner && (
        <div
          className={`absolute inset-x-0 z-30 flex items-center justify-center px-3 text-center text-[11px] ${
            banner.tone === "danger"
              ? "bg-danger/20 font-semibold text-danger"
              : banner.tone === "warn"
                ? "bg-warn/15 text-warn"
                : "bg-brand/15 text-brand"
          }`}
          style={{ top: 36, height: BANNER_H }}
        >
          {banner.text}
        </div>
      )}

      {/* grid de mesas — encolhe quando o chat está aberto (sem sobrepor) */}
      <div
        className="absolute grid gap-1 p-1"
        style={{
          left: 0,
          right: chatOpen ? 296 : 0,
          top: topOffset,
          bottom: iAmPlayer && !iAmOut ? "132px" : "0px",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          // com 2 jogadores empilhados, meu quadrante (embaixo) ganha mais altura
          gridTemplateRows:
            visibleMats.length === 2 ? "0.82fr 1.18fr" : `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {visibleMats.map((p, i) => (
          <div
            key={p.userId}
            className="min-h-0 min-w-0"
            style={visibleMats.length === 3 && i === 2 ? { gridColumn: "span 2" } : undefined}
          >
            <PlayerMat
              player={p}
              isMe={p.userId === me}
              meLocked={iAmOut}
              isActive={turn?.activeUserId === p.userId}
              others={playerList.filter((o) => o.userId !== p.userId)}
              cardsOf={cardsOf}
              cardById={(cid) => cards[cid]}
              selectedId={selectedId}
              multiSelected={multiSelected}
              onSelect={(c, e) => {
                if (e.ctrlKey || e.metaKey || e.shiftKey) {
                  setMultiSelected((prev) => {
                    const next = new Set(prev);
                    if (next.has(c.id)) next.delete(c.id);
                    else next.add(c.id);
                    return next;
                  });
                  return;
                }
                setMultiSelected(new Set());
                setSelectedId(c.id);
              }}
              onContextMenu={openMenu}
              onOpenZone={(zone, ownerUserId) => setBrowse({ zone, ownerUserId })}
              focused={focusValid && p.userId === focusedUserId}
              onToggleFocus={() =>
                setFocusedUserId((f) => (f === p.userId ? null : p.userId))
              }
            />
          </div>
        ))}
      </div>

      {/* chat: coluna fixa à direita (não sobrepõe o grid) */}
      {chatOpen && (
        <div
          className={`absolute right-0 z-30 flex w-[292px] flex-col border-l border-line bg-bg/95 p-2 ${
            iAmPlayer && !iAmOut ? "bottom-[132px]" : "bottom-0"
          }`}
          style={{ top: topOffset }}
        >
          <GameChat />
        </div>
      )}

      {/* minha mão (só jogador ativo) — alinhada com a borda direita do campo (mesmo
          limite do chat); os botões ocupam esse mesmo espaço, por baixo do chat,
          sem tirar largura extra das cartas */}
      {iAmPlayer && !iAmOut && (
        <>
          <div
            className="absolute bottom-0 z-40 h-[132px]"
            style={{ left: 0, right: chatOpen ? 296 : HAND_ACTIONS_WIDTH }}
          >
            <HandRail
              cards={cardsOf(me, "HAND")}
              onContextMenu={openMenu}
              selectedId={selectedId}
              onSelect={(c) => setSelectedId(c.id)}
            />
          </div>
          <div
            className="absolute bottom-0 right-0 z-40 flex h-[132px] flex-col items-center justify-center gap-1 border-l border-t border-line bg-bg/90 px-3 backdrop-blur"
            style={{ width: chatOpen ? 296 : HAND_ACTIONS_WIDTH }}
          >
            <button
              className="btn btn-ghost !py-1 text-[11px]"
              onClick={untapAll}
              title="Desvirar todas as suas cartas"
            >
              ⟳ Desvirar tudo
            </button>
            <button
              className="btn btn-primary !py-1 text-[11px]"
              onClick={passTurn}
              title="Passar o turno"
            >
              ⏭ Passar turno
            </button>
          </div>
        </>
      )}

      {/* barra de seleção múltipla (ctrl/cmd/shift+clique nas cartas do campo) */}
      {multiSelected.size > 0 && (
        <div className="absolute left-1/2 top-12 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-gold/50 bg-bg-elev px-3 py-1.5 text-xs shadow-pop">
          <span className="text-gold">{multiSelected.size} carta(s) selecionada(s)</span>
          <button
            className="btn btn-ghost !py-1 text-[11px]"
            onClick={() => {
              multiSelected.forEach((id) => setTapped(id, true));
            }}
          >
            Virar (tap)
          </button>
          <button
            className="btn btn-ghost !py-1 text-[11px]"
            onClick={() => {
              multiSelected.forEach((id) => setTapped(id, false));
            }}
          >
            Desvirar
          </button>
          <button className="btn btn-ghost !py-1 text-[11px]" onClick={() => setMultiSelected(new Set())}>
            Limpar
          </button>
        </div>
      )}


      <CardPreview />
      <CascadeModal />
      <LookTopModal />
      <TokenModal />
      <AddCardModal />
      {menu && <CardContextMenu x={menu.x} y={menu.y} card={menu.card} onClose={() => setMenu(null)} />}
      {browse && (
        <ZoneBrowser zone={browse.zone} ownerUserId={browse.ownerUserId} onClose={() => setBrowse(null)} />
      )}
      {error && (
        <div className="fixed bottom-[160px] left-1/2 z-[70] -translate-x-1/2 rounded-lg border border-danger/40 bg-danger/15 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      )}
    </div>
  );
}
