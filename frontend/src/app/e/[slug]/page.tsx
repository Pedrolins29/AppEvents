import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { InvitationBody } from "@/components/InvitationBody";
import { DEFAULT_THEME_STYLE, THEME_STYLES } from "@/components/InvitationHero";
import { absoluteImageUrl } from "@/lib/absoluteImageUrl";
import { formatEventDate } from "@/lib/formatEventDate";
import type { InvitationViewModel } from "@/lib/invitationViewModel";
import { publicEventsApi } from "@/lib/publicEventsApi";
import { getEventTypeLabels } from "@/types/event";

// ISR: the public invitation page is guest-facing and cacheable — a burst of guests opening the
// same link on event day should hit Vercel's edge cache, not the .NET API, on every visit. The
// per-guest personal-link prefill (?g=token) can't be baked into this shared cache, so it's fetched
// client-side instead (see RsvpForm.tsx).
export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ g?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await publicEventsApi.get(slug);

  if (!event) {
    const t = await getTranslations("invitation");
    return { title: t("notFoundTitle") };
  }

  const locale = await getLocale();
  const eventTypeLabels = getEventTypeLabels(await getTranslations("eventTypes"));
  const invitationT = await getTranslations("invitation");
  const description = event.description
    ? event.description.slice(0, 160)
    : invitationT("metadataFallback", {
        type: eventTypeLabels[event.eventType],
        date: new Date(event.eventDate).toLocaleDateString(locale),
      });

  return {
    title: event.name,
    description,
    alternates: { canonical: `/e/${slug}` },
    openGraph: { title: event.name, description, type: "website" },
    twitter: { title: event.name, description },
  };
}

export default async function PublicEventPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { g: inviteToken } = await searchParams;
  const event = await publicEventsApi.get(slug);

  if (!event) {
    notFound();
  }

  const locale = await getLocale();
  const eventTypeLabels = getEventTypeLabels(await getTranslations("eventTypes"));
  const theme = event.themeKey ? THEME_STYLES[event.themeKey] : DEFAULT_THEME_STYLE;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.eventDate,
    ...(event.description ? { description: event.description } : {}),
    ...(event.address
      ? { location: { "@type": "Place", name: event.address, address: event.address } }
      : {}),
    ...(event.coverImageUrl ? { image: [absoluteImageUrl(event.coverImageUrl)] } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
  };

  const viewModel: InvitationViewModel = {
    name: event.name,
    eventTypeLabel: eventTypeLabels[event.eventType],
    formattedDate: formatEventDate(event.eventDate, locale),
    eventDateIso: event.eventDate,
    coverImageUrl: event.coverImageUrl,
    description: event.description,
    timelineItems: event.timelineItems,
    galleryImageUrls: event.galleryImageUrls,
    address: event.address,
    dressCode: event.dressCode,
    featuredPhotoUrl: event.featuredPhotoUrl,
    slug: event.slug,
    themeKey: event.themeKey,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so a literal "</script>" inside user-entered description/address can't
        // prematurely close this tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <InvitationBody event={viewModel} theme={theme} inviteToken={inviteToken} />
    </>
  );
}
