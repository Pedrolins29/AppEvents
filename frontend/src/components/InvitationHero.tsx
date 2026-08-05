import { Cormorant_Garamond, Playfair_Display, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import type { ThemeKey } from "@/types/template";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600"], style: ["italic", "normal"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500"], style: ["italic"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

export interface ThemeStyle {
  pageBg: string;
  sectionBg: string;
  heading: string;
  body: string;
  accent: string;
  gold?: string; // Optional wax seal color (defaults to accent if not provided)
  fontClassName: string;
  fontStyle: "italic" | "normal";
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
  },
};

export const DEFAULT_THEME_STYLE: ThemeStyle = THEME_STYLES.minimalist;

// Small per-theme decorative accents for the public page (e.g. the featured-photo closing
// section) — visually consistent with, but independently defined from, TemplateCard.tsx's own
// motifs (that file is theme-picker-specific output and stays untouched).
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

export function ThemeMotif({ theme, accentColor }: { theme: ThemeKey; accentColor: string }) {
  if (theme === "elegant") {
    return (
      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-px w-8" style={{ backgroundColor: accentColor }} />
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path d="M5 0L10 5L5 10L0 5Z" fill={accentColor} />
        </svg>
        <span className="h-px w-8" style={{ backgroundColor: accentColor }} />
      </div>
    );
  }
  if (theme === "floral") {
    return <Sprig className="h-10 w-10" color={accentColor} />;
  }
  if (theme === "modern") {
    return <div className="h-8 w-8 rounded-full" style={{ border: `4px solid ${accentColor}` }} aria-hidden />;
  }
  return <span className="h-px w-10" style={{ backgroundColor: accentColor }} aria-hidden />;
}

interface InvitationHeroProps {
  name: string;
  eventTypeLabel: string;
  formattedDate: string;
  coverImageUrl: string | null;
  theme: ThemeStyle;
  children?: ReactNode;
}

export function InvitationHero({ name, eventTypeLabel, formattedDate, coverImageUrl, theme, children }: InvitationHeroProps) {
  return (
    <section className="relative flex min-h-[75vh] sm:min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {coverImageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: theme.pageBg, opacity: 0.55 }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: theme.pageBg }} />
      )}
      <div className="relative flex flex-col items-center gap-5">
        <span
          className="text-xs font-medium uppercase tracking-[0.4em]"
          style={{ color: theme.accent }}
        >
          {eventTypeLabel}
        </span>
        <h1
          className={theme.fontClassName}
          style={{
            color: theme.heading,
            fontStyle: theme.fontStyle,
            fontSize: "clamp(2.25rem, 6vw, 4rem)",
            lineHeight: 1.1,
          }}
        >
          {name}
        </h1>
        <p className="text-sm tracking-wide" style={{ color: theme.body }}>
          {formattedDate}
        </p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
