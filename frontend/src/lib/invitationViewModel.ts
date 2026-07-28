import type { TimelineItemRecord } from "@/types/event";
import type { ThemeKey } from "@/types/template";

// The normalized shape InvitationBody renders from — both the public fetch (PublicEventRecord)
// and the authenticated fetch (EventRecord) get mapped into this by their own page, since the two
// source shapes differ enough (plain galleryImageUrls vs. galleryImages objects, themeKey vs.
// templateId) that a shared mapper function would just be an if/else with no real reuse.
export interface InvitationViewModel {
  name: string;
  eventTypeLabel: string;
  formattedDate: string;
  eventDateIso: string;
  coverImageUrl: string | null;
  description: string | null;
  timelineItems: TimelineItemRecord[];
  galleryImageUrls: string[];
  address: string | null;
  dressCode: string | null;
  featuredPhotoUrl: string | null;
  slug: string;
  themeKey: ThemeKey | null;
}
