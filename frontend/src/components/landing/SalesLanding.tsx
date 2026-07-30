import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { EnvelopeReveal } from "@/components/EnvelopeReveal";
import { InteractiveInvitation } from "@/components/InteractiveInvitation";
import { InvitationPhoneMockup } from "@/components/InvitationPhoneMockup";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatEventDate } from "@/lib/formatEventDate";
import { EVENT_TYPES, getEventTypeLabels } from "@/types/event";
import { SHOWCASE_ENTRIES } from "@/components/landing/HomeLanding";

// A thin antique-gold foil rule — the recurring editorial divider under section headings.
function FoilRule({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block h-px w-14 bg-[var(--gold)] ${className}`} />;
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none" className="shrink-0">
      <path
        d="M3.5 9.5L7 13L14.5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden fill="none" className="shrink-0">
      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface Persona {
  audience: string;
  pain: string;
  solution: string;
}

interface ComparisonRow {
  feature: string;
  you: string;
  others: string;
  pdf: string;
}

// Sprint 13 — the PLG conversion-focused landing. Rendered only when SALES_LANDING=true (see
// app/page.tsx); its hero badge and comparison rows sell features (Pix gift list, WhatsApp RSVP,
// music) that ship in later sprints, which is exactly why it stays behind the flag until then.
// The interactive envelope, showcase, how-it-works and FAQ below reuse the REAL, already-shipped
// sections. No fabricated ratings, counters, or testimonials anywhere.
export async function SalesLanding() {
  const locale = await getLocale();
  const t = await getTranslations("landing");
  const s = await getTranslations("landing.sales");
  const eventTypeT = await getTranslations("eventTypes");
  const eventTypeLabels = getEventTypeLabels(eventTypeT);

  const personas = s.raw("personas.items") as Persona[];
  const rows = s.raw("comparison.rows") as ComparisonRow[];
  const steps = t.raw("howItWorks.steps") as { title: string; body: string }[];
  const faqItems = t.raw("faq.items") as { question: string; answer: string }[];
  const eventTypesJoined = EVENT_TYPES.map((type) => eventTypeLabels[type]).join(", ");

  return (
    <div className="flex flex-1 flex-col bg-[var(--porcelain)]">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero — deep Ink anchor band, conversion-first */}
        <section className="bg-[var(--ink)] px-6 py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="min-w-0 text-center lg:text-left">
              <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--gold)_38%,transparent)] bg-white/[0.03] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--champagne)]">
                {s("hero.badge")}
              </span>
              <FoilRule className="mx-auto mt-6 lg:mx-0" />
              <h1 className="mt-6 text-balance font-display text-[2.6rem] font-light leading-[1.05] tracking-tight text-[var(--porcelain)] sm:text-6xl lg:text-7xl">
                {s("hero.title")}
              </h1>
              <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-[#D9CFBD] lg:mx-0">
                {s("hero.subtitle")}
              </p>
              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="rounded-full bg-[var(--gold)] px-7 py-3 text-sm font-semibold text-[var(--ink)] transition-colors duration-150 hover:bg-[#C6A05E]"
                >
                  {s("hero.ctaPrimary")}
                </Link>
                <a
                  href="#live-demo"
                  className="rounded-full border border-[color-mix(in_srgb,var(--champagne)_38%,transparent)] px-7 py-3 text-sm font-medium text-[var(--porcelain)] transition-colors duration-150 hover:bg-white/5"
                >
                  {s("hero.ctaSecondary")}
                </a>
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.15em] text-[#B9AF9C]">
                {s("hero.ctaPrimaryNote")}
              </p>
            </div>

            <div id="live-demo" className="flex min-w-0 scroll-mt-28 justify-center">
              <EnvelopeReveal label={t("demo.envelopeLabel")} openLabel={t("demo.tapToOpen")}>
                <InteractiveInvitation />
              </EnvelopeReveal>
            </div>
          </div>
        </section>

        {/* Para quem é — personas (porcelain) */}
        <section className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mb-12 text-center">
              <h2 className="font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
                {s("personas.heading")}
              </h2>
              <FoilRule className="mx-auto mt-5" />
            </Reveal>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {personas.map(({ audience, pain, solution }, i) => (
                <Reveal key={audience} delay={i * 0.07}>
                  <div className="flex h-full flex-col rounded-sm border border-[var(--border)] bg-white/70 p-7 shadow-[0_14px_36px_-26px_rgba(22,19,14,0.4)]">
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--pinewood)]">
                      {audience}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">{pain}</p>
                    <p className="mt-4 flex items-start gap-2 text-sm font-medium leading-relaxed text-[var(--ink)]">
                      <span className="mt-0.5 text-[var(--gold)]">
                        <CheckIcon />
                      </span>
                      <span>{solution}</span>
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table (porcelain muted) */}
        <section className="bg-[var(--muted)] px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <Reveal className="mb-12 text-center">
              <h2 className="font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
                {s("comparison.heading")}
              </h2>
              <FoilRule className="mx-auto mt-5" />
            </Reveal>
            <Reveal>
              <div className="overflow-x-auto rounded-sm border border-[var(--border)] bg-[var(--porcelain)]">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="px-4 py-4 font-medium text-[var(--muted-foreground)]">
                        {s("comparison.feature")}
                      </th>
                      <th className="bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] px-4 py-4 font-display text-base text-[var(--ink)]">
                        {s("comparison.you")}
                      </th>
                      <th className="px-4 py-4 font-medium text-[var(--muted-foreground)]">
                        {s("comparison.others")}
                      </th>
                      <th className="px-4 py-4 font-medium text-[var(--muted-foreground)]">
                        {s("comparison.pdf")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.feature} className="border-b border-[var(--border)] last:border-b-0">
                        <th
                          scope="row"
                          className="px-4 py-4 text-left align-top font-medium text-[var(--ink)]"
                        >
                          {row.feature}
                        </th>
                        <td className="bg-[color-mix(in_srgb,var(--gold)_10%,transparent)] px-4 py-4 align-top text-[var(--ink)]">
                          <span className="flex items-start gap-2">
                            <span className="mt-0.5 text-[var(--pinewood)]">
                              <CheckIcon />
                            </span>
                            <span>{row.you}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-[var(--muted-foreground)]">
                          <span className="flex items-start gap-2">
                            <span className="mt-0.5 text-[var(--muted-foreground)] opacity-60">
                              <CrossIcon />
                            </span>
                            <span>{row.others}</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top text-[var(--muted-foreground)]">
                          <span className="flex items-start gap-2">
                            <span className="mt-0.5 text-[var(--muted-foreground)] opacity-60">
                              <CrossIcon />
                            </span>
                            <span>{row.pdf}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
            <p className="mt-4 text-center text-xs leading-relaxed text-[var(--muted-foreground)]">
              {s("comparison.footnote")}
            </p>
          </div>
        </section>

        {/* See it in action — reuse the REAL showcase (deep Ink anchor band) */}
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

        {/* How it works — reuse real steps (porcelain) */}
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

        {/* FAQ — reuse real Q&As (porcelain muted) */}
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
                {s("finalCta.title")}
              </h2>
              <FoilRule className="mx-auto mt-5" />
              <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed text-[#C9BFA9]">
                {s("finalCta.subtitle")}
              </p>
              <Link
                href="/register"
                className="mt-8 inline-block rounded-full bg-[var(--gold)] px-7 py-3 text-sm font-semibold text-[var(--ink)] transition-colors duration-150 hover:bg-[#C6A05E]"
              >
                {s("finalCta.cta")}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
