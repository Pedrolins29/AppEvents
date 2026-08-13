import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AnimatedHeroPhone } from "@/components/AnimatedHeroPhone";
import { EnvelopeReveal } from "@/components/EnvelopeReveal";
import { InteractiveInvitation } from "@/components/InteractiveInvitation";
import { MobileCtaBar } from "@/components/MobileCtaBar";
import { TemplateCarousel } from "@/components/TemplateCarousel";
import type { MockupScreen } from "@/components/InvitationPhoneMockup";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { AdminPreview } from "@/components/landing/AdminPreview";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { HorizontalTemplateCarousel } from "@/components/landing/HorizontalTemplateCarousel";
import { ServicesGrid } from "@/components/landing/ServicesGrid";
import { StepSection } from "@/components/landing/StepSection";
import { TestimonialGrid } from "@/components/landing/TestimonialGrid";
import { EVENT_TYPES, getEventTypeLabels, type EventType } from "@/types/event";
import type { ThemeKey } from "@/types/template";

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
  {
    theme: "romantic",
    eventType: "Wedding",
    name: "Sofia & Rafael",
    dateIso: "2026-07-18",
    screens: ["countdown", "map"],
    address: "Quinta das Oliveiras, Sintra",
    photoUrl: "/showcase/prewed 2.jpg",
  },
  {
    theme: "garden",
    eventType: "Wedding",
    name: "Baby Aria's Reveal",
    dateIso: "2026-02-20",
    screens: ["countdown", "dressCode"],
    dressCode: "Botanical, pastels",
    photoUrl: "/showcase/prewed3.jpg",
  },
  {
    theme: "newspaper",
    eventType: "Birthday",
    name: "The Daily Times",
    dateIso: "2026-09-25",
    screens: ["timeline", "photo"],
    timelineItems: [
      { time: "18:00", label: "Arrival" },
      { time: "19:00", label: "Dinner" },
      { time: "21:00", label: "Dancing" },
    ],
    photoUrl: "/showcase/prewed4.jpg",
  },
  {
    theme: "candlelight",
    eventType: "Wedding",
    name: "Lucia & Gabriel",
    dateIso: "2026-10-14",
    screens: ["countdown", "map"],
    address: "Château de la Rose, Paris",
    photoUrl: "/showcase/prewed5.jpg",
  },
  {
    theme: "neon",
    eventType: "Birthday",
    name: "Electric Nights",
    dateIso: "2026-12-31",
    screens: ["countdown", "photo"],
    photoUrl: "/showcase/prewed6.jpg",
  },
  {
    theme: "seal",
    eventType: "Wedding",
    name: "Catherine & Edmund",
    dateIso: "2026-06-12",
    screens: ["timeline", "map"],
    address: "Manor House, Edinburgh",
    timelineItems: [
      { time: "15:00", label: "Ceremony" },
      { time: "16:30", label: "Reception" },
      { time: "19:00", label: "Dinner" },
    ],
    photoUrl: "/showcase/wedding-embrace.jpg",
  },
];

