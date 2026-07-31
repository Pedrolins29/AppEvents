"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppHeader } from "@/components/AppHeader";
import { EventForm, type EventFormValues } from "@/components/EventForm";
import { eventsApi } from "@/lib/eventsApi";
import type { CreateEventRequest } from "@/types/event";

function NewEventForm() {
  const t = useTranslations("events.new");
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
        dressCode: "",
        timelineItems: [],
        templateId,
      }
    : undefined;

  async function handleSubmit(request: CreateEventRequest) {
    const event = await eventsApi.create(request);
    router.push(`/events/${event.id}/edit`);
  }

  return <EventForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel={t("createEvent")} />;
}

export default function NewEventPage() {
  const t = useTranslations("events.new");

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7]">
      <AppHeader />
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1
            className="mb-6 font-serif text-2xl text-[#14211D]"
            style={{ fontWeight: 600 }}
          >
            {t("heading")}
          </h1>
          <Suspense fallback={<p className="text-[#5B6B67]">{t("loading")}</p>}>
            <NewEventForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
