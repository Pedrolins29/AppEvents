import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Countdown } from "@/components/Countdown";
import { THEME_STYLES } from "@/components/InvitationHero";
import { InvitationHero } from "@/components/InvitationHeroContent";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { RsvpForm } from "@/components/RsvpForm";
import { mapsLinks } from "@/lib/mapsLinks";
import { getEventTypeLabels, type EventType } from "@/types/event";
import type { ThemeKey } from "@/types/template";

interface SampleTimelineItem {
  time: string;
  label: string;
}

interface SampleEvent {
  name: string;
  eventType: EventType;
  description: string;
  address: string;
  dressCode: string;
  timelineItems: SampleTimelineItem[];
  coverImageUrl: string | null;
}

const SAMPLE_NAMES: Record<ThemeKey, string> = {
  elegant: "Isabella & Marco",
  minimalist: "Maya's Graduation",
  floral: "Welcome, Baby Rose",
  modern: "Alex's 30th Birthday",
  romantic: "Sofia & Rafael",
  garden: "Baby Aria's Reveal",
};

const SAMPLE_EVENT_TYPES: Record<ThemeKey, EventType> = {
  elegant: "Wedding",
  minimalist: "Graduation",
  floral: "BabyShower",
  modern: "Birthday",
  romantic: "Wedding",
  garden: "GenderReveal",
};

const SAMPLE_ADDRESSES: Record<ThemeKey, string> = {
  elegant: "The Grand Pavilion, Lisbon",
  minimalist: "University Hall, Austin",
  floral: "The Garden Room, Portland",
  modern: "Skyline Loft, Chicago",
  romantic: "Quinta das Oliveiras, Sintra",
  garden: "Botanical Garden, Curitiba",
};

const SAMPLE_COVER_IMAGES: Record<ThemeKey, string | null> = {
  elegant: "/showcase/wedding-rose.jpg",
  minimalist: "/showcase/graduation.jpg",
  floral: "/showcase/babyshower-farm.jpg",
  modern: null,
  romantic: null,
  garden: null,
};

function formatEventDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Without this, Next could statically pre-render this route at build time, freezing the
// "45 days from now" countdown target to whatever it computed at deploy time.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ theme: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { theme } = await params;
  const name = SAMPLE_NAMES[theme as ThemeKey];
  const t = await getTranslations("templates.themePreview");
  if (!name) {
    return { title: t("notFoundTitle") };
  }
  return { title: `${name}${t("metadataSuffix")}` };
}

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { theme: themeParam } = await params;
  const name = SAMPLE_NAMES[themeParam as ThemeKey];

  if (!name) {
    notFound();
  }

  const locale = await getLocale();
  const t = await getTranslations("templates.themePreview");
  const invitationT = await getTranslations("invitation");
  const eventTypeLabels = getEventTypeLabels(await getTranslations("eventTypes"));

  const sampleKey = themeParam as ThemeKey;
  const sample: SampleEvent = {
    name,
    eventType: SAMPLE_EVENT_TYPES[sampleKey],
    description: t(`samples.${sampleKey}.description`),
    address: SAMPLE_ADDRESSES[sampleKey],
    dressCode: t(`samples.${sampleKey}.dressCode`),
    timelineItems: t.raw(`samples.${sampleKey}.timeline`) as SampleTimelineItem[],
    coverImageUrl: SAMPLE_COVER_IMAGES[sampleKey],
  };

  const theme = THEME_STYLES[sampleKey];
  // 45 days out from whenever this is rendered, so the countdown is never stale — intentionally
  // impure (see `dynamic = "force-dynamic"` above, which is what makes that safe here).
  // eslint-disable-next-line react-hooks/purity
  const targetDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString();
  const links = mapsLinks(sample.address);

  return (
    <div style={{ backgroundColor: theme.pageBg }}>
      <Link
        href="/templates"
        className="fixed left-4 top-4 z-10 rounded-full bg-[#0F766E] px-4 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-sm"
      >
        {t("badge")}
      </Link>
      <div className="fixed right-4 top-4 z-10">
        <LanguageSwitcher />
      </div>

      <InvitationHero
        name={sample.name}
        eventTypeLabel={eventTypeLabels[sample.eventType]}
        formattedDate={formatEventDate(targetDate, locale)}
        coverImageUrl={sample.coverImageUrl}
        theme={theme}
        themeKey={sampleKey}
      >
        <Countdown targetDate={targetDate} accentColor={theme.accent} textColor={theme.body} />
      </InvitationHero>

      <section className="px-6 py-16" style={{ backgroundColor: theme.sectionBg }}>
        <div className="mx-auto max-w-xl text-center">
          <h2
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: theme.accent }}
          >
            {invitationT("ourStory")}
          </h2>
          <p className="whitespace-pre-line text-base leading-relaxed" style={{ color: theme.body }}>
            {sample.description}
          </p>
        </div>
      </section>

      <section className="px-6 py-16" style={{ backgroundColor: theme.pageBg }}>
        <div className="mx-auto max-w-md">
          <h2
            className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: theme.accent }}
          >
            {invitationT("timeline")}
          </h2>
          <ul>
            {sample.timelineItems.map((item, index) => (
              <li
                key={index}
                className={`flex items-baseline gap-4 py-3 ${index > 0 ? "border-t" : ""}`}
                style={index > 0 ? { borderColor: theme.accent + "33" } : undefined}
              >
                <span className="text-sm font-semibold tabular-nums" style={{ color: theme.accent }}>
                  {item.time}
                </span>
                <span className="text-sm" style={{ color: theme.body }}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-6 py-16 text-center" style={{ backgroundColor: theme.pageBg }}>
        <h2
          className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
          style={{ color: theme.accent }}
        >
          {invitationT("location")}
        </h2>
        <p className="mb-2 text-base" style={{ color: theme.body }}>
          {sample.address}
        </p>
        <p className="mb-6 text-sm" style={{ color: theme.body }}>
          {invitationT("dressCodePrefix")}{sample.dressCode}
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href={links.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border px-5 py-2 text-sm font-medium"
            style={{ borderColor: theme.accent, color: theme.heading }}
          >
            {invitationT("openGoogleMaps")}
          </a>
          <a
            href={links.waze}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border px-5 py-2 text-sm font-medium"
            style={{ borderColor: theme.accent, color: theme.heading }}
          >
            {invitationT("openWaze")}
          </a>
        </div>
      </section>

      <section className="px-6 py-16" style={{ backgroundColor: theme.sectionBg }}>
        <h2
          className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em]"
          style={{ color: theme.accent }}
        >
          {invitationT("rsvp.heading")}
        </h2>
        <RsvpForm slug={themeParam} theme={theme} demoMode />
      </section>
    </div>
  );
}
