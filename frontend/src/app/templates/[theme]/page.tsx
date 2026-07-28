import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { InvitationHero, THEME_STYLES } from "@/components/InvitationHero";
import { RsvpForm } from "@/components/RsvpForm";
import type { ThemeKey } from "@/types/template";

interface SampleEvent {
  name: string;
  eventTypeLabel: string;
  description: string;
  address: string;
}

const SAMPLE_EVENTS: Record<ThemeKey, SampleEvent> = {
  elegant: {
    name: "Isabella & Marco",
    eventTypeLabel: "Wedding",
    description:
      "Two families, one celebration. Join us for an evening of vows, dancing, and everything in between.",
    address: "The Grand Pavilion, Lisbon",
  },
  minimalist: {
    name: "Maya's Graduation",
    eventTypeLabel: "Graduation",
    description: "Four years, countless late nights, and one very big day. Come celebrate with us.",
    address: "University Hall, Austin",
  },
  floral: {
    name: "Welcome, Baby Rose",
    eventTypeLabel: "Baby Shower",
    description: "A little one is on the way. Join us for an afternoon of tea, games, and good wishes.",
    address: "The Garden Room, Portland",
  },
  modern: {
    name: "Alex's 30th Birthday",
    eventTypeLabel: "Birthday",
    description: "Thirty years in the making. Music, drinks, and a night to remember.",
    address: "Skyline Loft, Chicago",
  },
};

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function mapsLinks(address: string) {
  const query = encodeURIComponent(address);
  return {
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${query}`,
    waze: `https://waze.com/ul?q=${query}&navigate=yes`,
  };
}

// Without this, Next could statically pre-render this route at build time, freezing the
// "45 days from now" countdown target to whatever it computed at deploy time.
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ theme: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { theme } = await params;
  const sample = SAMPLE_EVENTS[theme as ThemeKey];
  if (!sample) {
    return { title: "Template not found" };
  }
  return { title: `${sample.name} — Preview` };
}

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { theme: themeParam } = await params;
  const sample = SAMPLE_EVENTS[themeParam as ThemeKey];

  if (!sample) {
    notFound();
  }

  const theme = THEME_STYLES[themeParam as ThemeKey];
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
        Preview &middot; back to templates
      </Link>

      <InvitationHero
        name={sample.name}
        eventTypeLabel={sample.eventTypeLabel}
        formattedDate={formatEventDate(targetDate)}
        coverImageUrl={null}
        theme={theme}
      >
        <Countdown targetDate={targetDate} accentColor={theme.accent} textColor={theme.body} />
      </InvitationHero>

      <section className="px-6 py-16" style={{ backgroundColor: theme.sectionBg }}>
        <div className="mx-auto max-w-xl text-center">
          <h2
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: theme.accent }}
          >
            Our Story
          </h2>
          <p className="whitespace-pre-line text-base leading-relaxed" style={{ color: theme.body }}>
            {sample.description}
          </p>
        </div>
      </section>

      <section className="px-6 py-16 text-center" style={{ backgroundColor: theme.pageBg }}>
        <h2
          className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
          style={{ color: theme.accent }}
        >
          Location
        </h2>
        <p className="mb-6 text-base" style={{ color: theme.body }}>
          {sample.address}
        </p>
        <div className="flex items-center justify-center gap-4">
          <a
            href={links.googleMaps}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border px-5 py-2 text-sm font-medium"
            style={{ borderColor: theme.accent, color: theme.heading }}
          >
            Open in Google Maps
          </a>
          <a
            href={links.waze}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border px-5 py-2 text-sm font-medium"
            style={{ borderColor: theme.accent, color: theme.heading }}
          >
            Open in Waze
          </a>
        </div>
      </section>

      <section className="px-6 py-16" style={{ backgroundColor: theme.sectionBg }}>
        <h2
          className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em]"
          style={{ color: theme.accent }}
        >
          RSVP
        </h2>
        <RsvpForm slug={themeParam} theme={theme} demoMode />
      </section>
    </div>
  );
}
