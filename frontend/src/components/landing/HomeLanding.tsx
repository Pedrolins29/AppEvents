import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { EnvelopeReveal } from "@/components/EnvelopeReveal";
import { InteractiveInvitation } from "@/components/InteractiveInvitation";
import { InvitationPhoneMockup, type MockupScreen } from "@/components/InvitationPhoneMockup";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TemplateCard } from "@/components/TemplateCard";
import { formatEventDate } from "@/lib/formatEventDate";
import { EVENT_TYPES, getEventTypeLabels, type EventType } from "@/types/event";
import type { ThemeKey } from "@/types/template";

function ThemesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function CountdownIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <circle cx="11" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 6.5V12L14.5 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 1.5H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <rect x="4" y="5" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 15L8 11L11 14L15 10L18 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <path
        d="M11 20C11 20 18 13.8 18 9.2C18 5.2 14.9 2 11 2C7.1 2 4 5.2 4 9.2C4 13.8 11 20 11 20Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="9.2" r="2.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

const FEATURE_ICONS = [ThemesIcon, CountdownIcon, GalleryIcon, MapIcon] as const;

const TEMPLATE_THEMES: ThemeKey[] = ["elegant", "minimalist", "floral", "modern"];

// A thin antique-gold foil rule — the recurring editorial divider under section headings.
function FoilRule({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block h-px w-14 bg-[var(--gold)] ${className}`} />;
}

export interface ShowcaseEntry {
  theme: ThemeKey;
  eventType: EventType;
  name: string;
  dateIso: string;
  screens: [MockupScreen, MockupScreen];
  address?: string;
  dressCode?: string;
  timelineItems?: { time: string; label: string }[];
  photoUrl?: string;
}

// One illustrative sample per card — real product features (countdown, maps, gallery, RSVP are
// all shipped; Timeline/Dress Code below are real Event fields too), never fabricated content.
// Two examples each for Wedding, Graduation, a "Party" bucket, and Baby Shower, spread across
// all 4 real themes, so every screen type appears more than once without any card repeating.
export const SHOWCASE_ENTRIES: ShowcaseEntry[] = [
  {
    theme: "elegant",
    eventType: "Wedding",
    name: "Isabella & Marco",
    dateIso: "2026-09-14",
    screens: ["countdown", "map"],
    address: "The Grand Pavilion, Lisbon",
    photoUrl: "/showcase/wedding-rose.jpg",
  },
  {
    theme: "floral",
    eventType: "Wedding",
    name: "Sofia & Daniel",
    dateIso: "2026-06-06",
    screens: ["timeline", "dressCode"],
    dressCode: "Garden formal — soft pastels",
    timelineItems: [
      { time: "16:00", label: "Ceremony" },
      { time: "17:00", label: "Cocktail hour" },
      { time: "18:30", label: "Dinner" },
    ],
    photoUrl: "/showcase/wedding-beach.jpg",
  },
  {
    theme: "minimalist",
    eventType: "Graduation",
    name: "Maya's Graduation",
    dateIso: "2026-05-22",
    screens: ["countdown", "timeline"],
    timelineItems: [
      { time: "10:00", label: "Processional" },
      { time: "10:30", label: "Ceremony" },
      { time: "12:00", label: "Reception" },
    ],
    photoUrl: "/showcase/graduation.jpg",
  },
  {
    theme: "modern",
    eventType: "Graduation",
    name: "Jordan's Grad Night",
    dateIso: "2026-05-30",
    screens: ["map", "dressCode"],
    address: "Skyline Loft, Chicago",
    dressCode: "Black tie, no exceptions",
    photoUrl: "/showcase/graduation.jpg",
  },
  {
    theme: "modern",
    eventType: "Birthday",
    name: "Alex's 30th Birthday",
    dateIso: "2026-08-08",
    screens: ["countdown", "photo"],
  },
  {
    theme: "elegant",
    eventType: "FifteenYearsParty",
    name: "Camila's Quinceañera",
    dateIso: "2026-11-01",
    screens: ["timeline", "map"],
    address: "Grand Ballroom, Miami",
    timelineItems: [
      { time: "17:00", label: "Mass" },
      { time: "19:00", label: "Waltz" },
      { time: "20:00", label: "Dinner" },
    ],
    photoUrl: "/showcase/quinceanera.jpg",
  },
  {
    theme: "floral",
    eventType: "BabyShower",
    name: "Welcome, Baby Rose",
    dateIso: "2026-04-12",
    screens: ["countdown", "dressCode"],
    dressCode: "Garden pastels",
    photoUrl: "/showcase/babyshower-farm.jpg",
  },
  {
    theme: "minimalist",
    eventType: "BabyShower",
    name: "Baby Chen's Shower",
    dateIso: "2026-03-03",
    screens: ["timeline", "photo"],
    timelineItems: [
      { time: "13:00", label: "Arrival" },
      { time: "13:30", label: "Games" },
      { time: "14:30", label: "Lunch" },
    ],
    photoUrl: "/showcase/babyshower-minimalist.jpg",
  },
];

export async function HomeLanding() {
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const eventTypeT = await getTranslations("eventTypes");
  const themeNameT = await getTranslations("templateThemeNames");
  const countdownT = await getTranslations("countdown");
  const eventTypeLabels = getEventTypeLabels(eventTypeT);

  const features = t.raw("features") as { title: string; body: string }[];
  const steps = t.raw("howItWorks.steps") as { title: string; body: string }[];
  const faqItems = t.raw("faq.items") as { question: string; answer: string }[];
  const proof = t.raw("hero.proof") as string[];
  const eventTypesJoined = EVENT_TYPES.map((type) => eventTypeLabels[type]).join(", ");
  const miniCountdownLabels = [countdownT("days"), countdownT("hours"), countdownT("min")];

  return (
    <div className="flex flex-1 flex-col bg-[var(--porcelain)]">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero — deep Ink anchor band */}
        <section className="bg-[var(--ink)] px-6 py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="min-w-0 text-center lg:text-left">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--gold)]">
                {t("hero.eyebrow")}
              </p>
              <FoilRule className="mx-auto mt-5 lg:mx-0" />
              <h1 className="mt-6 text-balance font-display text-[2.6rem] font-light leading-[1.05] tracking-tight text-[var(--porcelain)] sm:text-6xl lg:text-7xl">
                {t("hero.title")}
              </h1>
              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-[#D9CFBD] lg:mx-0">
                {t("hero.subtitle")}
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="rounded-full bg-[var(--gold)] px-7 py-3 text-sm font-semibold text-[var(--ink)] transition-colors duration-150 hover:bg-[#C6A05E]"
                >
                  {t("hero.ctaCreate")}
                </Link>
                <Link
                  href="/templates"
                  className="rounded-full border border-[color-mix(in_srgb,var(--champagne)_38%,transparent)] px-7 py-3 text-sm font-medium text-[var(--porcelain)] transition-colors duration-150 hover:bg-white/5"
                >
                  {t("hero.ctaBrowse")}
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-[#B9AF9C] lg:justify-start">
                {proof.map((item, i) => (
                  <li key={item} className="flex items-center gap-3">
                    {i > 0 && <span className="text-[var(--gold)]">&middot;</span>}
                    <span className="uppercase tracking-[0.15em]">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                {EVENT_TYPES.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-[color-mix(in_srgb,var(--gold)_32%,transparent)] px-3 py-1 text-xs text-[#C9BFA9]"
                  >
                    {eventTypeLabels[type]}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex min-w-0 justify-center">
              <EnvelopeReveal label={t("demo.envelopeLabel")} openLabel={t("demo.tapToOpen")}>
                <InteractiveInvitation />
              </EnvelopeReveal>
            </div>
          </div>
        </section>

        {/* Features — porcelain */}
        <section className="px-6 py-16 sm:py-24">
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map(({ title, body }, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <Reveal key={title} delay={i * 0.06}>
                  <div className="h-full rounded-sm border border-[var(--border)] bg-white/70 p-6 shadow-[0_14px_36px_-26px_rgba(22,19,14,0.4)]">
                    <div className="mb-4 text-[var(--pinewood)]">
                      {i === 1 ? (
                        <div className="flex items-center gap-2" aria-hidden>
                          {["12", "08", "45"].map((value, j) => (
                            <div
                              key={j}
                              className="flex flex-col items-center rounded border border-[var(--border)] px-2 py-1"
                            >
                              <span className="text-sm font-semibold tabular-nums text-[var(--pinewood)]">
                                {value}
                              </span>
                              <span className="text-[8px] uppercase tracking-wide text-[var(--muted-foreground)]">
                                {miniCountdownLabels[j]}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : i === 3 ? (
                        <div className="flex items-center gap-2" aria-hidden>
                          <Icon />
                          <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--muted-foreground)]">
                            Google Maps
                          </span>
                          <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--muted-foreground)]">
                            Waze
                          </span>
                        </div>
                      ) : (
                        <Icon />
                      )}
                    </div>
                    <h3 className="mb-1.5 font-display text-xl text-[var(--ink)]">{title}</h3>
                    <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* Choose your style — porcelain (muted) */}
        <section id="templates" className="bg-[var(--muted)] px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <Reveal className="mb-12 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--pinewood)]">
                {t("chooseYourStyle.eyebrow")}
              </p>
              <h2 className="mt-4 font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
                {t("chooseYourStyle.heading")}
              </h2>
              <FoilRule className="mx-auto mt-5" />
            </Reveal>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TEMPLATE_THEMES.map((theme, i) => (
                <Reveal key={theme} delay={i * 0.06}>
                  <Link
                    href={`/templates/${theme}`}
                    className="group block h-full overflow-hidden rounded-sm border border-[var(--border)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-20px_rgba(22,19,14,0.4)]"
                  >
                    <TemplateCard theme={theme} name={themeNameT(theme)} />
                    <div className="border-t border-[var(--border)] bg-white px-3 py-2.5 text-center">
                      <span className="font-display text-base text-[var(--ink)]">{themeNameT(theme)}</span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/templates"
                className="text-sm font-medium text-[var(--pinewood)] underline-offset-4 hover:underline"
              >
                {t("chooseYourStyle.seeAll")}
              </Link>
            </div>
          </div>
        </section>

        {/* See it in action — deep Ink anchor band */}
        <section className="bg-[var(--ink)] px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mb-12 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--gold)]">
                {t("showcase.eyebrow")}
              </p>
              <h2 className="mt-4 font-display text-4xl font-light text-[var(--porcelain)] sm:text-5xl">
                {t("showcase.heading")}
              </h2>
              <FoilRule className="mx-auto mt-5" />
              <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-[#C9BFA9]">
                {t("showcase.subtitle")}
              </p>
            </Reveal>
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
              {SHOWCASE_ENTRIES.map((entry, i) => {
                const eventTypeLabel = eventTypeLabels[entry.eventType];
                const dateLabel = formatEventDate(entry.dateIso, locale);
                return (
                  <Reveal key={entry.name} delay={(i % 4) * 0.07} className="flex flex-col items-center gap-3">
                    <InvitationPhoneMockup
                      theme={entry.theme}
                      eventTypeLabel={eventTypeLabel}
                      name={entry.name}
                      dateLabel={dateLabel}
                      screens={entry.screens}
                      address={entry.address}
                      dressCode={entry.dressCode}
                      timelineItems={entry.timelineItems}
                      photoUrl={entry.photoUrl}
                      size="sm"
                    />
                    <div className="text-center">
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--gold)]">
                        {eventTypeLabel}
                      </p>
                      <p className="text-xs font-medium text-[var(--porcelain)]">{entry.name}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works — porcelain */}
        <section id="how-it-works" className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <Reveal className="mb-12 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--pinewood)]">
                {t("howItWorks.eyebrow")}
              </p>
              <h2 className="mt-4 font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
                {t("howItWorks.heading")}
              </h2>
              <FoilRule className="mx-auto mt-5" />
            </Reveal>
            <Reveal className="grid grid-cols-1 divide-y divide-[var(--border)] border-t border-b border-[var(--border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {steps.map(({ title, body }, i) => (
                <div key={title} className="px-6 py-9 text-center sm:px-8">
                  <span className="font-display text-4xl font-light text-[var(--gold)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-xl text-[var(--ink)]">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">{body}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* FAQ — porcelain (muted) */}
        <section id="faq" className="bg-[var(--muted)] px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <Reveal className="mb-12 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--pinewood)]">
                {t("faq.eyebrow")}
              </p>
              <h2 className="mt-4 font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
                {t("faq.heading")}
              </h2>
              <FoilRule className="mx-auto mt-5" />
            </Reveal>
            <div className="flex flex-col gap-3">
              {faqItems.map(({ question, answer }, i) => (
                <Reveal key={question} delay={i * 0.04}>
                  <details className="group rounded-sm border border-[var(--border)] bg-[var(--porcelain)] p-6">
                    <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-[var(--ink)]">{question}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          aria-hidden
                          className="shrink-0 text-[var(--gold)] transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
                        >
                          <path
                            d="M2 4L6 8L10 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {answer.replace("{types}", eventTypesJoined)}
                    </p>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA — deep Ink anchor band, gold foil frame */}
        <section className="bg-[var(--ink)] px-6 py-20 sm:py-28">
          <Reveal className="mx-auto max-w-xl">
            <div className="rounded-sm border border-[color-mix(in_srgb,var(--gold)_40%,transparent)] px-8 py-14 text-center">
              <h2 className="font-display text-4xl font-light text-[var(--porcelain)] sm:text-5xl">
                {t("finalCta.title")}
              </h2>
              <FoilRule className="mx-auto mt-5" />
              <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-[#C9BFA9]">
                {t("finalCta.subtitle")}
              </p>
              <Link
                href="/register"
                className="mt-8 inline-block rounded-full bg-[var(--gold)] px-7 py-3 text-sm font-semibold text-[var(--ink)] transition-colors duration-150 hover:bg-[#C6A05E]"
              >
                {t("hero.ctaCreate")}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
