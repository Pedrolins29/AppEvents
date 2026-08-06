"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DURATION, EASE_FRAMER } from "@/lib/motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger offset in seconds, e.g. index * 0.1 for a 100ms sibling stagger. */
  delay?: number;
  /** Vertical travel distance in px (default 40). */
  y?: number;
  /** Renders children statically with no animation, bypassing the IntersectionObserver
   * entirely — used where whileInView's viewport semantics don't apply (e.g. peel-book
   * pages, which have no real scroll container). */
  skip?: boolean;
}

// A small scroll-reveal island: fades/rises its children in once, when they scroll into view.
// Server-rendered content is passed through as children. Under prefers-reduced-motion, or when
// `skip` is set, it renders the final state immediately with no animation.
export function Reveal({ children, className, delay = 0, y = 40, skip = false }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion || skip) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: DURATION.reveal, ease: EASE_FRAMER, delay }}
    >
      {children}
    </motion.div>
  );
}
