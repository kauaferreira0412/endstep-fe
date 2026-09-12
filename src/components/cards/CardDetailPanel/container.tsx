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
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    let alive = true;
    setCard(null);
    setError(null);
    setShowBack(false);
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

  const frontImage =
    card?.printings.find((p) => p.imageLarge || p.imageNormal)?.imageLarge ??
    card?.printings.find((p) => p.imageNormal)?.imageNormal ??
    card?.faces.find((f) => f.faceIndex === 0 && (f.imageLarge || f.imageNormal))?.imageLarge ??
    null;
  const backFace = card?.faces.find((f) => f.faceIndex === 1) ?? null;
  const hasBackFace = !!backFace && (!!backFace.imageLarge || !!backFace.imageNormal);
  const image = showBack && backFace ? backFace.imageLarge ?? backFace.imageNormal ?? frontImage : frontImage;

  return (
    <CardDetailPanelView
      oracleId={oracleId}
      card={card}
      error={error}
      image={image}
      hasBackFace={hasBackFace}
      showBack={showBack}
      onToggleFace={() => setShowBack((s) => !s)}
      onClose={onClose}
    />
  );
}
