import { type FormEvent } from "react";
import { CardGrid } from "@/components/cards/CardGrid/container";
import { CardDetailPanel } from "@/components/cards/CardDetailPanel/container";
import type { CardSummary } from "@/types/card";
import styles from "./style.module.css";

export interface CardSearchViewProps {
  query: string;
  results: CardSummary[];
  page: number;
  totalPages: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
  selectedOracleId: string | null;
  onQueryChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onGoToPage: (page: number) => void;
  onSelect: (oracleId: string | null) => void;
}

export function CardSearchView({
  query,
  results,
  page,
  totalPages,
  totalElements,
  loading,
  error,
  selectedOracleId,
  onQueryChange,
  onSubmit,
  onGoToPage,
  onSelect,
}: CardSearchViewProps) {
  return (
    <div>
      <div className={styles.head}>
        <div>
          <h1 className={styles.title}>Cartas</h1>
          <p className={styles.subtitle}>Pesquise na base do Scryfall</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className={styles.form}>
        <input
          type="search"
          className={styles.input}
          placeholder="Buscar carta pelo nome (ex.: Sol Ring)"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoFocus
        />
        <button type="submit" className={styles.submit}>
          Buscar
        </button>
      </form>

      <div className={styles.status}>
        {loading
          ? "Buscando…"
          : query.trim().length < 2
            ? "Digite ao menos 2 caracteres."
            : `${totalElements.toLocaleString("pt-BR")} resultado(s)`}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <CardGrid cards={results} onSelect={(id) => onSelect(id)} />

      {totalPages > 1 && (
        <div className={styles.pager}>
          <button
            className={styles.pagerButton}
            disabled={page <= 0}
            onClick={() => onGoToPage(page - 1)}
          >
            ← Anterior
          </button>
          <span className={styles.pagerInfo}>
            Página {page + 1} de {totalPages}
          </span>
          <button
            className={styles.pagerButton}
            disabled={page >= totalPages - 1}
            onClick={() => onGoToPage(page + 1)}
          >
            Próxima →
          </button>
        </div>
      )}

      {selectedOracleId && (
        <CardDetailPanel oracleId={selectedOracleId} onClose={() => onSelect(null)} />
      )}
    </div>
  );
}
