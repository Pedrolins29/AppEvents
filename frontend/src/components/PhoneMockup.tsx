import { InvitationPhoneMockup } from "@/components/InvitationPhoneMockup";

// The landing hero's visual centerpiece — a fixed sample (Floral theme, wedding) rendered via
// the generalized InvitationPhoneMockup also used by the "See it in action" showcase further
// down the page.
export function PhoneMockup() {
  return (
    <InvitationPhoneMockup
      theme="floral"
      eventTypeLabel="Wedding"
      name="Isabella & Marco"
      dateLabel="September 14, 2026"
      screens={["countdown", "story", "rsvp"]}
      description="Two families, one celebration. Join us for an evening of vows and dancing."
    />
  );
}
