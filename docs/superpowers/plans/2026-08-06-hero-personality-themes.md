# Hero Personality Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 new invitation themes (`newspaper`, `candlelight`, `neon`, `seal`) with distinct photo-first Hero treatments, and refactor the Hero's visual customization points (photo filter, overlay, decoration, motif) into named, reusable registries instead of per-theme literals.

**Architecture:** `frontend/src/components/InvitationHero.tsx` gains 4 registries (`PHOTO_FILTERS`, `HERO_OVERLAYS`, `HERO_DECORATIONS`, `MOTIF_RENDERERS`) and an extended `ThemeStyle` interface that references them by key. `InvitationHeroContent.tsx` resolves those keys at render time — no change to its GSAP entrance timeline. The existing 6 themes are migrated onto the same registries (motif only; they set no filter/overlay/decoration, so they render identically to today). `ThemeKey` widens from 6 to 10 values, threading through every place that already enumerates themes (`TemplateCard.tsx`, `templates/[theme]/page.tsx`, `HomeLanding.tsx`, `InstantPreview.tsx`, 3 i18n files).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 (CSS-variable based, no `tailwind.config.*`), next-intl (pt/en/es), plain CSS `@keyframes` for looping motion (not GSAP/Framer — matches this codebase's existing convention for continuous decorative loops, e.g. `.phone-scroll`/`.seal-sheen`).

## Global Constraints

- No automated test framework exists in `frontend/` (confirmed: no Jest/Vitest, no `*.test.*` files, no `"test"` script in `package.json`). Every task's verification step uses `npx tsc --noEmit`, `npx eslint <files>`, and where relevant a concrete HTTP/content check (`curl` against the dev server) — not unit tests. This mirrors the verification approach already used for the `romantic`/`garden` themes earlier in this project.
- Dev server is expected running at `http://localhost:3000` (confirmed reachable). Backend API (`https://localhost:5001`) is reachable but **not used by this plan** — the 4 new themes are frontend-only; the backend `TemplateRecord`/`/api/templates` catalog is explicitly out of scope (per the design spec).
- All new themes reuse existing photo assets already committed under `frontend/public/showcase/` (`prewed.jpg`, `prewed3.jpg`, `prewed4.jpg`, `prewed5.jpg`) — no new image assets, no new npm dependencies, no new Google Font imports (reuse `playfair`/`cormorant`/`spaceGrotesk`, already imported in `InvitationHero.tsx`).
- Design spec: `docs/superpowers/specs/2026-08-06-hero-personality-themes-design.md` — read it for full rationale; this plan implements it verbatim (registry names, hex values, CSS strings, and theme keys below are copied from it).
- Commit after each task, following this repo's existing commit-message convention (imperative, `type: summary`, e.g. `feat: add newspaper/candlelight/neon/seal hero themes`) — this plan uses one commit per task, at the end of each task's steps.

---

### Task 1: Registries, `ThemeStyle` extension, and all 10 `THEME_STYLES` entries

**Files:**
- Modify: `frontend/src/types/template.ts`
- Modify: `frontend/src/components/InvitationHero.tsx`

**Interfaces:**
- Consumes: nothing (foundational task).
- Produces:
  - `ThemeKey` (in `types/template.ts`) = `"elegant" | "minimalist" | "floral" | "modern" | "romantic" | "garden" | "newspaper" | "candlelight" | "neon" | "seal"`.
  - From `InvitationHero.tsx`: `PHOTO_FILTERS: Record<"vintage"|"warm"|"dark"|"neon", string>`, `HERO_OVERLAYS: Record<"editorial"|"night"|"neon"|"romantic", string>`, `PhotoFilterKey`, `HeroOverlayKey`, `DecorationKey = "newspaper"|"waxSeal"|"neonGlow"`, `MotifKey = "diamond"|"leaf"|"ring"|"line"|"glow"|"rule"`, `HERO_DECORATIONS: Record<DecorationKey, (theme: ThemeStyle) => ReactNode>`, `MOTIF_RENDERERS: Record<MotifKey, (accentColor: string) => ReactNode>`, extended `ThemeStyle` interface (adds `photoFilterKey?: PhotoFilterKey`, `heroOverlayKey?: HeroOverlayKey`, `heroDecoration?: DecorationKey`, `motif: MotifKey`), `THEME_STYLES: Record<ThemeKey, ThemeStyle>` with all 10 entries, `ThemeMotif({ theme, accentColor })` component (same call signature as today, new lookup-based implementation).

- [ ] **Step 1: Widen `ThemeKey`**

Edit `frontend/src/types/template.ts`:

```ts
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
```

- [ ] **Step 2: Verify Step 1 compiles (expect new errors elsewhere — that's the point)**

Run: `cd frontend && npx tsc --noEmit -p tsconfig.json`
Expected: FAILS with "not assignable" / missing-property errors pointing at `TemplateCard.tsx`, `templates/[theme]/page.tsx`, and `InvitationHero.tsx`'s `THEME_STYLES` (not yet updated) — this confirms TypeScript is tracking every exhaustiveness point that later tasks must also update.

- [ ] **Step 3: Add `ReactNode` import to `InvitationHero.tsx`**

At the top of `frontend/src/components/InvitationHero.tsx`, change:

```ts
import { Cormorant_Garamond, Playfair_Display, Space_Grotesk } from "next/font/google";
import type { ThemeKey } from "@/types/template";
```

to:

```ts
import { Cormorant_Garamond, Playfair_Display, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import type { ThemeKey } from "@/types/template";
```

- [ ] **Step 4: Add the 4 registries and their key types**

Insert this block into `frontend/src/components/InvitationHero.tsx`, immediately after the font `const` declarations (`const playfair = ...`, `const cormorant = ...`, `const spaceGrotesk = ...`) and before `export interface ThemeStyle`:

```ts
// Named visual primitives shared across themes, so a new theme can reuse an existing filter/
// overlay/decoration/motif instead of repeating its CSS. Seeded only with what today's 10 themes
// actually use — add an entry here (once) when a new theme genuinely needs a new treatment.
export const PHOTO_FILTERS = {
  vintage: "sepia(0.35) contrast(1.15) brightness(0.95)",
  warm: "sepia(0.18) brightness(0.97) contrast(1.05)",
  dark: "brightness(0.6) saturate(1.15) contrast(1.05)",
  neon: "grayscale(0.3) hue-rotate(220deg) saturate(2.2) brightness(0.65) contrast(1.1)",
} as const;

export const HERO_OVERLAYS = {
  editorial:
    "linear-gradient(to bottom, rgba(245,239,225,0.78) 0%, rgba(245,239,225,0.35) 40%, rgba(245,239,225,0.15) 100%)",
  night: "linear-gradient(to top, rgba(20,12,6,0.75) 0%, rgba(20,12,6,0.35) 45%, rgba(20,12,6,0.05) 100%)",
  neon: "radial-gradient(circle at 50% 40%, rgba(255,0,200,0.35) 0%, rgba(76,0,130,0.55) 45%, rgba(10,0,20,0.75) 100%)",
  romantic: "linear-gradient(to bottom, rgba(45,30,20,0.15) 0%, rgba(45,30,20,0.45) 100%)",
} as const;

export type PhotoFilterKey = keyof typeof PHOTO_FILTERS;
export type HeroOverlayKey = keyof typeof HERO_OVERLAYS;
export type DecorationKey = "newspaper" | "waxSeal" | "neonGlow";
export type MotifKey = "diamond" | "leaf" | "ring" | "line" | "glow" | "rule";
```

- [ ] **Step 5: Extend `ThemeStyle` and add `THEME_STYLES` entries for the 6 existing themes' new `motif` field**

Replace the existing `export interface ThemeStyle { ... }` block with:

```ts
export interface ThemeStyle {
  pageBg: string;
  sectionBg: string;
  heading: string;
  body: string;
  accent: string;
  gold?: string; // Optional wax seal color (defaults to accent if not provided)
  fontClassName: string;
  fontStyle: "italic" | "normal";
  photoFilterKey?: PhotoFilterKey;
  heroOverlayKey?: HeroOverlayKey;
  heroDecoration?: DecorationKey;
  motif: MotifKey;
}
```

Then, in the `THEME_STYLES` object, add `motif: "..."` to each of the 6 existing entries (no other field changes — these produce byte-identical rendered output to today, verified in Task 7):

```ts
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
```

(`sectionBg` for the 4 new themes is a lighter/darker variant of `pageBg` following the same pattern as every existing theme — not separately specified in the design spec, derived here consistently: newspaper/seal/candlelight each get a `sectionBg` a few percent lighter than `pageBg`, matching how `elegant`'s `sectionBg` `#1F1A12` relates to its `pageBg` `#17140F`.)

- [ ] **Step 6: Replace `Sprig` + `ThemeMotif` if-chain with `MOTIF_RENDERERS` + `HERO_DECORATIONS`**

Replace the existing `function Sprig(...)` and `export function ThemeMotif(...)` block (everything from `function Sprig` down to the end of `ThemeMotif`'s closing brace) with:

```ts
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

export function ThemeMotif({ theme, accentColor }: { theme: ThemeKey; accentColor: string }) {
  return MOTIF_RENDERERS[THEME_STYLES[theme].motif](accentColor);
}
```

Note: `MOTIF_RENDERERS` is intentionally **not exported** (only `ThemeMotif` and `HERO_DECORATIONS` are consumed outside this file, per Task 3's needs) — keeps the module's public surface exactly as large as callers need.

- [ ] **Step 7: Verify**

Run: `cd frontend && npx tsc --noEmit -p tsconfig.json`
Expected: Still FAILS (Task 1 alone doesn't fix `TemplateCard.tsx`/`templates/[theme]/page.tsx` — that's Tasks 3–4), but the errors should now be **only** in those two files, not in `InvitationHero.tsx` itself. Confirm by running:

Run: `cd frontend && npx eslint src/components/InvitationHero.tsx src/types/template.ts`
Expected: PASS (no lint errors) — this file's own syntax/types are self-consistent even though downstream consumers aren't updated yet.

- [ ] **Step 8: Commit**

```bash
cd "c:\Users\pedro.correa.lins\Souce\AppEvents" && git add frontend/src/types/template.ts frontend/src/components/InvitationHero.tsx && git commit -m "feat: add hero theme registries and 4 new theme definitions"
```

---

### Task 2: `InvitationHeroContent.tsx` rendering + `globals.css` neon-glow animation

**Files:**
- Modify: `frontend/src/components/InvitationHeroContent.tsx`
- Modify: `frontend/src/app/globals.css`

**Interfaces:**
- Consumes: `PHOTO_FILTERS`, `HERO_OVERLAYS`, `HERO_DECORATIONS` (from Task 1's `InvitationHero.tsx`), `ThemeStyle.photoFilterKey`/`heroOverlayKey`/`heroDecoration`.
- Produces: cover image respects `photoFilterKey`; overlay respects `heroOverlayKey` (falls back to today's flat `pageBg` tint); decoration renders inside the existing `decorationRef` (alongside the motif, so it animates in the same GSAP fade as today — no new refs, no timeline changes); `.hero-neon-glow` CSS class + `@keyframes hero-neon-pulse` in `globals.css`, with a `prefers-reduced-motion` override.

- [ ] **Step 1: Update imports**

In `frontend/src/components/InvitationHeroContent.tsx`, change:

```ts
import { ThemeMotif, type ThemeStyle } from "@/components/InvitationHero";
```

to:

```ts
import { HERO_DECORATIONS, HERO_OVERLAYS, PHOTO_FILTERS, ThemeMotif, type ThemeStyle } from "@/components/InvitationHero";
```

- [ ] **Step 2: Apply the photo filter and overlay**

Replace the existing cover-image block:

```tsx
{coverImageUrl ? (
  <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img ref={bgImageRef} src={coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0" style={{ backgroundColor: theme.pageBg, opacity: 0.55 }} />
  </>
) : (
  <div className="absolute inset-0" style={{ backgroundColor: theme.pageBg }} />
)}
```

with:

```tsx
{coverImageUrl ? (
  <>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      ref={bgImageRef}
      src={coverImageUrl}
      alt=""
      className="absolute inset-0 h-full w-full object-cover"
      style={{ filter: theme.photoFilterKey ? PHOTO_FILTERS[theme.photoFilterKey] : undefined }}
    />
    <div
      className="absolute inset-0"
      style={
        theme.heroOverlayKey
          ? { background: HERO_OVERLAYS[theme.heroOverlayKey] }
          : { backgroundColor: theme.pageBg, opacity: 0.55 }
      }
    />
  </>
) : (
  <div className="absolute inset-0" style={{ backgroundColor: theme.pageBg }} />
)}
```

- [ ] **Step 3: Render the decoration alongside the motif, inside `decorationRef`**

Replace:

```tsx
<div
  ref={decorationRef}
  className="opacity-0 -translate-y-2 motion-reduce:opacity-100 motion-reduce:translate-y-0"
>
  <ThemeMotif theme={themeKey} accentColor={theme.accent} />
</div>
```

with:

```tsx
<div
  ref={decorationRef}
  className="flex flex-col items-center gap-2 opacity-0 -translate-y-2 motion-reduce:opacity-100 motion-reduce:translate-y-0"
>
  {theme.heroDecoration && <div aria-hidden>{HERO_DECORATIONS[theme.heroDecoration](theme)}</div>}
  <ThemeMotif theme={themeKey} accentColor={theme.accent} />
</div>
```

- [ ] **Step 4: Add the neon-glow CSS animation**

In `frontend/src/app/globals.css`, add this block immediately after the existing `.seal-sheen { animation: seal-sheen 4s ease-in-out infinite; }` rule (before the `.invitation-scroll` section):

```css
/* Neon hero decoration: pulsing glow, used only by the `neon` theme's heroDecoration. Color is
   hardcoded to that theme's accent (#FF3EC9) rather than parameterized via a CSS custom property —
   only one theme uses this today; generalize if a second neon-family theme needs a different hue. */
@keyframes hero-neon-pulse {
  0%,
  100% {
    box-shadow: 0 0 10px 2px rgba(255, 62, 201, 0.6);
  }
  50% {
    box-shadow: 0 0 22px 6px rgba(255, 62, 201, 0.9);
  }
}

.hero-neon-glow {
  animation: hero-neon-pulse 2.2s ease-in-out infinite;
}
```

Then add `.hero-neon-glow { animation: none; }` inside the existing `@media (prefers-reduced-motion: reduce) { ... }` block (alongside `.phone-scroll`, `.seal-sheen`, `.testimonial-marquee-track`).

- [ ] **Step 5: Verify**

Run: `cd frontend && npx tsc --noEmit -p tsconfig.json`
Expected: Still FAILS in `TemplateCard.tsx`/`templates/[theme]/page.tsx` only (unchanged from Task 1's Step 7) — `InvitationHeroContent.tsx` itself must now compile cleanly.

Run: `cd frontend && npx eslint src/components/InvitationHeroContent.tsx src/app/globals.css`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd "c:\Users\pedro.correa.lins\Souce\AppEvents" && git add frontend/src/components/InvitationHeroContent.tsx frontend/src/app/globals.css && git commit -m "feat: render hero photo filter, overlay, and decoration from theme registries"
```

---

### Task 3: `TemplateCard.tsx` — 4 new illustrative branches

**Files:**
- Modify: `frontend/src/components/TemplateCard.tsx`

**Interfaces:**
- Consumes: `ThemeKey` (from Task 1).
- Produces: `TemplateCard({ theme, name })` renders a distinct illustrative card for all 10 `ThemeKey` values (previously 6; the `modern`-branch fallback at the end must remain reachable only for `theme === "modern"`).

- [ ] **Step 1: Add 4 new `if` branches before the existing final fallback**

In `frontend/src/components/TemplateCard.tsx`, insert this block immediately before the final `return (\n    <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: "#14161F" }}>` (the `modern` fallback block):

```tsx
if (theme === "newspaper") {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: "#F5EFE1" }}>
      <div className="pointer-events-none absolute inset-3 flex flex-col justify-between">
        <span className="h-px w-full" style={{ backgroundColor: "#8B2E22" }} />
        <span className="h-px w-full" style={{ backgroundColor: "#8B2E22" }} />
      </div>
      <div className="relative flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: "#8B2E22" }}>{name}</span>
        <h3 className={playfair.className} style={{ color: "#221D16", fontSize: "1.75rem", lineHeight: 1.15 }}>
          Read All About It
        </h3>
        <p className="text-xs" style={{ color: "rgba(34,29,22,0.6)" }}>Vintage print, breaking news</p>
      </div>
    </div>
  );
}

if (theme === "candlelight") {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: "#1A120A" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 65%, rgba(217,154,78,0.25) 0%, transparent 60%)" }}
      />
      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#D99A4E" }}>{name}</span>
        <h3 className={cormorant.className} style={{ fontStyle: "italic", color: "#F3E9D8", fontSize: "2.1rem" }}>
          By Candlelight
        </h3>
        <p className="text-xs" style={{ color: "rgba(243,233,216,0.6)" }}>Low light, big love</p>
      </div>
    </div>
  );
}

if (theme === "neon") {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: "#12081C" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,0,200,0.3) 0%, rgba(76,0,130,0.4) 50%, transparent 80%)" }}
      />
      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <div
          className="rounded-sm px-4 py-2"
          style={{ border: "2px solid #FF3EC9", boxShadow: "0 0 16px 2px rgba(255,62,201,0.6)" }}
        >
          <span className={spaceGrotesk.className} style={{ color: "#FF3EC9", fontSize: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {name}
          </span>
        </div>
        <h3 className={spaceGrotesk.className} style={{ color: "#FFFFFF", fontSize: "1.4rem", textTransform: "uppercase", lineHeight: 1.1 }}>
          Tonight We Glow
        </h3>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Vivid. Loud. Alive.</p>
      </div>
    </div>
  );
}

if (theme === "seal") {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: "#2A1F16" }}>
      <div
        className="pointer-events-none absolute left-1/2 top-6 h-9 w-9 -translate-x-1/2 rounded-full"
        style={{ border: "1.5px solid #D4AF37" }}
        aria-hidden
      >
        <span
          className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: "#D4AF37" }}
        />
      </div>
      <div className="relative flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="text-[10px] uppercase tracking-[0.35em]" style={{ color: "#C9A24B" }}>{name}</span>
        <h3 className={playfair.className} style={{ color: "#FBF6EC", fontSize: "1.9rem", lineHeight: 1.15, fontStyle: "italic" }}>
          Sealed With Love
        </h3>
        <p className="text-xs" style={{ color: "rgba(251,246,236,0.6)" }}>Classic romance, wax and gold</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `cd frontend && npx tsc --noEmit -p tsconfig.json`
