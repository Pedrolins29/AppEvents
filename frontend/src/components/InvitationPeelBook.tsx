"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { PeelBack } from "@/components/PeelBack";

interface InvitationPeelBookProps {
  pages: ReactNode[];
  accentColor?: string;
  pullLabel?: string;
  pageLabel?: (index: number, total: number) => string;
}

// Higher-level "book" built on top of PeelBack: holds the current page index, derives the
// front/next/prev triple PeelBack needs from a flat page array (clamped at both ends — no
// wraparound, it's a book, not a carousel), and adds a dot indicator + keyboard navigation.
// Respects prefers-reduced-motion by asking PeelBack to skip the drag physics entirely.
export function InvitationPeelBook({
  pages,
  accentColor = "#0F766E",
  pullLabel = "PUXE AQUI",
  pageLabel,
}: InvitationPeelBookProps) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  function goNext() {
    setIndex((i) => Math.min(i + 1, pages.length - 1));
  }

  function goPrev() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === "ArrowLeft") {
        goPrev();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length]);

  if (pages.length === 0) {
    return null;
  }

  const front = pages[index];
  const next = pages[Math.min(index + 1, pages.length - 1)];
  const prev = pages[Math.max(index - 1, 0)];

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative min-h-0 flex-1">
        <PeelBack
          front={front}
          next={next}
          prev={prev}
          onNext={goNext}
          onPrev={goPrev}
          reduceMotion={Boolean(reduceMotion)}
          pullLabel={pullLabel}
        />
      </div>

      {pages.length > 1 && (
        <div
          className="flex justify-center gap-2 py-3"
          role="tablist"
          aria-label={pageLabel ? pageLabel(index, pages.length) : `Página ${index + 1} de ${pages.length}`}
        >
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={pageLabel ? pageLabel(i, pages.length) : `Página ${i + 1} de ${pages.length}`}
              aria-current={i === index}
              className="h-2 rounded-full transition-all duration-150"
              style={{
                width: i === index ? 20 : 8,
                backgroundColor: accentColor,
                opacity: i === index ? 1 : 0.35,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
