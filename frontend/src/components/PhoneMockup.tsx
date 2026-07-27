import { THEME_STYLES } from "@/components/InvitationHero";

// A decorative, non-interactive echo of the real Elegant invitation experience — static
// illustrative content, not live data. Pure CSS animation (see .phone-scroll in globals.css),
// so this stays a Server Component: no client-side JS needed.
export function PhoneMockup() {
  const theme = THEME_STYLES.elegant;

  return (
    <div
      className="relative mx-auto h-[420px] w-[210px] rounded-[2.25rem] border-[6px] p-2 shadow-[0_25px_60px_-15px_rgba(15,23,20,0.45)]"
      style={{ borderColor: "#1A1611", backgroundColor: "#1A1611" }}
    >
      <div
        className="absolute left-1/2 top-3 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: "#1A1611" }}
        aria-hidden
      />
      <div
        className="h-full w-full overflow-hidden rounded-[1.75rem]"
        style={{ backgroundColor: theme.pageBg }}
      >
        <div className="phone-scroll flex flex-col items-center gap-6 px-5 pt-14 pb-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <span
              className="text-[9px] font-medium uppercase tracking-[0.35em]"
              style={{ color: theme.accent }}
            >
              Wedding
            </span>
            <h3
              className={theme.fontClassName}
              style={{ color: theme.heading, fontStyle: theme.fontStyle, fontSize: "1.5rem", lineHeight: 1.15 }}
            >
              Isabella &amp; Marco
            </h3>
            <p className="text-[11px]" style={{ color: theme.body }}>
              September 14, 2026
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            {["45", "12", "30", "05"].map((value, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-sm font-semibold tabular-nums" style={{ color: theme.accent }}>
                  {value}
                </span>
                <span
                  className="mt-0.5 text-[7px] uppercase tracking-[0.15em]"
                  style={{ color: theme.body }}
                >
                  {["Days", "Hrs", "Min", "Sec"][i]}
                </span>
              </div>
            ))}
          </div>

          <p className="text-[10px] leading-relaxed" style={{ color: theme.body }}>
            Two families, one celebration. Join us for an evening of vows and dancing.
          </p>

          <div className="flex flex-col items-center gap-3 pt-4">
            <span
              className="text-[9px] font-medium uppercase tracking-[0.3em]"
              style={{ color: theme.accent }}
            >
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
        </div>
      </div>
    </div>
  );
}
