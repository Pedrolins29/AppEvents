import type { EventType } from "@/types/event";

// Sprint 14: config-only slots for the checkout links the user creates in the Lastlink
// dashboard themselves — blank by default (no NEXT_PUBLIC_LASTLINK_CHECKOUT_* set), which is
// exactly the state that keeps the upsell hidden (see UpsellBanner) until real links exist.
//
// Known gap: EventType (types/event.ts) has no "Corporate" value today, so nothing maps to
// NEXT_PUBLIC_LASTLINK_CHECKOUT_CORPORATE yet — the slot is reserved, not wired up. Adding a
// real Corporate event type is a separate domain decision, out of this sprint's scope.
function envUrlFor(eventType: EventType): string | undefined {
  switch (eventType) {
    case "Wedding":
      return process.env.NEXT_PUBLIC_LASTLINK_CHECKOUT_WEDDING;
    case "BabyShower":
    case "GenderReveal":
      return process.env.NEXT_PUBLIC_LASTLINK_CHECKOUT_BABY_SHOWER;
    case "Birthday":
    case "Graduation":
    case "FifteenYearsParty":
      return process.env.NEXT_PUBLIC_LASTLINK_CHECKOUT_BIRTHDAY_GRADUATION;
    default:
      return undefined;
  }
}

// Appends our own correlation id so a paid webhook can (best-effort — unverified against real
// Lastlink passthrough behavior) be traced back to the user/event it unlocks. See
// Order.ExternalReference and PaymentWebhookProcessorService.ParseReference on the backend.
export function getCheckoutUrl(eventType: EventType, userId: string, eventId: string): string | null {
  const base = envUrlFor(eventType);
  if (!base) {
    return null;
  }

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}appeventsRef=${encodeURIComponent(`${userId}.${eventId}`)}`;
}
