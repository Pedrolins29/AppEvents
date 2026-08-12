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
  /** Optional background photo to display on the envelope cover — creates a premium letter-style look. */
  photoUrl?: string;
}

// The landing hero's signature: a wax-sealed cover the user TAPS to open (matrimonio.pro-style).
// The seal breaks and the cover lifts away, revealing the interactive invitation underneath.
// Keyboard-accessible (a real <button>); prefers-reduced-motion opens instantly on tap.
export function EnvelopeReveal({ children, label, openLabel, photoUrl }: EnvelopeRevealProps) {
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
            className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden rounded-[2.25rem] border-[3px] shadow-[0_30px_60px_-25px_rgba(22,19,14,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2"
            style={{
              borderColor: "var(--gold)",
              backgroundColor: photoUrl ? undefined : "var(--porcelain)",
              transformOrigin: "top center",
            }}
            initial={{ opacity: 1, y: 0 }}
            exit={{ y: "-114%", opacity: 0, rotateX: -12 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Background photo (premium letter envelope style) */}
            {photoUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                {/* Overlay to ensure text legibility on photo */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/50" />
              </>
            )}

            {/* Faint stationery hairline frame */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-[1.9rem] border border-[color-mix(in_srgb,var(--gold)_35%,transparent)]"
            />
            <motion.div
              className="relative z-20"
              animate={phase === "sealed" ? { scale: 1, opacity: 1 } : { scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <WaxSeal width={60} height={60} />
            </motion.div>

            {phase === "sealed" && (
              <span className="relative z-20 flex flex-col items-center gap-1">
                <span className="text-[0.5rem] font-medium uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--ink)_48%,transparent)]">
                  {openLabel}
                </span>
                <motion.svg
                  width="12"
                  height="14"
                  viewBox="0 0 14 16"
                  aria-hidden
                  className="text-[var(--gold)]"
                  animate={reduceMotion ? undefined : { y: [0, -2, 0] }}
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

function WaxSeal({ width = 88, height = 88 }: { width?: number; height?: number } = {}) {
  return (
    <svg width={width} height={height} viewBox="0 0 88 88" aria-hidden style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}>
      <defs>
        {/* Rich 3D wax gradient */}
        <radialGradient id="seal-face" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#E8D9BC" />
          <stop offset="25%" stopColor="#D4B894" />
          <stop offset="50%" stopColor="#C9A968" />
          <stop offset="75%" stopColor="#B08D4C" />
          <stop offset="100%" stopColor="#7A5E2C" />
        </radialGradient>
        {/* Inner shadow for depth */}
        <radialGradient id="seal-depth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="80%" stopColor="#000000" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {/* Outer wax ring (darker edge) */}
      <circle cx="44" cy="44" r="34" fill="#6B4E1F" opacity="0.8" />

      {/* Main seal face */}
      <circle cx="44" cy="44" r="31" fill="url(#seal-face)" />

      {/* Depth and dimension overlay */}
      <circle cx="44" cy="44" r="31" fill="url(#seal-depth)" />

      {/* Embossed diamond monogram — echoes the AppEvents mark */}
      <g opacity="0.6">
        <path d="M44 28L58 44L44 60L30 44Z" fill="#5C4620" />
      </g>
      <g opacity="0.85">
        <path d="M44 32L54 44L44 56L34 44Z" fill="#E8D9BC" />
      </g>

      {/* Fine detail line around edge */}
      <circle cx="44" cy="44" r="31" fill="none" stroke="#D4B894" strokeWidth="0.5" opacity="0.4" />
      <circle cx="44" cy="44" r="30" fill="none" stroke="#6B4E1F" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}
