import type { EventType } from "@/types/event";

// Sprint 17: the pSEO category pages (/criar-convite/[categoria]) map 1:1 to EventType. GenderReveal
// is deliberately excluded — SHOWCASE_ENTRIES has zero entries for it and there's no matching photo
// asset in public/showcase/, so shipping that page would mean a page with a weak/placeholder
// showcase. Fast-follow once a real entry + asset exist.
export const CATEGORY_SLUGS: Partial<Record<EventType, string>> = {
  Wedding: "casamento",
  Birthday: "aniversario",
  Graduation: "formatura",
  FifteenYearsParty: "debutantes",
  BabyShower: "cha-de-bebe",
};

export const SLUG_TO_EVENT_TYPE: Record<string, EventType> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([type, slug]) => [slug, type as EventType]),
);

export const CATEGORY_ORDER: EventType[] = Object.keys(CATEGORY_SLUGS) as EventType[];
