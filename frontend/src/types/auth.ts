export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  honeypotField?: string | null;
  locale?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresInSeconds: number;
  user: UserProfile;
}

export interface ConfirmEmailResponse {
  alreadyConfirmed: boolean;
  /** Populated only on a fresh (non-replay) confirmation, which also issues a session — mirrors
   * AuthResponse so the caller can drop straight into an authenticated state. */
  accessToken?: string | null;
  expiresInSeconds?: number | null;
  user?: UserProfile | null;
}

export interface ApiProblem {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}
