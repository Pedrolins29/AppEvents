"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/auth-context";
import { getCheckoutUrl } from "@/lib/checkoutUrls";
import type { EventType } from "@/types/event";

interface UpsellBannerProps {
  eventId: string;
  eventType: EventType;
}

// Sprint 14: purely additive next to the publish button — never blocks publish/unpublish.
// Renders nothing unless NEXT_PUBLIC_PREMIUM_UPSELL is on AND a real Lastlink checkout URL is
// configured for this event's type (see lib/checkoutUrls.ts), so it stays invisible until both
// are true.
export function UpsellBanner({ eventId, eventType }: UpsellBannerProps) {
  const t = useTranslations("payments.upsell");
  const { user } = useAuth();

  if (process.env.NEXT_PUBLIC_PREMIUM_UPSELL !== "true" || !user) {
    return null;
  }

  const checkoutUrl = getCheckoutUrl(eventType, user.id, eventId);
  if (!checkoutUrl) {
    return null;
  }

  function handleClick() {
    window.fbq?.("track", "InitiateCheckout");
    window.gtag?.("event", "begin_checkout");
    window.ttq?.track?.("InitiateCheckout");
  }

  return (
    <div className="mb-6 border border-[#E2DFD3] p-4">
      <p className="font-medium text-[#14211D]">{t("heading")}</p>
      <p className="mt-1 text-sm text-[#5B6B67]">{t("body")}</p>
      <a
        href={checkoutUrl}
        onClick={handleClick}
        className="mt-3 inline-block rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#0C5C56] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
      >
        {t("cta")}
      </a>
    </div>
  );
}
