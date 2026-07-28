import { THEME_STYLES } from "@/components/InvitationHero";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import type { ThemeKey } from "@/types/template";

export type MockupScreen = "countdown" | "map" | "timeline" | "dressCode" | "photo" | "story" | "rsvp";

interface SampleTimelineItem {
  time: string;
  label: string;
}

interface InvitationPhoneMockupProps {
  theme: ThemeKey;
  eventTypeLabel: string;
  name: string;
  dateLabel: string;
  /**
   * The "See it in action" showcase grid always passes exactly 2, so every card in that grid has
   * identical content height and the shared `.phone-scroll` animation works unmodified across
   * all of them. The landing hero (rendered alone, not in a grid) isn't bound by that constraint.
   */
  screens: MockupScreen[];
  address?: string;
  timelineItems?: SampleTimelineItem[];
  dressCode?: string;
  description?: string;
  /** Optional real photo behind the phone screen, tinted with the theme's own background color
   * so the (small, busy-photo-prone) mockup text stays legible — same overlay pattern already
   * proven on the real InvitationHero cover photo, just at a higher opacity for this smaller,
   * denser context. */
  photoUrl?: string;
  size?: "default" | "sm";
}

function MapGlyph({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
      <path
        d="M9 16C9 16 15 11 15 7.5C15 4.5 12.3 2 9 2C5.7 2 3 4.5 3 7.5C3 11 9 16 9 16Z"
        stroke={color}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="7.5" r="2" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

function ScreenBlock({
  theme,
  screen,
  address,
  timelineItems,
  dressCode,
  description,
}: {
  theme: (typeof THEME_STYLES)[ThemeKey];
  screen: MockupScreen;
  address?: string;
  timelineItems?: SampleTimelineItem[];
  dressCode?: string;
  description?: string;
}) {
  if (screen === "countdown") {
    return (
      <div className="flex items-center justify-center gap-3" aria-hidden>
        {["45", "12", "30", "05"].map((value, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-sm font-semibold tabular-nums" style={{ color: theme.accent }}>
              {value}
            </span>
            <span className="mt-0.5 text-[7px] uppercase tracking-[0.15em]" style={{ color: theme.body }}>
              {["Days", "Hrs", "Min", "Sec"][i]}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (screen === "map") {
    return (
      <div className="flex w-full flex-col items-center gap-2">
        <div
          className="flex h-16 w-full items-center justify-center rounded-md border"
          style={{ borderColor: theme.accent + "40" }}
        >
          <MapGlyph color={theme.accent} />
        </div>
        {address && (
          <p className="text-center text-[9px]" style={{ color: theme.body }}>
            {address}
          </p>
        )}
      </div>
    );
  }

  if (screen === "timeline" && timelineItems) {
    return (
      <div className="flex w-full flex-col gap-1.5">
        {timelineItems.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-baseline gap-2">
            <span className="text-[9px] font-semibold tabular-nums" style={{ color: theme.accent }}>
              {item.time}
            </span>
            <span className="text-[9px]" style={{ color: theme.body }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (screen === "dressCode" && dressCode) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[8px] uppercase tracking-[0.25em]" style={{ color: theme.accent }}>
          Dress code
        </span>
        <span className="text-[10px]" style={{ color: theme.heading }}>
          {dressCode}
        </span>
      </div>
    );
  }

  if (screen === "photo") {
    return <PhotoPlaceholder accentColor={theme.accent} tintColor={theme.sectionBg} className="max-w-[90px]" />;
  }

  if (screen === "story" && description) {
    return (
      <p className="text-[10px] leading-relaxed" style={{ color: theme.body }}>
        {description}
      </p>
    );
  }

  if (screen === "rsvp") {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-[9px] font-medium uppercase tracking-[0.3em]" style={{ color: theme.accent }}>
          RSVP
        </span>
        <div className="flex gap-2">
          <span
            className="rounded-full px-3 py-1.5 text-[9px] font-medium"
            style={{ backgroundColor: theme.accent, color: theme.pageBg }}
          >
            I&apos;ll be there
          </span>
          <span
            className="rounded-full border px-3 py-1.5 text-[9px] font-medium"
            style={{ borderColor: theme.accent, color: theme.heading }}
          >
            Can&apos;t make it
          </span>
        </div>
      </div>
    );
  }

  return null;
}

// A decorative, non-interactive echo of the real invitation experience — static illustrative
// content, not live data. Pure CSS animation (see .phone-scroll in globals.css), so this stays a
// Server Component: no client-side JS needed.
export function InvitationPhoneMockup({
  theme: themeKey,
  eventTypeLabel,
  name,
  dateLabel,
  screens,
  address,
  timelineItems,
  dressCode,
  description,
  photoUrl,
  size = "default",
}: InvitationPhoneMockupProps) {
  const theme = THEME_STYLES[themeKey];
  const dims = size === "sm" ? { h: 320, w: 160 } : { h: 420, w: 210 };

  return (
    <div
      className="relative mx-auto rounded-[2.25rem] border-[6px] shadow-[0_25px_60px_-15px_rgba(15,23,20,0.45)]"
      style={{ borderColor: "#1A1611", backgroundColor: "#1A1611", height: dims.h, width: dims.w, padding: 8 }}
    >
      <div
        className="absolute left-1/2 top-3 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: "#1A1611" }}
        aria-hidden
      />
      <div
        className="relative h-full w-full overflow-hidden rounded-[1.75rem]"
        style={{ backgroundColor: theme.pageBg }}
      >
        {photoUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ backgroundColor: theme.pageBg, opacity: 0.65 }} />
          </>
        )}
        <div className="phone-scroll relative flex flex-col items-center gap-5 px-4 pb-8 pt-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <span
              className="text-[9px] font-medium uppercase tracking-[0.35em]"
              style={{ color: theme.accent }}
            >
              {eventTypeLabel}
            </span>
            <h3
              className={theme.fontClassName}
              style={{ color: theme.heading, fontStyle: theme.fontStyle, fontSize: "1.3rem", lineHeight: 1.15 }}
            >
              {name}
            </h3>
            <p className="text-[10px]" style={{ color: theme.body }}>
              {dateLabel}
            </p>
          </div>

          {screens.map((screen, i) => (
            <ScreenBlock
              key={i}
              theme={theme}
              screen={screen}
              address={address}
              timelineItems={timelineItems}
              dressCode={dressCode}
              description={description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
