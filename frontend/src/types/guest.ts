import type { RsvpStatus } from "@/types/rsvp";

// Organizer-facing view of a guest (from authenticated, owner-scoped endpoints). Includes the
// invite token so the dashboard can build each guest's personal link.
export interface GuestRecord {
  id: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  status: RsvpStatus;
  inviteToken: string;
  respondedAtUtc: string | null;
  reminderCount: number;
  lastReminderSentAtUtc: string | null;
  createdAtUtc: string;
}

export interface AttendanceSummary {
  total: number;
  pending: number;
  confirmed: number;
  declined: number;
}

export interface GuestListResponse {
  summary: AttendanceSummary;
  guests: GuestRecord[];
}

export interface AddGuestRequest {
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
}

export interface UpdateGuestRequest {
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  status: RsvpStatus;
}
