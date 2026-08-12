"use client";

import { motion, type Variants } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedHeroPhoneProps {
  children: ReactNode;
}

const phoneContainerVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25,
      duration: 0.8,
    },
  },
};

const shadowVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { delay: 0.2, duration: 0.6 },
  },
};

const glowVariants: Variants = {
  animate: {
    boxShadow: [
      "0px 20px 60px -20px rgba(201,162,75,0.2)",
      "0px 30px 80px -25px rgba(201,162,75,0.35)",
      "0px 20px 60px -20px rgba(201,162,75,0.2)",
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

export function AnimatedHeroPhone({ children }: AnimatedHeroPhoneProps) {
  return (
    <motion.div
      className="relative w-full max-w-sm"
      variants={phoneContainerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Animated glow background */}
      <motion.div
        className="absolute -inset-4 rounded-3xl blur-3xl opacity-0 lg:block"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(201,162,75,0.15) 0%, transparent 70%)",
        }}
        variants={glowVariants}
        animate="animate"
      />

      {/* Main phone container with shadow */}
      <motion.div
        className="relative z-10"
        variants={shadowVariants}
        initial="initial"
        animate="animate"
      >
        {/* Dynamic shadow effect */}
        <div className="absolute -bottom-6 left-1/2 h-12 w-3/4 -translate-x-1/2 rounded-full bg-black/10 blur-2xl" />

        {/* Phone content */}
        <div className="relative">{children}</div>
      </motion.div>

      {/* Accent line below phone */}
      <motion.div
        className="mt-8 h-0.5 w-20 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent mx-auto"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
    </motion.div>
  );
}
