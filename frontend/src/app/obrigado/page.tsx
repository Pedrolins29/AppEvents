"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

// Sprint 14: a "Purchase"-equivalent pixel event fires here on mount, but this page only ever
// becomes reachable if Lastlink's checkout is configured (unverified whether it supports one) to
// redirect back here after a successful payment — until then it's an unlinked, harmless route.
export default function ObrigadoPage() {
  const t = useTranslations("payments.thankYou");

  useEffect(() => {
    window.fbq?.("track", "Purchase");
    window.gtag?.("event", "purchase");
    window.ttq?.track?.("CompletePayment");
  }, []);

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7]">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 font-serif text-2xl text-[#14211D]" style={{ fontWeight: 600 }}>
            {t("title")}
          </h1>
          <p className="mb-6 text-[#5B6B67]">{t("body")}</p>
          <Link href="/events" className="font-medium text-[#0F766E] underline transition-colors duration-150">
            {t("backToEvents")}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
