"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { eventsApi } from "@/lib/eventsApi";
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
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-12 dark:bg-black">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Your events</h1>
          <Link
            href="/events/new"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          >
            New event
          </Link>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {isLoading ? (
          <p className="text-zinc-500">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-zinc-500">
            You haven&apos;t created any events yet.{" "}
            <Link href="/events/new" className="font-medium underline">
              Create your first one
            </Link>
            .
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-50">
                    {event.name}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        event.isPublished
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {event.isPublished ? "Published" : "Draft"}
                    </span>
                  </p>
                  <p className="text-sm text-zinc-500">
                    {EVENT_TYPE_LABELS[event.eventType]} &middot;{" "}
                    {new Date(event.eventDate).toLocaleDateString()} &middot; /{event.slug}
                  </p>
                </div>
                <div className="flex gap-3 text-sm">
                  <Link href={`/events/${event.id}/edit`} className="font-medium underline">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="font-medium text-red-600 underline disabled:opacity-50"
                  >
                    {deletingId === event.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link href="/dashboard" className="mt-8 inline-block text-sm text-zinc-500 underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