Expected: Still FAILS only in `templates/[theme]/page.tsx` (Task 4) — `TemplateCard.tsx` must now compile with no theme-related errors.

Run: `cd frontend && npx eslint src/components/TemplateCard.tsx`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
cd "c:\Users\pedro.correa.lins\Souce\AppEvents" && git add frontend/src/components/TemplateCard.tsx && git commit -m "feat: add TemplateCard illustrations for the 4 new themes"
```

---

### Task 4: i18n content for the 4 new themes (pt/en/es)

**Files:**
- Modify: `frontend/src/messages/pt.json`
- Modify: `frontend/src/messages/en.json`
- Modify: `frontend/src/messages/es.json`

**Interfaces:**
- Consumes: nothing (content-only task).
- Produces: `templateThemeNames.{newspaper,candlelight,neon,seal}`, `templates.themePreview.samples.{newspaper,candlelight,neon,seal}` (each with `description`, `dressCode`, `timeline`) in all 3 locale files. Also updates every "N themes" copy string (`templates.gallery.subtitle`, `templates.metadata.description`, `landing.features[0]`, `landing.howItWorks.steps[0].body`) from 6 → 10, consistent with the same pattern already used when `romantic`/`garden` were added.

- [ ] **Step 1: `pt.json` — add theme names**

In `frontend/src/messages/pt.json`, find the `templateThemeNames` object (currently ending with `"garden": "Jardim"`) and change it to:

```json
"templateThemeNames": {
  "elegant": "Elegante",
  "minimalist": "Minimalista",
  "floral": "Floral",
  "modern": "Moderno",
  "romantic": "Romântico",
  "garden": "Jardim",
  "newspaper": "Manchete",
  "candlelight": "Velas",
  "neon": "Neon",
  "seal": "Lacre & Selo"
}
```

(Read the file first to get the exact surrounding keys/values for `elegant` through `garden` — do not guess them; copy verbatim, only appending the 4 new entries.)

- [ ] **Step 2: `pt.json` — add `themePreview.samples` entries**

Inside `templates.themePreview.samples`, immediately after the existing `"garden": { ... }` entry (added when `romantic`/`garden` were built), add:

```json
"newspaper": {
  "description": "Notícia quente saindo do forno: Laura e Vicente vão se casar! Venha celebrar essa manchete com a gente.",
  "dressCode": "Traje social, tons clássicos",
  "timeline": [
    { "time": "17:00", "label": "Cerimônia" },
    { "time": "18:00", "label": "Sessão de fotos" },
    { "time": "19:00", "label": "Jantar" },
    { "time": "21:00", "label": "Festa" }
  ]
},
"candlelight": {
  "description": "À luz de velas, começamos um novo capítulo. Junte-se a nós numa noite intimista, cheia de amor.",
  "dressCode": "Traje a rigor, tons escuros",
  "timeline": [
    { "time": "19:00", "label": "Cerimônia" },
    { "time": "20:00", "label": "Jantar à luz de velas" },
    { "time": "22:00", "label": "Baile" }
  ]
},
"neon": {
  "description": "O letreiro vai acender! Vem com a gente pra uma noite neon, cheia de luz, música e muita festa.",
  "dressCode": "Traje de festa, aposte em cores vibrantes",
  "timeline": [
    { "time": "20:00", "label": "Abertura" },
    { "time": "21:00", "label": "Jantar" },
    { "time": "23:00", "label": "Pista aberta" }
  ]
},
"seal": {
  "description": "Vamos nos casar! Um convite lacrado com carinho, guardando a promessa do nosso “para sempre”.",
  "dressCode": "Esporte fino, tons neutros",
  "timeline": [
    { "time": "16:00", "label": "Cerimônia" },
    { "time": "17:00", "label": "Recepção" },
    { "time": "18:30", "label": "Jantar" },
    { "time": "20:30", "label": "Festa" }
  ]
}
```

- [ ] **Step 3: `pt.json` — update "N themes" copy from six to ten**

Three edits in `frontend/src/messages/pt.json`:

- `templates.gallery.subtitle`: `"Seis temas exclusivos — escolha um e deixe com a sua cara."` → `"Dez temas exclusivos — escolha um e deixe com a sua cara."`
- `templates.metadata.description`: `"Seis temas de convite exclusivos — Elegante, Minimalista, Floral, Moderno, Romântico e Jardim. Escolha um e deixe com a sua cara."` → `"Dez temas de convite exclusivos — Elegante, Minimalista, Floral, Moderno, Romântico, Jardim, Manchete, Velas, Neon e Lacre & Selo. Escolha um e deixe com a sua cara."`
- `landing.features[0]`: `"title": "Seis temas exclusivos"` → `"title": "Dez temas exclusivos"`, and `"body": "Elegante, Minimalista, Floral, Moderno, Romântico ou Jardim — cada um com sua própria tipografia, cor e estilo. Escolha o que mais combina com seu evento."` → `"body": "Elegante, Minimalista, Floral, Moderno, Romântico, Jardim, Manchete, Velas, Neon ou Lacre & Selo — cada um com sua própria tipografia, cor e estilo. Escolha o que mais combina com seu evento."`
- `landing.howItWorks.steps[0].body`: `"Elegante, Minimalista, Floral, Moderno, Romântico ou Jardim — escolha o que mais combina com seu evento."` → `"Elegante, Minimalista, Floral, Moderno, Romântico, Jardim, Manchete, Velas, Neon ou Lacre & Selo — escolha o que mais combina com seu evento."`

- [ ] **Step 4: `en.json` — repeat Steps 1–3 with English content**

`templateThemeNames` additions: `"newspaper": "Headline", "candlelight": "Candlelight", "neon": "Neon", "seal": "Wax Seal"`.

`themePreview.samples` additions:

```json
"newspaper": {
  "description": "Hot off the press: Laura and Vicente are getting married! Come celebrate the headline with us.",
  "dressCode": "Formal, classic tones",
  "timeline": [
    { "time": "17:00", "label": "Ceremony" },
    { "time": "18:00", "label": "Photo session" },
    { "time": "19:00", "label": "Dinner" },
    { "time": "21:00", "label": "Party" }
  ]
},
"candlelight": {
  "description": "By candlelight, we begin a new chapter. Join us for an intimate evening full of love.",
  "dressCode": "Black tie, dark tones",
  "timeline": [
    { "time": "19:00", "label": "Ceremony" },
    { "time": "20:00", "label": "Candlelit dinner" },
    { "time": "22:00", "label": "Dancing" }
  ]
},
"neon": {
  "description": "The sign's about to light up! Join us for a neon night full of light, music, and celebration.",
  "dressCode": "Party attire, go bold with color",
  "timeline": [
    { "time": "20:00", "label": "Doors open" },
    { "time": "21:00", "label": "Dinner" },
    { "time": "23:00", "label": "Dance floor opens" }
  ]
},
"seal": {
  "description": "We're getting married! A lovingly sealed invitation, holding the promise of our forever.",
  "dressCode": "Smart casual, neutral tones",
  "timeline": [
    { "time": "16:00", "label": "Ceremony" },
    { "time": "17:00", "label": "Reception" },
    { "time": "18:30", "label": "Dinner" },
    { "time": "20:30", "label": "Party" }
  ]
}
```

"N themes" copy: `templates.gallery.subtitle` "Six hand-designed themes..." → "Ten hand-designed themes..."; `templates.metadata.description` list → "Elegant, Minimalist, Floral, Modern, Romantic, Garden, Headline, Candlelight, Neon, and Wax Seal."; `landing.features[0].title` "Six designer themes" → "Ten designer themes", body list updated the same way; `landing.howItWorks.steps[0].body` list updated the same way.

- [ ] **Step 5: `es.json` — repeat Steps 1–3 with Spanish content**

`templateThemeNames` additions: `"newspaper": "Titular", "candlelight": "Velas", "neon": "Neón", "seal": "Lacre y Sello"`.

`themePreview.samples` additions:

```json
"newspaper": {
  "description": "Noticia de última hora: ¡Laura y Vicente se casan! Ven a celebrar este titular con nosotros.",
  "dressCode": "Formal, tonos clásicos",
  "timeline": [
    { "time": "17:00", "label": "Ceremonia" },
    { "time": "18:00", "label": "Sesión de fotos" },
    { "time": "19:00", "label": "Cena" },
    { "time": "21:00", "label": "Fiesta" }
  ]
},
"candlelight": {
  "description": "A la luz de las velas, comenzamos un nuevo capítulo. Únete a nosotros en una noche íntima, llena de amor.",
  "dressCode": "Etiqueta rigurosa, tonos oscuros",
  "timeline": [
    { "time": "19:00", "label": "Ceremonia" },
    { "time": "20:00", "label": "Cena a la luz de las velas" },
    { "time": "22:00", "label": "Baile" }
  ]
},
"neon": {
  "description": "¡El letrero se va a encender! Ven con nosotros a una noche neón, llena de luz, música y fiesta.",
  "dressCode": "Traje de fiesta, apuesta por colores vibrantes",
  "timeline": [
    { "time": "20:00", "label": "Apertura" },
    { "time": "21:00", "label": "Cena" },
    { "time": "23:00", "label": "Pista abierta" }
  ]
},
"seal": {
  "description": "¡Nos casamos! Una invitación lacrada con cariño, guardando la promesa de nuestro “para siempre”.",
  "dressCode": "Formal casual, tonos neutros",
  "timeline": [
    { "time": "16:00", "label": "Ceremonia" },
    { "time": "17:00", "label": "Recepción" },
    { "time": "18:30", "label": "Cena" },
    { "time": "20:30", "label": "Fiesta" }
  ]
}
```

"N themes" copy: `templates.gallery.subtitle` "Seis temas exclusivos..." → "Diez temas exclusivos..."; `templates.metadata.description` list updated to include "Manchete/Titular, Velas, Neón, Lacre y Sello" (use `Titular` for newspaper here to match the ES theme name); `landing.features[0].title` "Seis plantillas exclusivas" → "Diez plantillas exclusivas", body list updated; `landing.howItWorks.steps[0].body` list updated.

- [ ] **Step 6: Verify JSON validity**

Run:
```bash
cd frontend/src/messages && node -e "JSON.parse(require('fs').readFileSync('pt.json','utf8')); JSON.parse(require('fs').readFileSync('en.json','utf8')); JSON.parse(require('fs').readFileSync('es.json','utf8')); console.log('all valid JSON')"
```
Expected: prints `all valid JSON`.

- [ ] **Step 7: Commit**

```bash
cd "c:\Users\pedro.correa.lins\Souce\AppEvents" && git add frontend/src/messages/pt.json frontend/src/messages/en.json frontend/src/messages/es.json && git commit -m "feat: add pt/en/es content for the 4 new hero themes"
```

---

### Task 5: `templates/[theme]/page.tsx` sample-content maps

**Files:**
- Modify: `frontend/src/app/templates/[theme]/page.tsx`

**Interfaces:**
- Consumes: `ThemeKey` (Task 1), `templateThemeNames`/`themePreview.samples.{newspaper,candlelight,neon,seal}` (Task 4).
- Produces: `/templates/newspaper`, `/templates/candlelight`, `/templates/neon`, `/templates/seal` all render without runtime errors, using real sample content and one of the 4 `prewed*.jpg` cover images each.

- [ ] **Step 1: Add entries to all 4 `SAMPLE_*` maps**

In `frontend/src/app/templates/[theme]/page.tsx`, extend each `Record<ThemeKey, ...>`:

```ts
const SAMPLE_NAMES: Record<ThemeKey, string> = {
  elegant: "Isabella & Marco",
  minimalist: "Maya's Graduation",
  floral: "Welcome, Baby Rose",
  modern: "Alex's 30th Birthday",
  romantic: "Sofia & Rafael",
  garden: "Baby Aria's Reveal",
  newspaper: "Laura & Vicente",
  candlelight: "Renata & Gustavo",
  neon: "Jade & Kaique",
  seal: "Helena & Noah",
};

