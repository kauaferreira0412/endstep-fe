import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { ProtectedRouteView } from "./index";

export function ProtectedRoute({
  children,
  role,
  permission,
}: {
  children: ReactNode;
  role?: string;
  permission?: string;
}) {
  const status = useAuthStore((s) => s.status);
  const canAccess = useAuthStore((s) => s.canAccess);
  const location = useLocation();

  return (
    <ProtectedRouteView
      status={status}
      allowed={canAccess({ role, permission })}
      fromPath={location.pathname}
    >
      {children}
    </ProtectedRouteView>
  );
}
