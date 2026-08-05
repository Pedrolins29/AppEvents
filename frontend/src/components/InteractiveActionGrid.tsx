"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import React, { useState } from "react";

interface ActionIcon {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  action?: () => void;
}

interface InteractiveActionGridProps {
  actions: ActionIcon[];
  accentColor: string;
  t: (key: string) => string;
}

/**
 * Interactive action grid — circular buttons with icons for real, shipped invitation actions
 * only (Location, WhatsApp, Dress Code, RSVP). No gift registry or calendar export yet, so
 * neither is offered here (see createLocationAction etc. below).
 */
export function InteractiveActionGrid({
  actions,
  accentColor,
  t,
}: InteractiveActionGridProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const iconVariants: Variants = {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.95 },
  };

  const handleActionClick = (action: ActionIcon) => {
    setSelectedAction(action.id);
    action.action?.();

    // Reset selection after action
    setTimeout(() => setSelectedAction(null), 300);
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-4 px-4 py-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <h3
        className="text-center text-sm font-medium uppercase tracking-wider"
        style={{ color: accentColor }}
      >
        {t("interactWithUs")}
      </h3>

      {/* Grid of actions (2 columns × 3 rows) */}
      <motion.div className="grid grid-cols-2 gap-3 w-full">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            className="flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all"
            style={{
              backgroundColor: selectedAction === action.id ? accentColor : `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
              color: selectedAction === action.id ? "#FAFAF7" : "inherit",
            }}
            variants={itemVariants}
            onClick={() => handleActionClick(action)}
            whileHover={{
              backgroundColor: `${accentColor}25`,
              boxShadow: `0 8px 20px -6px rgba(156, 138, 118, 0.25)`,
            }}
            whileTap={{ scale: 0.95 }}
            aria-label={action.label}
            title={action.description}
          >
            {/* Icon */}
            <motion.div
              className="flex items-center justify-center h-10 w-10 rounded-full"
              style={{
                backgroundColor: selectedAction === action.id ? "rgba(255,255,255,0.2)" : "transparent",
              }}
              variants={iconVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
            >
              {action.icon}
            </motion.div>

            {/* Label */}
            <span className="text-[9px] font-medium text-center leading-tight">
              {action.label}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

/**
 * Predefined action generators
 * Use these to quickly build common invitation actions
 */

export const createLocationAction = (t: (key: string) => string): ActionIcon => ({
  id: "location",
  icon: <span className="text-lg">📍</span>,
  label: t("location"),
  description: t("openInMaps"),
  action: () => {
    // Will be implemented during integration
  },
});

export const createWhatsAppAction = (t: (key: string) => string): ActionIcon => ({
  id: "whatsapp",
  icon: <span className="text-lg">💬</span>,
  label: t("message"),
  description: t("contactViaWhatsApp"),
  action: () => {
    // Will be implemented during integration
  },
});

export const createDressCodeAction = (t: (key: string) => string): ActionIcon => ({
  id: "dresscode",
  icon: <span className="text-lg">👔</span>,
  label: t("dressCode"),
  description: t("viewDressCode"),
  action: () => {
    // Will be implemented during integration
  },
});

export const createRsvpAction = (t: (key: string) => string): ActionIcon => ({
  id: "rsvp",
  icon: <span className="text-lg">✅</span>,
  label: t("rsvp.heading"),
  description: t("confirmAttendance"),
  action: () => {
    // Will be implemented during integration
  },
});
