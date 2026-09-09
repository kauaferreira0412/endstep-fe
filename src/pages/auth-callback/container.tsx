import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, tokenStore } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { AuthCallbackView } from "./index";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("accessToken");
    const refreshToken = hash.get("refreshToken");
    window.history.replaceState(null, "", window.location.pathname);

    if (!accessToken || !refreshToken) {
      setError("Não recebi os tokens do login com Google.");
      return;
    }
    tokenStore.set(accessToken, refreshToken);
    api
      .me()
      .then((user) => {
        setUser(user);
        useAuthStore.setState({ status: "authenticated", user });
        navigate("/cards", { replace: true });
      })
      .catch(() => {
        tokenStore.clear();
        setError("Falha ao carregar o perfil.");
      });
  }, [navigate, setUser]);

  return (
    <AuthCallbackView error={error} onBackToLogin={() => navigate("/login", { replace: true })} />
  );
}
