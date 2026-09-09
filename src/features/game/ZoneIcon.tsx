import type { Zone } from "@/types/game";

/** Glifo que representa cada zona-pilha. currentColor, escalável. */
export function ZoneIcon({ zone, size = 12 }: { zone: Zone; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };
  switch (zone) {
    case "COMMAND": // coroa
      return (
        <svg {...common}>
          <path d="M2 12h12M3 12l-.8-6 3.4 3L8 3l2.4 6L13.8 6 13 12" />
        </svg>
      );
    case "LIBRARY": // pilha de cartas
      return (
        <svg {...common}>
          <rect x="4.5" y="2.5" width="7" height="9" rx="1.2" />
          <path d="M6.5 13.5h7M8 15h5" />
        </svg>
      );
    case "GRAVEYARD": // lápide
      return (
        <svg {...common}>
          <path d="M4 14V7a4 4 0 018 0v7" />
          <path d="M3 14h10M8 7v4M6 9h4" />
        </svg>
      );
    case "EXILE": // sol / vazio
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="3" />
          <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" />
        </svg>
      );
    case "STACK":
      return (
        <svg {...common}>
          <path d="M2 5l6-3 6 3-6 3-6-3zM2 8l6 3 6-3M2 11l6 3 6-3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="3" y="3" width="10" height="10" rx="2" />
        </svg>
      );
  }
}
