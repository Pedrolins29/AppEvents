"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ApiError, configureApiClient } from "@/lib/apiClient";
import { authApi } from "@/lib/authApi";
import { eventsApi } from "@/lib/eventsApi";
import { buildDraftSlug, consumeInstantPreviewDraft } from "@/lib/instantPreviewDraft";
import type { LoginRequest, RegisterRequest, UserProfile } from "@/types/auth";

export interface LoginResult {
  /** Set when an InstantPreview draft (see instantPreviewDraft.ts) was staged and successfully
   * turned into a real event on this login — callers can redirect straight into its editor
   * instead of the default post-login destination. */
  claimedEventId: string | null;
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<LoginResult>;
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

  const login = useCallback(async (request: LoginRequest): Promise<LoginResult> => {
    const result = await authApi.login(request);
    accessTokenRef.current = result.accessToken;
    setUser(result.user);
    localStorage.setItem(SESSION_HINT_KEY, "1");

    const draft = consumeInstantPreviewDraft();
    if (!draft || !draft.name.trim() || !draft.eventDate) {
      return { claimedEventId: null };
    }
    try {
      const event = await eventsApi.create({
        name: draft.name.trim(),
        slug: buildDraftSlug(draft.name),
        eventType: draft.eventType,
        eventDate: draft.eventDate,
        description: null,
        address: draft.address.trim() || null,
        dressCode: null,
        timelineItems: [],
        templateId: null,
      });
      return { claimedEventId: event.id };
    } catch {
      // Best-effort: a failed auto-claim (slug collision, transient error, etc.) should never
      // block a real login — the visitor just lands on the normal events list instead.
      return { claimedEventId: null };
    }
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
