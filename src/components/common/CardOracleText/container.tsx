import { useEffect, useState } from "react";
import { useTranslationStore } from "@/stores/translationStore";
import { CardOracleTextView } from "./index";

type Ref = { oracleId: string } | { oracleCardId: number };

interface Props {
  reference: Ref;
  original: string | null | undefined;
  className?: string;
  hideToggle?: boolean;
}

export function CardOracleText({ reference, original, className, hideToggle }: Props) {
  // sempre comeca em ingles; a traducao e opt-in por visualizacao (nao persiste)
  const [showPt, setShowPt] = useState(false);
  const ensure = useTranslationStore((s) => s.ensure);
  const key = "oracleId" in reference ? `u:${reference.oracleId}` : `o:${reference.oracleCardId}`;
  const entry = useTranslationStore((s) => s.cache[key]);

  useEffect(() => {
    setShowPt(false);
  }, [key]);

  useEffect(() => {
    if (showPt) ensure(reference);
  }, [showPt, key]); // eslint-disable-line react-hooks/exhaustive-deps

  const t = entry?.status === "ok" ? entry.data : null;
  const showTranslated = showPt && t && t.source !== "none" && t.oracleText;
  const body = showTranslated ? t!.oracleText : original;

  return (
    <CardOracleTextView
      enabled={showPt}
      loading={showPt && entry?.status === "loading"}
      source={showPt ? (t?.source ?? null) : null}
      body={original == null && body == null ? null : body}
      className={className}
      hideToggle={hideToggle}
      onToggle={() => setShowPt((v) => !v)}
    />
  );
}
