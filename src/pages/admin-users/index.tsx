import type { AdminUser, PermissionCatalogItem } from "@/types/admin";
import styles from "./style.module.css";

function initialsOf(name: string): string {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export interface AdminUsersViewProps {
  users: AdminUser[];
  catalog: PermissionCatalogItem[];
  loading: boolean;
  error: string | null;
  savingId: number | null;
  onTogglePermission: (userId: number, code: string, next: boolean) => void;
}

export function AdminUsersView({
  users,
  catalog,
  loading,
  error,
  savingId,
  onTogglePermission,
}: AdminUsersViewProps) {
  return (
    <div>
      <h1 className={styles.title}>Usuários</h1>
      <p className={styles.intro}>
        Todos os usuários cadastrados. Marque as telas que cada um pode acessar. Quem é ADMIN tem
        acesso a tudo automaticamente.
      </p>

      {error && <div className={styles.error}>{error}</div>}
      {loading && <p className={styles.loading}>Carregando…</p>}

      {!loading && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Usuário</th>
                <th className={styles.th}>Provedor</th>
                <th className={styles.th}>Papéis</th>
                {catalog.map((p) => (
                  <th key={p.code} className={styles.thPerm} title={p.code}>
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isAdmin = u.roles.includes("ADMIN");
                return (
                  <tr key={u.id} className={styles.row}>
                    <td className={styles.userCell}>
                      <div className={styles.userMain}>
                        <span className={styles.avatar}>{initialsOf(u.displayName)}</span>
                        <span>
                          <span className={styles.name}>{u.displayName}</span>
                          <span className={styles.email}> · @{u.username}</span>
                          <div className={styles.email}>{u.email}</div>
                        </span>
                        {savingId === u.id && <span className={styles.saving}>salvando…</span>}
                      </div>
                    </td>
                    <td className={styles.meta}>{u.provider}</td>
                    <td className={styles.meta}>
                      <div className={styles.roles}>
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`${styles.chip} ${r === "ADMIN" ? styles.chipAdmin : ""}`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    {catalog.map((p) => (
                      <td key={p.code} className={styles.permCell}>
                        {isAdmin ? (
                          <span className={styles.full}>✓ total</span>
                        ) : (
                          <input
                            type="checkbox"
                            className={styles.check}
                            checked={u.permissions.includes(p.code)}
                            disabled={savingId === u.id}
                            onChange={(e) => onTogglePermission(u.id, p.code, e.target.checked)}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
