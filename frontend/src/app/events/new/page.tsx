"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { EventForm, type EventFormValues } from "@/components/EventForm";
import { eventsApi } from "@/lib/eventsApi";
import type { CreateEventRequest } from "@/types/event";

function NewEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const initialValues: EventFormValues | undefined = templateId
    ? {
        name: "",
        slug: "",
        eventType: "Wedding",
        eventDate: "",
        description: "",
        address: "",
        templateId,
      }
    : undefined;

  async function handleSubmit(request: CreateEventRequest) {
    await eventsApi.create(request);
    router.push("/events");
  }

  return <EventForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Create event" />;
}

export default function NewEventPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Create an event
        </h1>
        <Suspense fallback={<p className="text-zinc-500">Loading...</p>}>
          <NewEventForm />
        </Suspense>
      </div>
    </div>
  );
}
