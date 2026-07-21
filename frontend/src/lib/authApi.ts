import { apiClient } from "@/lib/apiClient";
import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "@/types/auth";

export const authApi = {
  register: (request: RegisterRequest) =>
    apiClient.post<UserProfile>("/api/auth/register", request),
  login: (request: LoginRequest) => apiClient.post<AuthResponse>("/api/auth/login", request),
  refresh: () => apiClient.post<AuthResponse>("/api/auth/refresh", undefined, { retryOn401: false }),
  logout: () => apiClient.post<void>("/api/auth/logout"),
  getMe: () => apiClient.get<UserProfile>("/api/users/me"),
};
