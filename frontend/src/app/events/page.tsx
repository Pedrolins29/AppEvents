"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { eventsApi } from "@/lib/eventsApi";
import { Skeleton } from "@/components/Skeleton";
import { EVENT_TYPE_LABELS, type EventRecord } from "@/types/event";

export default function EventsPage() {
  const router = useRouter();
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
      setError("Could not load your events.");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    if (!confirm("Delete this event? This cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      await eventsApi.remove(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch {
      setError("Could not delete the event.");
    } finally {
      setDeletingId(null);
    }
  }

  if (isAuthLoading || !user) {
    return (
      <div className="flex flex-1 flex-col bg-[#FDFBF7] px-6 py-12 dark:bg-[#0F1714]">
        <div className="mx-auto w-full max-w-2xl">
          <Skeleton className="mb-6 h-8 w-40" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7] px-6 py-12 dark:bg-[#0F1714]">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1
            className="font-serif text-2xl text-[#14211D] dark:text-[#F3F1EA]"
            style={{ fontWeight: 600 }}
          >
            Your events
          </h1>
          <Link
            href="/events/new"
            className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56] dark:bg-[#14B8A6] dark:text-[#062420] dark:hover:bg-[#2DD4BF]"
          >
            New event
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
          <p className="text-[#5B6B67] dark:text-[#9CA9A5]">
            You haven&apos;t created any events yet.{" "}
            <Link href="/events/new" className="font-medium text-[#0F766E] underline dark:text-[#14B8A6]">
              Create your first one
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between border border-[#E2DFD3] bg-white px-4 py-3 dark:border-[#2A3532] dark:bg-[#1B2422]"
              >
                <div>
                  <p className="flex items-center gap-2 font-medium text-[#14211D] dark:text-[#F3F1EA]">
                    {event.name}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        event.isPublished
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          : "bg-[#F2EFE7] text-[#5B6B67] dark:bg-[#1B2422] dark:text-[#9CA9A5]"
                      }`}
                    >
                      {event.isPublished ? "Published" : "Draft"}
                    </span>
                  </p>
                  <p className="text-sm text-[#5B6B67] dark:text-[#9CA9A5]">
                    {EVENT_TYPE_LABELS[event.eventType]} &middot;{" "}
                    {new Date(event.eventDate).toLocaleDateString()} &middot; /{event.slug}
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <Link href={`/events/${event.id}/edit`} className="font-medium text-[#0F766E] underline transition-colors duration-150 dark:text-[#14B8A6]">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="font-medium text-red-600 underline transition-colors duration-150 disabled:opacity-50"
                  >
                    {deletingId === event.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/dashboard"
          className="mt-8 inline-block text-sm text-[#5B6B67] underline dark:text-[#9CA9A5]"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
