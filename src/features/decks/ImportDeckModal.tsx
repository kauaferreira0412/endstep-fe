import { useState } from "react";
import { api } from "@/services/api";
import { useDeckStore } from "@/stores/deckStore";
import type { ImportResult } from "@/types/deck";

export function ImportDeckModal({ onClose }: { onClose: () => void }) {
  const { folders, refreshList, selectDeck } = useDeckStore();
  const [name, setName] = useState("");
  const format = "commander";
  const [folderId, setFolderId] = useState<string>("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.importDeck({
        name: name.trim() || undefined,
        format,
        folderId: folderId ? Number(folderId) : null,
        text,
      });
      setResult(r);
      await refreshList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao importar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-lg animate-fade-in p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-ink">Importar deck</h2>

        {result ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-ok">
              ✓ {result.importedCards} cartas em {result.importedLines} linhas.
            </p>
            {result.notFound.length > 0 && (
              <div className="rounded-lg border border-warn/40 bg-warn/10 p-2.5">
                <p className="font-medium text-warn">Não encontradas ({result.notFound.length})</p>
                <p className="mt-1 text-ink-dim">{result.notFound.join(", ")}</p>
              </div>
            )}
            {result.ambiguous.length > 0 && (
              <div className="rounded-lg border border-warn/40 bg-warn/10 p-2.5">
                <p className="font-medium text-warn">Ambíguas ({result.ambiguous.length})</p>
                <p className="mt-1 text-ink-dim">{result.ambiguous.join(", ")}</p>
              </div>
            )}
            <button
              className="btn btn-primary w-full"
              onClick={() => {
                onClose();
                void selectDeck(result.deckId);
              }}
            >
              Abrir deck
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                className="input flex-1"
                placeholder="Nome do deck (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="shrink-0 rounded-lg border border-line bg-bg-input/60 px-2.5 py-2 text-sm text-ink-dim">
                ◈ Commander
              </span>
            </div>
            <select
              className="input"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
            >
              <option value="">Sem pasta</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <textarea
              className="input h-48 resize-none font-mono text-xs"
              placeholder={"Commander\n1 Atraxa, Praetors' Voice\n\nDeck\n1 Sol Ring\n1 Arcane Signet\n..."}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {error && (
              <div className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <button
                className="btn btn-primary flex-1"
                onClick={() => void submit()}
                disabled={busy || !text.trim()}
              >
                {busy ? "Importando…" : "Importar"}
              </button>
              <button className="btn" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
