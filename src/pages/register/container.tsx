import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { RegisterView, type RegisterForm } from "./index";

export function RegisterPage() {
  const register = useAuthStore((s) => s.register);
  const googleEnabled = useAuthStore((s) => s.googleEnabled);
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterForm>({
    displayName: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onChange(key: keyof RegisterForm) {
    return (e: ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register({
        displayName: form.displayName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/cards", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar conta");
    } finally {
      setBusy(false);
    }
  }

  return (
    <RegisterView
      form={form}
      error={error}
      busy={busy}
      googleEnabled={googleEnabled}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
