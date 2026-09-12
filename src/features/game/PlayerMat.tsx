import { useState } from "react";
import { dialog } from "@/stores/dialogStore";
import { useGameStore } from "@/stores/gameStore";
import type { GameCard, GamePlayer, Zone } from "@/types/game";
import { Battlefield } from "./Battlefield";
import { ZoneSlot } from "./ZoneSlot";

interface Props {
  player: GamePlayer;
  isMe: boolean;
  isActive: boolean;
  others: GamePlayer[];
  cardsOf: (ownerId: number, zone: Zone) => GameCard[];
  cardById: (id: number) => GameCard | undefined;
  selectedId: number | null;
  onSelect: (c: GameCard, e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent, c: GameCard) => void;
  onOpenZone: (zone: Zone, ownerUserId: number) => void;
  focused: boolean;
  onToggleFocus: () => void;
  meLocked?: boolean;
  multiSelected?: Set<number>;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/** Um quadrante da mesa: HUD + campo com zoom/pan + espaços fixos das zonas. */
export function PlayerMat({
  player,
  isMe,
  isActive,
  others,
  cardsOf,
  cardById,
  selectedId,
  onSelect,
  onContextMenu,
  onOpenZone,
  focused,
  onToggleFocus,
  meLocked,
  multiSelected,
}: Props) {
  const s = useGameStore();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const reset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom((z) => clamp(z * (e.deltaY < 0 ? 1.12 : 0.89), 0.4, 3));
  }

  const gone = player.status === "LEFT" || player.status === "LOST";
  const eliminated = player.status === "LOST" && player.life <= 0;
  const canControl = isMe && !meLocked;
  const bannerText =
    player.status === "LEFT"
      ? `${player.username} saiu da partida`
      : eliminated
        ? `${player.username} foi eliminado`
        : `${player.username} desistiu`;

  return (
    <div
      className={`relative h-full w-full overflow-hidden border-2 ${
        eliminated
          ? "border-danger/70"
          : isActive
            ? "border-brand"
            : isMe
              ? "border-line"
              : "border-line/40"
      } ${gone ? "opacity-60 grayscale" : ""}`}
    >
      {gone && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-start justify-center pt-10">
          <span
            className={`rounded-full border bg-bg/90 px-3 py-1 text-xs font-semibold shadow-glow ${
              eliminated || player.status === "LEFT"
                ? "border-danger/60 text-danger"
                : "border-warn/60 text-warn"
            }`}
          >
            {bannerText}
          </span>
        </div>
      )}

