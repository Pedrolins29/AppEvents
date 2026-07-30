import { HomeLanding } from "@/components/landing/HomeLanding";
import { SalesLanding } from "@/components/landing/SalesLanding";

// Sprint 13: the redesigned PLG sales landing is gated behind the SALES_LANDING env flag so its
// aspirational copy (Pix / WhatsApp RSVP / music — shipped in later sprints) never goes public
// until those features actually exist. Default (flag unset) → the current, fully-truthful landing.
export default async function Home() {
  if (process.env.SALES_LANDING === "true") {
    return <SalesLanding />;
  }
  return <HomeLanding />;
}
