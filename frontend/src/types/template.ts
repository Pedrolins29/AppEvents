export type ThemeKey = "elegant" | "minimalist" | "floral" | "modern" | "romantic" | "garden";

export interface TemplateRecord {
  id: string;
  name: string;
  theme: ThemeKey;
  thumbnailUrl: string;
}
