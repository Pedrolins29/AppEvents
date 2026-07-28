import type { EventType, TimelineItemRecord } from "@/types/event";
import type { ThemeKey } from "@/types/template";

export interface PublicEventRecord {
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
  galleryImageUrls: string[];
  themeKey: ThemeKey | null;
}
