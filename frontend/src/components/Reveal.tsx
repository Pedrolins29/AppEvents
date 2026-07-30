"use client";

import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger offset in seconds, e.g. index * 0.06 for grid items. */
  delay?: number;
  /** Vertical travel distance in px (default 24). */
  y?: number;
}

// A small scroll-reveal island: fades/rises its children in once, when they scroll into view.
// Server-rendered content is passed through as children. Under prefers-reduced-motion it renders
// the final state immediately with no animation.
export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
