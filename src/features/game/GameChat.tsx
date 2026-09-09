import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/stores/gameStore";

export function GameChat() {
  const { chat, log, sendChat } = useGameStore();
  const [tab, setTab] = useState<"chat" | "log">("chat");
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [chat, log, tab]);

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-line bg-bg-elev/40">
      <div className="flex border-b border-line text-xs">
        {(["chat", "log"] as const).map((t) => (
          <button
            key={t}
            className={`flex-1 py-1.5 ${tab === t ? "border-b-2 border-brand text-ink" : "text-ink-faint"}`}
            onClick={() => setTab(t)}
          >
            {t === "chat" ? "Chat" : "Histórico"}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2 text-xs">
        {tab === "chat"
          ? chat.map((m) => (
              <div key={m.id} className={m.kind === "SYSTEM" ? "text-ink-faint italic" : "text-ink-dim"}>
                {m.kind === "USER" && <span className="font-medium text-ink">{m.username}: </span>}
                {m.body}
              </div>
            ))
          : log
              .slice()
              .reverse()
              .map((l) => (
                <div key={l.sequence} className="text-ink-faint">
                  {l.line}
                </div>
              ))}
        {tab === "chat" && chat.length === 0 && <p className="text-ink-faint">sem mensagens</p>}
      </div>

      {tab === "chat" && (
        <form
          className="flex gap-1 border-t border-line p-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim()) {
              sendChat(text.trim());
              setText("");
            }
          }}
        >
          <input
            className="input flex-1 !py-1 text-xs"
            placeholder="mensagem…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-ghost !py-1 text-xs" type="submit">
            enviar
          </button>
        </form>
      )}
    </div>
  );
}