const SAMPLE_EVENT_TYPES: Record<ThemeKey, EventType> = {
  elegant: "Wedding",
  minimalist: "Graduation",
  floral: "BabyShower",
  modern: "Birthday",
  romantic: "Wedding",
  garden: "GenderReveal",
  newspaper: "Wedding",
  candlelight: "Wedding",
  neon: "Wedding",
  seal: "Wedding",
};

const SAMPLE_ADDRESSES: Record<ThemeKey, string> = {
  elegant: "The Grand Pavilion, Lisbon",
  minimalist: "University Hall, Austin",
  floral: "The Garden Room, Portland",
  modern: "Skyline Loft, Chicago",
  romantic: "Quinta das Oliveiras, Sintra",
  garden: "Botanical Garden, Curitiba",
  newspaper: "Clube Literário, Porto Alegre",
  candlelight: "Casarão Vale Verde, Petrópolis",
  neon: "Club Elétrico, Vila Madalena, São Paulo",
  seal: "Vinícola Villa Toscana, Bento Gonçalves",
};

const SAMPLE_COVER_IMAGES: Record<ThemeKey, string | null> = {
  elegant: "/showcase/wedding-rose.jpg",
  minimalist: "/showcase/graduation.jpg",
  floral: "/showcase/babyshower-farm.jpg",
  modern: null,
  romantic: null,
  garden: null,
  newspaper: "/showcase/prewed5.jpg",
  candlelight: "/showcase/prewed3.jpg",
  neon: "/showcase/prewed4.jpg",
  seal: "/showcase/prewed.jpg",
};
```

- [ ] **Step 2: Verify TypeScript is now fully clean**

Run: `cd frontend && npx tsc --noEmit -p tsconfig.json`
Expected: PASS with **no output** — this is the point where every `Record<ThemeKey, ...>` in the codebase has been extended and the whole project compiles cleanly again (Tasks 1, 3, and this task together closed every error introduced by Task 1 Step 1).

Run: `cd frontend && npx eslint src/app/templates/\[theme\]/page.tsx`
Expected: PASS.

- [ ] **Step 3: Visual/content check against the running dev server**

Run:
```bash
curl -s -m 10 "http://localhost:3000/templates/newspaper" | grep -o "Laura" | head -1
curl -s -m 10 "http://localhost:3000/templates/candlelight" | grep -o "Renata" | head -1
curl -s -m 10 "http://localhost:3000/templates/neon" | grep -o "Jade" | head -1
curl -s -m 10 "http://localhost:3000/templates/seal" | grep -o "Helena" | head -1
```
Expected: each command prints the matched name (confirms the page renders server-side with the right sample data, no crash). If any prints nothing, `curl -s -m 10 "http://localhost:3000/templates/<theme>"` alone and inspect the response for a Next.js error page/stack trace.

- [ ] **Step 4: Commit**

```bash
cd "c:\Users\pedro.correa.lins\Souce\AppEvents" && git add "frontend/src/app/templates/[theme]/page.tsx" && git commit -m "feat: add templates/[theme] sample content for the 4 new themes"
```

---

### Task 6: Widen theme pickers in `HomeLanding.tsx` and `InstantPreview.tsx`

**Files:**
- Modify: `frontend/src/components/landing/HomeLanding.tsx`
- Modify: `frontend/src/components/InstantPreview.tsx`

**Interfaces:**
- Consumes: `ThemeKey` (Task 1), `templateThemeNames` (Task 4).
- Produces: both theme-picker UIs list all 10 themes.

- [ ] **Step 1: `HomeLanding.tsx` — widen `TEMPLATE_THEMES` and grid columns**

Change:

```ts
const TEMPLATE_THEMES: ThemeKey[] = ["elegant", "minimalist", "floral", "modern", "romantic", "garden"];
```

to:

```ts
const TEMPLATE_THEMES: ThemeKey[] = [
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
```

Change the "Choose your style" grid:

```tsx
<div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
  {TEMPLATE_THEMES.map((theme, i) => (
```

to:

```tsx
<div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
  {TEMPLATE_THEMES.map((theme, i) => (
```

- [ ] **Step 2: `InstantPreview.tsx` — widen `THEME_KEYS` and grid columns**

Change:

```ts
const THEME_KEYS: ThemeKey[] = ["elegant", "minimalist", "floral", "modern", "romantic", "garden"];
```

to:

```ts
const THEME_KEYS: ThemeKey[] = [
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
```

Change:

```tsx
<div className="grid grid-cols-3 gap-2">
  {THEME_KEYS.map((key) => (
```

to:

```tsx
<div className="grid grid-cols-5 gap-2">
  {THEME_KEYS.map((key) => (
```

- [ ] **Step 3: Verify**

Run: `cd frontend && npx tsc --noEmit -p tsconfig.json`
Expected: PASS, no output.

Run: `cd frontend && npx eslint src/components/landing/HomeLanding.tsx src/components/InstantPreview.tsx`
Expected: PASS.

Run:
```bash
curl -s -m 10 "http://localhost:3000/" > /tmp/home2.html
for name in "Manchete" "Velas" "Neon" "Lacre"; do
  grep -q "$name" /tmp/home2.html && echo "found: $name" || echo "MISSING: $name"
done
```
Expected: all 4 print `found:`.

- [ ] **Step 4: Commit**

```bash
cd "c:\Users\pedro.correa.lins\Souce\AppEvents" && git add frontend/src/components/landing/HomeLanding.tsx frontend/src/components/InstantPreview.tsx && git commit -m "feat: expand landing and instant-preview theme pickers to 10 themes"
```

---

### Task 7: Final verification pass

**Files:** none (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1–6.
- Produces: a confirmed-working, confirmed-scoped feature.

- [ ] **Step 1: Full project typecheck and lint**

Run: `cd frontend && npx tsc --noEmit -p tsconfig.json`
Expected: PASS, no output.

Run: `cd frontend && npx eslint src`
Expected: PASS, no output (full-project lint, not just the touched files — catches anything Task-by-task file-scoped lint runs might have missed).

- [ ] **Step 2: Confirm the 6 existing themes render unchanged**

Run:
```bash
curl -s -m 10 "http://localhost:3000/templates/elegant" | grep -o "Forever" | head -1
curl -s -m 10 "http://localhost:3000/templates/minimalist" | grep -o "Less, Said Well" | head -1
```
Expected: both print a match — confirms `TemplateCard`'s pre-existing branches for `elegant`/`minimalist` are untouched and still reachable (i.e., the new `if` branches inserted in Task 3 didn't accidentally shadow or reorder existing ones).

- [ ] **Step 3: Confirm reduced-motion coverage**

Run: `grep -A2 "prefers-reduced-motion: reduce" frontend/src/app/globals.css`
Expected: the block includes `.hero-neon-glow { animation: none; }` alongside `.phone-scroll`, `.seal-sheen`, `.testimonial-marquee-track`.

- [ ] **Step 4: Confirm scope — no unrelated files touched**

Run: `cd "c:\Users\pedro.correa.lins\Souce\AppEvents" && git status --porcelain`
Expected: no changes outside the files listed in Tasks 1–6 (plus this plan/spec doc under `docs/`). In particular, confirm no changes to: `frontend/src/lib/templatesApi.ts`, any `backend/` file, `frontend/src/components/landing/SalesLanding.tsx`, any dashboard/`#0F766E` file — all explicitly out of scope per the design spec.

- [ ] **Step 5: Exhaustiveness grep — confirm no other hardcoded 4/6-theme array was missed**

Run:
```bash
cd "c:\Users\pedro.correa.lins\Souce\AppEvents\frontend\src" && grep -rn "elegant.*minimalist.*floral.*modern" --include="*.ts" --include="*.tsx"
```
Expected: matches only in `types/template.ts` (the `ThemeKey` union, now with all 10), `HomeLanding.tsx`, and `InstantPreview.tsx` — the same 3 files already updated. If a 4th file appears, add it as a follow-up task before considering this plan done (this is exactly how `InstantPreview.tsx` was discovered as a second hardcoded array during the `romantic`/`garden` work — worth re-checking every time).

- [ ] **Step 6: No commit needed** (verification-only task; if Step 5 finds a gap, fix it, verify, and commit as a follow-up).
