import type { MetadataRoute } from "next";
import { CATEGORY_ORDER, CATEGORY_SLUGS } from "@/lib/inviteCategories";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL ?? "http://localhost:3000";

// Published /e/[slug] invitation pages aren't included yet — the backend only exposes a
// single-slug lookup (GET /api/public/events/{slug}), no list endpoint to enumerate them from.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: APP_BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_BASE_URL}/templates`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${APP_BASE_URL}/templates/elegant`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_BASE_URL}/templates/minimalist`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_BASE_URL}/templates/floral`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_BASE_URL}/templates/modern`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_BASE_URL}/criar-convite`, changeFrequency: "monthly", priority: 0.8 },
    ...CATEGORY_ORDER.map((type) => ({
      url: `${APP_BASE_URL}/criar-convite/${CATEGORY_SLUGS[type]}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
