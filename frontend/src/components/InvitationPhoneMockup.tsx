import { getTranslations } from "next-intl/server";
import {
  InvitationPhoneMockupView,
  type MockupLabels,
  type MockupScreen,
  type SampleTimelineItem,
} from "@/components/InvitationPhoneMockupView";
import type { ThemeKey } from "@/types/template";

export type { MockupLabels, MockupScreen, SampleTimelineItem };

interface InvitationPhoneMockupProps {
  theme: ThemeKey;
  eventTypeLabel: string;
  name: string;
  dateLabel: string;
  /**
   * The "See it in action" showcase grid always passes exactly 2, so every card in that grid has
   * identical content height and the shared `.phone-scroll` animation works unmodified across
   * all of them. The landing hero (rendered alone, not in a grid) isn't bound by that constraint.
   */
  screens: MockupScreen[];
  address?: string;
  timelineItems?: SampleTimelineItem[];
  dressCode?: string;
  description?: string;
  /** Optional real photo behind the phone screen, tinted with the theme's own background color
   * so the (small, busy-photo-prone) mockup text stays legible — same overlay pattern already
   * proven on the real InvitationHero cover photo, just at a higher opacity for this smaller,
   * denser context. */
  photoUrl?: string;
  size?: "default" | "sm";
}

// A decorative, non-interactive echo of the real invitation experience — static illustrative
// content, not live data. Pure CSS animation (see .phone-scroll in globals.css), so this stays a
// Server Component: no client-side JS needed. Resolves i18n labels server-side, then delegates
// rendering to InvitationPhoneMockupView (shared with the client-side InstantPreview component).
export async function InvitationPhoneMockup({
  theme,
  eventTypeLabel,
  name,
  dateLabel,
  screens,
  address,
  timelineItems,
  dressCode,
  description,
  photoUrl,
  size = "default",
}: InvitationPhoneMockupProps) {
  const [countdownT, invitationT] = await Promise.all([
    getTranslations("countdown"),
    getTranslations("invitation"),
  ]);
  const labels: MockupLabels = {
    days: countdownT("days"),
    hrs: countdownT("hours"),
    min: countdownT("min"),
    sec: countdownT("sec"),
    dressCode: invitationT("dressCode"),
    rsvpHeading: invitationT("rsvp.heading"),
    attending: invitationT("rsvp.attending"),
    notAttending: invitationT("rsvp.notAttending"),
  };

  return (
    <InvitationPhoneMockupView
      theme={theme}
      eventTypeLabel={eventTypeLabel}
      name={name}
      dateLabel={dateLabel}
      screens={screens}
      labels={labels}
      address={address}
      timelineItems={timelineItems}
      dressCode={dressCode}
      description={description}
      photoUrl={photoUrl}
      size={size}
    />
  );
}
