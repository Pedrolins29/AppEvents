import type { PublicEventRecord } from "@/types/publicEvent";

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
};
