import { type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/common/AuthShell/container";
import { GoogleButton } from "@/components/common/GoogleButton/container";
import styles from "./style.module.css";

export interface RegisterForm {
  displayName: string;
  username: string;
  email: string;
  password: string;
}

export interface RegisterViewProps {
  form: RegisterForm;
  error: string | null;
  busy: boolean;
  googleEnabled: boolean;
  onChange: (key: keyof RegisterForm) => (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
}

export function RegisterView({ form, error, busy, googleEnabled, onChange, onSubmit }: RegisterViewProps) {
  return (
    <AuthShell
      title="Criar conta"
      subtitle="Comece a montar seus decks e jogar com os amigos"
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className={styles.footerLink}>
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className={styles.form}>
        <div>
          <label className={styles.label} htmlFor="displayName">
            Nome de exibição
          </label>
          <input
            id="displayName"
            className={styles.control}
            value={form.displayName}
            onChange={onChange("displayName")}
            required
            autoFocus
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className={styles.control}
            value={form.username}
            onChange={onChange("username")}
            pattern="[a-zA-Z0-9_.\-]+"
            title="letras, números, ponto, hífen e underscore"
            minLength={3}
            maxLength={32}
            required
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={styles.control}
            value={form.email}
            onChange={onChange("email")}
            required
          />
        </div>
        <div>
          <label className={styles.label} htmlFor="password">
            Senha <span className={styles.hint}>(mín. 8 caracteres)</span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={styles.control}
            value={form.password}
            onChange={onChange("password")}
            minLength={8}
            required
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" className={styles.submit} disabled={busy}>
          {busy ? "Criando…" : "Criar conta"}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className={styles.divider}>
            <span className={styles.dividerRule} />
            ou
            <span className={styles.dividerRule} />
          </div>
          <GoogleButton label="Continuar com Google" />
        </>
      )}
    </AuthShell>
  );
}
