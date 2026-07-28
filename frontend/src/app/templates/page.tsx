"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/Skeleton";
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
    <div className="flex flex-1 flex-col bg-[#FDFBF7]">
      <SiteHeader />

      <main className="flex-1 px-6 py-16 sm:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-[#0F766E]">
              Templates
            </p>
            <h1
              className="font-serif text-3xl text-[#14211D] sm:text-4xl"
              style={{ fontWeight: 600 }}
            >
              Choose your style
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[#5B6B67]">
              Four hand-designed themes — pick one and make it yours.
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
                className="group overflow-hidden border border-[#E2DFD3] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-16px_rgba(15,23,20,0.35)]"
              >
                <TemplateCard theme={template.theme} name={template.name} />
                <div className="flex items-center justify-between border-t border-[#E2DFD3] bg-white px-4 py-3">
                  <span className="font-medium text-[#14211D]">
                    {template.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/templates/${template.theme}`}
                      className="text-sm font-medium text-[#5B6B67] transition-colors duration-150 hover:text-[#14211D]"
                    >
                      Preview
                    </Link>
                    <Link
                      href={`/events/new?templateId=${template.id}`}
                      className="rounded-full bg-[#0F766E] px-4 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#0C5C56]"
                    >
                      Use this template
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
