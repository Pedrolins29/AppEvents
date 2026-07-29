import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("templates.metadata");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
