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
   *  (event editor's publish box); "popup" = toggle button that shows share options in a popup. */
  variant?: "compact" | "full" | "popup";
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

  if (variant === "popup") {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowQr((v) => !v)}
          className="rounded-full bg-[#0F766E] p-2 text-white transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#0C5C56] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
          title={t("shareTitle")}
          aria-label={t("shareTitle")}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.469 9 12c0-3.314-2.686-6-6-6s-6 2.686-6 6 2.686 6 6 6c.469 0 .938-.114 1.342-.316m6.976-7.25v2.565a2.007 2.007 0 01-1.342 1.903m5.676-3.468a7 7 0 10-13.856 0m13.856 0l-5.676 3.468m5.676-3.468l4.318 2.59a1 1 0 00-1.432-1.409l-4.318-2.59" />
          </svg>
        </button>
        {showQr && (
          <div className="absolute right-0 top-12 z-50 rounded-lg bg-white p-4 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-3">
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
                className="rounded-full bg-[#0F766E] px-4 py-2 text-center text-sm font-medium text-white transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#0C5C56] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
              >
                {t("whatsappShare")}
              </a>
              <button
                type="button"
                onClick={() => setShowQr(false)}
                className="rounded-full border border-[#E2DFD3] px-4 py-2 text-sm font-medium text-[#14211D] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#F5F2EA] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)]"
              >
                {t("showQrCode")}
              </button>
              <div className="mt-2 flex justify-center">
                <QrCode value={buildInviteUrl(slug)} />
              </div>
            </div>
          </div>
        )}
      </div>
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
