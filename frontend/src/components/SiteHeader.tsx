"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function DiamondMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden className="text-[#A16207]">
      <path d="M5 0L10 5L5 10L0 5Z" fill="currentColor" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none">
      {open ? (
        <path
          d="M5 5L15 15M15 5L5 15"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path d="M3 6H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3 10H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3 14H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/#templates", labelKey: "chooseYourDesign" },
  { href: "/templates", labelKey: "preview" },
  { href: "/#how-it-works", labelKey: "howItWorks" },
  { href: "/#faq", labelKey: "qa" },
] as const;

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative text-sm text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D]"
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#0F766E] transition-transform duration-200 group-hover:scale-x-100" />
    </Link>
  );
}

export function SiteHeader() {
  const t = useTranslations("siteHeader");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 border-b border-[#E2DFD3] bg-[#FDFBF7]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-colors duration-150"
          onClick={() => setIsMenuOpen(false)}
        >
          <DiamondMark />
          <span className="text-sm font-semibold tracking-wide text-[#14211D]">AppEvents</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={t(link.labelKey)} />
          ))}
          <LanguageSwitcher />
          <Link
            href="/login"
            className="text-sm text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D]"
          >
            {t("logIn")}
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-[#0F766E] px-4 py-2 text-sm font-medium text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#0C5C56] hover:shadow-md"
          >
            {t("getStarted")}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
          className="flex items-center justify-center rounded-md p-2 text-[#14211D] transition-colors duration-150 hover:text-[#0F766E] sm:hidden"
        >
          <MenuIcon open={isMenuOpen} />
        </button>
      </div>

      <div
        className={`origin-top overflow-hidden border-t border-[#E2DFD3] bg-[#FDFBF7] transition-all duration-150 sm:hidden ${
          isMenuOpen ? "max-h-96 scale-y-100 opacity-100" : "max-h-0 scale-y-95 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="rounded-md px-2 py-2 text-sm text-[#5B6B67] transition-colors duration-150 hover:bg-[#0F766E]/5 hover:text-[#14211D]"
            >
              {t(link.labelKey)}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-md px-2 py-2 text-sm text-[#5B6B67] transition-colors duration-150 hover:bg-[#0F766E]/5 hover:text-[#14211D]"
          >
            {t("logIn")}
          </Link>
          <Link
            href="/register"
            onClick={() => setIsMenuOpen(false)}
            className="mt-2 rounded-full bg-[#0F766E] px-4 py-2 text-center text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56]"
          >
            {t("getStarted")}
          </Link>
          <div className="mt-2 flex justify-center">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
