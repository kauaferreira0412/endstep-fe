import { useEffect } from "react";
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
  const enabled = useTranslationStore((s) => s.enabled);
  const toggle = useTranslationStore((s) => s.toggle);
  const ensure = useTranslationStore((s) => s.ensure);
  const key = "oracleId" in reference ? `u:${reference.oracleId}` : `o:${reference.oracleCardId}`;
  const entry = useTranslationStore((s) => s.cache[key]);

  useEffect(() => {
    if (enabled) ensure(reference);
  }, [enabled, key]); // eslint-disable-line react-hooks/exhaustive-deps

  const t = entry?.status === "ok" ? entry.data : null;
  const showTranslated = enabled && t && t.source !== "none" && t.oracleText;
  const body = showTranslated ? t!.oracleText : original;

  return (
    <CardOracleTextView
      enabled={enabled}
      loading={enabled && entry?.status === "loading"}
      source={t?.source ?? null}
      body={original == null && body == null ? null : body}
      className={className}
      hideToggle={hideToggle}
      onToggle={toggle}
    />
  );
}
