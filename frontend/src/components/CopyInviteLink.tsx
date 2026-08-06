"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { QrCode } from "@/components/QrCode";
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
  const [showQr, setShowQr] = useState(false);

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
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-[#0F766E] px-4 py-2 text-sm font-medium text-[#0F766E] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#0F766E] hover:text-white hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
        >
          {copied ? t("linkCopied") : t("copyLink")}
        </button>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => fireSharedEvent("whatsapp")}
          className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#0C5C56] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
        >
          {t("whatsappShare")}
        </a>
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          className="rounded-full border border-[#E2DFD3] px-4 py-2 text-sm font-medium text-[#14211D] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#F5F2EA] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
        >
          {showQr ? t("hideQrCode") : t("showQrCode")}
        </button>
      </div>
      {showQr && (
        <div className="mt-3">
          <QrCode value={buildInviteUrl(slug)} />
        </div>
      )}
    </div>
  );
}
