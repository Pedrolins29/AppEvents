import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";

function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none" className="shrink-0">
      <path
        d="M4 4L14 14M14 4L4 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none" className="shrink-0">
      <path
        d="M3.5 9.5L7 13L14.5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Side-by-side before/after comparison: the old, scattered way of planning an event vs.
// the AppEvents way. Left card is red-tinted with ✕ marks, right card is green-tinted with
// ✓ marks — a familiar "problem vs. solution" pattern that reinforces the value prop.
export function ComparisonSection() {
  const t = useTranslations("landing.comparison");
  const before = t.raw("before") as string[];
  const after = t.raw("after") as string[];

  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <Reveal className="mb-12 text-center">
          <h2 className="font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            {t("subtitle")}
          </p>
        </Reveal>

        {/* Before / After Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Before card */}
          <Reveal>
            <div
              className="h-full rounded-sm border p-6 sm:p-8 comparison-card-before"
            >
              <h3 className="mb-5 font-display text-xl text-[var(--ink)]">{t("beforeTitle")}</h3>
              <ul className="flex flex-col gap-4">
                {before.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    <span className="mt-0.5 comparison-card-before-icon">
                      <IconX />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* After card */}
          <Reveal delay={0.08}>
            <div
              className="h-full rounded-sm border p-6 sm:p-8 comparison-card-after"
            >
              <h3 className="mb-5 font-display text-xl text-[var(--ink)]">{t("afterTitle")}</h3>
              <ul className="flex flex-col gap-4">
                {after.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    <span className="mt-0.5 comparison-card-after-icon">
                      <IconCheck />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
