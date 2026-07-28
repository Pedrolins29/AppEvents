"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/apiClient";
import { InvitationBody } from "@/components/InvitationBody";
import { DEFAULT_THEME_STYLE, THEME_STYLES, type ThemeStyle } from "@/components/InvitationHero";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/lib/auth-context";
import { eventsApi } from "@/lib/eventsApi";
import { formatEventDate } from "@/lib/formatEventDate";
import type { InvitationViewModel } from "@/lib/invitationViewModel";
import { templatesApi } from "@/lib/templatesApi";
import { EVENT_TYPE_LABELS, type EventRecord } from "@/types/event";
import type { ThemeKey } from "@/types/template";

export default function EventPreviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [event, setEvent] = useState<EventRecord | null>(null);
  const [theme, setTheme] = useState<ThemeStyle>(DEFAULT_THEME_STYLE);
  const [themeKey, setThemeKey] = useState<ThemeKey | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
    }
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    if (!user) {
      return;
    }
    eventsApi
      .get(params.id)
      .then(async (loaded) => {
        setEvent(loaded);
        if (loaded.templateId) {
          try {
            const template = await templatesApi.get(loaded.templateId);
            setTheme(THEME_STYLES[template.theme]);
            setThemeKey(template.theme);
          } catch {
            setTheme(DEFAULT_THEME_STYLE);
            setThemeKey(null);
          }
        }
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFoundState(true);
        } else {
          setError("Could not load this event.");
        }
      });
  }, [user, params.id]);

  if (notFoundState) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#FDFBF7] px-6 text-center">
        <p className="text-[#14211D]">Event not found.</p>
        <Link href="/events" className="text-sm font-medium text-[#0F766E] underline">
          Back to your events
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#FDFBF7] px-6 text-center">
        <p className="text-red-600">{error}</p>
        <Link href="/events" className="text-sm font-medium text-[#0F766E] underline">
          Back to your events
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-[#FDFBF7] px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 w-full max-w-md" />
      </div>
    );
  }

  const viewModel: InvitationViewModel = {
    name: event.name,
    eventTypeLabel: EVENT_TYPE_LABELS[event.eventType],
    formattedDate: formatEventDate(event.eventDate),
    eventDateIso: event.eventDate,
    coverImageUrl: event.coverImageUrl,
    description: event.description,
    timelineItems: event.timelineItems,
    galleryImageUrls: event.galleryImages.map((image) => image.imageUrl),
    address: event.address,
    dressCode: event.dressCode,
    featuredPhotoUrl: event.featuredPhotoUrl,
    slug: event.slug,
    themeKey,
  };

  return (
    <>
      <Link
        href="/events"
        className="fixed left-4 top-4 z-10 rounded-full bg-[#0F766E] px-4 py-1.5 text-xs font-medium text-white shadow-md backdrop-blur-sm"
      >
        {event.isPublished ? "Preview" : "Preview · not published yet"}
      </Link>
      <InvitationBody event={viewModel} theme={theme} demoRsvp />
    </>
  );
}
