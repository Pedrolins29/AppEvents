export type ThemeKey = "elegant" | "minimalist" | "floral" | "modern";

export interface TemplateRecord {
  id: string;
  name: string;
  theme: ThemeKey;
  thumbnailUrl: string;
}
