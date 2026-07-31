import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/Reveal";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CATEGORY_ORDER, CATEGORY_SLUGS } from "@/lib/inviteCategories";
import { getEventTypeLabels } from "@/types/event";

function FoilRule({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block h-px w-14 bg-[var(--gold)] ${className}`} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("criarConvite.hub");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/criar-convite" },
  };
}

export default async function CreateInvitationHubPage() {
  const t = await getTranslations("criarConvite.hub");
  const eventTypeLabels = getEventTypeLabels(await getTranslations("eventTypes"));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: t("breadcrumbHome"), item: "/" }],
  };

  return (
    <div className="flex flex-1 flex-col bg-[var(--porcelain)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-[var(--ink)] px-6 py-16 sm:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--gold)]">{t("eyebrow")}</p>
            <FoilRule className="mx-auto mt-5" />
            <h1 className="mt-6 text-balance font-display text-4xl font-light leading-[1.1] tracking-tight text-[var(--porcelain)] sm:text-5xl">
              {t("heading")}
            </h1>
            <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-[#D9CFBD]">{t("subtitle")}</p>
          </Reveal>
        </section>

        <section className="px-6 py-16 sm:py-24">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3">
            {CATEGORY_ORDER.map((type, i) => {
              const slug = CATEGORY_SLUGS[type]!;
              return (
                <Reveal key={type} delay={i * 0.06}>
                  <Link
                    href={`/criar-convite/${slug}`}
                    className="group flex h-full flex-col items-center justify-center gap-2 rounded-sm border border-[var(--border)] bg-white/70 px-4 py-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-20px_rgba(22,19,14,0.4)]"
                  >
                    <span className="font-display text-xl text-[var(--ink)]">{eventTypeLabels[type]}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--pinewood)]">
                      {t("cardCta")}
                      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
            <Reveal delay={CATEGORY_ORDER.length * 0.06}>
              <Link
                href="/templates"
                className="group flex h-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-[var(--gold)] bg-white/40 px-4 py-10 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_44px_-20px_rgba(22,19,14,0.4)]"
              >
                <span className="font-display text-xl text-[var(--ink)]">{t("otherEventsTitle")}</span>
                <span className="inline-flex items-center gap-1 text-xs text-[var(--pinewood)]">
                  {t("otherEventsSubtitle")}
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
