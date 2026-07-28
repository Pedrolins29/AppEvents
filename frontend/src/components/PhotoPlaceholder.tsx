// A reusable "guests would see your photos here" illustration — line-art, theme-colored, not a
// real photo. No stock-photo library or image-generation tool is available in this environment,
// and using scraped photos of real strangers as fake "customers" isn't acceptable, so every
// photo-related visual across the app uses this same illustrative treatment instead.
interface PhotoPlaceholderProps {
  accentColor: string;
  tintColor: string;
  className?: string;
}

export function PhotoPlaceholder({ accentColor, tintColor, className }: PhotoPlaceholderProps) {
  return (
    <div
      className={`flex aspect-[4/5] w-full items-center justify-center rounded-md ${className ?? ""}`}
      style={{ backgroundColor: tintColor }}
      aria-hidden
    >
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <circle cx="12" cy="14" r="7" stroke={accentColor} strokeWidth="1.4" />
        <circle cx="22" cy="14" r="7" stroke={accentColor} strokeWidth="1.4" />
        <path
          d="M4 30C4 24 8 20 17 20C26 20 30 24 30 30"
          stroke={accentColor}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
