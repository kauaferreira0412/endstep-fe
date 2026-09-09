import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { PrintingView } from "@/types/card";
import type { CustomArt } from "@/types/customArt";
import type { DeckDetail, Section } from "@/types/deck";
import { CustomArtEditor } from "./CustomArtEditor";

interface Props {
  deckId: number;
  oracleId: string;
  cardName: string;
  section: Section;
  current: { printingId: number | null; customArtId: number | null };
  baseImageUrl: string;
  onClose: () => void;
  onChanged: (d: DeckDetail) => void;
}

export function ArtPicker({
  deckId,
  oracleId,
  cardName,
  section,
  current,
  baseImageUrl,
  onClose,
  onChanged,
}: Props) {
  const [printings, setPrintings] = useState<PrintingView[]>([]);
  const [customs, setCustoms] = useState<CustomArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const reload = () =>
    Promise.all([api.getPrintings(oracleId), api.customArts(oracleId)])
      .then(([p, c]) => {
        setPrintings(p);
        setCustoms(c);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oracleId]);

  async function pick(data: { printingId?: number | null; customArtId?: number | null }) {
    setSaving(true);
    try {
      const d = await api.setDeckCardArt(deckId, {
        oracleId,
        section,
        printingId: data.printingId ?? null,
        customArtId: data.customArtId ?? null,
      });
      onChanged(d);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card flex max-h-[80vh] w-full max-w-2xl flex-col p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Arte de {cardName}</h2>
          <button className="btn btn-ghost !py-1.5 text-sm" onClick={() => setEditorOpen(true)}>
            ＋ Criar arte
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-ink-faint">Carregando…</p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            <Tile
              label="Padrão"
              selected={!current.printingId && !current.customArtId}
              onClick={() => void pick({})}
            >
              <div className="grid h-full place-items-center text-[11px] text-ink-faint">auto</div>
            </Tile>

            {customs.map((c) => (
              <Tile
                key={`c${c.id}`}
                label={c.label}
                badge="custom"
                selected={current.customArtId === c.id}
                onClick={() => void pick({ customArtId: c.id })}
              >
                <img src={c.thumbUrl ?? c.imageUrl} alt="" className="h-full w-full object-cover" />
              </Tile>
            ))}

            {printings.map((p) => (
              <Tile
                key={`p${p.id}`}
                label={`${(p.setCode ?? "?").toUpperCase()} · ${p.artist ?? ""}`}
                selected={current.printingId === p.id}
                onClick={() => void pick({ printingId: p.id })}
              >
                {p.imageSmall ? (
                  <img src={p.imageSmall} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[10px] text-ink-faint">sem img</div>
                )}
              </Tile>
            ))}
          </div>
        )}

        {saving && <p className="mt-2 text-xs text-ink-faint">Aplicando…</p>}
      </div>

      {editorOpen && (
        <CustomArtEditor
          oracleId={oracleId}
          cardName={cardName}
          baseImageUrl={baseImageUrl}
          basePrintingId={current.printingId ?? null}
          onClose={() => setEditorOpen(false)}
          onCreated={(art) => {
            setEditorOpen(false);
            void pick({ customArtId: art.id });
          }}
        />
      )}
    </div>
  );
}

function Tile({
  children,
  label,
  badge,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  badge?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`overflow-hidden rounded-lg border text-left transition ${
        selected ? "border-brand ring-2 ring-brand/40" : "border-line hover:border-brand/60"
      }`}
    >
      <div className="relative aspect-[488/680] bg-bg-elev">
        {children}
        {badge && (
          <span className="absolute left-1 top-1 rounded bg-brand/80 px-1 text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </div>
      <div className="truncate px-1.5 py-1 text-[10px] text-ink-dim">{label}</div>
    </button>
  );
}
