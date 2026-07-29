import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { InvitationPhoneMockup, type MockupScreen } from "@/components/InvitationPhoneMockup";
import { PhoneMockup } from "@/components/PhoneMockup";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TemplateCard } from "@/components/TemplateCard";
import { formatEventDate } from "@/lib/formatEventDate";
import { EVENT_TYPES, getEventTypeLabels, type EventType } from "@/types/event";
import type { ThemeKey } from "@/types/template";

function Diamond({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 10 10" aria-hidden className={className}>
      <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" />
    </svg>
  );
}

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

interface ShowcaseEntry {
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
const SHOWCASE_ENTRIES: ShowcaseEntry[] = [
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

export default async function Home() {
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const eventTypeT = await getTranslations("eventTypes");
  const themeNameT = await getTranslations("templateThemeNames");
  const countdownT = await getTranslations("countdown");
  const eventTypeLabels = getEventTypeLabels(eventTypeT);

  const features = t.raw("features") as { title: string; body: string }[];
  const steps = t.raw("howItWorks.steps") as { title: string; body: string }[];
  const faqItems = t.raw("faq.items") as { question: string; answer: string }[];
  const eventTypesJoined = EVENT_TYPES.map((type) => eventTypeLabels[type]).join(", ");
  const miniCountdownLabels = [countdownT("days"), countdownT("hours"), countdownT("min")];

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7]">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="px-6 py-14 sm:py-28">
          <div className="mx-auto max-w-2xl border border-[#0F766E]/25 p-1.5">
            <div className="border border-[#0F766E]/25 px-6 py-12 text-center sm:px-14 sm:py-16">
              <Diamond className="mx-auto mb-6 text-[#A16207]" />
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E]">
                {t("hero.eyebrow")}
              </p>
              <h1
                className="font-serif text-4xl leading-tight text-[#14211D] sm:text-5xl"
                style={{ fontWeight: 600 }}
              >
                {t("hero.title")}
              </h1>
              <p className="mx-auto mt-5 max-w-md text-base text-[#5B6B67]">{t("hero.subtitle")}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-full bg-[#0F766E] px-6 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56]"
                >
                  {t("hero.ctaCreate")}
                </Link>
                <Link
                  href="/templates"
                  className="rounded-full border border-[#0F766E]/40 px-6 py-3 text-sm font-medium text-[#14211D] transition-colors duration-150 hover:bg-[#0F766E]/5"
                >
                  {t("hero.ctaBrowse")}
                </Link>
              </div>
              <p className="mt-6 text-xs uppercase tracking-[0.15em] text-[#5B6B67]/80">
                {t("hero.tagline")}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {EVENT_TYPES.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-[#E2DFD3] px-3 py-1 text-xs text-[#5B6B67]"
                  >
                    {eventTypeLabels[type]}
                  </span>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <PhoneMockup />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 pb-14 sm:pb-28">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map(({ title, body }, i) => {
                const Icon = FEATURE_ICONS[i];
                return (
                  <div key={title} className="border border-[#E2DFD3] p-6">
                    <div className="mb-3 text-[#0F766E]">
                      {i === 1 ? (
                        <div className="flex items-center gap-2" aria-hidden>
                          {["12", "08", "45"].map((value, j) => (
                            <div
                              key={j}
                              className="flex flex-col items-center rounded border border-[#E2DFD3] px-2 py-1"
                            >
                              <span className="text-sm font-semibold tabular-nums text-[#0F766E]">
                                {value}
                              </span>
                              <span className="text-[8px] uppercase tracking-wide text-[#5B6B67]">
                                {miniCountdownLabels[j]}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : i === 3 ? (
                        <div className="flex items-center gap-2" aria-hidden>
                          <Icon />
                          <span className="rounded-full border border-[#E2DFD3] px-2 py-0.5 text-[10px] text-[#5B6B67]">
                            Google Maps
                          </span>
                          <span className="rounded-full border border-[#E2DFD3] px-2 py-0.5 text-[10px] text-[#5B6B67]">
                            Waze
                          </span>
                        </div>
                      ) : (
                        <Icon />
                      )}
                    </div>
                    <h3 className="mb-1.5 text-sm font-semibold text-[#14211D]">{title}</h3>
                    <p className="text-sm text-[#5B6B67]">{body}</p>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Choose your style */}
        <section id="templates" className="px-6 pb-14 sm:pb-28">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E]">
              {t("chooseYourStyle.heading")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TEMPLATE_THEMES.map((theme) => (
                <Link
                  key={theme}
                  href={`/templates/${theme}`}
                  className="group block overflow-hidden border border-[#E2DFD3] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(15,23,20,0.35)]"
                >
                  <TemplateCard theme={theme} name={themeNameT(theme)} />
                  <div className="border-t border-[#E2DFD3] bg-white px-3 py-2 text-center">
                    <span className="text-xs font-medium text-[#14211D]">{themeNameT(theme)}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/templates" className="text-sm font-medium text-[#0F766E] hover:underline">
                {t("chooseYourStyle.seeAll")}
              </Link>
            </div>
          </div>
        </section>

        {/* See it in action */}
        <section className="px-6 pb-14 sm:pb-28">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-2 text-center text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E]">
              {t("showcase.heading")}
            </h2>
            <p className="mx-auto mb-10 max-w-md text-center text-sm text-[#5B6B67]">
              {t("showcase.subtitle")}
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {SHOWCASE_ENTRIES.map((entry) => {
                const eventTypeLabel = eventTypeLabels[entry.eventType];
                const dateLabel = formatEventDate(entry.dateIso, locale);
                return (
                  <div key={entry.name} className="flex flex-col items-center gap-3">
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
                      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#0F766E]">
                        {eventTypeLabel}
                      </p>
                      <p className="text-xs font-medium text-[#14211D]">{entry.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-6 pb-14 sm:pb-28">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-10 text-center text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E]">
              {t("howItWorks.heading")}
            </h2>
            <div className="grid grid-cols-1 divide-y divide-[#E2DFD3] border-t border-b border-[#E2DFD3] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {steps.map(({ title, body }, i) => (
                <div key={title} className="px-6 py-8 text-center sm:px-8">
                  <span className="font-serif text-3xl text-[#A16207]" style={{ fontWeight: 600 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-[#14211D]">{title}</h3>
                  <p className="mt-1.5 text-sm text-[#5B6B67]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 pb-14 sm:pb-28">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-10 text-center text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E]">
              {t("faq.heading")}
            </h2>
            <div className="flex flex-col gap-4">
              {faqItems.map(({ question, answer }) => (
                <details key={question} className="group border border-[#E2DFD3] p-6">
                  <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-[#14211D]">{question}</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        aria-hidden
                        className="shrink-0 text-[#0F766E] transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
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
                  <p className="mt-3 text-sm text-[#5B6B67]">
                    {answer.replace("{types}", eventTypesJoined)}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-xl border border-[#0F766E]/25 px-8 py-12 text-center">
            <h2 className="font-serif text-2xl text-[#14211D] sm:text-3xl" style={{ fontWeight: 600 }}>
              {t("finalCta.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-[#5B6B67]">{t("finalCta.subtitle")}</p>
            <Link
              href="/register"
              className="mt-6 inline-block rounded-full bg-[#0F766E] px-6 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56]"
            >
              {t("hero.ctaCreate")}
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
