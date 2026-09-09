import { AuthShell } from "@/components/common/AuthShell/container";
import styles from "./style.module.css";

export interface AuthCallbackViewProps {
  error: string | null;
  onBackToLogin: () => void;
}

export function AuthCallbackView({ error, onBackToLogin }: AuthCallbackViewProps) {
  return (
    <AuthShell title="Entrando…" subtitle="Finalizando o login com Google">
      {error ? (
        <div className={styles.errorWrap}>
          <div className={styles.error}>{error}</div>
          <button className={styles.backButton} onClick={onBackToLogin}>
            Voltar ao login
          </button>
        </div>
      ) : (
        <div className={styles.pending}>
          <span className={styles.spinner} />
          Só um instante…
        </div>
      )}
    </AuthShell>
  );
}
