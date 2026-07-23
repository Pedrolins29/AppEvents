import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { DEFAULT_THEME_STYLE, InvitationHero, THEME_STYLES } from "@/components/InvitationHero";
import { publicEventsApi } from "@/lib/publicEventsApi";
import { EVENT_TYPE_LABELS } from "@/types/event";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:5001";

function absoluteImageUrl(path: string) {
  return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await publicEventsApi.get(slug);
  return { title: event ? event.name : "Invitation not found" };
}

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

export default async function PublicEventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await publicEventsApi.get(slug);

  if (!event) {
    notFound();
  }

  const theme = event.themeKey ? THEME_STYLES[event.themeKey] : DEFAULT_THEME_STYLE;
  const links = event.address ? mapsLinks(event.address) : null;

  return (
    <div style={{ backgroundColor: theme.pageBg }}>
      <InvitationHero
        name={event.name}
        eventTypeLabel={EVENT_TYPE_LABELS[event.eventType]}
        formattedDate={formatEventDate(event.eventDate)}
        coverImageUrl={event.coverImageUrl ? absoluteImageUrl(event.coverImageUrl) : null}
        theme={theme}
      >
        <Countdown targetDate={event.eventDate} accentColor={theme.accent} textColor={theme.body} />
      </InvitationHero>

      {event.description && (
        <section className="px-6 py-16" style={{ backgroundColor: theme.sectionBg }}>
          <div className="mx-auto max-w-xl text-center">
            <h2
              className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: theme.accent }}
            >
              Our Story
            </h2>
            <p className="whitespace-pre-line text-base leading-relaxed" style={{ color: theme.body }}>
              {event.description}
            </p>
          </div>
        </section>
      )}

      {event.galleryImageUrls.length > 0 && (
        <section className="px-6 py-16" style={{ backgroundColor: theme.pageBg }}>
          <div className="mx-auto max-w-3xl">
            <h2
              className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: theme.accent }}
            >
              Gallery
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {event.galleryImageUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={absoluteImageUrl(url)}
                  alt=""
                  loading="lazy"
                  className="aspect-square w-full rounded-md object-cover"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {event.address && links && (
        <section className="px-6 py-16 text-center" style={{ backgroundColor: theme.sectionBg }}>
          <h2
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: theme.accent }}
          >
            Location
          </h2>
          <p className="mb-6 text-base" style={{ color: theme.body }}>
            {event.address}
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
      )}
    </div>
  );
}
