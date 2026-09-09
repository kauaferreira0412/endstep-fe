import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import type { GameCard } from "@/types/game";

/** Atalhos da mesa (endstep.txt secao 58). Agem sobre a carta selecionada. */
export function useGameShortcuts(selected: GameCard | null) {
  const s = useGameStore();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;

      if (e.key === "d" || e.key === "D") {
        s.draw(1);
        return;
      }
      if (!selected) return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          s.setTapped(selected.id, !selected.tapped);
          break;
        case "g":
        case "G":
          s.moveCard(selected.id, "GRAVEYARD");
          break;
        case "e":
        case "E":
          s.moveCard(selected.id, "EXILE");
          break;
        case "r":
        case "R":
          s.rotate(selected.id, (selected.rotation || 0) + 180);
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, s]);
}
