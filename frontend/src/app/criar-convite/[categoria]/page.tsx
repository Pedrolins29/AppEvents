import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { InstantPreview } from "@/components/InstantPreview";
import { InvitationPhoneMockup } from "@/components/InvitationPhoneMockup";
import { SHOWCASE_ENTRIES } from "@/components/landing/HomeLanding";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatEventDate } from "@/lib/formatEventDate";
import { CATEGORY_ORDER, CATEGORY_SLUGS, SLUG_TO_EVENT_TYPE } from "@/lib/inviteCategories";
import { getEventTypeLabels } from "@/types/event";

function FoilRule({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block h-px w-14 bg-[var(--gold)] ${className}`} />;
}

interface FaqEntry {
  question: string;
  answer: string;
}

interface PageProps {
  params: Promise<{ categoria: string }>;
}

export function generateStaticParams() {
  return CATEGORY_ORDER.map((type) => ({ categoria: CATEGORY_SLUGS[type]! }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const eventType = SLUG_TO_EVENT_TYPE[categoria];
  if (!eventType) {
    return {};
  }
  const t = await getTranslations(`criarConvite.categories.${eventType}`);
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: `/criar-convite/${categoria}` },
  };
}

export default async function CreateInvitationCategoryPage({ params }: PageProps) {
  const { categoria } = await params;
  const eventType = SLUG_TO_EVENT_TYPE[categoria];

  if (!eventType) {
    notFound();
  }

  const locale = await getLocale();
  const hubT = await getTranslations("criarConvite.hub");
  const t = await getTranslations(`criarConvite.categories.${eventType}`);
  const instantPreviewT = await getTranslations("criarConvite.instantPreview");
  const eventTypeLabels = getEventTypeLabels(await getTranslations("eventTypes"));
  const faqItems = t.raw("faq") as FaqEntry[];
  const showcaseEntries = SHOWCASE_ENTRIES.filter((entry) => entry.eventType === eventType).slice(0, 4);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: hubT("breadcrumbHome"), item: "/" },
      { "@type": "ListItem", position: 2, name: hubT("breadcrumbHub"), item: "/criar-convite" },
      { "@type": "ListItem", position: 3, name: eventTypeLabels[eventType], item: `/criar-convite/${categoria}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="flex flex-1 flex-col bg-[var(--porcelain)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />

      <main className="flex-1">
        <nav aria-label="Breadcrumb" className="px-6 pt-6 text-xs text-[var(--muted-foreground)]">
          <ol className="mx-auto flex max-w-4xl items-center gap-2">
            <li>
              <Link href="/" className="hover:underline">
                {hubT("breadcrumbHome")}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/criar-convite" className="hover:underline">
                {hubT("breadcrumbHub")}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-[var(--ink)]">{eventTypeLabels[eventType]}</li>
          </ol>
        </nav>

        <section className="bg-[var(--ink)] px-6 py-12 sm:py-20">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--gold)]">{t("heroEyebrow")}</p>
            <FoilRule className="mx-auto mt-5" />
            <h1 className="mt-6 text-balance font-display text-4xl font-light leading-[1.1] tracking-tight text-[var(--porcelain)] sm:text-5xl">
              {t("heroHeading")}
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-[#D9CFBD]">{t("heroSubtitle")}</p>
          </Reveal>
        </section>

        <section className="px-6 py-16 sm:py-20">
          <Reveal className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
            <div className="rounded-sm border border-[var(--border)] bg-white/70 p-6">
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{t("painPoint")}</p>
            </div>
            <div className="rounded-sm border border-[color-mix(in_srgb,var(--pinewood)_35%,transparent)] bg-white/70 p-6">
              <p className="text-sm font-medium leading-relaxed text-[var(--ink)]">{t("solution")}</p>
            </div>
          </Reveal>
        </section>

        {showcaseEntries.length > 0 && (
          <section className="bg-[var(--ink)] px-6 py-16 sm:py-24">
            <div className="mx-auto max-w-5xl">
              <Reveal className="mb-12 text-center">
                <h2 className="font-display text-3xl font-light text-[var(--porcelain)] sm:text-4xl">
                  {t("showcaseHeading")}
                </h2>
                <FoilRule className="mx-auto mt-5" />
              </Reveal>
              <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                {showcaseEntries.map((entry, i) => (
                  <Reveal key={entry.name} delay={(i % 4) * 0.07} className="flex justify-center">
                    <InvitationPhoneMockup
                      theme={entry.theme}
                      eventTypeLabel={eventTypeLabels[entry.eventType]}
                      name={entry.name}
                      dateLabel={formatEventDate(entry.dateIso, locale)}
                      screens={entry.screens}
                      address={entry.address}
                      dressCode={entry.dressCode}
                      timelineItems={entry.timelineItems}
                      photoUrl={entry.photoUrl}
                      size="sm"
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="preview" className="px-6 py-16 sm:py-24">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-light text-[var(--ink)] sm:text-4xl">
              {instantPreviewT("heading")}
            </h2>
            <FoilRule className="mx-auto mt-5" />
          </Reveal>
          <InstantPreview defaultEventType={eventType} />
        </section>

        <section className="bg-[var(--muted)] px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-col gap-3">
              {faqItems.map((item) => (
                <details key={item.question} className="group rounded-sm border border-[var(--border)] bg-[var(--porcelain)] p-6">
                  <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold text-[var(--ink)]">{item.question}</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        aria-hidden
                        className="shrink-0 text-[var(--gold)] transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
                      >
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--ink)] px-6 py-20 sm:py-28">
          <Reveal className="mx-auto max-w-xl">
            <div className="rounded-sm border border-[color-mix(in_srgb,var(--gold)_40%,transparent)] px-8 py-14 text-center">
              <h2 className="font-display text-3xl font-light text-[var(--porcelain)] sm:text-4xl">
                {t("heroHeading")}
              </h2>
              <FoilRule className="mx-auto mt-5" />
              <Link
                href="/register"
                className="mt-8 inline-block rounded-full bg-[var(--gold)] px-7 py-3 text-sm font-semibold text-[var(--ink)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#C6A05E] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
              >
                {instantPreviewT("ctaCreate")}
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
