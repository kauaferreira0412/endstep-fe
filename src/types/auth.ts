export interface AuthUser {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  provider: string;
  status: string;
  roles: string[];
  permissions: string[];
  createdAt: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser;
}

export interface RegisterPayload {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthConfig {
  googleEnabled: boolean;
}