export async function HomeLanding() {
  const t = await getTranslations("landing");
  const eventTypeT = await getTranslations("eventTypes");
  const eventTypeLabels = getEventTypeLabels(eventTypeT);

  const faqItems = t.raw("faq.items") as { question: string; answer: string }[];
  const proof = t.raw("hero.proof") as string[];
  // Deliberately not derived from EVENT_TYPES — these are display-only groupings for the hero
  // (e.g. baby shower + gender reveal merged into one pill, plus a "Corporate Events" pill that
  // has no backing EventType yet — see Sprints/sprint19.md).
  const heroPills = t.raw("hero.pills") as string[];
  const eventTypesJoined = EVENT_TYPES.map((type) => eventTypeLabels[type]).join(", ");

  return (
    <div className="flex flex-1 flex-col bg-[var(--porcelain)]">
      <SiteHeader />

      <main className="flex-1">
        {/* 1. Hero — soft Porcelain luxury open with wash-a gradient accents */}
        <section className="wash-a px-6 py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="min-w-0 text-center lg:text-left">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--gold)]">
                {t("hero.eyebrow")}
              </p>
              <FoilRule className="mx-auto mt-5 lg:mx-0" />
              <h1 className="mt-6 text-balance font-display text-[2.6rem] font-light leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl lg:text-7xl">
                {t("hero.title")}
              </h1>
              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-[var(--muted-foreground)] lg:mx-0">
                {t("hero.subtitle")}
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/criar-convite"
                  className="h-12 rounded-full bg-[var(--gold)] px-7 py-2.5 text-sm font-semibold text-[var(--ink)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#C6A05E] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)] focus-ring"
                >
                  {t("hero.ctaCreate")}
                </Link>
                <Link
                  href="/templates"
                  className="h-12 rounded-full border border-[var(--gold)] px-7 py-2.5 text-sm font-medium text-[var(--ink)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[var(--champagne)] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.15)] focus-ring"
                >
                  {t("hero.ctaBrowse")}
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-[var(--muted-foreground)] lg:justify-start">
                {proof.map((item, i) => (
                  <li key={item} className="flex items-center gap-3">
                    {i > 0 && <span className="text-[var(--gold)]">&middot;</span>}
                    <span className="uppercase tracking-[0.15em]">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start">
                {heroPills.map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex min-w-0 justify-center">
              <AnimatedHeroPhone>
                <EnvelopeReveal
                  label={t("demo.envelopeLabel")}
                  openLabel={t("demo.tapToOpen")}
                  photoUrl="/showcase/wedding-embrace.jpg"
                >
                  <InteractiveInvitation />
                </EnvelopeReveal>
              </AnimatedHeroPhone>
            </div>
          </div>
        </section>

        {/* 2. How it works — three numbered steps with wash-b (smooth continuation from Hero) */}
        <section className="wash-b">
          <StepSection />
        </section>

        {/* 3. What you get — 2×3 feature grid with wash-c */}
        <section className="wash-c">
          <ServicesGrid />
        </section>

        {/* 4. Admin dashboard preview — mockup + feature list with wash-c */}
        <section className="wash-c">
          <AdminPreview />
        </section>

        {/* 5. Choose your style — horizontal template strip with wash-b */}
        <section className="wash-b">
          <HorizontalTemplateCarousel />
        </section>

        {/* 6. Before / after comparison with wash-a */}
        <section className="wash-a">
          <ComparisonSection />
        </section>

        {/* 7. Social proof — testimonial grid with wash-a.
            PLACEHOLDER quotes, not real customer testimonials. */}
        <section className="wash-a">
          <TestimonialGrid />
        </section>

        {/* 8. See it in action — light showcase section with wash-b (soft luxury continues) */}
        <section className="wash-b px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mb-12 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--gold)]">
                {t("showcase.eyebrow")}
              </p>
              <h2 className="mt-4 font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
                {t("veja.title")}
              </h2>
              <FoilRule className="mx-auto mt-5" />
              <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-[var(--muted-foreground)]">
                {t("veja.subtitle")}
              </p>
            </Reveal>

            {/* Interactive carousel showcase — the single demo surface for SHOWCASE_ENTRIES.
                The static phone grid that used to sit below it was removed: it repeated the
                same entries the carousel already rotates through. */}
            <Reveal>
              <div className="flex justify-center rounded-2xl border border-[var(--border)] bg-gradient-to-b from-white/10 to-transparent p-8 sm:p-12 backdrop-blur-sm">
                <TemplateCarousel autoRotate rotationIntervalMs={4000} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* 9. FAQ — uniform light background (wash-b) for clean content readability */}
        <section id="faq" className="wash-b px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <Reveal className="mb-12 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--gold)]">
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

        {/* Final CTA — gradient from porcelain-2 → champagne → charcoal (softer anchor band) */}
        <section
          className="px-6 py-20 sm:py-28"
          style={{
            background:
              "linear-gradient(to bottom, var(--porcelain-2) 0%, var(--champagne) 18%, var(--charcoal) 75%, var(--charcoal) 100%)",
          }}
        >
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
                href="/criar-convite"
                className="mt-8 inline-block h-12 rounded-full bg-[var(--gold)] px-7 py-2.5 text-sm font-semibold text-[var(--ink)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#C6A05E] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)] focus-ring"
              >
                {t("hero.ctaCreate")}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <MobileCtaBar />
      <SiteFooter />
    </div>
  );
}
