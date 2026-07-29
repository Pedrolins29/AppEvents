import { apiClient } from "@/lib/apiClient";
import type {
  AuthResponse,
  ConfirmEmailResponse,
  LoginRequest,
  RegisterRequest,
  UserProfile,
} from "@/types/auth";

export const authApi = {
  register: (request: RegisterRequest) =>
    apiClient.post<UserProfile>("/api/auth/register", request),
  login: (request: LoginRequest) => apiClient.post<AuthResponse>("/api/auth/login", request),
  refresh: () => apiClient.post<AuthResponse>("/api/auth/refresh", undefined, { retryOn401: false }),
  logout: () => apiClient.post<void>("/api/auth/logout"),
  getMe: () => apiClient.get<UserProfile>("/api/users/me"),
  confirmEmail: (token: string) =>
    apiClient.post<ConfirmEmailResponse>("/api/auth/confirm-email", { token }),
  resendConfirmation: (email: string) =>
    apiClient.post<void>("/api/auth/resend-confirmation", { email }),
};
