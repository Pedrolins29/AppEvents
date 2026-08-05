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

export type WeddingPlanTier = "Essencial" | "Premium";

// Sprint 23: the soft-gate/plan modal fires right after registration, before the visitor's
// InstantPreview draft has been claimed into a real Event (that only happens on first login — see
// instantPreviewDraft.ts) — so there's no eventId yet to correlate with. Order.EventId is already
// nullable for exactly this case; only the new user's id goes in the reference. Wedding-only for
// now (see Sprints/sprint23.md) — other event types get their own env vars + entries here once
// modeled, without touching the modal itself.
function weddingPlanEnvUrlFor(tier: WeddingPlanTier): string | undefined {
  switch (tier) {
    case "Essencial":
      return process.env.NEXT_PUBLIC_LASTLINK_CHECKOUT_WEDDING_ESSENCIAL;
    case "Premium":
      return process.env.NEXT_PUBLIC_LASTLINK_CHECKOUT_WEDDING_PREMIUM;
  }
}

export function getWeddingPlanCheckoutUrl(tier: WeddingPlanTier, userId: string): string | null {
  const base = weddingPlanEnvUrlFor(tier);
  if (!base) {
    return null;
  }

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}appeventsRef=${encodeURIComponent(userId)}`;
}

export function isWeddingPlanConfigured(tier: WeddingPlanTier): boolean {
  return Boolean(weddingPlanEnvUrlFor(tier));
}

// Whether the Wedding soft-gate/plan modal has anywhere real to send a visitor — same
// invisible-until-configured convention as UpsellBanner. False (both env vars unset) means
// InstantPreview's CTA keeps its current plain-register behavior instead of showing the modal.
export function hasWeddingPlansConfigured(): boolean {
  return isWeddingPlanConfigured("Essencial") || isWeddingPlanConfigured("Premium");
}
