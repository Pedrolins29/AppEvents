"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { EASE_CSS } from "@/lib/motion";

/** Named GSAP ease matching EASE_CSS's curve — reference by name instead of re-typing the bezier. */
export const GSAP_EASE_PREMIUM = "premium";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create(GSAP_EASE_PREMIUM, EASE_CSS.replace("cubic-bezier(", "").replace(")", ""));
}

export { gsap, ScrollTrigger };

/**
 * Runs `setup` inside a gsap.context() scoped to `scope` (or globally if omitted), and reverts
 * (kills all tweens/ScrollTriggers/timelines created inside it) on unmount. `setup` receives the
 * context and GSAP's `contextSafe` wrapper via GSAP's own callback parameters rather than an
 * outer closure, since gsap.context() invokes its function synchronously while still constructing
 * the context. Use `contextSafe(fn)` to wrap a function that will run later (e.g. an onComplete
 * callback, an event handler) so any animations it creates are still tracked for cleanup — a bare
 * gsap.to() called from inside an async callback is NOT auto-tracked, only ones created
 * synchronously during `setup` itself are.
 */
export function useGsapContext(
  setup: (context: gsap.Context, contextSafe: gsap.ContextSafeFunc) => void,
  scope?: React.RefObject<Element | null>,
  deps: React.DependencyList = [],
) {
  const contextRef = useRef<ReturnType<typeof gsap.context> | null>(null);

  useEffect(() => {
    const ctx = gsap.context(
      (self, contextSafe) => setup(self as gsap.Context, contextSafe as gsap.ContextSafeFunc),
      scope?.current ?? undefined,
    );
    contextRef.current = ctx;
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setup's closure isn't analyzable; caller supplies deps explicitly
  }, deps);

  return contextRef;
}
