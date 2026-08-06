import type { Transition } from "framer-motion";

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

/**
 * Framer Motion spring transitions, four tiers. `bouncy` is sourced verbatim from
 * ui-ux-pro-max's styles.csv "Tactile Digital / Deformable UI" entry (--spring-stiffness: 300,
 * --spring-damping: 20) — the only spring-physics data point in that database. There are no named
 * gentle/snappy/stiff tiers in the DB (confirmed: zero results for spring-preset queries), so the
 * other three are derived from `bouncy`'s stiffness via a damping-ratio scale
 * (zeta = damping / (2*sqrt(stiffness*mass))), a standard spring-physics convention — not
 * arbitrary numbers, but explicitly NOT DB-sourced.
 */
export const SPRING: Record<"gentle" | "bouncy" | "snappy" | "stiff", Transition> = {
  gentle: { type: "spring", stiffness: 120, damping: 22, mass: 1 }, // zeta ~= 1.0, critically damped
  bouncy: { type: "spring", stiffness: 300, damping: 20, mass: 1 }, // DB-sourced (see above)
  snappy: { type: "spring", stiffness: 400, damping: 32, mass: 1 }, // zeta ~= 0.8, mild overshoot
  stiff: { type: "spring", stiffness: 600, damping: 49, mass: 1 }, // zeta ~= 1.0, fastest/no oscillation
} as const;

/**
 * GSAP ease strings for the same four spring "personalities" (GSAP eases are strings, not
 * stiffness/damping objects). bouncy/snappy/gentle reused verbatim from PeelBackEnhanced.tsx's
 * previously-local SPRING_EASES. These are GSAP's own built-in elastic/back/power eases —
 * ui-ux-pro-max's motion.csv has zero elastic/back rows (confirmed). `stiff` is new: a
 * higher-overshoot back.out() than `snappy`, extrapolated, not DB-sourced.
 */
export const SPRING_EASE_GSAP: Record<"gentle" | "bouncy" | "snappy" | "stiff", string> = {
  gentle: "power2.out",
  bouncy: "elastic.out(1, 0.5)",
  snappy: "back.out(1.7)",
  stiff: "back.out(4)",
} as const;

/**
 * Named GSAP eases sourced from ui-ux-pro-max's motion.csv (domain: gsap) rows and
 * ux-guidelines.csv's "ease-out entering / ease-in exiting, never linear" rule.
 */
export const EASE_GSAP = {
  enter: "power2.out", // ux-guidelines.csv entering rule
  exit: "power2.in", // mirror of `enter`; no standalone exit row in motion.csv, extrapolated
  reveal: "power2.out", // motion.csv "Scroll Reveal / Standard" row (400-600ms) — pair with DURATION.reveal
  sharedElement: "expo.inOut", // motion.csv "Page Transition / Complex" row (500-800ms, Flip plugin)
} as const;

/** Duration tiers, aliased to DURATION where a tier's value already matches an existing entry. */
export const DURATION_TIER = {
  micro: 0.15, // sub-"Subtle"-tier hover/press feedback — general practice, NOT DB-sourced (DB's floor is 200ms)
  short: DURATION.fast, // 0.25s — ui-ux-pro-max "Subtle" tier (200-300ms)
  medium: DURATION.base, // 0.4s — ui-ux-pro-max "Standard" tier (400-600ms)
  long: DURATION.slow, // 0.7s — inside ui-ux-pro-max "Complex" tier (500-800ms)
  epic: 0.8, // top of ui-ux-pro-max's "Complex" tier — extrapolated, no literal "epic" DB token exists
} as const;
