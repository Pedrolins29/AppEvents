export type EventType =
  | "Wedding"
  | "Birthday"
  | "Graduation"
  | "FifteenYearsParty"
  | "BabyShower"
  | "GenderReveal";

// EVENT_TYPE_LABELS can't be a static export once labels are translated — it needs a translator
// instance, which only exists inside a component render. Callers do
// `getEventTypeLabels(useTranslations("eventTypes"))` (client) or
// `getEventTypeLabels(await getTranslations("eventTypes"))` (server).
export function getEventTypeLabels(t: (key: EventType) => string): Record<EventType, string> {
  return {
    Wedding: t("Wedding"),
    Birthday: t("Birthday"),
    Graduation: t("Graduation"),
    FifteenYearsParty: t("FifteenYearsParty"),
    BabyShower: t("BabyShower"),
    GenderReveal: t("GenderReveal"),
  };
}

export const EVENT_TYPES: EventType[] = [
  "Wedding",
  "Birthday",
  "Graduation",
  "FifteenYearsParty",
  "BabyShower",
  "GenderReveal",
];

export interface EventImageRecord {
  id: string;
  imageUrl: string;
}

export interface TimelineItemRecord {
  time: string;
  label: string;
}

export interface EventRecord {
  id: string;
  name: string;
  slug: string;
  eventType: EventType;
  eventDate: string;
  description: string | null;
  address: string | null;
  dressCode: string | null;
  timelineItems: TimelineItemRecord[];
  coverImageUrl: string | null;
  featuredPhotoUrl: string | null;
  isPublished: boolean;
  galleryImages: EventImageRecord[];
  userId: string;
  templateId: string | null;
  createdAtUtc: string;
  updatedAtUtc: string;
}

export interface CreateEventRequest {
  name: string;
  slug: string;
  eventType: EventType;
  eventDate: string;
  description: string | null;
  address: string | null;
  dressCode: string | null;
  timelineItems: TimelineItemRecord[];
  templateId: string | null;
}

export type UpdateEventRequest = CreateEventRequest;
