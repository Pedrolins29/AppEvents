"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DateReveal } from "@/components/DateReveal";
import { THEME_STYLES } from "@/components/InvitationHero";
import { InvitationPeelBook } from "@/components/InvitationPeelBook";
import {
  InteractiveActionGrid,
  createLocationAction,
  createWhatsAppAction,
  createDressCodeAction,
  createRsvpAction,
} from "@/components/InteractiveActionGrid";
import { formatEventDate } from "@/lib/formatEventDate";

// The hero's interactive demo invitation — page-based navigation (drag the corner to peel,
// PeelBack-style) instead of continuous scroll. Each "page" reveals a section of the invitation.
// Client component: content from `landing.demo` namespace, countdown ticks live.
const THEME = THEME_STYLES.floral;
const DATE_ISO = "2026-09-14";
const COUPLE = "Isabella & Marco";
const COVER = "/showcase/wedding-embrace.jpg";
const PHOTOS = ["/showcase/wedding-rose.jpg", "/showcase/wedding-beach.jpg", "/showcase/wedding-embrace.jpg"];

function mapsUrl(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function useCountdown(iso: string) {
  const [p, setP] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    const target = new Date(iso).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setP({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);
  return p;
}

// Page wrapper: fills whatever slot InvitationPeelBook gives it, scrolls internally if content
// runs long (a fixed "page" can't grow the way a normal flowing section could).
function Page({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-y-auto rounded-[1.75rem]"
      style={{ backgroundColor: THEME.pageBg, color: THEME.body }}
    >
      {children}
    </div>
  );
}

function CoverPage({ coverImage, dateLabel }: { coverImage: string; dateLabel: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[1.75rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverImage}
        alt=""
        className="h-full w-full object-cover"
        style={{ filter: "grayscale(30%) brightness(0.85)" }}
      />
      <div
        className="absolute bottom-8 left-0 right-0 text-center text-sm tracking-widest"
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        {dateLabel}
      </div>
    </div>
  );
}

function NameDatePage({
  dateLabel,
  cdLabels,
  cdValues,
  eventTypeLabel,
  t,
}: {
  dateLabel: string;
  cdLabels: string[];
  cdValues: number[];
  eventTypeLabel: string;
  t: (key: string) => string;
}) {
  return (
    <Page>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 py-6">
        <span className="text-[8px] font-medium uppercase tracking-[0.35em]" style={{ color: THEME.accent }}>
          {eventTypeLabel}
        </span>

        <h3
          className={THEME.fontClassName}
          style={{ color: THEME.heading, fontStyle: THEME.fontStyle, fontSize: "1.5rem", lineHeight: 1.1 }}
        >
          {COUPLE}
        </h3>

        <p className="text-center text-[10px]" style={{ color: THEME.body }}>
          {t("invitedLine")}
        </p>

        <p className="text-[9px]" style={{ color: THEME.accent }}>
          {dateLabel}
        </p>

        <DateReveal label={t("revealDate")} coverBg={THEME.sectionBg} accent={THEME.accent}>
          <div className="flex items-center justify-center gap-2" aria-label={dateLabel}>
            {cdValues.map((value: number, i: number) => (
              <div
                key={i}
                className="flex min-w-[32px] flex-col items-center rounded-md py-1"
                style={{ backgroundColor: THEME.sectionBg }}
              >
                <span className="text-[11px] font-semibold tabular-nums" style={{ color: THEME.heading }}>
                  {String(value).padStart(2, "0")}
                </span>
                <span className="mt-0.5 text-[7px] uppercase tracking-[0.15em]" style={{ color: THEME.body }}>
                  {cdLabels[i]}
                </span>
              </div>
            ))}
          </div>
        </DateReveal>
      </div>
    </Page>
  );
}

function TimelinePage({ timeline, t }: { timeline: { time: string; label: string }[]; t: (key: string) => string }) {
  return (
    <Page>
      <div className="flex flex-col gap-3 px-5 py-6">
        <h4
          className={`${THEME.fontClassName} text-center text-[1rem]`}
          style={{ color: THEME.heading, fontStyle: THEME.fontStyle }}
        >
          {t("timelineHeading")}
        </h4>

        <ol className="relative ml-3 flex flex-col gap-3 border-l" style={{ borderColor: `${THEME.accent}55` }}>
          {timeline.map((item: { time: string; label: string }) => (
            <li key={item.time} className="relative pl-4">
              <span
                className="absolute -left-[5px] top-1 h-2 w-2 rotate-45"
                style={{ backgroundColor: THEME.accent }}
                aria-hidden
              />
              <span className="block text-[9px] font-semibold tabular-nums" style={{ color: THEME.heading }}>
                {item.time}
              </span>
              <span className="block text-[8px]" style={{ color: THEME.body }}>
                {item.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Page>
  );
}

function LocationsPage({
  locations,
  t,
}: {
  locations: { label: string; name: string; address: string }[];
  t: (key: string) => string;
}) {
  return (
    <Page>
      <div className="flex flex-col gap-2.5 px-5 py-6">
        <h4
          className={`${THEME.fontClassName} text-center text-[1rem]`}
          style={{ color: THEME.heading, fontStyle: THEME.fontStyle }}
        >
          {t("locationsHeading")}
        </h4>

        {locations.map((loc: { label: string; name: string; address: string }) => (
          <div
            key={loc.label}
            className="flex flex-col items-center gap-1 rounded-lg px-3 py-2.5 text-center"
            style={{ backgroundColor: THEME.sectionBg }}
          >
            <span className="text-[7px] font-medium uppercase tracking-[0.25em]" style={{ color: THEME.accent }}>
              {loc.label}
            </span>
            <span className="text-[10px] font-medium" style={{ color: THEME.heading }}>
              {loc.name}
            </span>
            <span className="text-[8px]" style={{ color: THEME.body }}>
              {loc.address}
            </span>
            <a
              href={mapsUrl(`${loc.name}, ${loc.address}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 rounded-full px-2.5 py-0.5 text-[7px] font-medium uppercase tracking-[0.15em]"
              style={{ backgroundColor: THEME.accent, color: THEME.pageBg }}
            >
              {t("howToGetThere")}
            </a>
          </div>
        ))}
      </div>
    </Page>
  );
}

function GalleryPage({ photos, t }: { photos: string[]; t: (key: string) => string }) {
  return (
    <Page>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-6">
        <h4
          className={`${THEME.fontClassName} text-center text-[1rem]`}
          style={{ color: THEME.heading, fontStyle: THEME.fontStyle }}
        >
          {t("photosHeading")}
        </h4>
        <span className="text-[7px] uppercase tracking-[0.25em]" style={{ color: THEME.accent }}>
          {t("swipe")} →
        </span>
        <div className="photo-strip flex w-full snap-x snap-mandatory gap-2 overflow-x-auto">
          {photos.map((src: string) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className="h-20 w-28 shrink-0 snap-center rounded-lg object-cover"
            />
          ))}
        </div>
      </div>
    </Page>
  );
}

// Quick-actions page — only real, shipped capabilities (location, WhatsApp nudge, dress code,
// RSVP). Gift registry and calendar export don't exist in the product yet, so they're excluded
// rather than shown as clickable actions that go nowhere.
function InteractiveActionsPage({ inv }: { inv: (key: string) => string }) {
  const actions = [
    createLocationAction(inv),
    createWhatsAppAction(inv),
    createDressCodeAction(inv),
    createRsvpAction(inv),
  ];

  return (
    <Page>
      <InteractiveActionGrid actions={actions} accentColor={THEME.accent} t={inv} />
    </Page>
  );
}

export function InteractiveInvitation() {
  const locale = useLocale();
  const t = useTranslations("landing.demo");
  const c = useTranslations("countdown");
  const inv = useTranslations("invitation");
  const eventTypes = useTranslations("eventTypes");
  const cd = useCountdown(DATE_ISO);

  const dateLabel = formatEventDate(DATE_ISO, locale);
  const timeline = t.raw("timeline") as { time: string; label: string }[];
  const locations = [
    { label: t("ceremonyLabel"), name: t("ceremonyName"), address: t("ceremonyAddress") },
    { label: t("receptionLabel"), name: t("receptionName"), address: t("receptionAddress") },
  ];
  const cdLabels = [c("days"), c("hours"), c("min"), c("sec")];
  const cdValues = cd ? [cd.d, cd.h, cd.m, cd.s] : [0, 0, 0, 0];

  const pages = [
    <CoverPage key="cover" dateLabel={dateLabel} coverImage={COVER} />,
    <NameDatePage
      key="namedate"
      dateLabel={dateLabel}
      cdLabels={cdLabels}
      cdValues={cdValues}
      eventTypeLabel={eventTypes("Wedding")}
      t={t}
    />,
    <TimelinePage key="timeline" timeline={timeline} t={t} />,
    <LocationsPage key="locations" locations={locations} t={t} />,
    <GalleryPage key="gallery" photos={PHOTOS} t={t} />,
    <InteractiveActionsPage key="actions" inv={inv} />,
  ];

  return (
    <div
      className="relative mx-auto rounded-[2.25rem] border-[6px] shadow-[0_25px_60px_-15px_rgba(15,23,20,0.45)]"
      style={{ borderColor: "#1A1611", backgroundColor: "#1A1611", height: 520, width: 260, padding: 8 }}
    >
      <div
        className="absolute left-1/2 top-3 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: "#1A1611" }}
        aria-hidden
      />

      <InvitationPeelBook pages={pages} accentColor={THEME.gold ?? THEME.accent} pullLabel="PUXE AQUI" />
    </div>
  );
}
