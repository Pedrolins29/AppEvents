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

// Non-sensitive UX hint only (the access token itself stays in-memory, never localStorage) —
// lets the bootstrap effect below skip the silent-refresh call when no session could exist.
const SESSION_HINT_KEY = "appevents:has-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await authApi.refresh();
      accessTokenRef.current = result.accessToken;
      setUser(result.user);
      localStorage.setItem(SESSION_HINT_KEY, "1");
      return result.accessToken;
    } catch {
      accessTokenRef.current = null;
      setUser(null);
      localStorage.removeItem(SESSION_HINT_KEY);
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
    // access token, if any. Skipped entirely when there's no hint a session could exist
    // (e.g. a never-logged-in visitor on a public page), to avoid a guaranteed 401 on every
    // single page load. No Suspense/data-fetching library in this MVP, so the
    // set-state-in-effect rule is intentionally suppressed here.
    if (localStorage.getItem(SESSION_HINT_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refresh();
    } else {
      setIsLoading(false);
    }
  }, [refresh]);

  const login = useCallback(async (request: LoginRequest) => {
    const result = await authApi.login(request);
    accessTokenRef.current = result.accessToken;
    setUser(result.user);
    localStorage.setItem(SESSION_HINT_KEY, "1");
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
      localStorage.removeItem(SESSION_HINT_KEY);
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
