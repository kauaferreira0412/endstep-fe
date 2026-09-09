import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { CardDetail } from "@/types/card";
import { CardDetailPanelView } from "./index";

interface Props {
  oracleId: string;
  onClose: () => void;
}

export function CardDetailPanel({ oracleId, onClose }: Props) {
  const [card, setCard] = useState<CardDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setCard(null);
    setError(null);
    api
      .getCard(oracleId)
      .then((c) => alive && setCard(c))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Erro"));
    return () => {
      alive = false;
    };
  }, [oracleId]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const image =
    card?.printings.find((p) => p.imageLarge || p.imageNormal)?.imageLarge ??
    card?.printings.find((p) => p.imageNormal)?.imageNormal ??
    card?.faces.find((f) => f.imageLarge || f.imageNormal)?.imageLarge ??
    null;

  return (
    <CardDetailPanelView
      oracleId={oracleId}
      card={card}
      error={error}
      image={image}
      onClose={onClose}
    />
  );
}
