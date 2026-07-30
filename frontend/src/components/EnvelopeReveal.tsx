"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

type Phase = "sealed" | "breaking" | "lifted";

interface EnvelopeRevealProps {
  /** The invitation rendered underneath the sealed cover. */
  children: React.ReactNode;
  /** Accessible description of the button (what tapping does). */
  label: string;
  /** Visible caption on the seal, e.g. "toque para abrir". */
  openLabel: string;
}

// The landing hero's signature: a wax-sealed cover the user TAPS to open (matrimonio.pro-style).
// The seal breaks and the cover lifts away, revealing the interactive invitation underneath.
// Keyboard-accessible (a real <button>); prefers-reduced-motion opens instantly on tap.
export function EnvelopeReveal({ children, label, openLabel }: EnvelopeRevealProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("sealed");

  function handleOpen() {
    if (phase !== "sealed") return;
    if (reduceMotion) {
      setPhase("lifted");
      return;
    }
    setPhase("breaking");
    window.setTimeout(() => setPhase("lifted"), 450);
  }

  const settled = phase === "lifted";
  const showCover = phase !== "lifted";

  return (
    <div className="relative">
      <motion.div
        animate={{ scale: settled ? 1 : 0.985 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {showCover && (
          <motion.button
            key="cover"
            type="button"
            onClick={handleOpen}
            aria-label={label}
            className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-7 overflow-hidden rounded-[2.25rem] border border-[color-mix(in_srgb,var(--gold)_45%,transparent)] bg-[var(--porcelain)] shadow-[0_30px_60px_-25px_rgba(22,19,14,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
            initial={{ opacity: 1, y: 0 }}
            exit={{ y: "-114%", opacity: 0, rotateX: -12 }}
            style={{ transformOrigin: "top center" }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Faint stationery hairline frame */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-[1.9rem] border border-[color-mix(in_srgb,var(--gold)_28%,transparent)]"
            />
            <motion.div
              animate={phase === "sealed" ? { scale: 1, opacity: 1 } : { scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <WaxSeal />
            </motion.div>

            {phase === "sealed" && (
              <span className="flex flex-col items-center gap-2">
                <span className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-[color-mix(in_srgb,var(--ink)_58%,transparent)]">
                  {openLabel}
                </span>
                <motion.svg
                  width="14"
                  height="16"
                  viewBox="0 0 14 16"
                  aria-hidden
                  className="text-[var(--gold)]"
                  animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.7, ease: "easeInOut" }}
                >
                  <path d="M7 15V2M7 2L2 7M7 2L12 7" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function WaxSeal() {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden>
      <defs>
        <radialGradient id="seal-face" cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#C9A968" />
          <stop offset="55%" stopColor="#B08D4C" />
          <stop offset="100%" stopColor="#8A6C34" />
        </radialGradient>
      </defs>
      {/* Scalloped wax edge */}
      <circle cx="44" cy="44" r="34" fill="#8A6C34" opacity="0.55" />
      <circle cx="44" cy="44" r="31" fill="url(#seal-face)" />
      <circle
        cx="44"
        cy="44"
        r="26"
        fill="none"
        stroke="#E8D9BC"
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      {/* Embossed diamond monogram — echoes the AppEvents mark */}
      <path d="M44 30L56 44L44 58L32 44Z" fill="#7A5E2C" opacity="0.5" />
      <path d="M44 32L54 44L44 56L34 44Z" fill="#E8D9BC" opacity="0.55" />
    </svg>
  );
}
