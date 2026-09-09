import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import styles from "./style.module.css";

export interface ProtectedRouteViewProps {
  status: "loading" | "anonymous" | "authenticated";
  allowed: boolean;
  fromPath: string;
  children: ReactNode;
}

export function ProtectedRouteView({ status, allowed, fromPath, children }: ProtectedRouteViewProps) {
  if (status === "loading") {
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} />
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: fromPath }} />;
  }

  if (!allowed) {
    return <Navigate to="/cards" replace />;
  }

  return <>{children}</>;
}
