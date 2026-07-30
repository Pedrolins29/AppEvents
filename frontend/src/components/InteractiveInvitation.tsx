"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { DateReveal } from "@/components/DateReveal";
import { THEME_STYLES } from "@/components/InvitationHero";
import { formatEventDate } from "@/lib/formatEventDate";

// The hero's interactive demo invitation — a real, user-scrollable sample of what AppEvents
// produces (matrimonio.pro-style). Client component: content comes from the `landing.demo`
// message namespace so pt/en/es all read naturally; the countdown ticks live.
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

  const heading = (text: string) => (
    <h4
      className={`${THEME.fontClassName} text-center text-[1.05rem]`}
      style={{ color: THEME.heading, fontStyle: THEME.fontStyle }}
    >
      {text}
    </h4>
  );

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
      <div
        className="invitation-scroll relative h-full w-full overflow-y-auto rounded-[1.75rem]"
        style={{ backgroundColor: THEME.pageBg, color: THEME.body }}
      >
        {/* Cover photo */}
        <div className="relative h-40 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={COVER} alt="" loading="lazy" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent 45%, ${THEME.pageBg})` }}
          />
        </div>

        <div className="flex flex-col gap-6 px-5 pb-10 pt-2">
          {/* Names */}
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-[8px] font-medium uppercase tracking-[0.35em]" style={{ color: THEME.accent }}>
              {eventTypes("Wedding")}
            </span>
            <h3
              className={THEME.fontClassName}
              style={{ color: THEME.heading, fontStyle: THEME.fontStyle, fontSize: "1.6rem", lineHeight: 1.1 }}
            >
              {COUPLE}
            </h3>
            <p className="text-[11px]" style={{ color: THEME.body }}>
              {t("invitedLine")}
            </p>
            <p className="text-[10px]" style={{ color: THEME.accent }}>
              {dateLabel}
            </p>
          </div>

          {/* Countdown (live) — revealed with a playful tap, like the reference's "raspe para
              revelar a data". */}
          <DateReveal label={t("revealDate")} coverBg={THEME.sectionBg} accent={THEME.accent}>
            <div className="flex items-center justify-center gap-2.5" aria-label={dateLabel}>
              {cdValues.map((value, i) => (
                <div
                  key={i}
                  className="flex min-w-[38px] flex-col items-center rounded-md py-1.5"
                  style={{ backgroundColor: THEME.sectionBg }}
                >
                  <span className="text-sm font-semibold tabular-nums" style={{ color: THEME.heading }}>
                    {String(value).padStart(2, "0")}
                  </span>
                  <span className="mt-0.5 text-[7px] uppercase tracking-[0.15em]" style={{ color: THEME.body }}>
                    {cdLabels[i]}
                  </span>
                </div>
              ))}
            </div>
          </DateReveal>

          {/* Letter */}
          <section className="rounded-lg px-4 py-4" style={{ backgroundColor: THEME.sectionBg }}>
            <p
              className={`${THEME.fontClassName} mb-2 text-center text-[0.95rem]`}
              style={{ color: THEME.heading, fontStyle: THEME.fontStyle }}
            >
              {t("letterHeading")}
            </p>
            <p className="text-center text-[10px] leading-relaxed" style={{ color: THEME.body }}>
              {t("letter")}
            </p>
          </section>

          {/* Locations */}
          <div className="flex flex-col gap-3">
            {heading(t("locationsHeading"))}
            {locations.map((loc) => (
              <div
                key={loc.label}
                className="flex flex-col items-center gap-1 rounded-lg px-4 py-3 text-center"
                style={{ backgroundColor: THEME.sectionBg }}
              >
                <span className="text-[7px] font-medium uppercase tracking-[0.25em]" style={{ color: THEME.accent }}>
                  {loc.label}
                </span>
                <span className="text-[11px] font-medium" style={{ color: THEME.heading }}>
                  {loc.name}
                </span>
                <span className="text-[9px]" style={{ color: THEME.body }}>
                  {loc.address}
                </span>
                <a
                  href={mapsUrl(`${loc.name}, ${loc.address}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 rounded-full px-3 py-1 text-[8px] font-medium uppercase tracking-[0.15em]"
                  style={{ backgroundColor: THEME.accent, color: THEME.pageBg }}
                >
                  {t("howToGetThere")}
                </a>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-3">
            {heading(t("timelineHeading"))}
            <ol className="relative ml-3 flex flex-col gap-3 border-l" style={{ borderColor: `${THEME.accent}55` }}>
              {timeline.map((item) => (
                <li key={item.time} className="relative pl-4">
                  <span
                    className="absolute -left-[5px] top-1 h-2 w-2 rotate-45"
                    style={{ backgroundColor: THEME.accent }}
                    aria-hidden
                  />
                  <span className="block text-[10px] font-semibold tabular-nums" style={{ color: THEME.heading }}>
                    {item.time}
                  </span>
                  <span className="block text-[9px]" style={{ color: THEME.body }}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Photo strip */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2">
              {heading(t("photosHeading"))}
            </div>
            <span className="text-center text-[8px] uppercase tracking-[0.25em]" style={{ color: THEME.accent }}>
              {t("swipe")} →
            </span>
            <div className="photo-strip -mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1">
              {PHOTOS.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-24 w-32 shrink-0 snap-center rounded-md object-cover"
                />
              ))}
            </div>
          </div>

          {/* Dress code */}
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-[8px] font-medium uppercase tracking-[0.25em]" style={{ color: THEME.accent }}>
              {inv("dressCode")}
            </span>
            <span className="text-[11px]" style={{ color: THEME.heading }}>
              {t("dressCodeValue")}
            </span>
          </div>

          {/* RSVP */}
          <div className="flex flex-col items-center gap-2.5 text-center">
            <span className="text-[9px] font-medium uppercase tracking-[0.3em]" style={{ color: THEME.accent }}>
              {inv("rsvp.heading")}
            </span>
            <div className="flex gap-2">
              <span
                className="rounded-full px-3.5 py-1.5 text-[9px] font-medium"
                style={{ backgroundColor: THEME.accent, color: THEME.pageBg }}
              >
                {inv("rsvp.attending")}
              </span>
              <span
                className="rounded-full border px-3.5 py-1.5 text-[9px] font-medium"
                style={{ borderColor: THEME.accent, color: THEME.heading }}
              >
                {inv("rsvp.notAttending")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
