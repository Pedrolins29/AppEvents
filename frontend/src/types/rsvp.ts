export type RsvpStatus = "Pending" | "Confirmed" | "Declined";

// Same pattern as getEventTypeLabels in types/event.ts — needs a translator instance from the caller.
export function getRsvpStatusLabels(t: (key: RsvpStatus) => string): Record<RsvpStatus, string> {
  return {
    Pending: t("Pending"),
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
  // Present when the guest opened their personal link (/e/{slug}?g={token}); the submission then
  // updates that pre-existing pending guest instead of creating a new one.
  inviteToken?: string | null;
  // The page's current UI language (en/pt/es) at submission time — picks the guest confirmation
  // email's language, same pattern as RegisterRequest.locale.
  locale?: string;
}

// Public prefill for a guest opening their own personal link.
export interface GuestPrefill {
  guestName: string;
  guestEmail: string | null;
  guestPhone: string | null;
  status: RsvpStatus;
  hasResponded: boolean;
}
