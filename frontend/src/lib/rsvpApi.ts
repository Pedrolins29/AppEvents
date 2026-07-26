import { apiClient } from "@/lib/apiClient";
import type { AttendanceResponse, CreateRsvpRequest, RsvpRecord } from "@/types/rsvp";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://localhost:5001";

export const rsvpApi = {
  // Public, unauthenticated submission - standalone fetch like publicEventsApi, not apiClient
  // (no bearer token/silent-refresh applies to a guest submitting an RSVP).
  submit: async (slug: string, request: CreateRsvpRequest): Promise<RsvpRecord> => {
    const response = await fetch(`${API_BASE_URL}/api/public/events/${encodeURIComponent(slug)}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const problem = await response.json().catch(() => null);
      throw new Error(problem?.detail ?? problem?.title ?? `RSVP failed: ${response.status}`);
    }
    return (await response.json()) as RsvpRecord;
  },
  getAttendance: (eventId: string) => apiClient.get<AttendanceResponse>(`/api/events/${eventId}/rsvps`),
};
