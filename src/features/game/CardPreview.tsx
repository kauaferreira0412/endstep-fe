import { useEffect, useRef, useState } from "react";
import { CardOracleText } from "@/components/common/CardOracleText/container";
import { useHoverStore } from "@/stores/hoverStore";

/**
 * Preview grande da carta. Aparece com Alt+clique e some ao soltar o Alt —
 * mas continua aberto enquanto o mouse estiver sobre o painel (pra dar pra
 * clicar em "Ver em português").
 */
export function CardPreview() {
  const card = useHoverStore((s) => s.card);
  const clear = useHoverStore((s) => s.clear);
  const [pinned, setPinned] = useState(false);
  const pinnedRef = useRef(false);
  pinnedRef.current = pinned;

  useEffect(() => {
    if (!card) return;
    setPinned(false);
    const onKeyUp = (e: KeyboardEvent) => {
      if ((e.key === "Alt" || !e.altKey) && !pinnedRef.current) clear();
    };
    const onBlur = () => clear();
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [card, clear]);

  if (!card || card.faceDown) return null;
  const img =
    card.identity?.imageLarge ?? card.identity?.imageNormal ?? card.identity?.imageSmall ?? null;
  if (!img) return null;

  const oracleCardId = card.identity?.oracleCardId ?? null;
  const oracleText = card.identity?.oracleText ?? null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-[90] w-[360px] max-w-[30vw] drop-shadow-2xl"
      onMouseEnter={() => setPinned(true)}
      onMouseLeave={(e) => {
        setPinned(false);
        if (!e.altKey) clear();
      }}
    >
      <img
        src={img}
        alt={card.identity?.name ?? ""}
        className="w-full rounded-xl ring-1 ring-white/10"
      />
      {oracleCardId != null && (
        <div className="pointer-events-auto mt-1 max-h-[38vh] overflow-y-auto rounded-lg border border-line bg-bg/95 p-2 backdrop-blur">
          <CardOracleText
            reference={{ oracleCardId }}
            original={oracleText}
            className="whitespace-pre-wrap text-[12px] leading-snug text-ink"
          />
        </div>
      )}
      <p className="mt-1 text-center text-[10px] text-ink-faint">
        solte Alt para fechar (ou passe o mouse aqui para manter)
      </p>
    </div>
  );
}
