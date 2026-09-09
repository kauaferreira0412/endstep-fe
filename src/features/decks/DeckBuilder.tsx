import { useMemo, useState } from "react";
import { useDeckStore } from "@/stores/deckStore";
import { dialog } from "@/stores/dialogStore";
import { api } from "@/services/api";
import type { DeckCardChange, DeckCardView, DeckDetail, Section } from "@/types/deck";
import { ManaCost, ColorIdentity } from "./ManaCost";
import { DeckValidationPanel } from "./DeckValidationPanel";
import { DeckStatsPanel } from "./DeckStatsPanel";
import { AddCardsPanel } from "./AddCardsPanel";
import { ArtPicker } from "./ArtPicker";
import { CardDetailPanel } from "@/components/cards/CardDetailPanel/container";
import { SuggestDeckModal } from "@/components/decks/SuggestDeckModal/container";

const SECTION_LABEL: Record<Section, string> = {
  COMMANDER: "Comandante",
  MAINBOARD: "Deck",
  SIDEBOARD: "Sideboard",
  MAYBEBOARD: "Talvez",
};

const TYPE_ORDER = [
  "Creature",
  "Planeswalker",
  "Instant",
  "Sorcery",
  "Artifact",
  "Enchantment",
  "Battle",
  "Land",
  "Outro",
];

