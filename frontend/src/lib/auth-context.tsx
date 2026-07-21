"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ApiError, configureApiClient } from "@/lib/apiClient";
import { authApi } from "@/lib/authApi";
import type { LoginRequest, RegisterRequest, UserProfile } from "@/types/auth";

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  register: (request: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await authApi.refresh();
      accessTokenRef.current = result.accessToken;
      setUser(result.user);
      return result.accessToken;
    } catch {
      accessTokenRef.current = null;
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    configureApiClient(
      () => accessTokenRef.current,
      () => refresh(),
    );
  }, [refresh]);

  useEffect(() => {
    // Silent session bootstrap on load: exchanges the HttpOnly refresh cookie for an
    // access token, if any. No Suspense/data-fetching library in this MVP, so the
    // set-state-in-effect rule is intentionally suppressed here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const login = useCallback(async (request: LoginRequest) => {
    const result = await authApi.login(request);
    accessTokenRef.current = result.accessToken;
    setUser(result.user);
  }, []);

  const register = useCallback(async (request: RegisterRequest) => {
    await authApi.register(request);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      accessTokenRef.current = null;
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { ApiError };
