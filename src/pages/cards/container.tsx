import { useEffect, type FormEvent } from "react";
import { useCardSearchStore } from "@/stores/cardSearchStore";
import { CardSearchView } from "./index";

export function CardSearchPage() {
  const {
    query,
    results,
    page,
    totalPages,
    totalElements,
    loading,
    error,
    selectedOracleId,
    setQuery,
    search,
    select,
  } = useCardSearchStore();

  useEffect(() => {
    const t = setTimeout(() => void search(0), 350);
    return () => clearTimeout(t);
  }, [query, search]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void search(0);
  }

  return (
    <CardSearchView
      query={query}
      results={results}
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      loading={loading}
      error={error}
      selectedOracleId={selectedOracleId}
      onQueryChange={setQuery}
      onSubmit={onSubmit}
      onGoToPage={(p) => void search(p)}
      onSelect={select}
    />
  );
}
