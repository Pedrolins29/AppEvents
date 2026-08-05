"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface PeelBackProps {
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
}

type Corner = "r" | "l" | null;

// PeelBack — "descascar o canto" page-turn, book-style. Drag (press and pull) the bottom-right
// corner to advance, bottom-left to go back. Ported from a provided prototype (manual pointer
// physics + clip-path corner cut) rather than framer-motion's built-in `drag`, which moves the
// whole element and can't reproduce this corner-clip peel.
export function PeelBack({
  front,
  next,
  prev,
  onNext,
  onPrev,
  reduceMotion = false,
  minFlap = 58,
  pullLabel = "PUXE AQUI",
}: PeelBackProps) {
  const [peelR, setPeelR] = useState(0);
  const [peelL, setPeelL] = useState(0);
  const [corner, setCorner] = useState<Corner>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setSize({ w: r.width, h: r.height });
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const maxSize = Math.max(size.w, size.h) * 1.5 || 800;
  const flapR = minFlap + peelR * (maxSize - minFlap);
  const flapL = minFlap + peelL * (maxSize - minFlap);

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
    if (corner === "r") {
      setPeelR(Math.min(1, Math.max(0, Math.max(dx, dy) / t)));
    } else {
      setPeelL(Math.min(1, Math.max(0, Math.max(-dx, dy) / t)));
    }
  }

  function animate(target: number, which: "r" | "l") {
    const startVal = which === "r" ? peelR : peelL;
    const set = which === "r" ? setPeelR : setPeelL;
    const t0 = performance.now();
    const dur = target === 1 ? 360 : 240;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      set(startVal + (target - startVal) * eased);
      if (t < 1) {
        requestAnimationFrame(step);
      } else if (target === 1) {
        setTimeout(() => {
          if (which === "r") {
            onNext();
          } else {
            onPrev();
          }
          set(0);
        }, 50);
      }
    };
    requestAnimationFrame(step);
  }

  function finish() {
    if (!corner) {
      return;
    }
    const peel = corner === "r" ? peelR : peelL;
    if (peel > 0.4) {
      animate(1, corner);
    } else {
      animate(0, corner);
    }
    setCorner(null);
    startRef.current = null;
  }

  const sr = (flapR / Math.max(size.w, 1)) * 100;
  const sl = (flapL / Math.max(size.w, 1)) * 100;
  const clip = `polygon(0 0, 100% 0, 100% calc(100% - ${sr}%), calc(100% - ${sr}%) 100%, ${sl}% 100%, 0 calc(100% - ${sl}%))`;

  const back = peelL > peelR ? prev : next;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full select-none overflow-hidden"
      style={{ touchAction: "none" }}
    >
      <div className="absolute inset-0">{back}</div>

      <div
        className="absolute inset-0"
        style={{
          clipPath: clip,
          WebkitClipPath: clip,
          boxShadow: peelR > 0.02 || peelL > 0.02 ? "0 -6px 24px rgba(0,0,0,0.25)" : "none",
        }}
      >
        {front}
      </div>

      <Flap side="right" flap={flapR} label={pullLabel} />
      <Flap side="left" flap={flapL} label={pullLabel} />

      <div
        onPointerDown={(e) => start("r", e)}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
        className="absolute bottom-0 right-0 z-20 cursor-grab active:cursor-grabbing"
        style={{
          width: `${Math.max(flapR + 40, minFlap + 40)}px`,
          height: `${Math.max(flapR + 40, minFlap + 40)}px`,
        }}
      />
      <div
        onPointerDown={(e) => start("l", e)}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={finish}
        className="absolute bottom-0 left-0 z-20 cursor-grab active:cursor-grabbing"
        style={{
          width: `${Math.max(flapL + 40, minFlap + 40)}px`,
          height: `${Math.max(flapL + 40, minFlap + 40)}px`,
        }}
      />
    </div>
  );
}

function Flap({ side, flap, label }: { side: "right" | "left"; flap: number; label: string }) {
  const isRight = side === "right";
  const foldPath = isRight ? `M 0 ${flap} L ${flap} 0` : `M ${flap} ${flap} L 0 0`;
  return (
    <div
      className="pointer-events-none absolute bottom-0 z-10"
      style={{
        [isRight ? "right" : "left"]: 0,
        width: `${flap}px`,
        height: `${flap}px`,
        clipPath: isRight ? "polygon(0 100%, 100% 100%, 100% 0)" : "polygon(100% 100%, 0 100%, 0 0)",
        background: "linear-gradient(135deg, #ffffff 0%, #f4f4f4 55%, #e3e3e3 100%)",
        boxShadow: "inset 0 0 18px rgba(0,0,0,0.18)",
      }}
    >
      <div
        className="absolute"
        style={{
          bottom: 0,
          [isRight ? "left" : "right"]: 0,
          width: `${flap * 1.414}px`,
          transformOrigin: isRight ? "0 0" : "100% 0",
          transform: isRight ? "rotate(-45deg)" : "rotate(45deg)",
          height: "1px",
          background: "rgba(0,0,0,0.14)",
        }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${flap} ${flap}`}
        preserveAspectRatio="none"
        className="absolute inset-0"
      >
        <defs>
          <path id={`fold-${side}`} d={foldPath} fill="none" />
        </defs>
        <text
          style={{
            fontSize: Math.max(9, flap * 0.11),
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            letterSpacing: "0.2em",
            fontWeight: 600,
            fill: "#333333",
          }}
        >
          <textPath href={`#fold-${side}`} startOffset="50%" textAnchor="middle">
            {label}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
