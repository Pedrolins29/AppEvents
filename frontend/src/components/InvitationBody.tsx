import { Countdown } from "@/components/Countdown";
import { InvitationHero, ThemeMotif, type ThemeStyle } from "@/components/InvitationHero";
import { RsvpForm } from "@/components/RsvpForm";
import { absoluteImageUrl } from "@/lib/absoluteImageUrl";
import type { InvitationViewModel } from "@/lib/invitationViewModel";

function mapsLinks(address: string) {
  const query = encodeURIComponent(address);
  return {
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${query}`,
    waze: `https://waze.com/ul?q=${query}&navigate=yes`,
  };
}

interface InvitationBodyProps {
  event: InvitationViewModel;
  theme: ThemeStyle;
  /** Skips the real RSVP network call, going straight to the themed success state — used by
   * demo/preview surfaces (template previews, an owner's own event preview) where a real
   * submission would be meaningless or unwanted. */
  demoRsvp?: boolean;
}

// The section stack shared by the real public invitation page (/e/[slug]) and the authenticated
// owner-preview page (/events/[id]/preview) — same order, same conditionals, no consumer wants a
// subset, so this is one component rather than several independently-imported sub-components.
export function InvitationBody({ event, theme, demoRsvp = false }: InvitationBodyProps) {
  const links = event.address ? mapsLinks(event.address) : null;

  return (
    <div style={{ backgroundColor: theme.pageBg }}>
      <InvitationHero
        name={event.name}
        eventTypeLabel={event.eventTypeLabel}
        formattedDate={event.formattedDate}
        coverImageUrl={event.coverImageUrl ? absoluteImageUrl(event.coverImageUrl) : null}
        theme={theme}
      >
        <Countdown targetDate={event.eventDateIso} accentColor={theme.accent} textColor={theme.body} />
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

      {event.timelineItems.length > 0 && (
        <section className="px-6 py-16" style={{ backgroundColor: theme.pageBg }}>
          <div className="mx-auto max-w-md">
            <h2
              className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: theme.accent }}
            >
              Timeline
            </h2>
            <ul>
              {event.timelineItems.map((item, index) => (
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
          <p className={event.dressCode ? "mb-2 text-base" : "mb-6 text-base"} style={{ color: theme.body }}>
            {event.address}
          </p>
          {event.dressCode && (
            <p className="mb-6 text-sm" style={{ color: theme.body }}>
              Dress code: {event.dressCode}
            </p>
          )}
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

      {event.dressCode && !(event.address && links) && (
        <section className="px-6 py-16 text-center" style={{ backgroundColor: theme.sectionBg }}>
          <h2
            className="mb-4 text-xs font-medium uppercase tracking-[0.3em]"
            style={{ color: theme.accent }}
          >
            Dress Code
          </h2>
          <p className="text-base" style={{ color: theme.body }}>
            {event.dressCode}
          </p>
        </section>
      )}

      <section className="px-6 py-16" style={{ backgroundColor: theme.pageBg }}>
        <h2
          className="mb-6 text-center text-xs font-medium uppercase tracking-[0.3em]"
          style={{ color: theme.accent }}
        >
          RSVP
        </h2>
        <RsvpForm slug={event.slug} theme={theme} demoMode={demoRsvp} />
      </section>

      {event.featuredPhotoUrl && (
        <section className="px-6 py-16 text-center" style={{ backgroundColor: theme.sectionBg }}>
          <div className="mx-auto flex max-w-md flex-col items-center gap-4">
            <ThemeMotif theme={event.themeKey ?? "minimalist"} accentColor={theme.accent} />
            <p
              className={theme.fontClassName}
              style={{ color: theme.heading, fontStyle: theme.fontStyle, fontSize: "1.5rem" }}
            >
              We can&apos;t wait to celebrate with you
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={absoluteImageUrl(event.featuredPhotoUrl)}
              alt=""
              className="mt-2 aspect-[4/5] w-full rounded-md object-cover"
            />
          </div>
        </section>
      )}
    </div>
  );
}
