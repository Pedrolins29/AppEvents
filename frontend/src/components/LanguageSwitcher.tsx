"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const LOCALES = ["pt", "en", "es"] as const;

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: string) {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <select
      aria-label={t("label")}
      value={locale}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-full border border-[#E2DFD3] bg-transparent px-3 py-1.5 text-sm text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D] disabled:opacity-50"
    >
      {LOCALES.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
