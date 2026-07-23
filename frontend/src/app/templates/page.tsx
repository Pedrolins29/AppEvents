"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
            Choose your style
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Four invitation themes, each with its own voice. Pick one to get started.
          </p>
        </div>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        {isLoading && <p className="text-center text-zinc-500">Loading templates...</p>}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {templates.map((template) => (
            <div key={template.id} className="overflow-hidden rounded-lg shadow-sm">
              <TemplateCard theme={template.theme} name={template.name} />
              <div className="flex items-center justify-between bg-white px-4 py-3 dark:bg-zinc-900">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">{template.name}</span>
                <Link
                  href={`/events/new?templateId=${template.id}`}
                  className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
                >
                  Use this template
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/dashboard" className="text-sm text-zinc-500 underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
