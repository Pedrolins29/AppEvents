import { Cormorant_Garamond, Playfair_Display, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import type { ThemeKey } from "@/types/template";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600"], style: ["italic", "normal"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500"], style: ["italic"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

export type PhotoFilterKey = "vintage" | "warm" | "dark" | "neon";
export type HeroOverlayKey = "editorial" | "night" | "neon" | "romantic";
export type DecorationKey = "newspaper" | "waxSeal" | "neonGlow";
export type MotifKey = "diamond" | "leaf" | "ring" | "line" | "glow" | "rule";

export const PHOTO_FILTERS: Record<PhotoFilterKey, string> = {
  vintage: "sepia(0.35) contrast(1.15) brightness(0.95)",
  warm: "sepia(0.18) brightness(0.97) contrast(1.05)",
  dark: "brightness(0.6) saturate(1.15) contrast(1.05)",
  neon: "grayscale(0.3) hue-rotate(220deg) saturate(2.2) brightness(0.65) contrast(1.1)",
};

export const HERO_OVERLAYS: Record<HeroOverlayKey, string> = {
  editorial:
    "linear-gradient(to bottom, rgba(245,239,225,0.78) 0%, rgba(245,239,225,0.35) 40%, rgba(245,239,225,0.15) 100%)",
  night: "linear-gradient(to top, rgba(20,12,6,0.75) 0%, rgba(20,12,6,0.35) 45%, rgba(20,12,6,0.05) 100%)",
  neon: "radial-gradient(circle at 50% 40%, rgba(255,0,200,0.35) 0%, rgba(76,0,130,0.55) 45%, rgba(10,0,20,0.75) 100%)",
  romantic: "linear-gradient(to bottom, rgba(45,30,20,0.15) 0%, rgba(45,30,20,0.45) 100%)",
};

function Sprig({ className, color }: { className?: string; color: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden style={{ color }}>
      <path d="M4 60C10 40 16 24 32 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="14" cy="46" rx="7" ry="3.2" transform="rotate(-40 14 46)" fill="currentColor" opacity="0.55" />
      <ellipse cx="22" cy="32" rx="7" ry="3.2" transform="rotate(-30 22 32)" fill="currentColor" opacity="0.7" />
      <ellipse cx="29" cy="17" rx="6" ry="2.8" transform="rotate(-15 29 17)" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

const MOTIF_RENDERERS: Record<MotifKey, (accentColor: string) => ReactNode> = {
  diamond: (accentColor) => (
    <div className="flex items-center gap-3" aria-hidden>
      <span className="h-px w-8" style={{ backgroundColor: accentColor }} />
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
        <path d="M5 0L10 5L5 10L0 5Z" fill={accentColor} />
      </svg>
      <span className="h-px w-8" style={{ backgroundColor: accentColor }} />
    </div>
  ),
  leaf: (accentColor) => <Sprig className="h-10 w-10" color={accentColor} />,
  ring: (accentColor) => (
    <div className="h-8 w-8 rounded-full" style={{ border: `4px solid ${accentColor}` }} aria-hidden />
  ),
  line: (accentColor) => <span className="h-px w-10" style={{ backgroundColor: accentColor }} aria-hidden />,
  glow: (accentColor) => (
    <div
      className="h-3 w-3 rounded-full"
      style={{ backgroundColor: accentColor, boxShadow: `0 0 12px 4px ${accentColor}` }}
      aria-hidden
    />
  ),
  rule: (accentColor) => (
    <div className="flex flex-col items-center gap-1" aria-hidden>
      <span className="h-px w-14" style={{ backgroundColor: accentColor }} />
      <span className="h-1.5 w-1.5" style={{ backgroundColor: accentColor }} />
      <span className="h-px w-14" style={{ backgroundColor: accentColor }} />
    </div>
  ),
};

export const HERO_DECORATIONS: Record<DecorationKey, (theme: ThemeStyle) => ReactNode> = {
  newspaper: (theme) => (
    <div className="flex flex-col items-center gap-1" aria-hidden>
      <span className="h-px w-20" style={{ backgroundColor: theme.accent }} />
      <span className="h-px w-20" style={{ backgroundColor: theme.accent, opacity: 0.5 }} />
    </div>
  ),
  waxSeal: (theme) => (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full"
      style={{ border: `1.5px solid ${theme.gold ?? theme.accent}` }}
      aria-hidden
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.gold ?? theme.accent }} />
    </div>
  ),
  neonGlow: (theme) => (
    <div
      className="hero-neon-glow h-9 w-9 rounded-full"
      style={{ border: `2px solid ${theme.accent}` }}
      aria-hidden
    />
  ),
};

export interface ThemeStyle {
  pageBg: string;
  sectionBg: string;
  heading: string;
  body: string;
  accent: string;
  gold?: string;
  fontClassName: string;
  fontStyle: "italic" | "normal";
  photoFilterKey?: PhotoFilterKey;
  heroOverlayKey?: HeroOverlayKey;
  heroDecoration?: DecorationKey;
  motif: MotifKey;
}

export const THEME_STYLES: Record<ThemeKey, ThemeStyle> = {
  elegant: {
    pageBg: "#17140F",
    sectionBg: "#1F1A12",
    heading: "#F3EDE0",
    body: "rgba(243,237,224,0.65)",
    accent: "#C9A24B",
    gold: "#D4AF37",
    fontClassName: playfair.className,
    fontStyle: "italic",
    motif: "diamond",
  },
  minimalist: {
    pageBg: "#FAFAF7",
    sectionBg: "#FFFFFF",
    heading: "#16130F",
    body: "rgba(22,19,15,0.6)",
    accent: "#9C8A76",
    gold: "#C5A572",
    fontClassName: "",
    fontStyle: "normal",
    motif: "line",
  },
  floral: {
    pageBg: "#F8ECE6",
    sectionBg: "#FFFDFB",
    heading: "#4A2E28",
    body: "rgba(74,46,40,0.65)",
    accent: "#C97B63",
    gold: "#D4AF37",
    fontClassName: cormorant.className,
    fontStyle: "italic",
    motif: "leaf",
  },
  modern: {
    pageBg: "#14161F",
    sectionBg: "#1B1E2B",
    heading: "#FFFFFF",
    body: "rgba(255,255,255,0.6)",
    accent: "#FF6B4A",
    gold: "#FFD700",
    fontClassName: spaceGrotesk.className,
    fontStyle: "normal",
    motif: "ring",
  },
  romantic: {
    pageBg: "#FBF6EC",
    sectionBg: "#FFFDF7",
    heading: "#2A2118",
    body: "rgba(42,33,24,0.62)",
    accent: "#B8863E",
    gold: "#C9A24B",
    fontClassName: playfair.className,
    fontStyle: "italic",
    motif: "diamond",
  },
  garden: {
    pageBg: "#F4F6EE",
    sectionBg: "#FFFFFF",
    heading: "#33402C",
    body: "rgba(51,64,44,0.62)",
    accent: "#7C9473",
    gold: "#C5A572",
    fontClassName: "",
    fontStyle: "normal",
    motif: "leaf",
  },
  newspaper: {
    pageBg: "#F5EFE1",
    sectionBg: "#FBF8F2",
    heading: "#221D16",
    body: "rgba(34,29,22,0.65)",
    accent: "#8B2E22",
    gold: "#B08D4C",
    fontClassName: playfair.className,
    fontStyle: "normal",
    photoFilterKey: "vintage",
    heroOverlayKey: "editorial",
    heroDecoration: "newspaper",
    motif: "rule",
  },
  candlelight: {
    pageBg: "#1A120A",
    sectionBg: "#241A0F",
    heading: "#F3E9D8",
    body: "rgba(243,233,216,0.7)",
    accent: "#D99A4E",
    gold: "#E0A85C",
    fontClassName: cormorant.className,
    fontStyle: "italic",
    photoFilterKey: "dark",
    heroOverlayKey: "night",
    motif: "diamond",
  },
  neon: {
    pageBg: "#12081C",
    sectionBg: "#1B0F2B",
    heading: "#FFFFFF",
    body: "rgba(255,255,255,0.75)",
    accent: "#FF3EC9",
    gold: "#4CFFDA",
    fontClassName: spaceGrotesk.className,
    fontStyle: "normal",
    photoFilterKey: "neon",
    heroOverlayKey: "neon",
    heroDecoration: "neonGlow",
    motif: "glow",
  },
  seal: {
    pageBg: "#2A1F16",
    sectionBg: "#33261A",
    heading: "#FBF6EC",
    body: "rgba(251,246,236,0.75)",
    accent: "#C9A24B",
    gold: "#D4AF37",
    fontClassName: playfair.className,
    fontStyle: "italic",
    photoFilterKey: "warm",
    heroOverlayKey: "romantic",
    heroDecoration: "waxSeal",
    motif: "diamond",
  },
};

export const DEFAULT_THEME_STYLE: ThemeStyle = THEME_STYLES.minimalist;

export function ThemeMotif({ theme, accentColor }: { theme: ThemeKey; accentColor: string }) {
  return MOTIF_RENDERERS[THEME_STYLES[theme].motif](accentColor);
}
