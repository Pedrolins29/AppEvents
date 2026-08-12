export type ThemeKey =
  | "elegant"
  | "minimalist"
  | "floral"
  | "modern"
  | "romantic"
  | "garden"
  | "newspaper"
  | "candlelight"
  | "neon"
  | "seal";

export interface TemplateRecord {
  id: string;
  name: string;
  theme: ThemeKey;
  thumbnailUrl: string;
}

