"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { SHOWCASE_ENTRIES } from "@/components/landing/HomeLanding";
import { InvitationPhoneMockupView } from "@/components/InvitationPhoneMockupView";
import { formatEventDate } from "@/lib/formatEventDate";
import { getEventTypeLabels } from "@/types/event";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

interface TemplateCarouselProps {
  autoRotate?: boolean;
  rotationIntervalMs?: number;
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

export function TemplateCarousel({
  autoRotate = true,
  rotationIntervalMs = 4000,
}: TemplateCarouselProps) {
  const locale = useLocale();
  const eventTypeT = useTranslations("eventTypes");
  const countdownT = useTranslations("countdown");
  const invitationT = useTranslations("invitation");
  const eventTypeLabels = getEventTypeLabels(eventTypeT);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-rotate logic
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % SHOWCASE_ENTRIES.length);
    }, rotationIntervalMs);

    return () => clearInterval(interval);
  }, [autoRotate, rotationIntervalMs]);

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const currentEntry = SHOWCASE_ENTRIES[currentIndex];
  const eventTypeLabel = eventTypeLabels[currentEntry.eventType];
  const dateLabel = formatEventDate(currentEntry.dateIso, locale);

  return (
    <div className="relative flex flex-col items-center gap-6">
      {/* Carousel container */}
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
            <InvitationPhoneMockupView
              theme={currentEntry.theme}
              eventTypeLabel={eventTypeLabel}
              name={currentEntry.name}
              dateLabel={dateLabel}
              screens={currentEntry.screens}
              address={currentEntry.address}
              dressCode={currentEntry.dressCode}
              timelineItems={currentEntry.timelineItems}
              photoUrl={currentEntry.photoUrl}
              size="sm"
              labels={{
                days: countdownT("days"),
                hrs: countdownT("hours"),
                min: countdownT("min"),
                sec: countdownT("sec"),
                dressCode: invitationT("dressCode"),
                rsvpHeading: invitationT("rsvp.heading"),
                attending: invitationT("rsvp.attending"),
                notAttending: invitationT("rsvp.notAttending"),
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Template info */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
          {eventTypeLabel}
        </p>
        <p className="text-sm font-medium text-[var(--ink)]">{currentEntry.name}</p>
      </motion.div>

      {/* Pagination dots */}
      <div className="flex items-center gap-2">
        {SHOWCASE_ENTRIES.map((_, index) => (
          <motion.button
            key={index}
            variants={dotVariants}
            initial="inactive"
            animate={index === currentIndex ? "active" : "inactive"}
            onClick={() => handleDotClick(index)}
            className="h-2 rounded-full bg-[var(--gold)] transition-all"
            style={{
              width: index === currentIndex ? 24 : 8,
            }}
            aria-label={`Go to template ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="text-xs font-medium text-[var(--muted-foreground)]">
        {currentIndex + 1} / {SHOWCASE_ENTRIES.length}
      </div>
    </div>
  );
}
