export type RsvpStatus = "Confirmed" | "Declined";

// Same pattern as getEventTypeLabels in types/event.ts — needs a translator instance from the caller.
export function getRsvpStatusLabels(t: (key: RsvpStatus) => string): Record<RsvpStatus, string> {
  return {
    Confirmed: t("Confirmed"),
    Declined: t("Declined"),
  };
}

export interface CreateRsvpRequest {
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  status: RsvpStatus;
  honeypotField: string | null;
}

export interface RsvpRecord {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  status: RsvpStatus;
  createdAtUtc: string;
}

export interface AttendanceSummary {
  total: number;
  confirmed: number;
  declined: number;
}

export interface AttendanceResponse {
  summary: AttendanceSummary;
  responses: RsvpRecord[];
}
