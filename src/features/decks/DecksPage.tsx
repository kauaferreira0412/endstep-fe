import { useEffect, useState } from "react";
import { useDeckStore } from "@/stores/deckStore";
import { DeckSidebar } from "./DeckSidebar";
import { DeckBuilder } from "./DeckBuilder";
import { ImportDeckModal } from "./ImportDeckModal";

export function DecksPage() {
  const { bootstrap, detail, loadingDetail, selectedDeckId, error } = useDeckStore();
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <div className="grid h-[calc(100vh-104px)] grid-cols-[280px_1fr] gap-4">
      <aside className="card overflow-hidden">
        <DeckSidebar onImport={() => setImportOpen(true)} />
      </aside>

      <section className="min-w-0">
        {error && (
          <div className="mb-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        {selectedDeckId == null ? (
          <EmptyState onImport={() => setImportOpen(true)} />
        ) : loadingDetail || !detail ? (
          <div className="flex h-full items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand" />
          </div>
        ) : (
          <DeckBuilder detail={detail} />
        )}
      </section>

      {importOpen && <ImportDeckModal onClose={() => setImportOpen(false)} />}
    </div>
  );
}

function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-line bg-bg-elev">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-brand">
          <path
            d="M4 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-ink">Selecione ou crie um deck</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-dim">
        Crie uma pasta, um deck dentro dela, e monte na busca — com validação de Commander ao vivo
        (100 cartas, singleton, identidade de cor, comandante).
      </p>
      <button className="btn btn-primary mt-4" onClick={onImport}>
        Importar uma lista
      </button>
    </div>
  );
}
