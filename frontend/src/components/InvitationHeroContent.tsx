"use client";

import { useRef, type ReactNode } from "react";
import { gsap, GSAP_EASE_PREMIUM, useGsapContext } from "@/lib/gsap";
import { DURATION } from "@/lib/motion";
import { HERO_DECORATIONS, HERO_OVERLAYS, PHOTO_FILTERS, ThemeMotif, type ThemeStyle } from "@/components/InvitationHero";
import type { ThemeKey } from "@/types/template";

export interface InvitationHeroProps {
  name: string;
  eventTypeLabel: string;
  formattedDate: string;
  coverImageUrl: string | null;
  theme: ThemeStyle;
  themeKey?: ThemeKey;
  children?: ReactNode;
}

// Cinematic entrance sequence (background zoom → decoration → title → subtitle → CTA, then the
// decoration floats forever) — see docs/superpowers plan "Phase 2: Hero" for the full spec this
// implements. Hidden baseline state for every animated element lives in Tailwind classes (with a
// motion-reduce: override), not inline style, so the very first paint is already correct for both
// motion and reduced-motion visitors — GSAP only ever animates FROM that baseline, never decides
// whether to hide anything itself.
export function InvitationHero({
  name,
  eventTypeLabel,
  formattedDate,
  coverImageUrl,
  theme,
  themeKey = "minimalist",
  children,
}: InvitationHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const bgImageRef = useRef<HTMLImageElement>(null);
  const decorationRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useGsapContext(
    (_context, contextSafe) => {
      gsap.matchMedia().add(
        { reduceMotion: "(prefers-reduced-motion: reduce)" },
        (matchContext) => {
          const { reduceMotion } = matchContext.conditions as { reduceMotion: boolean };
          const targets = [
            decorationRef.current,
            eyebrowRef.current,
            titleRef.current,
            subtitleRef.current,
            ctaRef.current,
          ].filter(Boolean);

          if (reduceMotion) {
            gsap.set(targets, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 });
            return;
          }

          const tl = gsap.timeline();

          if (bgImageRef.current) {
            tl.to(bgImageRef.current, { scale: 1.05, duration: DURATION.heroZoom, ease: "none" }, 0);
          }

          // contextSafe wraps a function for later (async) invocation while keeping any
          // animations it creates tracked by this same gsap.context for cleanup — required
          // because onComplete fires ~1.7s later, outside this setup call's synchronous scope,
          // so a bare gsap.to() inside it would never be revert()-able on unmount. contextSafe's
          // return type is the broad built-in `Function`, not a callable signature TS accepts
          // directly as a tween's onComplete — cast, since we know exactly what we wrapped.
          const startFloat = contextSafe(() => {
            gsap.to(decorationRef.current, {
              keyframes: { y: [-8, 8, -8], rotation: [-3, 3, -3] },
              duration: DURATION.floatLoop,
              ease: "sine.inOut",
              repeat: -1,
            });
          }) as () => void;

          tl.to(
            decorationRef.current,
            { opacity: 1, y: 0, duration: DURATION.hero, ease: GSAP_EASE_PREMIUM, onComplete: startFloat },
            0.3,
          );
          tl.to(
            [eyebrowRef.current, titleRef.current],
            { opacity: 1, y: 0, duration: DURATION.hero, ease: GSAP_EASE_PREMIUM },
            0.7,
          );
          tl.to(subtitleRef.current, { opacity: 1, duration: DURATION.hero, ease: GSAP_EASE_PREMIUM }, 1.0);
          if (ctaRef.current) {
            tl.to(ctaRef.current, { opacity: 1, scale: 1, duration: DURATION.hero, ease: GSAP_EASE_PREMIUM }, 1.3);
          }
        },
      );
    },
    heroRef,
    [],
  );

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[75vh] sm:min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
    >
      {coverImageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={bgImageRef}
            src={coverImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ filter: theme.photoFilterKey ? PHOTO_FILTERS[theme.photoFilterKey] : undefined }}
          />
          <div
            className="absolute inset-0"
            style={
              theme.heroOverlayKey
                ? { background: HERO_OVERLAYS[theme.heroOverlayKey] }
                : { backgroundColor: theme.pageBg, opacity: 0.55 }
            }
          />
        </>
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: theme.pageBg }} />
      )}
      <div className="relative flex flex-col items-center gap-5">
        <div
          ref={decorationRef}
          className="flex flex-col items-center gap-2 opacity-0 -translate-y-2 motion-reduce:opacity-100 motion-reduce:translate-y-0"
        >
          {theme.heroDecoration && <div aria-hidden>{HERO_DECORATIONS[theme.heroDecoration](theme)}</div>}
          <ThemeMotif theme={themeKey} accentColor={theme.accent} />
        </div>
        <span
          ref={eyebrowRef}
          className="text-xs font-medium uppercase tracking-[0.4em] opacity-0 translate-y-7 motion-reduce:opacity-100 motion-reduce:translate-y-0"
          style={{ color: theme.accent }}
        >
          {eventTypeLabel}
        </span>
        <h1
          ref={titleRef}
          className={`${theme.fontClassName} opacity-0 translate-y-7 motion-reduce:opacity-100 motion-reduce:translate-y-0`}
          style={{
            color: theme.heading,
            fontStyle: theme.fontStyle,
            fontSize: "clamp(2.25rem, 6vw, 4rem)",
            lineHeight: 1.1,
          }}
        >
          {name}
        </h1>
        <p
          ref={subtitleRef}
          className="text-sm tracking-wide opacity-0 motion-reduce:opacity-100"
          style={{ color: theme.body }}
        >
          {formattedDate}
        </p>
        {children && (
          <div ref={ctaRef} className="mt-6 opacity-0 scale-95 motion-reduce:opacity-100 motion-reduce:scale-100">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
