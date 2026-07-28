import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvitationBody } from "@/components/InvitationBody";
import { DEFAULT_THEME_STYLE, THEME_STYLES } from "@/components/InvitationHero";
import { absoluteImageUrl } from "@/lib/absoluteImageUrl";
import { formatEventDate } from "@/lib/formatEventDate";
import type { InvitationViewModel } from "@/lib/invitationViewModel";
import { publicEventsApi } from "@/lib/publicEventsApi";
import { EVENT_TYPE_LABELS } from "@/types/event";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await publicEventsApi.get(slug);

  if (!event) {
    return { title: "Invitation not found" };
  }

  const description = event.description
    ? event.description.slice(0, 160)
    : `You're invited — ${EVENT_TYPE_LABELS[event.eventType]} on ${new Date(event.eventDate).toLocaleDateString()}.`;

  return {
    title: event.name,
    description,
    alternates: { canonical: `/e/${slug}` },
    openGraph: { title: event.name, description, type: "website" },
    twitter: { title: event.name, description },
  };
}

export default async function PublicEventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await publicEventsApi.get(slug);

  if (!event) {
    notFound();
  }

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
    eventTypeLabel: EVENT_TYPE_LABELS[event.eventType],
    formattedDate: formatEventDate(event.eventDate),
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InvitationBody event={viewModel} theme={theme} />
    </>
  );
}
