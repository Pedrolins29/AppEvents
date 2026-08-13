"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";

interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

const slideVariants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 400 : -400,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      duration: 0.6,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -400 : 400,
    opacity: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
      duration: 0.6,
    },
  }),
};

const dotVariants: Variants = {
  inactive: { scale: 1, opacity: 0.4 },
  active: {
    scale: 1.2,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

export function TestimonialGrid() {
  const t = useTranslations("landing.testimonials");
  const items = t.raw("items") as Testimonial[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const reduceMotion = useReducedMotion();

  // Auto-rotate logic
  useEffect(() => {
    // Skip auto-rotation if user prefers reduced motion
    if (reduceMotion) {
      return;
    }

    // Skip auto-rotation if carousel is focused
    if (isFocused) {
      return;
    }

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [items.length, reduceMotion, isFocused]);

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentItem = items[currentIndex];

  return (
    <section className="px-6 py-16 sm:py-24 bg-[var(--porcelain)]">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
        <Reveal className="mb-12 text-center">
          <h2 className="font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
        </Reveal>

        {/* Carousel container */}
        <div
          className="relative flex flex-col items-center gap-8"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {/* Testimonial carousel */}
          <div className="relative w-full overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex justify-center"
              >
                <div className="w-full max-w-2xl rounded-sm border border-[var(--border)] bg-white p-8 shadow-[0_14px_36px_-26px_rgba(22,19,14,0.4)]">
                  <div aria-hidden className="mb-4 text-sm tracking-wider text-[var(--gold)]">
                    ⭐⭐⭐⭐⭐
                  </div>
                  <p className="text-base italic leading-relaxed text-[var(--ink)]">
                    &ldquo;{currentItem.quote}&rdquo;
                  </p>
                  <p className="mt-6 font-semibold text-[var(--ink)]">{currentItem.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{currentItem.location}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center gap-2">
            {items.map((_, index) => (
              <motion.button
                key={index}
                variants={dotVariants}
                initial="inactive"
                animate={index === currentIndex ? "active" : "inactive"}
                onClick={() => handleDotClick(index)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="h-3 rounded-full bg-[var(--gold)] transition-all focus-ring-sm"
                style={{
                  width: index === currentIndex ? 24 : 12,
                }}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === currentIndex}
              />
            ))}
          </div>

          {/* Counter */}
          <div className="text-xs font-medium text-[var(--muted-foreground)]">
            {currentIndex + 1} / {items.length}
          </div>
        </div>
      </div>
    </section>
  );
}
