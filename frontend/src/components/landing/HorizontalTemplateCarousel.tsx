"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Reveal } from "@/components/Reveal";
import { TemplateCard } from "@/components/TemplateCard";
import { TEMPLATE_THEMES } from "@/lib/templateThemes";

const SCROLL_DISTANCE_PX = 400;

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
      <path
        d={direction === "left" ? "M11 3L5 9L11 15" : "M7 3L13 9L7 15"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// A horizontally-scrolling strip of template cards (5–6 visible at once on desktop), with
// snap-to-card scrolling and left/right nav arrows. Used in place of the static theme grid on
// the landing page's "Choose your style" section.
export function HorizontalTemplateCarousel() {
  const t = useTranslations("landing.templates");
  const themeNameT = useTranslations("templateThemeNames");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section id="templates" className="bg-[var(--muted)] px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--pinewood)]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
        </Reveal>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollByAmount(-SCROLL_DISTANCE_PX)}
            aria-label="Previous templates"
            className="absolute left-0 top-1/2 z-10 hidden -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-white/90 p-2.5 text-[var(--ink)] shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)] backdrop-blur-sm transition-all duration-200 ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-105 hover:bg-white sm:flex"
          >
            <ArrowIcon direction="left" />
          </button>

          <div
            ref={scrollRef}
            className="photo-strip flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
          >
            {TEMPLATE_THEMES.map((theme, i) => (
              <Reveal
                key={theme}
                delay={i * 0.06}
                className="w-[42vw] shrink-0 snap-start sm:w-[170px] lg:w-[190px]"
              >
                <Link
                  href={`/templates/${theme}`}
                  className="group block h-full overflow-hidden rounded-sm border border-[var(--border)] transition-all duration-300 ease-[var(--ease-premium)] motion-reduce:transition-none hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_22px_44px_-20px_rgba(22,19,14,0.4)]"
                >
                  <TemplateCard
                    theme={theme}
                    name={themeNameT(theme)}
                    showPeelback={["elegant", "floral", "candlelight"].includes(theme)}
                  />
                  <div className="border-t border-[var(--border)] bg-white px-3 py-2.5 text-center">
                    <span className="font-display text-base text-[var(--ink)]">
                      {themeNameT(theme)}
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollByAmount(SCROLL_DISTANCE_PX)}
            aria-label="Next templates"
            className="absolute right-0 top-1/2 z-10 hidden translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-white/90 p-2.5 text-[var(--ink)] shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)] backdrop-blur-sm transition-all duration-200 ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-105 hover:bg-white sm:flex"
          >
            <ArrowIcon direction="right" />
          </button>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/templates"
            className="text-sm font-medium text-[var(--pinewood)] underline-offset-4 hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
