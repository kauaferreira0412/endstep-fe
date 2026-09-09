import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { HomeStats } from "@/types/stats";
import { HomeView } from "./index";

export function HomePage() {
  const [data, setData] = useState<HomeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .homeStats()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Falha ao carregar"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return <HomeView data={data} loading={loading} error={error} />;
}
