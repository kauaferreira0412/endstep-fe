import type { CardSummary } from "@/types/card";
import { CardGridView } from "./index";

interface Props {
  cards: CardSummary[];
  onSelect: (oracleId: string) => void;
}

export function CardGrid({ cards, onSelect }: Props) {
  return <CardGridView cards={cards} onSelect={onSelect} />;
}
