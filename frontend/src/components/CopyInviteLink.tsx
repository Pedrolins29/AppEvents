"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { buildInviteUrl } from "@/lib/inviteUrl";
import { buildWhatsappShareLink } from "@/lib/whatsappLink";

interface CopyInviteLinkProps {
  slug: string;
  eventName: string;
  /** "compact" = a single small text link (events list row); "full" = two prominent buttons
   *  (event editor's publish box). */
  variant?: "compact" | "full";
}

// The one-click "copy/share the link I just published" affordance — the single most important
// activation action in the app had no dedicated UI before Sprint 19 (guests' *personal* links
// already had this in GuestListManager; the main invitation link didn't).
export function CopyInviteLink({ slug, eventName, variant = "full" }: CopyInviteLinkProps) {
  const t = useTranslations("events.shareLink");
  const [copied, setCopied] = useState(false);

  function fireSharedEvent(method: "copy_link" | "whatsapp") {
    window.fbq?.("trackCustom", "InvitationShared");
    window.gtag?.("event", "invitation_shared", { method });
    window.ttq?.track?.("InvitationShared");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildInviteUrl(slug));
      setCopied(true);
      fireSharedEvent("copy_link");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  const whatsappHref = buildWhatsappShareLink(
    t("whatsappMessage", { name: eventName, link: buildInviteUrl(slug) }),
  );

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="font-medium text-[#0F766E] underline transition-colors duration-150"
      >
        {copied ? t("linkCopied") : t("copyLink")}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-full border border-[#0F766E] px-4 py-2 text-sm font-medium text-[#0F766E] transition-colors duration-150 hover:bg-[#0F766E] hover:text-white"
      >
        {copied ? t("linkCopied") : t("copyLink")}
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => fireSharedEvent("whatsapp")}
        className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56]"
      >
        {t("whatsappShare")}
      </a>
    </div>
  );
}
