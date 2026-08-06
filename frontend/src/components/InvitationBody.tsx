"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Countdown } from "@/components/Countdown";
import { ThemeMotif, type ThemeStyle } from "@/components/InvitationHero";
import { InvitationHero } from "@/components/InvitationHeroContent";
import { InvitationPeelBook } from "@/components/InvitationPeelBook";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Reveal } from "@/components/Reveal";
import { RsvpForm } from "@/components/RsvpForm";
import { absoluteImageUrl } from "@/lib/absoluteImageUrl";
import type { InvitationViewModel } from "@/lib/invitationViewModel";
import { mapsLinks } from "@/lib/mapsLinks";
import { DURATION, EASE_FRAMER } from "@/lib/motion";

interface InvitationBodyProps {
  event: InvitationViewModel;
  theme: ThemeStyle;
  /** Skips the real RSVP network call, going straight to the themed success state — used by
   * demo/preview surfaces (template previews, an owner's own event preview) where a real
   * submission would be meaningless or unwanted. */
  demoRsvp?: boolean;
  /** Set when a guest opened their personal link (/e/{slug}?g={token}) — RsvpForm fetches that
   * guest's own details client-side to prefill the form and tie the submission to them. */
  inviteToken?: string;
}

// Sprint 24: wraps one section for the peel-book layout — h-full/overflow-y-auto so a section
// taller than the viewport scrolls internally instead of overflowing the fixed "page" PeelBack
// gives it. Only used in peel mode; the default stacked layout renders sections unwrapped.
function Page({ pageBg, children }: { pageBg: string; children: ReactNode }) {
  return (
    <div className="h-full w-full overflow-y-auto" style={{ backgroundColor: pageBg }}>
      {children}
    </div>
  );
}

