"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ApiError } from "@/lib/auth-context";
import { slugify } from "@/lib/slugify";
import { templatesApi } from "@/lib/templatesApi";
import { TemplateCard } from "@/components/TemplateCard";
import { TimelineItemsEditor } from "@/components/TimelineItemsEditor";
import {
  getEventTypeLabels,
  EVENT_TYPES,
  type CreateEventRequest,
  type EventType,
  type TimelineItemRecord,
} from "@/types/event";
import type { TemplateRecord } from "@/types/template";

export interface EventFormValues {
  name: string;
  slug: string;
  eventType: EventType;
  eventDate: string;
  description: string;
  address: string;
  dressCode: string;
  timelineItems: TimelineItemRecord[];
  templateId: string | null;
}

// Mirrors the backend's CreateEventRequestValidator regex exactly — surfaced here as inline
// feedback instead of only after a round-trip to the API.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_VALUES: EventFormValues = {
  name: "",
  slug: "",
  eventType: "Wedding",
  eventDate: "",
  description: "",
  address: "",
  dressCode: "",
  timelineItems: [],
  templateId: null,
};

interface EventFormProps {
  initialValues?: EventFormValues;
  onSubmit: (request: CreateEventRequest) => Promise<void>;
  submitLabel: string;
}

export function EventForm({ initialValues, onSubmit, submitLabel }: EventFormProps) {
  const t = useTranslations("events.form");
  const eventTypeLabels = getEventTypeLabels(useTranslations("eventTypes"));
  const [values, setValues] = useState<EventFormValues>(initialValues ?? EMPTY_VALUES);
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Once the user has ever had a real slug (editing an existing event) or has typed in the slug
  // field directly, stop auto-syncing it from the name — never clobber something already live or
  // deliberately customized.
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    templatesApi.list().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  function update<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(name: string) {
    setValues((prev) => ({ ...prev, name, slug: slugTouched ? prev.slug : slugify(name) }));
  }

  function handleSlugChange(rawSlug: string) {
    setSlugTouched(true);
    setSlugError(null);
    update("slug", rawSlug.toLowerCase());
  }

  function handleSlugBlur() {
    if (values.slug && !SLUG_PATTERN.test(values.slug)) {
      setSlugError(t("slugInvalid"));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!SLUG_PATTERN.test(values.slug)) {
      setSlugError(t("slugInvalid"));
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: values.name,
        slug: values.slug,
        eventType: values.eventType,
        eventDate: new Date(values.eventDate).toISOString(),
        description: values.description || null,
        address: values.address || null,
        dressCode: values.dressCode || null,
        timelineItems: values.timelineItems,
        templateId: values.templateId,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors = err.problem?.errors
          ? Object.values(err.problem.errors).flat().join(" ")
          : null;
        setError(fieldErrors || err.message);
      } else {
        setError(t("genericError"));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-[#14211D]">
          {t("eventName")}
        </label>
        <input
          id="name"
          type="text"
          required
          value={values.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full border border-[#E2DFD3] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-[#14211D]">
          {t("urlSlug")}
        </label>
        <input
          id="slug"
          type="text"
          required
          placeholder={t("slugPlaceholder")}
          value={values.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          onBlur={handleSlugBlur}
          aria-invalid={slugError ? true : undefined}
          className="w-full border border-[#E2DFD3] px-3 py-2"
        />
        {slugError ? (
          <p className="mt-1 text-xs text-red-600">{slugError}</p>
        ) : (
          <p className="mt-1 text-xs text-[#5B6B67]">{t("slugHint")}</p>
        )}
      </div>
      <div>
        <label htmlFor="eventType" className="mb-1 block text-sm font-medium text-[#14211D]">
          {t("eventType")}
        </label>
        <select
          id="eventType"
          value={values.eventType}
          onChange={(e) => update("eventType", e.target.value as EventType)}
          className="w-full border border-[#E2DFD3] px-3 py-2"
        >
          {EVENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {eventTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="eventDate" className="mb-1 block text-sm font-medium text-[#14211D]">
          {t("eventDate")}
        </label>
        <input
          id="eventDate"
          type="date"
          required
          min={todayIsoDate()}
          value={values.eventDate}
          onChange={(e) => update("eventDate", e.target.value)}
          className="w-full border border-[#E2DFD3] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-[#14211D]">
          {t("description")}
        </label>
        <textarea
          id="description"
          rows={3}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full border border-[#E2DFD3] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="address" className="mb-1 block text-sm font-medium text-[#14211D]">
          {t("address")}
        </label>
        <input
          id="address"
          type="text"
          value={values.address}
          onChange={(e) => update("address", e.target.value)}
          className="w-full border border-[#E2DFD3] px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="dressCode" className="mb-1 block text-sm font-medium text-[#14211D]">
          {t("dressCode")}
        </label>
        <input
          id="dressCode"
          type="text"
          placeholder={t("dressCodePlaceholder")}
          value={values.dressCode}
          onChange={(e) => update("dressCode", e.target.value)}
          className="w-full border border-[#E2DFD3] px-3 py-2"
        />
      </div>
      <TimelineItemsEditor
        items={values.timelineItems}
        onChange={(timelineItems) => update("timelineItems", timelineItems)}
      />
      {templates.length > 0 && (
        <div>
          <span className="mb-1 block text-sm font-medium text-[#14211D]">
            {t("template")}
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => update("templateId", null)}
              className={`flex aspect-[3/4] items-center justify-center border-2 text-xs text-[#5B6B67] transition-colors duration-150 ${
                values.templateId === null ? "border-[#0F766E]" : "border-transparent bg-[#F2EFE7]"
              }`}
            >
              {t("none")}
            </button>
            {templates.map((template) => (
              <button
                type="button"
                key={template.id}
                onClick={() => update("templateId", template.id)}
                className={`overflow-hidden border-2 transition-colors duration-150 ${
                  values.templateId === template.id ? "border-[#0F766E]" : "border-transparent"
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
        className="mt-2 rounded-full bg-[#0F766E] px-5 py-2 font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56] disabled:opacity-50"
      >
        {isSubmitting ? t("saving") : submitLabel}
      </button>
    </form>
  );
}
