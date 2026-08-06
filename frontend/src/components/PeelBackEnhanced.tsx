"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { gsap, useGsapContext } from "@/lib/gsap";
import { DURATION, DURATION_TIER, SPRING_EASE_GSAP } from "@/lib/motion";

interface PeelBackEnhancedProps {
  front: ReactNode;
  next: ReactNode;
  prev: ReactNode;
  onNext: () => void;
  onPrev: () => void;
  /** Skips the drag physics entirely — used for prefers-reduced-motion, where page changes should
   * be instant, not animated. */
  reduceMotion?: boolean;
  minFlap?: number;
  pullLabel?: string;
  /**
   * GSAP ease "personality" for the release-to-target tween (commit-to-full-peel or
   * cancel-back-to-flat). Does not affect the live drag, which always tracks the pointer 1:1
   * with zero easing — spring easing during active drag would desync the paper from the finger.
   * Maps to `SPRING_EASE_GSAP` in `@/lib/motion` (source of truth, shared with other GSAP
   * consumers) — see that file for provenance of each tier.
   */
  springPreset?: "bouncy" | "snappy" | "gentle" | "stiff";
  /**
   * Multi-layer box-shadow intensity for the lifting front page once peel exceeds ~2%. Composited
   * from the ui-ux-pro-max "Dimensional Layering" elevation scale (elevation-1..4) and the
   * "Tactile Digital" depth-shadow token — there is no literal 'elevated-3d' key in the database,
   * this is the closest real composite.
   */
  shadowDepth?: "subtle" | "medium" | "elevated-3d";
  /**
   * GSAP ease for the shadow-opacity companion tween. Deliberately decoupled from springPreset:
   * the shadow must never overshoot past full opacity, or it reads as a rendering glitch rather
   * than paper physics.
   */
  easingProfile?: string;
}

type Corner = "r" | "l" | null;
type Side = "right" | "left";

// Composited from ui-ux-pro-max's real "Dimensional Layering" elevation scale
// (--elevation-1..4) and "Tactile Digital / Deformable UI" --depth-shadow token.
const SHADOW_LAYERS: Record<NonNullable<PeelBackEnhancedProps["shadowDepth"]>, string> = {
  subtle: "0 1px 3px rgba(0,0,0,0.1)",
  medium: "0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1)",
  "elevated-3d":
    "0 20px 40px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.1)",
};

const SETTLE_DURATION = DURATION_TIER.long; // 0.7s — see lib/motion.ts for sourcing
// ux-guidelines' exit-faster-than-enter guidance (~60-70% of enter duration).
const CANCEL_DURATION = SETTLE_DURATION * 0.6; // 0.42s

interface FlapDomRefs {
  wrapRef: RefObject<HTMLDivElement | null>;
  svgRef: RefObject<SVGSVGElement | null>;
  pathRef: RefObject<SVGPathElement | null>;
  foldLineRef: RefObject<HTMLDivElement | null>;
  textRef: RefObject<SVGTextElement | null>;
}

function foldPathFor(side: Side, flap: number) {
  return side === "right" ? `M 0 ${flap} L ${flap} 0` : `M ${flap} ${flap} L 0 0`;
}

