import { getLocale, getTranslations } from "next-intl/server";
import { InvitationPhoneMockup } from "@/components/InvitationPhoneMockup";
import { formatEventDate } from "@/lib/formatEventDate";
import { getEventTypeLabels } from "@/types/event";

const MOCKUP_DATE_ISO = "2026-09-14";

// The landing hero's visual centerpiece — a fixed sample (Floral theme, wedding) rendered via
// the generalized InvitationPhoneMockup also used by the "See it in action" showcase further
// down the page.
export async function PhoneMockup() {
  const [locale, eventTypeT, landingT] = await Promise.all([
    getLocale(),
    getTranslations("eventTypes"),
    getTranslations("landing"),
  ]);
  const eventTypeLabels = getEventTypeLabels(eventTypeT);

  return (
    <InvitationPhoneMockup
      theme="floral"
      eventTypeLabel={eventTypeLabels.Wedding}
      name="Isabella & Marco"
      dateLabel={formatEventDate(MOCKUP_DATE_ISO, locale)}
      screens={["countdown", "story", "rsvp"]}
      description={landingT("hero.mockupDescription")}
    />
  );
}
