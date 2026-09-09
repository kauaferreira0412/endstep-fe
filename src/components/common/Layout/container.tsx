import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { LayoutView } from "./index";

export function Layout() {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);
  const canAccess = useAuthStore((s) => s.canAccess);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initials =
    user?.displayName
      ?.split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  async function onLogout() {
    setMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <LayoutView
      user={user}
      isAdmin={hasRole("ADMIN")}
      canSync={canAccess({ permission: "SYNC" })}
      initials={initials}
      menuOpen={menuOpen}
      menuRef={menuRef}
      onToggleMenu={() => setMenuOpen((o) => !o)}
      onLogout={onLogout}
    />
  );
}
