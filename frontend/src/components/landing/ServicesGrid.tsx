import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";

function IconRSVP() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <rect x="2" y="3" width="18" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 8H16M6 12H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 15L16 17L19.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGift() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <rect x="3" y="9" width="16" height="10" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9H19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 9V19" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M11 9C11 9 8 9 7 6.5C6.3 4.8 8 3.5 9.3 4.5C10.6 5.5 11 9 11 9Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M11 9C11 9 14 9 15 6.5C15.7 4.8 14 3.5 12.7 4.5C11.4 5.5 11 9 11 9Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPhotos() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <rect x="4" y="5" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 15L8 11L11 14L15 10L18 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.25" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconMusic() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <circle cx="6" cy="16" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="15" cy="14" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8.5 16V5.5L17.5 3.5V14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTable() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden fill="none">
      <circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="11" cy="2.5" r="1.4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="19.5" cy="11" r="1.4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11" cy="19.5" r="1.4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="2.5" cy="11" r="1.4" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function IconMapPin() {
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

// Order matches the 6 `landing.services.features` entries: RSVP tracking, gift registry,
// shared photo gallery, personalized/musical invitation, live map, and guest table planner.
const FEATURE_ICONS = [IconRSVP, IconGift, IconPhotos, IconMusic, IconMapPin, IconTable] as const;

interface ServiceFeature {
  title: string;
  description: string;
}

export function ServicesGrid() {
  const t = useTranslations("landing.services");
  const features = t.raw("features") as ServiceFeature[];
  const miniStats = t.raw("miniStats") as string[];

  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Heading */}
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

        {/* 2x3 Feature Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = FEATURE_ICONS[i];
            const widths = [85, 72, 90, 78, 88, 81];
            const stat = { width: widths[i], label: miniStats[i] };
            return (
              <Reveal key={feature.title} delay={i * 0.06}>
                <div className="h-full rounded-sm border border-[var(--border)] bg-[var(--porcelain)] p-6 shadow-[0_14px_36px_-26px_rgba(22,19,14,0.4)] transition-all duration-300 ease-[var(--ease-premium)] motion-reduce:transition-none hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_22px_44px_-20px_rgba(22,19,14,0.4)]">
                  <div className="mb-4 text-[var(--gold)]">
                    <Icon />
                  </div>
                  <h3 className="mb-1.5 font-display text-xl text-[var(--ink)]">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{feature.description}</p>
                  <div className="mini-stat">
                    <div className="mini-stat-bar">
                      <span style={{ width: `${stat.width}%` }}></span>
                    </div>
                    <span className="mini-stat-label">{stat.label}</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