export function DeckBuilder({ detail }: { detail: DeckDetail }) {
  const { patchDeck, applyCards, savingCards, setDetail } = useDeckStore();
  const [showAdd, setShowAdd] = useState(true);
  const [artCard, setArtCard] = useState<DeckCardView | null>(null);
  const [viewOracleId, setViewOracleId] = useState<string | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);

  const bySection = useMemo(() => {
    const map: Record<Section, DeckCardView[]> = {
      COMMANDER: [],
      MAINBOARD: [],
      SIDEBOARD: [],
      MAYBEBOARD: [],
    };
    detail.cards.forEach((c) => map[c.section].push(c));
    return map;
  }, [detail.cards]);

  const uses = detail.formatRules.usesCommandZone;
  const sectionsToShow: Section[] = uses
    ? ["COMMANDER", "MAINBOARD", "SIDEBOARD", "MAYBEBOARD"]
    : ["MAINBOARD", "SIDEBOARD", "MAYBEBOARD"];

  function apply(changes: DeckCardChange[]) {
    void applyCards(changes);
  }

  function addCard(oracleId: string, section: Section) {
    const existing = detail.cards.find((c) => c.oracleId === oracleId && c.section === section);
    apply([{ oracleId, section, quantity: (existing?.quantity ?? 0) + 1 }]);
  }

  function setQty(card: DeckCardView, qty: number) {
    apply([{ oracleId: card.oracleId, section: card.section, quantity: Math.max(0, qty) }]);
  }

  function moveTo(card: DeckCardView, to: Section) {
    apply([
      { oracleId: card.oracleId, section: card.section, quantity: 0 },
      { oracleId: card.oracleId, section: to, quantity: to === "COMMANDER" ? 1 : card.quantity },
    ]);
  }

  const [exporting, setExporting] = useState<string | null>(null);
  const [txtView, setTxtView] = useState<string | null>(null);
  async function doExport(fmt: "txt" | "csv" | "json" | "pdf") {
    setExporting(fmt);
    try {
      await api.exportDeck(detail.id, fmt);
    } catch {
      /* ignore */
    } finally {
      setExporting(null);
    }
  }
  async function openTxt() {
    setExporting("txt");
    try {
      setTxtView(await api.exportDeckText(detail.id, "txt"));
    } catch (e) {
      void dialog.alert({
        title: "Não deu para gerar o texto",
        message: e instanceof Error ? e.message : "Falha ao exportar",
      });
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-3">
      {/* header */}
      <div className="card flex flex-wrap items-center gap-3 p-3">
        <ColorIdentity ci={detail.colorIdentity} />
        <button
          className="text-lg font-semibold text-ink hover:text-brand"
          onClick={async () => {
            const n = await dialog.prompt({
              title: "Renomear deck",
              message: "Novo nome do deck:",
              defaultValue: detail.name,
            });
            if (n && n.trim()) void patchDeck(detail.id, { name: n.trim() });
          }}
          title="Clique para renomear"
        >
          {detail.name}
        </button>
        {detail.folderPath.length > 0 && (
          <span className="text-xs text-ink-faint">{detail.folderPath.join(" / ")}</span>
        )}
        {detail.suggestedByUsername && (
          <span
            className="rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-[11px] text-brand"
            title="Deck sugerido por um amigo"
          >
            ↗ sugerido por {detail.suggestedByUsername}
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            className="btn !py-1.5 text-sm"
            onClick={() => setSuggestOpen(true)}
            title="Sugerir este deck para um amigo"
          >
            ↗ Sugerir
          </button>
          <span className="rounded-lg border border-line bg-bg-input/60 px-2.5 py-1.5 text-sm text-ink-dim">
            ◈ Commander
          </span>
          <button
            className={`btn !py-1.5 text-sm ${detail.favorite ? "text-gold" : ""}`}
            onClick={() => void patchDeck(detail.id, { favorite: !detail.favorite })}
            title="Favoritar"
          >
            {detail.favorite ? "★" : "☆"}
          </button>
          <div className="flex overflow-hidden rounded-lg border border-line text-sm">
            <button
              className="border-l border-line px-2.5 py-1.5 first:border-l-0 hover:bg-bg-elev disabled:opacity-50"
              onClick={() => void openTxt()}
              disabled={exporting !== null}
              title="Ver o deck em texto e copiar"
            >
              {exporting === "txt" ? "…" : "txt"}
            </button>
            {(["csv", "json", "pdf"] as const).map((f) => (
              <button
                key={f}
                className="border-l border-line px-2.5 py-1.5 first:border-l-0 hover:bg-bg-elev disabled:opacity-50"
                onClick={() => void doExport(f)}
                disabled={exporting !== null}
                title={f === "pdf" ? "PDF com as imagens das cartas" : `Baixar .${f}`}
              >
                {exporting === f ? "…" : f}
              </button>
            ))}
          </div>
          <button
            className="btn !py-1.5 text-sm"
            onClick={() => setShowAdd((s) => !s)}
          >
            {showAdd ? "Ocultar busca" : "＋ Cartas"}
          </button>
        </div>
      </div>

      {/* body */}
      <div className="grid min-h-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-h-0 grid-rows-[1fr_auto] gap-3">
          <div className="card min-h-0 overflow-y-auto p-4">
            {sectionsToShow.map((section) => {
              const cards = bySection[section];
              if (cards.length === 0 && section !== "MAINBOARD" && section !== "COMMANDER") return null;
              if (cards.length === 0 && section === "COMMANDER" && !uses) return null;
              return (
                <SectionBlock
                  key={section}
                  section={section}
                  cards={cards}
                  disabled={savingCards}
                  onSetQty={setQty}
                  onMoveTo={moveTo}
                  onArt={setArtCard}
                  onView={(c) => setViewOracleId(c.oracleId)}
                  usesCommandZone={uses}
                />
              );
            })}
          </div>
          {showAdd && (
            <div className="h-[280px]">
              <AddCardsPanel onAdd={addCard} usesCommandZone={uses} />
            </div>
          )}
        </div>

        <div className="space-y-3 overflow-y-auto">
          <DeckValidationPanel v={detail.validation} />
          <DeckStatsPanel stats={detail.stats} />
        </div>
      </div>

      {artCard && (
        <ArtPicker
          deckId={detail.id}
          oracleId={artCard.oracleId}
          cardName={artCard.name}
          section={artCard.section}
          current={{ printingId: artCard.printingId, customArtId: artCard.customArtId }}
          baseImageUrl={artCard.imageLarge ?? artCard.imageNormal ?? artCard.imageSmall ?? ""}
          onClose={() => setArtCard(null)}
          onChanged={(d) => {
            setDetail(d);
            setArtCard(null);
          }}
        />
      )}

      {viewOracleId && (
        <CardDetailPanel oracleId={viewOracleId} onClose={() => setViewOracleId(null)} />
      )}

      {txtView != null && (
        <DeckTxtModal
          text={txtView}
          deckName={detail.name}
          onDownload={() => void doExport("txt")}
          onClose={() => setTxtView(null)}
        />
      )}

      {suggestOpen && (
        <SuggestDeckModal
          deckId={detail.id}
          deckName={detail.name}
          onClose={() => setSuggestOpen(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------

function DeckTxtModal({
  text,
  deckName,
  onDownload,
  onClose,
}: {
  text: string;
  deckName: string;
  onDownload: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard indisponível: o usuário pode selecionar o texto manualmente */
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line/70 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Deck em texto</h2>
            <p className="text-[11px] text-ink-faint">{deckName} · formato lista (.txt)</p>
          </div>
          <button className="text-ink-faint transition hover:text-ink" onClick={onClose}>
            ✕
          </button>
        </div>

        <textarea
          readOnly
          value={text}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-[240px] flex-1 resize-none bg-bg-input/50 px-4 py-3 font-mono text-[12px] leading-[1.6] text-ink-dim outline-none"
        />

        <div className="flex gap-2 border-t border-line/70 px-4 py-3">
          <button className="btn btn-primary flex-1" onClick={() => void copy()}>
            {copied ? "Copiado ✓" : "Copiar"}
          </button>
          <button className="btn" onClick={onDownload}>
            Baixar .txt
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------

function SectionBlock({
  section,
  cards,
  disabled,
  onSetQty,
  onMoveTo,
  onArt,
  onView,
  usesCommandZone,
}: {
  section: Section;
  cards: DeckCardView[];
  disabled: boolean;
  onSetQty: (c: DeckCardView, qty: number) => void;
  onMoveTo: (c: DeckCardView, to: Section) => void;
  onArt: (c: DeckCardView) => void;
  onView: (c: DeckCardView) => void;
  usesCommandZone: boolean;
}) {
  const count = cards.reduce((a, c) => a + c.quantity, 0);
  const groups = useMemo(() => {
    const g = new Map<string, DeckCardView[]>();
    for (const c of cards) {
      const t = primaryType(c.typeLine);
      if (!g.has(t)) g.set(t, []);
      g.get(t)!.push(c);
    }
    return [...g.entries()].sort(
      (a, b) => TYPE_ORDER.indexOf(a[0]) - TYPE_ORDER.indexOf(b[0]),
    );
  }, [cards]);

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink-dim">
          {SECTION_LABEL[section]}
        </h3>
        <span className="text-[11px] text-ink-faint">{count}</span>
      </div>
      {cards.length === 0 ? (
        <p className="text-xs text-ink-faint">
          {section === "COMMANDER"
            ? "Nenhum comandante. Adicione uma criatura lendária."
            : "Vazio."}
        </p>
      ) : (
        groups.map(([type, list]) => (
          <div key={type} className="mb-2">
            <p className="mb-0.5 text-[11px] text-ink-faint">
              {type} ({list.reduce((a, c) => a + c.quantity, 0)})
            </p>
            <div className="divide-y divide-line/60">
              {list.map((c) => (
                <CardRow
                  key={c.oracleId}
                  c={c}
                  disabled={disabled}
                  onSetQty={onSetQty}
                  onMoveTo={onMoveTo}
                  onArt={onArt}
                  onView={onView}
                  usesCommandZone={usesCommandZone}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function CardRow({
  c,
  disabled,
  onSetQty,
  onMoveTo,
  onArt,
  onView,
  usesCommandZone,
}: {
  c: DeckCardView;
  disabled: boolean;
  onSetQty: (c: DeckCardView, qty: number) => void;
  onMoveTo: (c: DeckCardView, to: Section) => void;
  onArt: (c: DeckCardView) => void;
  onView: (c: DeckCardView) => void;
  usesCommandZone: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="group relative flex items-center gap-2 py-1 text-sm"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        onClick={() => onArt(c)}
        title="Escolher arte"
        className="relative h-8 w-[22px] shrink-0 overflow-hidden rounded-sm border border-line bg-bg-elev"
      >
        {c.imageSmall ? (
          <img src={c.imageSmall} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : null}
        {c.customArtId && (
          <span className="absolute inset-x-0 bottom-0 bg-brand/80 text-center text-[7px] font-bold leading-tight text-white">
            ★
          </span>
        )}
      </button>
      <div className="flex items-center rounded-md border border-line">
        <button
          className="px-1.5 text-ink-faint hover:text-ink disabled:opacity-40"
          disabled={disabled}
          onClick={() => onSetQty(c, c.quantity - 1)}
        >
          −
        </button>
        <span className="w-5 text-center text-xs">{c.quantity}</span>
        <button
          className="px-1.5 text-ink-faint hover:text-ink disabled:opacity-40"
          disabled={disabled}
          onClick={() => onSetQty(c, c.quantity + 1)}
        >
          ＋
        </button>
      </div>
      <span className="flex-1 truncate text-ink-dim">
        {c.displayName ?? c.name}
        {c.displayName && <span className="ml-1 text-[10px] text-ink-faint">({c.name})</span>}
      </span>
      <ManaCost cost={c.manaCost} />
      {hover && (
        <div className="flex shrink-0 items-center gap-1 text-[11px]">
          <button
            className="rounded border border-line px-1.5 py-0.5 text-ink-faint hover:text-ink"
            onClick={() => onView(c)}
            title="Ver carta / tradução PT-BR"
          >
            👁
          </button>
          <button
            className="rounded border border-line px-1.5 py-0.5 text-ink-faint hover:text-ink"
            onClick={() => onArt(c)}
            title="Escolher/criar arte"
          >
            🖼
          </button>
          {usesCommandZone && c.section !== "COMMANDER" && (
            <button
              className="rounded border border-line px-1.5 py-0.5 text-ink-faint hover:text-ink"
              onClick={() => onMoveTo(c, "COMMANDER")}
              title="Definir como comandante"
            >
              ⛨
            </button>
          )}
          {c.section !== "SIDEBOARD" && (
            <button
              className="rounded border border-line px-1.5 py-0.5 text-ink-faint hover:text-ink"
              onClick={() => onMoveTo(c, "SIDEBOARD")}
              title="Mover para sideboard"
            >
              SB
            </button>
          )}
          {c.section !== "MAYBEBOARD" && (
            <button
              className="rounded border border-line px-1.5 py-0.5 text-ink-faint hover:text-ink"
              onClick={() => onMoveTo(c, "MAYBEBOARD")}
              title="Mover para talvez"
            >
              ?
            </button>
          )}
          <button
            className="rounded border border-line px-1.5 py-0.5 text-danger hover:bg-danger/10"
            onClick={() => onSetQty(c, 0)}
            title="Remover"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function primaryType(typeLine: string | null): string {
  const t = typeLine ?? "";
  for (const known of TYPE_ORDER) {
    if (t.includes(known)) return known;
  }
  return "Outro";
}
