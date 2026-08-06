"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CopyInviteLink } from "@/components/CopyInviteLink";
import { useAuth } from "@/lib/auth-context";
import { eventsApi } from "@/lib/eventsApi";
import { Skeleton } from "@/components/Skeleton";
import { getEventTypeLabels, type EventRecord } from "@/types/event";

export default function EventsPage() {
  const router = useRouter();
  const t = useTranslations("events.list");
  const locale = useLocale();
  const eventTypeLabels = getEventTypeLabels(useTranslations("eventTypes"));
  const { user, isLoading: isAuthLoading } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await eventsApi.list();
      setEvents(data);
    } catch {
      setError(t("loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/login");
      return;
    }
    if (user) {
      // No Suspense/data-fetching library in this MVP — see auth-context.tsx for the same call.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadEvents();
    }
  }, [isAuthLoading, user, router, loadEvents]);

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) {
      return;
    }
    setDeletingId(id);
    try {
      await eventsApi.remove(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError(t("deleteError"));
    } finally {
      setDeletingId(null);
    }
  }

  if (isAuthLoading || !user) {
    return (
      <div className="flex flex-1 flex-col bg-[#FDFBF7]">
        <AppHeader />
        <div className="px-6 py-12">
          <div className="mx-auto w-full max-w-2xl">
            <Skeleton className="mb-6 h-8 w-40" />
            <div className="flex flex-col gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7]">
      <AppHeader />
      <div className="px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1
            className="font-serif text-2xl text-[#14211D]"
            style={{ fontWeight: 600 }}
          >
            {t("heading")}
          </h1>
          <Link
            href="/events/new"
            className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#0C5C56] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
          >
            {t("newEvent")}
          </Link>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-[#5B6B67]">
            {t("emptyState")}{" "}
            <Link href="/events/new" className="font-medium text-[#0F766E] underline">
              {t("createFirstOne")}
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-center justify-between gap-y-2 border border-[#E2DFD3] bg-white px-4 py-3"
              >
                <div>
                  <p className="flex items-center gap-2 font-medium text-[#14211D]">
                    {event.name}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        event.isPublished
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-[#F2EFE7] text-[#5B6B67]"
                      }`}
                    >
                      {event.isPublished ? t("published") : t("draft")}
                    </span>
                  </p>
                  <p className="text-sm text-[#5B6B67]">
                    {eventTypeLabels[event.eventType]} &middot;{" "}
                    {new Date(event.eventDate).toLocaleDateString(locale)} &middot;{" "}
                    {event.isPublished ? (
                      <a
                        href={`/e/${event.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline transition-colors duration-150 hover:text-[#14211D]"
                      >
                        /{event.slug}
                      </a>
                    ) : (
                      <span>/{event.slug}</span>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {event.isPublished && (
                    <CopyInviteLink slug={event.slug} eventName={event.name} variant="compact" />
                  )}
                  <Link
                    href={`/events/${event.id}/preview`}
                    className="font-medium text-[#0F766E] underline transition-colors duration-150"
                  >
                    {t("preview")}
                  </Link>
                  <Link href={`/events/${event.id}/edit`} className="font-medium text-[#0F766E] underline transition-colors duration-150">
                    {t("edit")}
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="font-medium text-red-600 underline transition-colors duration-150 disabled:opacity-50"
                  >
                    {deletingId === event.id ? t("deleting") : t("delete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </div>
  );
}