// PeelBackEnhanced — GSAP-powered evolution of PeelBack. Same "descascar o canto" interaction
// (drag the bottom-right/bottom-left corner to advance/go back, clip-path corner cut) but the
// release/settle animation runs through GSAP instead of a hand-rolled rAF loop, and per-frame
// updates write straight to the DOM via refs instead of triggering a React re-render every frame.
//
// The two flaps are inlined directly in this component's JSX (rather than a Flap subcomponent)
// so every ref stays owned and consumed within the single component that creates it — passing
// refs through props into a child's `ref` attribute trips the react-hooks/refs rule.
export function PeelBackEnhanced({
  front,
  next,
  prev,
  onNext,
  onPrev,
  reduceMotion = false,
  minFlap = 58,
  pullLabel = "PUXE AQUI",
  springPreset = "bouncy",
  shadowDepth = "elevated-3d",
  easingProfile = "power2.out",
}: PeelBackEnhancedProps) {
  const filterId = useId();
  const sizeRef = useRef({ w: 0, h: 0 });
  const [corner, setCorner] = useState<Corner>(null);
  const peelRRef = useRef(0);
  const peelLRef = useRef(0);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frontLayerRef = useRef<HTMLDivElement>(null);
  const shadowLayerRef = useRef<HTMLDivElement>(null);
  const shadowVisibleRef = useRef(false);
  const contextSafeRef = useRef<gsap.ContextSafeFunc | null>(null);
  const rightHitRef = useRef<HTMLDivElement>(null);
  const leftHitRef = useRef<HTMLDivElement>(null);

  const rightWrapRef = useRef<HTMLDivElement>(null);
  const rightFoldLineRef = useRef<HTMLDivElement>(null);
  const rightSvgRef = useRef<SVGSVGElement>(null);
  const rightPathRef = useRef<SVGPathElement>(null);
  const rightTextRef = useRef<SVGTextElement>(null);

  const leftWrapRef = useRef<HTMLDivElement>(null);
  const leftFoldLineRef = useRef<HTMLDivElement>(null);
  const leftSvgRef = useRef<SVGSVGElement>(null);
  const leftPathRef = useRef<SVGPathElement>(null);
  const leftTextRef = useRef<SVGTextElement>(null);

  useGsapContext(
    (_ctx, contextSafe) => {
      contextSafeRef.current = contextSafe;
    },
    containerRef,
    [],
  );

  function runSafe(fn: () => void) {
    contextSafeRef.current?.(fn)?.();
  }

  function writeFlapDom(refs: FlapDomRefs, side: Side, flap: number) {
    if (refs.wrapRef.current) {
      refs.wrapRef.current.style.width = `${flap}px`;
      refs.wrapRef.current.style.height = `${flap}px`;
    }
    if (refs.svgRef.current) {
      refs.svgRef.current.setAttribute("viewBox", `0 0 ${flap} ${flap}`);
    }
    if (refs.pathRef.current) {
      refs.pathRef.current.setAttribute("d", foldPathFor(side, flap));
    }
    if (refs.foldLineRef.current) {
      refs.foldLineRef.current.style.width = `${flap * 1.414}px`;
    }
    if (refs.textRef.current) {
      refs.textRef.current.style.fontSize = `${Math.max(9, flap * 0.11)}px`;
    }
  }

  function setShadowVisible(visible: boolean) {
    if (visible === shadowVisibleRef.current) {
      return;
    }
    shadowVisibleRef.current = visible;
    runSafe(() => {
      gsap.to(shadowLayerRef.current, {
        opacity: visible ? 1 : 0,
        duration: DURATION.fast,
        ease: easingProfile,
        overwrite: "auto",
      });
    });
  }

  function applyPeel(which: "r" | "l", raw: number) {
    const value = Math.min(1, Math.max(0, raw));
    if (which === "r") {
      peelRRef.current = value;
    } else {
      peelLRef.current = value;
    }

    const { w, h } = sizeRef.current;
    const maxSize = Math.max(w, h) * 1.5 || 800;
    const flapR = minFlap + peelRRef.current * (maxSize - minFlap);
    const flapL = minFlap + peelLRef.current * (maxSize - minFlap);
    const sr = (flapR / Math.max(w, 1)) * 100;
    const sl = (flapL / Math.max(w, 1)) * 100;
    const clip = `polygon(0 0, 100% 0, 100% calc(100% - ${sr}%), calc(100% - ${sr}%) 100%, ${sl}% 100%, 0 calc(100% - ${sl}%))`;

    if (frontLayerRef.current) {
      frontLayerRef.current.style.clipPath = clip;
      frontLayerRef.current.style.setProperty("-webkit-clip-path", clip);
    }
    if (shadowLayerRef.current) {
      shadowLayerRef.current.style.clipPath = clip;
      shadowLayerRef.current.style.setProperty("-webkit-clip-path", clip);
    }

    writeFlapDom(
      {
        wrapRef: rightWrapRef,
        svgRef: rightSvgRef,
        pathRef: rightPathRef,
        foldLineRef: rightFoldLineRef,
        textRef: rightTextRef,
      },
      "right",
      flapR,
    );
    writeFlapDom(
      {
        wrapRef: leftWrapRef,
        svgRef: leftSvgRef,
        pathRef: leftPathRef,
        foldLineRef: leftFoldLineRef,
        textRef: leftTextRef,
      },
      "left",
      flapL,
    );

    if (rightHitRef.current) {
      const s = Math.max(flapR + 40, minFlap + 40);
      rightHitRef.current.style.width = `${s}px`;
      rightHitRef.current.style.height = `${s}px`;
    }
    if (leftHitRef.current) {
      const s = Math.max(flapL + 40, minFlap + 40);
      leftHitRef.current.style.width = `${s}px`;
      leftHitRef.current.style.height = `${s}px`;
    }

    setShadowVisible(Math.max(peelRRef.current, peelLRef.current) > 0.02);
  }

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        sizeRef.current = { w: r.width, h: r.height };
        // Re-sync DOM (clip-path in particular) against the freshly measured size — the resting
        // clip at peel=0 doesn't depend on size, but this keeps corner geometry correct on resize
        // mid-drag-free state and after initial mount measurement.
        applyPeel("r", peelRRef.current);
        applyPeel("l", peelLRef.current);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyPeel closes over refs only
  }, []);

  function start(c: Corner, e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion) {
      if (c === "r") {
        onNext();
      } else {
        onPrev();
      }
      return;
    }
    setCorner(c);
    startRef.current = { x: e.clientX, y: e.clientY };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture unsupported — drag still works via move/up listeners */
    }
  }

  function move(e: React.PointerEvent<HTMLDivElement>) {
    if (!corner || !startRef.current) {
      return;
    }
    const dx = startRef.current.x - e.clientX;
    const dy = startRef.current.y - e.clientY;
    const t = 230;
    const value = corner === "r" ? Math.max(dx, dy) / t : Math.max(-dx, dy) / t;
    applyPeel(corner, value);
  }

  function finish() {
    if (!corner) {
      return;
    }
    const c = corner;
    const valueRef = c === "r" ? peelRRef : peelLRef;
    const commit = valueRef.current > 0.4;
    const obj = { v: valueRef.current };
    runSafe(() => {
      gsap.to(obj, {
        v: commit ? 1 : 0,
        duration: commit ? SETTLE_DURATION : CANCEL_DURATION,
        ease: SPRING_EASE_GSAP[springPreset],
        onUpdate: () => applyPeel(c, obj.v),
        onComplete: () => {
          if (commit) {
            if (c === "r") {
              onNext();
            } else {
              onPrev();
            }
          }
          applyPeel(c, 0);
        },
      });
    });
    setCorner(null);
    startRef.current = null;
  }

  // Only one corner is ever "live" during a drag/release sequence, so this is equivalent to the
  // original's continuous `peelL > peelR` comparison without needing peel values as render state.
  const back = corner === "l" ? prev : next;
  const idle = corner === null;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {/* Paper-grain filter: not sourced from the ui-ux-pro-max DB (zero results for feTurbulence/
          paper texture) — standard SVG paper-grain values, optional. Drop this <svg> block and the
          `filter` style below if it costs anything on low-end devices; nothing else depends on it. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id={`peel-grain-${filterId}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves={2}
              seed={7}
              stitchTiles="stitch"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={3}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <div className="absolute inset-0">{back}</div>

      <div
        ref={shadowLayerRef}
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: SHADOW_LAYERS[shadowDepth], opacity: 0 }}
      />

      <div ref={frontLayerRef} className="absolute inset-0">
        {front}
      </div>

      {/* Right flap */}
      <div
        ref={rightWrapRef}
        className="pointer-events-none absolute bottom-0 z-10"
        style={{
          right: 0,
          width: `${minFlap}px`,
          height: `${minFlap}px`,
          clipPath: "polygon(0 100%, 100% 100%, 100% 0)",
          background: "linear-gradient(135deg, #ffffff 0%, #f4f4f4 55%, #e3e3e3 100%)",
          boxShadow: "inset 0 0 18px rgba(0,0,0,0.18)",
          filter: idle ? `url(#peel-grain-${filterId})` : "none",
        }}
      >
        <div
          ref={rightFoldLineRef}
          className="absolute"
          style={{
            bottom: 0,
            left: 0,
            width: `${minFlap * 1.414}px`,
            transformOrigin: "0 0",
            transform: "rotate(-45deg)",
            height: "1px",
            background: "rgba(0,0,0,0.14)",
          }}
        />
        <svg
          ref={rightSvgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${minFlap} ${minFlap}`}
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          <defs>
            <path
              ref={rightPathRef}
              id={`fold-right-${filterId}`}
              d={foldPathFor("right", minFlap)}
              fill="none"
            />
          </defs>
          <text
            ref={rightTextRef}
            style={{
              fontSize: Math.max(9, minFlap * 0.11),
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              letterSpacing: "0.2em",
              fontWeight: 600,
              fill: "#333333",
            }}
          >
            <textPath href={`#fold-right-${filterId}`} startOffset="50%" textAnchor="middle">
              {pullLabel}
            </textPath>
          </text>
        </svg>
      </div>

      {/* Left flap */}
      <div
        ref={leftWrapRef}
        className="pointer-events-none absolute bottom-0 z-10"
        style={{
          left: 0,
          width: `${minFlap}px`,
          height: `${minFlap}px`,
          clipPath: "polygon(100% 100%, 0 100%, 0 0)",
          background: "linear-gradient(135deg, #ffffff 0%, #f4f4f4 55%, #e3e3e3 100%)",
          boxShadow: "inset 0 0 18px rgba(0,0,0,0.18)",
          filter: idle ? `url(#peel-grain-${filterId})` : "none",
        }}
      >
        <div
          ref={leftFoldLineRef}
          className="absolute"
          style={{
            bottom: 0,
            right: 0,
            width: `${minFlap * 1.414}px`,
            transformOrigin: "100% 0",
            transform: "rotate(45deg)",
            height: "1px",
            background: "rgba(0,0,0,0.14)",
          }}
        />
        <svg
          ref={leftSvgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${minFlap} ${minFlap}`}
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          <defs>
            <path
              ref={leftPathRef}
              id={`fold-left-${filterId}`}
              d={foldPathFor("left", minFlap)}
              fill="none"
            />
          </defs>
          <text
            ref={leftTextRef}
            style={{
              fontSize: Math.max(9, minFlap * 0.11),
              fontFamily: "ui-sans-serif, system-ui, sans-serif",
              letterSpacing: "0.2em",
              fontWeight: 600,
              fill: "#333333",
            }}
          >
            <textPath href={`#fold-left-${filterId}`} startOffset="50%" textAnchor="middle">
              {pullLabel}
            </textPath>
          </text>
        </svg>
      </div>

      <div
        ref={rightHitRef}
        onPointerDown={(e) => start("r", e)}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
        className="absolute bottom-0 right-0 z-20 cursor-grab active:cursor-grabbing"
        style={{
          width: `${minFlap + 40}px`,
          height: `${minFlap + 40}px`,
        }}
      />
      <div
        ref={leftHitRef}
        onPointerDown={(e) => start("l", e)}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
        className="absolute bottom-0 left-0 z-20 cursor-grab active:cursor-grabbing"
        style={{
          width: `${minFlap + 40}px`,
          height: `${minFlap + 40}px`,
        }}
      />
    </div>
  );
}
