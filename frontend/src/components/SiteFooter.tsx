"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("siteFooter");

  return (
    <footer className="border-t border-[color-mix(in_srgb,var(--gold)_35%,transparent)] bg-[var(--charcoal)] px-6 py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-[#B9AF9C] sm:flex-row">
        <Link href="/" className="flex items-center gap-2 focus-ring-sm">
          <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="text-[var(--gold)]">
            <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" />
          </svg>
          <span className="font-display text-base text-[var(--porcelain)]">AppEvents</span>
          <span className="text-[#8A8272]">&copy; {new Date().getFullYear()}</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/criar-convite" className="transition-colors duration-150 hover:text-[var(--porcelain)] focus-ring-sm">
            {t("criarConvite")}
          </Link>
          <Link href="/templates" className="transition-colors duration-150 hover:text-[var(--porcelain)] focus-ring-sm">
            {t("templates")}
          </Link>
          <Link href="/login" className="transition-colors duration-150 hover:text-[var(--porcelain)] focus-ring-sm">
            {t("logIn")}
          </Link>
          <Link href="/criar-convite" className="transition-colors duration-150 hover:text-[var(--porcelain)] focus-ring-sm">
            {t("getStarted")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
