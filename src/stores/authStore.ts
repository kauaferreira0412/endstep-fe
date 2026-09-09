import { create } from "zustand";
import { api, setAuthLostHandler, tokenStore } from "@/services/api";
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  googleEnabled: boolean;

  bootstrap: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithTokens: (r: AuthResponse) => void;
  logout: () => Promise<void>;
  setUser: (u: AuthUser) => void;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  canAccess: (opts: { role?: string; permission?: string }) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  setAuthLostHandler(() => set({ status: "anonymous", user: null }));

  return {
    status: "loading",
    user: null,
    googleEnabled: false,

    bootstrap: async () => {
      api
        .authConfig()
        .then((c) => set({ googleEnabled: c.googleEnabled }))
        .catch(() => {});

      if (!tokenStore.access()) {
        set({ status: "anonymous", user: null });
        return;
      }
      try {
        const user = await api.me();
        set({ status: "authenticated", user });
      } catch {
        tokenStore.clear();
        set({ status: "anonymous", user: null });
      }
    },

    login: async (payload) => {
      const r = await api.login(payload);
      get().loginWithTokens(r);
    },

    register: async (payload) => {
      const r = await api.register(payload);
      get().loginWithTokens(r);
    },

    loginWithTokens: (r) => {
      tokenStore.set(r.accessToken, r.refreshToken);
      set({ status: "authenticated", user: r.user });
    },

    logout: async () => {
      try {
        await api.logout();
      } catch {
        /* ignore */
      }
      tokenStore.clear();
      set({ status: "anonymous", user: null });
    },

    setUser: (u) => set({ user: u }),

    hasRole: (role) => !!get().user?.roles.includes(role),

    hasPermission: (permission) =>
      !!get().user &&
      (get().user!.roles.includes("ADMIN") ||
        (get().user!.permissions ?? []).includes(permission)),

    canAccess: ({ role, permission }) => {
      const s = get();
      if (!s.user) return false;
      if (s.user.roles.includes("ADMIN")) return true;
      if (role && s.user.roles.includes(role)) return true;
      if (permission && (s.user.permissions ?? []).includes(permission)) return true;
      return !role && !permission;
    },
  };
});
