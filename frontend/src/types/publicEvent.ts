import type { EventType } from "@/types/event";
import type { ThemeKey } from "@/types/template";

export interface PublicEventRecord {
  name: string;
  slug: string;
  eventType: EventType;
  eventDate: string;
  description: string | null;
  address: string | null;
  coverImageUrl: string | null;
  galleryImageUrls: string[];
  themeKey: ThemeKey | null;
}
