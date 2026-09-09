import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { AdminUser, PermissionCatalogItem } from "@/types/admin";
import { AdminUsersView } from "./index";

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([api.adminUsers(), api.adminPermissionCatalog()])
      .then(([u, c]) => {
        if (!alive) return;
        setUsers(u);
        setCatalog(c);
      })
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Falha ao carregar"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function onTogglePermission(userId: number, code: string, next: boolean) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const wanted = next
      ? [...new Set([...user.permissions, code])]
      : user.permissions.filter((p) => p !== code);

    setSavingId(userId);
    setError(null);
    try {
      const updated = await api.setUserPermissions(userId, wanted);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar permissões");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminUsersView
      users={users}
      catalog={catalog}
      loading={loading}
      error={error}
      savingId={savingId}
      onTogglePermission={onTogglePermission}
    />
  );
}
