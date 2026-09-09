import { useEffect, useRef, useState } from "react";
import { api } from "@/services/api";
import type { CustomArt } from "@/types/customArt";
import { CardFrame } from "./CardFrame";

interface Props {
  oracleId: string;
  cardName: string;
  baseImageUrl: string;
  basePrintingId: number | null;
  onClose: () => void;
  onCreated: (art: CustomArt) => void;
}

export function CustomArtEditor({
  oracleId,
  cardName,
  baseImageUrl,
  basePrintingId,
  onClose,
  onCreated,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [nameBar, setNameBar] = useState(false);
  const [textBar, setTextBar] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [overlayText, setOverlayText] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onPointerDown(e: React.PointerEvent) {
    if (!fileUrl) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current || !frameRef.current) return;
    const w = frameRef.current.clientWidth || 1;
    const h = frameRef.current.clientHeight || 1;
    const nx = clamp(drag.current.ox + (e.clientX - drag.current.x) / w, -1, 1);
    const ny = clamp(drag.current.oy + (e.clientY - drag.current.y) / h, -1, 1);
    setOffset({ x: nx, y: ny });
  }
  function onPointerUp() {
    drag.current = null;
  }

  async function save() {
    if (!file) {
      setError("Escolha uma imagem.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const art = await api.createCustomArt(oracleId, basePrintingId, {
        label: label.trim() || `${cardName} — arte`,
        displayName: nameBar ? displayName.trim() : undefined,
        overlayText: textBar ? overlayText.trim() : undefined,
        nameBar,
        textBar,
        zoom,
        offsetX: offset.x,
        offsetY: offset.y,
      }, file);
      onCreated(art);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar a arte");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card flex w-full max-w-3xl animate-fade-in gap-5 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-[280px] shrink-0">
          <div
            ref={frameRef}
            className="cursor-grab overflow-hidden rounded-xl active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
          >
            <CardFrame
              baseImageUrl={baseImageUrl}
              artUrl={fileUrl}
              zoom={zoom}
              offsetX={offset.x}
              offsetY={offset.y}
              nameBar={nameBar}
              textBar={textBar}
              displayName={displayName || cardName}
              overlayText={overlayText}
            />
          </div>
          {fileUrl && (
            <p className="mt-1.5 text-center text-[11px] text-ink-faint">
              Arraste a arte para posicionar
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Arte customizada</h2>
            <p className="text-xs text-ink-dim">
              Base: <span className="text-ink">{cardName}</span>
            </p>
          </div>

          <label className="btn cursor-pointer justify-start">
            {file ? file.name : "Escolher imagem…"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {fileUrl && (
            <label className="text-xs text-ink-dim">
              Zoom
              <input
                type="range"
                min={1}
                max={4}
                step={0.02}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-1 w-full accent-brand"
              />
            </label>
          )}

          <label className="flex items-center gap-2 text-sm text-ink-dim">
            <input type="checkbox" checked={nameBar} onChange={(e) => setNameBar(e.target.checked)} />
            Trocar o nome exibido
          </label>
          {nameBar && (
            <input
              className="input !py-2"
              placeholder="Novo nome (ex.: Banguela)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          )}

          <label className="flex items-center gap-2 text-sm text-ink-dim">
            <input type="checkbox" checked={textBar} onChange={(e) => setTextBar(e.target.checked)} />
            Texto por cima do quadro de regras
          </label>
          {textBar && (
            <textarea
              className="input h-20 resize-none !py-2 text-xs"
              placeholder="Texto livre (proxy)"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
            />
          )}

          <input
            className="input !py-2 text-sm"
            placeholder="Rótulo desta arte (opcional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          {error && (
            <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="mt-auto flex gap-2">
            <button className="btn btn-primary flex-1" onClick={() => void save()} disabled={busy || !file}>
              {busy ? "Salvando…" : "Salvar arte"}
            </button>
            <button className="btn" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
