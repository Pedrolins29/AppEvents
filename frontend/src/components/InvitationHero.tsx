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
    fontClassName: playfair.className,
    fontStyle: "italic",
  },
  minimalist: {
    pageBg: "#FAFAF7",
    sectionBg: "#FFFFFF",
    heading: "#16130F",
    body: "rgba(22,19,15,0.6)",
    accent: "#9C8A76",
    fontClassName: "",
    fontStyle: "normal",
  },
  floral: {
    pageBg: "#F8ECE6",
    sectionBg: "#FFFDFB",
    heading: "#4A2E28",
    body: "rgba(74,46,40,0.65)",
    accent: "#C97B63",
    fontClassName: cormorant.className,
    fontStyle: "italic",
  },
  modern: {
    pageBg: "#14161F",
    sectionBg: "#1B1E2B",
    heading: "#FFFFFF",
    body: "rgba(255,255,255,0.6)",
    accent: "#FF6B4A",
    fontClassName: spaceGrotesk.className,
    fontStyle: "normal",
  },
};

export const DEFAULT_THEME_STYLE: ThemeStyle = THEME_STYLES.minimalist;

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
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
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
