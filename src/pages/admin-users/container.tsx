import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { dialog } from "@/stores/dialogStore";
import type { AdminUser, PermissionCatalogItem } from "@/types/admin";
import { AdminUsersView } from "./index";

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  async function onDeleteUser(userId: number) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const ok = await dialog.confirm({
      title: "Excluir usuário",
      message:
        `Excluir @${user.username} (${user.email}) para sempre?\n\n` +
        "Isso apaga a conta, os decks, as artes personalizadas, as amizades e as salas/partidas criadas por ela. Não dá para desfazer.",
      okLabel: "Excluir",
      danger: true,
    });
    if (!ok) return;

    setDeletingId(userId);
    setError(null);
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao excluir usuário");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminUsersView
      users={users}
      catalog={catalog}
      loading={loading}
      error={error}
      savingId={savingId}
      deletingId={deletingId}
      onTogglePermission={onTogglePermission}
      onDeleteUser={onDeleteUser}
    />
  );
}
