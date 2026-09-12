import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import { tokenStore } from "@/services/api";
import type { ServerEnvelope } from "@/types/game";

/** URL absoluta do endpoint STOMP (o Vite faz proxy de /ws com ws:true). */
function wsUrl(): string {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
}

export interface GameSocketHandlers {
  onEnvelope: (env: ServerEnvelope) => void;
  onStatus?: (status: "connecting" | "connected" | "disconnected") => void;
}

/**
 * Uma conexao STOMP por partida. Reconecta sozinho; ao (re)conectar manda
 * /app/game/{id}/join para receber o snapshot atual (endstep.txt secao 32).
 */
export class GameSocket {
  private client: Client | null = null;
  private sub: StompSubscription | null = null;
  private gameId: number;
  private handlers: GameSocketHandlers;

  constructor(gameId: number, handlers: GameSocketHandlers) {
    this.gameId = gameId;
    this.handlers = handlers;
  }

  connect() {
    if (this.client) return;
    const client = new Client({
      brokerURL: wsUrl(),
      connectHeaders: { Authorization: `Bearer ${tokenStore.access() ?? ""}` },
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.handlers.onStatus?.("connected");
        this.sub = client.subscribe(`/user/queue/game/${this.gameId}`, (msg: IMessage) => {
          try {
            this.handlers.onEnvelope(JSON.parse(msg.body) as ServerEnvelope);
          } catch {
            /* ignora frame malformado */
          }
        });
        client.publish({
          destination: `/app/game/${this.gameId}/join`,
          body: "{}",
          headers: { "content-type": "application/json" },
        });
      },
      onWebSocketClose: () => this.handlers.onStatus?.("disconnected"),
      onStompError: () => this.handlers.onStatus?.("disconnected"),
    });
    this.handlers.onStatus?.("connecting");
    client.activate();
    this.client = client;
  }

  send(type: string, payload: Record<string, unknown> = {}) {
    this.client?.publish({
      destination: `/app/game/${this.gameId}/act`,
      body: JSON.stringify({ type, payload }),
      headers: { "content-type": "application/json" },
    });
  }

  searching(active: boolean) {
    this.client?.publish({
      destination: `/app/game/${this.gameId}/searching`,
      body: JSON.stringify({ active }),
      headers: { "content-type": "application/json" },
    });
  }

  chat(text: string) {
    this.client?.publish({
      destination: `/app/game/${this.gameId}/chat`,
      body: JSON.stringify({ text }),
      headers: { "content-type": "application/json" },
    });
  }

  disconnect() {
    this.sub?.unsubscribe();
    this.sub = null;
    void this.client?.deactivate();
    this.client = null;
  }
}
