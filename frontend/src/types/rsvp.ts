export type RsvpStatus = "Confirmed" | "Declined";

export interface CreateRsvpRequest {
  guestName: string;
  status: RsvpStatus;
  honeypotField: string | null;
}

export interface RsvpRecord {
  id: string;
  guestName: string;
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
