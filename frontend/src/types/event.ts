export type EventType =
  | "Wedding"
  | "Birthday"
  | "Graduation"
  | "FifteenYearsParty"
  | "BabyShower"
  | "GenderReveal";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  Wedding: "Wedding",
  Birthday: "Birthday",
  Graduation: "Graduation",
  FifteenYearsParty: "15th Birthday",
  BabyShower: "Baby Shower",
  GenderReveal: "Gender Reveal",
};

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

export interface EventRecord {
  id: string;
  name: string;
  slug: string;
  eventType: EventType;
  eventDate: string;
  description: string | null;
  address: string | null;
  coverImageUrl: string | null;
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
  templateId: string | null;
}

export type UpdateEventRequest = CreateEventRequest;
