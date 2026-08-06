import { Cormorant_Garamond, Playfair_Display, Space_Grotesk } from "next/font/google";
import type { ThemeKey } from "@/types/template";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600"], style: ["italic", "normal"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500"], style: ["italic"] });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["700"] });

function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <path d="M4 60C10 40 16 24 32 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="14" cy="46" rx="7" ry="3.2" transform="rotate(-40 14 46)" fill="currentColor" opacity="0.55" />
      <ellipse cx="22" cy="32" rx="7" ry="3.2" transform="rotate(-30 22 32)" fill="currentColor" opacity="0.7" />
      <ellipse cx="29" cy="17" rx="6" ry="2.8" transform="rotate(-15 29 17)" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

interface TemplateCardProps {
  theme: ThemeKey;
  name: string;
}

export function TemplateCard({ theme, name }: TemplateCardProps) {
  if (theme === "elegant") {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm" style={{ backgroundColor: "#17140F" }}>
        <div className="pointer-events-none absolute inset-3 border" style={{ borderColor: "rgba(201,162,75,0.55)" }}>
          <div className="absolute inset-2 border" style={{ borderColor: "rgba(201,162,75,0.25)" }} />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: "#C9A24B" }}>{name}</span>
          <div className="flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: "rgba(201,162,75,0.6)" }} />
            <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
              <path d="M5 0L10 5L5 10L0 5Z" fill="#C9A24B" />
            </svg>
            <span className="h-px w-8" style={{ backgroundColor: "rgba(201,162,75,0.6)" }} />
          </div>
          <h3 className={playfair.className} style={{ color: "#F3EDE0", fontSize: "1.9rem", lineHeight: 1.15, fontStyle: "italic" }}>
            Forever &amp; Always
          </h3>
          <p className="text-xs" style={{ color: "rgba(243,237,224,0.6)" }}>A timeless affair, engraved in gold</p>
        </div>
      </div>
    );
  }

  if (theme === "minimalist") {
    return (
      <div className="relative aspect-[3/4] w-full" style={{ backgroundColor: "#FAFAF7" }}>
        <div className="flex h-full flex-col items-center justify-center gap-6 px-10 text-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.4em]" style={{ color: "#9C8A76" }}>{name}</span>
          <span className="h-px w-10" style={{ backgroundColor: "#9C8A76" }} />
          <h3 className="text-3xl font-light tracking-tight" style={{ color: "#16130F" }}>Less, Said Well</h3>
          <p className="text-xs font-light" style={{ color: "rgba(22,19,15,0.5)" }}>Quiet type. Generous space.</p>
        </div>
      </div>
    );
  }

  if (theme === "floral") {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: "#F8ECE6" }}>
        <div style={{ color: "#7E9473" }}>
          <Sprig className="pointer-events-none absolute -left-2 -top-2 h-16 w-16 rotate-[20deg]" />
          <Sprig className="pointer-events-none absolute -bottom-2 -right-2 h-16 w-16 rotate-[200deg]" />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#C97B63" }}>{name}</span>
          <h3 className={cormorant.className} style={{ fontStyle: "italic", color: "#4A2E28", fontSize: "2.15rem" }}>
            Bloom &amp; Blossom
          </h3>
          <p className="text-xs" style={{ color: "rgba(74,46,40,0.6)" }}>Soft petals, garden light</p>
        </div>
      </div>
    );
  }

  if (theme === "romantic") {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: "#FBF6EC" }}>
        <div className="pointer-events-none absolute inset-3 border" style={{ borderColor: "rgba(184,134,62,0.45)" }}>
          <div className="absolute inset-2 border" style={{ borderColor: "rgba(184,134,62,0.2)" }} />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: "#B8863E" }}>{name}</span>
          <div className="flex items-center gap-3">
            <span className="h-px w-8" style={{ backgroundColor: "rgba(184,134,62,0.5)" }} />
            <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
              <path d="M5 0L10 5L5 10L0 5Z" fill="#B8863E" />
            </svg>
            <span className="h-px w-8" style={{ backgroundColor: "rgba(184,134,62,0.5)" }} />
          </div>
          <h3 className={playfair.className} style={{ color: "#2A2118", fontSize: "1.9rem", lineHeight: 1.15, fontStyle: "italic" }}>
            Golden Afternoon
          </h3>
          <p className="text-xs" style={{ color: "rgba(42,33,24,0.6)" }}>Warm cream, antique gold</p>
        </div>
      </div>
    );
  }

  if (theme === "garden") {
    return (
      <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: "#F4F6EE" }}>
        <div style={{ color: "#7C9473" }}>
          <Sprig className="pointer-events-none absolute -left-2 -top-2 h-16 w-16 rotate-[20deg]" />
          <Sprig className="pointer-events-none absolute -bottom-2 -right-2 h-16 w-16 rotate-[200deg]" />
        </div>
        <div className="relative flex h-full flex-col items-center justify-center gap-6 px-10 text-center">
          <span className="text-[10px] font-medium uppercase tracking-[0.4em]" style={{ color: "#7C9473" }}>{name}</span>
          <span className="h-px w-10" style={{ backgroundColor: "#7C9473" }} />
          <h3 className="text-3xl font-light tracking-tight" style={{ color: "#33402C" }}>Rooted in Love</h3>
          <p className="text-xs font-light" style={{ color: "rgba(51,64,44,0.5)" }}>Botanical. Quiet. Grown with care.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: "#14161F" }}>
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full"
        style={{ border: "10px solid #FF6B4A" }}
      />
      <div className="relative flex h-full flex-col justify-end gap-2 p-6">
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#4C5BFF" }}>{name}</span>
        <h3
          className={spaceGrotesk.className}
          style={{ color: "#FFFFFF", fontSize: "1.65rem", textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1 }}
        >
          Bold / Now
        </h3>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Graphic. Confident. Today.</p>
      </div>
    </div>
  );
}
