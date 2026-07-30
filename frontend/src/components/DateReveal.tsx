"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface DateRevealProps {
  /** The date / countdown to reveal. */
  children: React.ReactNode;
  /** Prompt shown on the cover, e.g. "toque para revelar a data". */
  label: string;
  /** Cover background + text colors (theme-driven). */
  coverBg: string;
  accent: string;
}

// A playful "reveal the date" cover (matrimonio.pro's "raspe para revelar a data"). Progressive
// enhancement: the date is rendered VISIBLE by default (SSR / no-JS / reduced-motion). Only once
// mounted with motion allowed does a tappable cover overlay it, clearing on tap/Enter. No content
// is ever hidden without JS.
export function DateReveal({ children, label, coverBg, accent }: DateRevealProps) {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    // Flip after first paint (not synchronously in the effect body) so the cover only appears
    // client-side — the date stays visible during SSR and without JS.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const covered = mounted && !reduceMotion && !revealed;

  return (
    <div className="relative">
      {children}
      {covered && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          aria-label={label}
          className="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-md transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ backgroundColor: coverBg }}
        >
          <span className="text-[8px] font-medium uppercase tracking-[0.3em]" style={{ color: accent }}>
            {label}
          </span>
          <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden style={{ color: accent }}>
            <path d="M2 5h6M5 2v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
