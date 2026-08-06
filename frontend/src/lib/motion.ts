/** Base durations, in seconds — the native unit for both Framer Motion and GSAP. */
export const DURATION = {
  fast: 0.25,
  base: 0.4,
  slow: 0.7,
  /** Scroll-reveal fade/rise-in. */
  reveal: 0.6,
  /** Modal open/close (overlay fade + panel scale/translateY). */
  modal: 0.3,
  /** Gallery image entrance (scale+fade), per item. */
  gallery: 0.5,
  hero: 1.4,
  /** Background Ken-Burns-style zoom, one-shot. */
  heroZoom: 10,
  /** Infinite floating-decoration cycle. */
  floatLoop: 7,
} as const;

/** Standard premium ease, as a CSS cubic-bezier() string — for inline styles / template literals. */
export const EASE_CSS = "cubic-bezier(.22,.61,.36,1)";

/** Same curve as EASE_CSS, as the 4-tuple Framer Motion's `ease` prop expects. */
export const EASE_FRAMER: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

/**
 * Imperative reduced-motion check for non-React code (GSAP timelines, event handlers).
 * Returns false during SSR / when matchMedia is unavailable, matching the "motion allowed
 * by default" behavior of framer-motion's useReducedMotion() before hydration.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
