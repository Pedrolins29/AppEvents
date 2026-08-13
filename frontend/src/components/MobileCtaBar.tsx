"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

/**
 * Mobile CTA bar — fixed bottom bar for mobile devices.
 * Hidden on desktop (640px+ breakpoint), displayed as a persistent
 * call-to-action on phones with safe-area-inset support for notches.
 * Styled via `.mobile-cta-bar` and `.mobile-cta-bar button` in globals.css.
 */
export function MobileCtaBar() {
  const t = useTranslations("siteHeader");

  return (
    <div className="mobile-cta-bar">
      <Link
        href="/criar-convite"
        className="block w-full h-12 rounded-full bg-[var(--gold)] px-7 py-2.5 text-center text-sm font-semibold text-[var(--ink)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-premium)] motion-reduce:transition-none hover:scale-[1.03] hover:bg-[#C6A05E] hover:shadow-[0_10px_24px_-10px_rgba(22,19,14,0.35)] focus-ring"
      >
        {t("getStarted")}
      </Link>
    </div>
  );
}
