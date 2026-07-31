import type { PublicEventRecord } from "@/types/publicEvent";
import type { GuestPrefill } from "@/types/rsvp";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:5001";

export const publicEventsApi = {
  get: async (slug: string): Promise<PublicEventRecord | null> => {
    const response = await fetch(`${API_BASE_URL}/api/public/events/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to load event: ${response.status}`);
    }
    return (await response.json()) as PublicEventRecord;
  },

  // Prefill for a guest who opened their personal link (?g={token}). Returns null for an unknown
  // token so the page can quietly fall back to the open form.
  getGuestPrefill: async (slug: string, token: string): Promise<GuestPrefill | null> => {
    const response = await fetch(
      `${API_BASE_URL}/api/public/events/${encodeURIComponent(slug)}/guest/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to load guest: ${response.status}`);
    }
    return (await response.json()) as GuestPrefill;
  },
};