// The section stack shared by the real public invitation page (/e/[slug]) and the authenticated
// owner-preview page (/events/[id]/preview) — same order, same conditionals, no consumer wants a
// subset, so this is one component rather than several independently-imported sub-components.
//
// Client Component (not Server): this renders inside events/[id]/preview/page.tsx, a "use client"
// page, which pulls any component it imports directly into the client bundle regardless of that
// component's own directive — a Server Component using the server-only getTranslations API broke
// exactly this way for SiteFooter.tsx earlier in this sprint. useTranslations (client-side) avoids
// that class of bug and works fine when rendered from the two Server Component consumers too
// (e/[slug], templates/[theme]), since a Server Component rendering a Client Component is normal.
//
// Sprint 24: the same sections below are reused for two presentations — a scrolling stack (the
// default, and the server-rendered HTML every request starts with, so SEO/no-JS/screen readers
// always get the full linear content) and, once mounted, a page-turn "book" (PeelBack) for events
// on the Floral theme when the visitor hasn't asked for reduced motion. The swap is purely a
// client-side re-presentation of the exact same nodes — nothing is fetched or rendered twice.
export function InvitationBody({ event, theme, demoRsvp = false, inviteToken }: InvitationBodyProps) {
  const t = useTranslations("invitation");
  const links = event.address ? mapsLinks(event.address) : null;
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Flip after first paint (not synchronously in the effect body) so the peel-book layout only
    // takes over client-side — SSR/no-JS visitors always get the full linear content below.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const usePeelBook = mounted && event.themeKey === "floral" && !reduceMotion;
  const skipGalleryAnimation = usePeelBook || reduceMotion;

  // Orchestrates the gallery's stagger: children animate via galleryItemVariants, this container
  // only carries the staggerChildren timing (no visual properties of its own). One parent-level
  // whileInView drives all images at once rather than N per-image observers — every image in the
  // horizontally-scrolling strip enters/exits the *vertical* viewport together as one unit, so a
  // per-image trigger would be both wasteful and semantically wrong (horizontal scroll within the
  // strip doesn't re-trigger anything).
  const galleryContainerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  };
  const galleryItemVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { duration: DURATION.gallery, ease: EASE_FRAMER } },
  };

  const heroSection = (
    <InvitationHero
      name={event.name}
      eventTypeLabel={event.eventTypeLabel}
      formattedDate={event.formattedDate}
      coverImageUrl={event.coverImageUrl ? absoluteImageUrl(event.coverImageUrl) : null}
      theme={theme}
      themeKey={event.themeKey ?? "minimalist"}
    >
      <Countdown targetDate={event.eventDateIso} accentColor={theme.accent} textColor={theme.body} />
    </InvitationHero>
  );

  const storySection = event.description && (
    <section className="px-6 py-16" style={{ backgroundColor: theme.sectionBg }}>
      <Reveal className="mx-auto max-w-xl text-center" skip={usePeelBook}>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.3em]" style={{ color: theme.accent }}>
          {t("ourStory")}
        </h2>
        <p className="whitespace-pre-line text-base leading-relaxed" style={{ color: theme.body }}>
          {event.description}
        </p>
      </Reveal>
    </section>
  );

  const timelineSection = event.timelineItems.length > 0 && (
    <section className="px-6 py-16" style={{ backgroundColor: theme.pageBg }}>
      <Reveal className="mx-auto max-w-md" skip={usePeelBook}>
        <h2 className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em]" style={{ color: theme.accent }}>
          {t("timeline")}
        </h2>
        <ul>
          {event.timelineItems.map((item, index) => (
            <li
              key={index}
              className={`py-3 ${index > 0 ? "border-t" : ""}`}
              style={index > 0 ? { borderColor: theme.accent + "33" } : undefined}
            >
              <Reveal className="flex items-baseline gap-4" delay={index * 0.1} skip={usePeelBook}>
                <span className="text-sm font-semibold tabular-nums" style={{ color: theme.accent }}>
                  {item.time}
                </span>
                <span className="text-sm" style={{ color: theme.body }}>
                  {item.label}
                </span>
              </Reveal>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );

  const gallerySection = event.galleryImageUrls.length > 0 && (
    <section className="px-6 py-16" style={{ backgroundColor: theme.pageBg }}>
      <Reveal className="mx-auto max-w-3xl" skip={usePeelBook}>
        <h2 className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em]" style={{ color: theme.accent }}>
          {t("gallery")}
        </h2>
        {/* Horizontal, swipeable strip (keyboard-scrollable when focused) — the next photo
            peeks in at the edge to signal there's more to scroll. */}
        {skipGalleryAnimation ? (
          <div
            className="photo-strip -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 focus-visible:outline-none"
            tabIndex={0}
            role="group"
            aria-label={t("gallery")}
          >
            {event.galleryImageUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={absoluteImageUrl(url)}
                alt=""
                loading="lazy"
                className="aspect-[4/5] w-60 shrink-0 snap-center rounded-md object-cover sm:w-64"
              />
            ))}
          </div>
        ) : (
          <motion.div
            className="photo-strip -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 focus-visible:outline-none"
            tabIndex={0}
            role="group"
            aria-label={t("gallery")}
            variants={galleryContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            {event.galleryImageUrls.map((url) => (
              <motion.img
                key={url}
                src={absoluteImageUrl(url)}
                alt=""
                loading="lazy"
                className="aspect-[4/5] w-60 shrink-0 snap-center rounded-md object-cover sm:w-64"
                variants={galleryItemVariants}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 24px -10px rgba(22,19,14,0.35)",
                  transition: { duration: DURATION.fast, ease: EASE_FRAMER },
                }}
              />
            ))}
          </motion.div>
        )}
      </Reveal>
    </section>
  );

  const locationSection = event.address && links && (
    <section className="px-6 py-16 text-center" style={{ backgroundColor: theme.sectionBg }}>
      <Reveal skip={usePeelBook}>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.3em]" style={{ color: theme.accent }}>
          {t("location")}
        </h2>
        <p className={event.dressCode ? "mb-2 text-base" : "mb-6 text-base"} style={{ color: theme.body }}>
          {event.address}
        </p>
        {event.dressCode && (
          <p className="mb-6 text-sm" style={{ color: theme.body }}>
            {t("dressCodePrefix")}{event.dressCode}
          </p>
        )}
        <div className="flex items-center justify-center gap-4">
          <a
            href={links.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border px-5 py-2 text-sm font-medium"
            style={{ borderColor: theme.accent, color: theme.heading }}
          >
            {t("openGoogleMaps")}
          </a>
          <a
            href={links.waze}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border px-5 py-2 text-sm font-medium"
            style={{ borderColor: theme.accent, color: theme.heading }}
          >
            {t("openWaze")}
          </a>
        </div>
      </Reveal>
    </section>
  );

  const dressCodeOnlySection = event.dressCode && !(event.address && links) && (
    <section className="px-6 py-16 text-center" style={{ backgroundColor: theme.sectionBg }}>
      <Reveal skip={usePeelBook}>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.3em]" style={{ color: theme.accent }}>
          {t("dressCodeHeading")}
        </h2>
        <p className="text-base" style={{ color: theme.body }}>
          {event.dressCode}
        </p>
      </Reveal>
    </section>
  );

  const rsvpSection = (
    <section className="px-6 py-16" style={{ backgroundColor: theme.pageBg }}>
      <Reveal skip={usePeelBook}>
        <h2 className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em]" style={{ color: theme.accent }}>
          {t("rsvp.heading")}
        </h2>
        <RsvpForm slug={event.slug} theme={theme} demoMode={demoRsvp} inviteToken={inviteToken} />
      </Reveal>
    </section>
  );

  const featuredPhotoSection = event.featuredPhotoUrl && (
    <section className="px-6 py-16 text-center" style={{ backgroundColor: theme.sectionBg }}>
      <Reveal className="mx-auto flex max-w-md flex-col items-center gap-4" skip={usePeelBook}>
        <ThemeMotif theme={event.themeKey ?? "minimalist"} accentColor={theme.accent} />
        <p
          className={theme.fontClassName}
          style={{ color: theme.heading, fontStyle: theme.fontStyle, fontSize: "1.5rem" }}
        >
          {t("cantWaitToCelebrate")}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={absoluteImageUrl(event.featuredPhotoUrl)}
          alt=""
          className="mt-2 aspect-[4/5] w-full rounded-md object-cover"
        />
      </Reveal>
    </section>
  );

  const sections = [
    heroSection,
    storySection,
    timelineSection,
    gallerySection,
    locationSection,
    dressCodeOnlySection,
    rsvpSection,
    featuredPhotoSection,
  ].filter(Boolean) as ReactNode[];

  if (usePeelBook) {
    return (
      <div className="fixed inset-0 h-dvh w-full" style={{ backgroundColor: theme.pageBg }}>
        <div className="fixed right-4 top-4 z-30">
          <LanguageSwitcher />
        </div>
        <InvitationPeelBook
          pages={sections.map((section, i) => (
            <Page key={i} pageBg={theme.pageBg}>
              {section}
            </Page>
          ))}
          accentColor={theme.accent}
        />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: theme.pageBg }}>
      <div className="fixed right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>
      {sections}
    </div>
  );
}
