import type { ReactNode } from "react";
import { Brand } from "@/components/common/Brand/container";
import styles from "./style.module.css";

export interface AuthShellViewProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShellView({ title, subtitle, children, footer }: AuthShellViewProps) {
  return (
    <div className={styles.root}>
      <div className={styles.glow} />
      <div className={styles.frame}>
        <div className={styles.logo}>
          <Brand size={32} />
        </div>
        <div className={styles.card}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <div className={styles.body}>{children}</div>
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
