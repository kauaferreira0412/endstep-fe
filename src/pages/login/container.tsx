import { type FormEvent, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { LoginView } from "./index";

const OAUTH_ERRORS: Record<string, string> = {
  google_cancelado: "Login com Google cancelado.",
  google_falhou: "Não deu para entrar com o Google. Tente de novo.",
};

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const googleEnabled = useAuthStore((s) => s.googleEnabled);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const from = (location.state as { from?: string })?.from ?? "/cards";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    OAUTH_ERRORS[searchParams.get("error") ?? ""] ?? null,
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao entrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <LoginView
      email={email}
      password={password}
      error={error}
      busy={busy}
      googleEnabled={googleEnabled}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={onSubmit}
    />
  );
}
