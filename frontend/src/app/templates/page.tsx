"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/Skeleton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TemplateCard } from "@/components/TemplateCard";
import { templatesApi } from "@/lib/templatesApi";
import type { TemplateRecord } from "@/types/template";

export default function TemplatesPage() {
  const t = useTranslations("templates.gallery");
  const themeNameT = useTranslations("templateThemeNames");
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    templatesApi
      .list()
      .then(setTemplates)
      .catch(() => setError(t("loadError")))
      .finally(() => setIsLoading(false));
  }, [t]);

  return (
    <div className="flex flex-1 flex-col bg-[var(--porcelain)]">
      <SiteHeader />

      <main className="flex-1 px-6 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[var(--pinewood)]">
              {t("eyebrow")}
            </p>
            <h1
              className="font-serif text-3xl text-[var(--ink)] sm:text-4xl"
              style={{ fontWeight: 600 }}
            >
              {t("heading")}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[var(--muted-foreground)]">
              {t("subtitle")}
            </p>
          </div>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="aspect-[3/4] w-full" />
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group overflow-hidden border border-[var(--border)] transition-all duration-300 ease-[var(--ease-premium)] motion-reduce:transition-none hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_-16px_rgba(22,19,14,0.35)]"
              >
                <TemplateCard theme={template.theme} name={themeNameT(template.theme)} />
                <div className="flex items-center justify-between border-t border-[var(--border)] bg-white px-4 py-3">
                  <span className="font-medium text-[var(--ink)]">
                    {themeNameT(template.theme)}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/templates/${template.theme}`}
                      className="text-sm font-medium text-[var(--muted-foreground)] transition-colors duration-150 hover:text-[var(--ink)]"
                    >
                      {t("preview")}
                    </Link>
                    <Link
                      href={`/events/new?templateId=${template.id}`}
                      className="rounded-full bg-[var(--pinewood)] px-4 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0C4A44]"
                    >
                      {t("useThisTemplate")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
