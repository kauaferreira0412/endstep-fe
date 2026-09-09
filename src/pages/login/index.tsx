import { type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/common/AuthShell/container";
import { GoogleButton } from "@/components/common/GoogleButton/container";
import styles from "./style.module.css";

export interface LoginViewProps {
  email: string;
  password: string;
  error: string | null;
  busy: boolean;
  googleEnabled: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function LoginView({
  email,
  password,
  error,
  busy,
  googleEnabled,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginViewProps) {
  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse sua conta do Endstep"
      footer={
        <>
          Não tem conta?{" "}
          <Link to="/register" className={styles.footerLink}>
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className={styles.form}>
        <div>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={styles.control}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={styles.control}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.submit} disabled={busy}>
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className={styles.divider}>
            <span className={styles.dividerRule} />
            ou
            <span className={styles.dividerRule} />
          </div>
          <GoogleButton />
        </>
      )}
    </AuthShell>
  );
}
