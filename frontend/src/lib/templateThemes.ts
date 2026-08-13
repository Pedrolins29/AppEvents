import type { ThemeKey } from "@/types/template";

// Single source of truth for the order templates are shown in on marketing surfaces
// (the landing page carousel, the /templates index). Lives in lib/ rather than in a
// component so both Server and Client Components can import it without pulling in a
// component module graph.
export const TEMPLATE_THEMES: ThemeKey[] = [
  "elegant",
  "minimalist",
  "floral",
  "modern",
  "romantic",
  "garden",
  "newspaper",
  "candlelight",
  "neon",
  "seal",
];
