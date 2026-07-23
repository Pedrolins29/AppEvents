"use client";

import { useEffect, useState } from "react";
import { ApiError } from "@/lib/auth-context";
import { templatesApi } from "@/lib/templatesApi";
import { TemplateCard } from "@/components/TemplateCard";
import { EVENT_TYPE_LABELS, EVENT_TYPES, type CreateEventRequest, type EventType } from "@/types/event";
import type { TemplateRecord } from "@/types/template";

export interface EventFormValues {
  name: string;
  slug: string;
  eventType: EventType;
  eventDate: string;
  description: string;
  address: string;
  templateId: string | null;
}

const EMPTY_VALUES: EventFormValues = {
  name: "",
  slug: "",
  eventType: "Wedding",
  eventDate: "",
  description: "",
  address: "",
  templateId: null,
};

interface EventFormProps {
  initialValues?: EventFormValues;
  onSubmit: (request: CreateEventRequest) => Promise<void>;
  submitLabel: string;
}

export function EventForm({ initialValues, onSubmit, submitLabel }: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>(initialValues ?? EMPTY_VALUES);
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    templatesApi.list().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  function update<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: values.name,
        slug: values.slug,
        eventType: values.eventType,
        eventDate: new Date(values.eventDate).toISOString(),
        description: values.description || null,
        address: values.address || null,
        templateId: values.templateId,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.problem?.errors
          ? Object.values(err.problem.errors).flat().join(" ")
          : null;
        setError(fieldErrors || err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
          Event name
        </label>
        <input
          id="name"
          type="text"
          required
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full border border-[#E2DFD3] px-3 py-2 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
        />
      </div>
      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
          URL slug
        </label>
        <input
          id="slug"
          type="text"
          required
          placeholder="john-and-mary"
          value={values.slug}
          onChange={(e) => update("slug", e.target.value.toLowerCase())}
          className="w-full border border-[#E2DFD3] px-3 py-2 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
        />
        <p className="mt-1 text-xs text-[#5B6B67] dark:text-[#9CA9A5]">Lowercase letters, numbers, and hyphens only.</p>
      </div>
      <div>
        <label htmlFor="eventType" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
          Event type
        </label>
        <select
          id="eventType"
          value={values.eventType}
          onChange={(e) => update("eventType", e.target.value as EventType)}
          className="w-full border border-[#E2DFD3] px-3 py-2 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {EVENT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="eventDate" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
          Event date
        </label>
        <input
          id="eventDate"
          type="date"
          required
          value={values.eventDate}
          onChange={(e) => update("eventDate", e.target.value)}
          className="w-full border border-[#E2DFD3] px-3 py-2 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full border border-[#E2DFD3] px-3 py-2 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
        />
      </div>
      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
          Address (optional)
        </label>
        <input
          id="address"
          type="text"
          value={values.address}
          onChange={(e) => update("address", e.target.value)}
          className="w-full border border-[#E2DFD3] px-3 py-2 dark:border-[#2A3532] dark:bg-[#1B2422] dark:text-[#F3F1EA]"
        />
      </div>
      {templates.length > 0 && (
        <div>
          <span className="mb-1 block text-sm font-medium text-[#14211D] dark:text-[#F3F1EA]">
            Template (optional)
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => update("templateId", null)}
              className={`flex aspect-[3/4] items-center justify-center border-2 text-xs text-[#5B6B67] dark:text-[#9CA9A5] ${
                values.templateId === null ? "border-[#0F766E] dark:border-[#14B8A6]" : "border-transparent bg-[#F2EFE7] dark:bg-[#1B2422]"
              }`}
            >
              None
            </button>
            {templates.map((template) => (
              <button
                type="button"
                key={template.id}
                onClick={() => update("templateId", template.id)}
                className={`overflow-hidden border-2 ${
                  values.templateId === template.id ? "border-[#0F766E] dark:border-[#14B8A6]" : "border-transparent"
                }`}
              >
                <TemplateCard theme={template.theme} name={template.name} />
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-full bg-[#0F766E] px-5 py-2 font-medium text-white hover:bg-[#0C5C56] disabled:opacity-50 dark:bg-[#14B8A6] dark:text-[#062420] dark:hover:bg-[#2DD4BF]"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
