"use client";

import { motion, type Variants } from "framer-motion";
import { THEME_STYLES } from "@/components/InvitationHero";
import type { ThemeKey } from "@/types/template";

interface TemplateSelectionCardProps {
  theme: ThemeKey;
  name: string;
  isSelected?: boolean;
  onSelect: (themeId: string) => void;
}

const cardVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: "0px 10px 20px -5px rgba(0,0,0,0.1)",
  },
  hover: {
    scale: 1.03,
    boxShadow: "0px 15px 30px -5px rgba(0,0,0,0.2)",
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

const arrowVariants: Variants = {
  initial: { x: 0 },
  hover: { x: 4, transition: { type: "spring" as const, stiffness: 400, damping: 15 } },
};

export function TemplateSelectionCard({
  theme,
  name,
  isSelected = false,
  onSelect,
}: TemplateSelectionCardProps) {
  const themeStyle = THEME_STYLES[theme];
  const accentColor = themeStyle.accent;

  return (
    <motion.button
      type="button"
      className="relative flex w-full flex-col justify-between overflow-hidden rounded-xl p-6 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ backgroundColor: themeStyle.pageBg }}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onClick={() => onSelect(theme)}
      aria-label={`Select ${name} template`}
      aria-pressed={isSelected}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <div
          className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: accentColor }}
        >
          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Content Container */}
      <div className="space-y-3 pr-8">
        <h3
          className="text-lg font-semibold tracking-tight"
          style={{ color: themeStyle.heading }}
        >
          {name}
        </h3>
        <p
          className="max-w-xs text-sm opacity-70"
          style={{ color: themeStyle.body }}
        >
          Premium invitation template
        </p>
      </div>

      {/* CTA Button */}
      <div className="mt-6 flex w-full items-center justify-between rounded-full px-5 py-2 transition-colors" style={{ backgroundColor: accentColor }}>
        <span
          className="text-sm font-semibold"
          style={{ color: themeStyle.pageBg }}
        >
          Select Template
        </span>
        <div className="flex h-7 w-7 items-center justify-center">
          <motion.svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: themeStyle.pageBg }}
            variants={arrowVariants}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </motion.svg>
        </div>
      </div>

      {/* Selection Border */}
      {isSelected && (
        <div
          className="pointer-events-none absolute inset-0 rounded-xl border-2"
          style={{ borderColor: accentColor }}
        />
      )}
    </motion.button>
  );
}