      {/* HUD */}
      <div className="absolute left-1 top-1 z-20 flex items-center gap-1 rounded-md bg-bg/85 px-1.5 py-0.5 text-xs backdrop-blur">
        <span className={`truncate font-semibold ${isActive ? "text-brand" : "text-ink"}`}>
          {player.username}
          {isMe && <span className="ml-1 text-ink-faint">(você)</span>}
        </span>
        {player.status === "LEFT" && (
          <span className="rounded bg-danger/20 px-1 text-[10px] font-semibold text-danger">saiu</span>
        )}
        {eliminated && (
          <span className="rounded bg-danger/25 px-1 text-[10px] font-bold text-danger">
            eliminado
          </span>
        )}
        {player.status === "LOST" && !eliminated && (
          <span className="rounded bg-warn/20 px-1 text-[10px] font-semibold text-warn">
            desistiu
          </span>
        )}
        {s.searching[player.userId] && (
          <span
            className="animate-pulse rounded bg-brand/25 px-1 text-[10px] font-semibold text-brand"
            title="Está olhando o próprio grimório agora"
          >
            🔍 procurando
          </span>
        )}
        <span className={player.connected ? "text-ok" : "text-danger"}>●</span>
        <span
          className="rounded bg-bg-elev px-1 text-[10px] text-ink-dim"
          title={`${player.handCount} cartas na mão`}
        >
          ✋ {player.handCount}
        </span>
        <span className="mx-1 h-3 w-px bg-line" />
        <button className="px-1 text-ink-faint hover:text-ink" onClick={() => s.changeLife(player.userId, -5)}>
          −5
        </button>
        <button className="px-1 text-ink-faint hover:text-ink" onClick={() => s.changeLife(player.userId, -1)}>
          −1
        </button>
        <button
          className="min-w-[26px] text-center text-sm font-bold"
          onClick={async () => {
            const v = await dialog.prompt({
              title: player.username,
              message: "Definir vida:",
              defaultValue: String(player.life),
            });
            if (v != null && v.trim() !== "" && !Number.isNaN(Number(v))) {
              s.setLife(player.userId, Number(v));
            }
          }}
        >
          {player.life}
        </button>
        <button className="px-1 text-ink-faint hover:text-ink" onClick={() => s.changeLife(player.userId, 1)}>
          +1
        </button>
        <button className="px-1 text-ink-faint hover:text-ink" onClick={() => s.changeLife(player.userId, 5)}>
          +5
        </button>
        <span className="mx-1 h-3 w-px bg-line" />
        {(
          [
            ["poison", "P", "Veneno (10 = perde)"],
            ["energy", "E", "Energia"],
            ["experience", "X", "Experiência"],
          ] as [string, string, string][]
        ).map(([k, sym, title]) => {
          const val = player.counters[k] ?? 0;
          const danger = k === "poison" && val >= 10;
          return (
            <button
              key={k}
              className={`rounded px-1 text-[10px] hover:text-ink ${
                danger ? "bg-danger/25 font-bold text-danger" : "bg-bg-elev text-ink-dim"
              }`}
              title={`${title}: clique +1, direito −1`}
              onClick={() => s.playerCounter(player.userId, k, 1)}
              onContextMenu={(e) => {
                e.preventDefault();
                s.playerCounter(player.userId, k, -1);
              }}
            >
              {sym}
              {val ? ` ${val}` : ""}
            </button>
          );
        })}
        <span className="mx-1 h-3 w-px bg-line" />
        <button
          className="rounded bg-gold/15 px-1 text-[10px] text-gold hover:brightness-125"
          title="Taxa de comandante (+2 de mana por vez que volta): clique +2, direito −2"
          onClick={() => s.playerCounter(player.userId, "cmdtax", 2)}
          onContextMenu={(e) => {
            e.preventDefault();
            s.playerCounter(player.userId, "cmdtax", -2);
          }}
        >
          ⛨ taxa {player.counters["cmdtax"] ?? 0}
        </button>
        {others.length > 0 && (
          <>
            <span className="mx-1 h-3 w-px bg-line" />
            {others.map((o) => (
              <button
                key={o.userId}
                className="rounded bg-bg-elev px-1 text-[10px] text-ink-faint hover:text-ink"
                title={`dano de commander de ${o.username}: clique +1, direito −1`}
                onClick={() => s.commanderDamage(o.userId, player.userId, 1)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  s.commanderDamage(o.userId, player.userId, -1);
                }}
              >
                ⚔{o.username.slice(0, 3)} {player.commanderDamage[String(o.userId)] ?? 0}
              </button>
            ))}
          </>
        )}
      </div>

      {/* zoom + foco */}
      <div className="absolute right-1 top-1 z-20 flex items-center gap-1 rounded-md bg-bg/85 px-1 py-0.5 text-xs backdrop-blur">
        <button className="px-1 text-ink-faint hover:text-ink" onClick={() => setZoom((z) => clamp(z * 0.89, 0.4, 3))}>
          −
        </button>
        <button className="w-10 text-center text-[10px] text-ink-dim" onClick={reset} title="resetar zoom">
          {Math.round(zoom * 100)}%
        </button>
        <button className="px-1 text-ink-faint hover:text-ink" onClick={() => setZoom((z) => clamp(z * 1.12, 0.4, 3))}>
          +
        </button>
        <span className="mx-0.5 h-3 w-px bg-line" />
        <button
          className={`px-1 ${focused ? "text-brand" : "text-ink-faint hover:text-ink"}`}
          onClick={onToggleFocus}
          title={focused ? "Voltar para todos os campos" : "Focar neste jogador (tela cheia)"}
        >
          {focused ? "⤢ todos" : "⛶"}
        </button>
      </div>

      {/* campo + coluna de zonas ao lado */}
      <div className="absolute inset-x-1 bottom-1 top-6 flex gap-1.5">
        <div className="min-w-0 flex-1" onWheel={onWheel}>
          <Battlefield
            cards={cardsOf(player.userId, "BATTLEFIELD")}
            cardWidth={Math.round((isMe ? 108 : 88) * zoom)}
            interactive={canControl}
            multiSelected={isMe ? multiSelected : undefined}
            onContextMenu={onContextMenu}
            onDropCard={
              canControl
                ? (id, x, y) => {
                    const c = cardById(id);
                    if (c && c.zone === "BATTLEFIELD") s.setPosition(id, x, y);
                    else s.playCard(id, x, y);
                  }
                : undefined
            }
            onSelect={onSelect}
            selectedId={selectedId}
            pan={pan}
            onPan={(dx, dy) => setPan((p) => ({ x: p.x + dx, y: p.y + dy }))}
          />
        </div>

        <div
          className={`flex shrink-0 flex-col gap-1.5 overflow-y-auto pr-0.5 ${
            focused ? "w-[188px]" : "w-[104px]"
          }`}
        >
          {(
            [
              ["COMMAND", "Comandante"],
              ["LIBRARY", "Grimório (deck)"],
              ["GRAVEYARD", "Cemitério"],
              ["EXILE", "Exílio"],
              ["STACK", "Pilha"],
            ] as [Zone, string][]
          )
            // a Pilha só ocupa espaço quando tem carta (ex.: após uma cascata)
            .filter(([zone]) => zone !== "STACK" || cardsOf(player.userId, "STACK").length > 0)
            .map(([zone, label]) => (
              <ZoneSlot
                key={zone}
                zone={zone}
                label={label}
                cards={cardsOf(player.userId, zone)}
                mine={canControl}
                big={focused}
                onOpen={() => onOpenZone(zone, player.userId)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
