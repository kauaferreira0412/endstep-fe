import type { RefObject } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Brand } from "@/components/common/Brand/container";
import type { AuthUser } from "@/types/auth";
import styles from "./style.module.css";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

export interface LayoutViewProps {
  user: AuthUser | null;
  isAdmin: boolean;
  canSync: boolean;
  unread: number;
  initials: string;
  menuOpen: boolean;
  menuRef: RefObject<HTMLDivElement>;
  onToggleMenu: () => void;
  onLogout: () => void;
}

export function LayoutView({
  user,
  isAdmin,
  canSync,
  unread,
  initials,
  menuOpen,
  menuRef,
  onToggleMenu,
  onLogout,
}: LayoutViewProps) {
  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand size={26} />
          <nav className={styles.nav}>
            <NavLink to="/cards" className={navLinkClass}>
              Cartas
            </NavLink>
            <NavLink to="/decks" className={navLinkClass}>
              Decks
            </NavLink>
            <NavLink to="/play" className={navLinkClass}>
              Jogar
            </NavLink>
            <NavLink to="/friends" className={navLinkClass}>
              Amigos
            </NavLink>
            <NavLink to="/suggestions" className={navLinkClass}>
              Sugeridos
              {unread > 0 && <span className={styles.badge}>{unread}</span>}
            </NavLink>
            {canSync && (
              <NavLink to="/admin/sync" className={navLinkClass}>
                Sincronização
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/users" className={navLinkClass}>
                Usuários
              </NavLink>
            )}
          </nav>

          <div className={styles.userWrap} ref={menuRef}>
            <button onClick={onToggleMenu} className={styles.userButton}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarInitials}>{initials}</span>
              )}
              <span className={styles.userName}>{user?.displayName}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" className={styles.caret}>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </button>

            {menuOpen && (
              <div className={styles.menu}>
                <div className={styles.menuHead}>
                  <div className={styles.menuName}>{user?.displayName}</div>
                  <div className={styles.menuEmail}>{user?.email}</div>
                  <div className={styles.menuRoles}>
                    {user?.roles.map((r) => (
                      <span key={r} className={styles.chip}>
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.divider} />
                <button className={styles.logout} onClick={onLogout}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
