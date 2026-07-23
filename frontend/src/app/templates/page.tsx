"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TemplateCard } from "@/components/TemplateCard";
import { templatesApi } from "@/lib/templatesApi";
import type { TemplateRecord } from "@/types/template";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    templatesApi
      .list()
      .then(setTemplates)
      .catch(() => setError("Could not load templates."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col bg-[#FDFBF7] dark:bg-[#0F1714]">
      <SiteHeader />

      <main className="flex-1 px-6 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E] dark:text-[#14B8A6]">
              Templates
            </p>
            <h1
              className="font-serif text-3xl text-[#14211D] sm:text-4xl dark:text-[#F3F1EA]"
              style={{ fontWeight: 600 }}
            >
              Choose your style
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[#5B6B67] dark:text-[#9CA9A5]">
              Four hand-designed themes — pick one and make it yours.
            </p>
          </div>

          {error && <p className="text-center text-sm text-red-600">{error}</p>}
          {isLoading && (
            <p className="text-center text-[#5B6B67] dark:text-[#9CA9A5]">Loading templates...</p>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group overflow-hidden border border-[#E2DFD3] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(15,23,20,0.35)] dark:border-[#2A3532]"
              >
                <TemplateCard theme={template.theme} name={template.name} />
                <div className="flex items-center justify-between border-t border-[#E2DFD3] bg-white px-4 py-3 dark:border-[#2A3532] dark:bg-[#1B2422]">
                  <span className="font-medium text-[#14211D] dark:text-[#F3F1EA]">
                    {template.name}
                  </span>
                  <Link
                    href={`/events/new?templateId=${template.id}`}
                    className="rounded-full bg-[#0F766E] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#0C5C56] dark:bg-[#14B8A6] dark:text-[#062420] dark:hover:bg-[#2DD4BF]"
                  >
                    Use this template
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/dashboard"
              className="text-sm text-[#5B6B67] underline hover:text-[#14211D] dark:text-[#9CA9A5] dark:hover:text-[#F3F1EA]"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
