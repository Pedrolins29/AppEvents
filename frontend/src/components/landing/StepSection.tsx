import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";

interface Step {
  number: number;
  title: string;
  body: string;
}

export function StepSection() {
  const t = useTranslations("landing.steps");

  const steps: Step[] = [
    { number: 1, title: t("step1Title"), body: t("step1Body") },
    { number: 2, title: t("step2Title"), body: t("step2Body") },
    { number: 3, title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <section className="px-6 py-16 sm:py-24 bg-[var(--porcelain)]">
      <div className="mx-auto max-w-4xl">
        {/* Heading */}
        <Reveal className="mb-12 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-[var(--pinewood)]">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-display text-4xl font-light text-[var(--ink)] sm:text-5xl">
            {t("heading")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted-foreground)]">
            {t("description")}
          </p>
        </Reveal>

        {/* 3-Step Cards Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.08}>
              <div className="flex flex-col gap-4">
                {/* Number Badge */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold)] text-[var(--ink)]">
                  <span className="font-semibold text-lg">{step.number}</span>
                </div>
                {/* Title */}
                <h3 className="font-display text-xl font-semibold text-[var(--ink)]">
                  {step.title}
                </h3>
                {/* Body */}
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
