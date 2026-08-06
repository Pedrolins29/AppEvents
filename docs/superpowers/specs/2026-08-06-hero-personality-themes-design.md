# Hero personality themes — design spec

## Context

AppEvents currently ships 6 invitation themes (`elegant`, `minimalist`, `floral`, `modern`, `romantic`, `garden`), all defined as flat-color palettes in `THEME_STYLES` (`frontend/src/components/InvitationHero.tsx`). Comparing our live `/templates/romantic` preview against a reference competitor (matrimonio.pro) surfaced the real gap: their templates are **photo-first**, with each variant giving its cover photo a distinct visual "personality" (vintage newsprint, candlelight, neon glow, wax-seal romance) — ours currently apply the same flat color tint over a photo regardless of theme, so opening any invitation feels the same regardless of which theme was picked. That's the missing "wow" factor.

Investigation found the core photo-hero mechanism already exists: `InvitationHeroContent.tsx` already renders `coverImageUrl` full-bleed with a GSAP Ken-Burns zoom and a theme-colored overlay. What's missing is per-theme differentiation of that photo treatment. This spec covers extending the existing theme system with that differentiation — **not** a folder-per-template rewrite, and **not** a full component-level theming system (Gallery/Countdown/RSVP/Timeline visual presets). Both were proposed and explicitly deferred to their own future specs: the folder-per-template idea would duplicate shared components per template; the full component-preset system would require auditing and refactoring every invitation component's current styling, which hasn't been scoped. This spec stays scoped to the Hero.

Real assets are available: `frontend/public/showcase/prewed.jpg`, `prewed3.jpg`, `prewed4.jpg`, `prewed5.jpg` (plus two spares, `prewed 2.jpg` and `prewed6.jpg`, not used by this spec).

## Goal

Add 4 new `ThemeKey` values — `newspaper`, `candlelight`, `neon`, `seal` — each with a genuinely distinct hero treatment (photo filter + overlay + optional decoration + motif), not just a different accent color.

## Architecture: composable primitives, not per-theme literals

Instead of each theme inlining its own raw CSS filter/gradient strings, extract 4 named registries in `frontend/src/components/InvitationHero.tsx`, and define every theme — the existing 6 as well as the 4 new ones — as a **composition** referencing named entries. This is scoped to the 4 fields that actually repeat *visual concepts* across themes (filter/overlay/decoration/motif); palette colors and font stay per-theme literals, since those are inherently unique per theme, not a reusable primitive.

**Seeded only with what today's 10 themes actually use** — not a larger aspirational catalog. The registry is designed to grow: adding a new theme that wants an existing named entry is free; adding a genuinely new visual treatment means adding one new named entry, still touched in exactly one place.

```ts
// In frontend/src/components/InvitationHero.tsx

export const PHOTO_FILTERS = {
  vintage: "sepia(0.35) contrast(1.15) brightness(0.95)",   // newspaper
  warm: "sepia(0.18) brightness(0.97) contrast(1.05)",       // seal
  dark: "brightness(0.6) saturate(1.15) contrast(1.05)",     // candlelight
  neon: "grayscale(0.3) hue-rotate(220deg) saturate(2.2) brightness(0.65) contrast(1.1)", // neon
} as const;

export const HERO_OVERLAYS = {
  editorial: "linear-gradient(to bottom, rgba(245,239,225,0.78) 0%, rgba(245,239,225,0.35) 40%, rgba(245,239,225,0.15) 100%)", // newspaper
  night: "linear-gradient(to top, rgba(20,12,6,0.75) 0%, rgba(20,12,6,0.35) 45%, rgba(20,12,6,0.05) 100%)",                    // candlelight
  neon: "radial-gradient(circle at 50% 40%, rgba(255,0,200,0.35) 0%, rgba(76,0,130,0.55) 45%, rgba(10,0,20,0.75) 100%)",       // neon
  romantic: "linear-gradient(to bottom, rgba(45,30,20,0.15) 0%, rgba(45,30,20,0.45) 100%)",                                   // seal
} as const;

export type PhotoFilterKey = keyof typeof PHOTO_FILTERS;
export type HeroOverlayKey = keyof typeof HERO_OVERLAYS;
export type DecorationKey = "newspaper" | "waxSeal" | "neonGlow"; // omit the field entirely for "no decoration"
export type MotifKey = "diamond" | "leaf" | "ring" | "glow" | "line" | "rule";
```

`HERO_DECORATIONS` and `MOTIF_RENDERERS` are registries of small render functions (not strings, since a decoration/motif is a bit of JSX, not a CSS value) — same lookup pattern as the two CSS registries above:

```ts
export const HERO_DECORATIONS: Record<DecorationKey, (theme: ThemeStyle) => ReactNode> = {
  newspaper: (theme) => /* thin double-rule border above/below the eyebrow, small-caps, masthead-style */,
  neonGlow: (theme) => /* rounded-rectangle border around the eyebrow+title block, pulsing box-shadow glow */,
  waxSeal: (theme) => /* small circular emblem (concentric ring + center mark) using theme.gold, above the eyebrow */,
};

export const MOTIF_RENDERERS: Record<MotifKey, (accentColor: string) => ReactNode> = {
  diamond: (c) => /* today's line+diamond+line, currently inline in ThemeMotif */,
  leaf: (c) => /* today's Sprig botanical motif */,
  ring: (c) => /* today's modern outlined circle */,
  line: (c) => /* today's minimalist fallback, a single short rule */,
  glow: (c) => /* new: neon's filled glowing dot, soft box-shadow */,
  rule: (c) => /* new: newspaper's double horizontal rule + small square dingbat */,
};
```

`ThemeStyle` changes shape to reference all four registries by key, not by raw string or inline JSX branch:

```ts
export interface ThemeStyle {
  // ...pageBg/sectionBg/heading/body/accent/gold/fontClassName/fontStyle unchanged, still per-theme literals...
  photoFilterKey?: PhotoFilterKey;
  heroOverlayKey?: HeroOverlayKey;
  heroDecoration?: DecorationKey;
  motif: MotifKey; // now required — every theme (old and new) names one explicitly, replacing ThemeMotif's if-chain
}
```

`ThemeMotif({ theme, accentColor })` becomes `MOTIF_RENDERERS[THEME_STYLES[theme].motif](accentColor)` — the if-chain is deleted.

`InvitationHeroContent.tsx` changes:
- The cover `<img>` (`bgImageRef`) gets `style={{ filter: theme.photoFilterKey ? PHOTO_FILTERS[theme.photoFilterKey] : undefined }}`.
- The tint `<div>` switches to `background: theme.heroOverlayKey ? HERO_OVERLAYS[theme.heroOverlayKey] : undefined`, falling back to today's flat `backgroundColor: theme.pageBg` tint when unset (unchanged for all 6 existing themes, which set neither key).
- A new line renders `theme.heroDecoration && HERO_DECORATIONS[theme.heroDecoration](theme)` positioned around the existing eyebrow/title block. `neonGlow`'s pulse is a pure-CSS `@keyframes` in `globals.css` (same `.seal-sheen`/`.phone-scroll` convention: infinite loop + `prefers-reduced-motion` override), not GSAP.
- No changes to the GSAP entrance timeline itself (targets, sequencing, `DURATION.hero` timing).

**Existing 6 themes' migration** (mechanical, no visual change): each gets a `motif` value matching what `ThemeMotif` already renders for it today (`elegant`→`diamond`, `minimalist`→`line`, `floral`→`leaf`, `modern`→`ring`, `romantic`→`diamond`, `garden`→`leaf`). None of them set `photoFilterKey`/`heroOverlayKey`/`heroDecoration` — identical rendered output to today, confirmed in the verification section.

## The 4 personalities

### `newspaper` ("Manchete")
- Photo: `prewed5.jpg` (vintage car, retro fashion — reads as an old print photo)
- `photoFilterKey: "vintage"`, `heroOverlayKey: "editorial"`, `heroDecoration: "newspaper"`, `motif: "rule"`
- Palette: `heading: "#221D16"`, `body: "rgba(34,29,22,0.65)"`, `accent: "#8B2E22"` (newsprint red), `pageBg: "#F5EFE1"`, `gold: "#B08D4C"`
- Font: `playfair.className`, `fontStyle: "normal"` (masthead feel — deliberately not italic, unlike `elegant`/`romantic`)

### `candlelight` ("Velas")
- Photo: `prewed3.jpg` (dramatic backlit sunset embrace)
- `photoFilterKey: "dark"`, `heroOverlayKey: "night"`, `heroDecoration`: unset (no extra decoration — the mood comes from the photo treatment; adding one would clutter it), `motif: "diamond"`
- Palette: `heading: "#F3E9D8"`, `body: "rgba(243,233,216,0.7)"`, `accent: "#D99A4E"`, `pageBg: "#1A120A"`, `gold: "#E0A85C"`
- Font: `cormorant.className`, `fontStyle: "italic"`

### `neon`
- Photo: `prewed4.jpg` (cool-toned dip-kiss against open sky — grades well into vivid color)
- `photoFilterKey: "neon"`, `heroOverlayKey: "neon"`, `heroDecoration: "neonGlow"`, `motif: "glow"`
- Palette: `heading: "#FFFFFF"`, `body: "rgba(255,255,255,0.75)"`, `accent: "#FF3EC9"`, `pageBg: "#12081C"`, `gold: "#4CFFDA"` (repurposed as the glow's secondary/cyan color, not a literal wax-seal gold)
- Font: `spaceGrotesk.className`, `fontStyle: "normal"`

### `seal` ("Lacre & Selo")
- Photo: `prewed.jpg` (pine path, soft golden light)
- `photoFilterKey: "warm"`, `heroOverlayKey: "romantic"`, `heroDecoration: "waxSeal"`, `motif: "diamond"`
- Palette: `heading: "#FBF6EC"`, `body: "rgba(251,246,236,0.75)"`, `accent: "#C9A24B"`, `pageBg: "#2A1F16"`, `gold: "#D4AF37"`
- Font: `playfair.className`, `fontStyle: "italic"`

## Implementation touchpoints (same checklist already established for `romantic`/`garden`)

1. `frontend/src/types/template.ts` — widen `ThemeKey` union with the 4 new values.
2. `frontend/src/components/InvitationHero.tsx` — extend `ThemeStyle` interface; add `PHOTO_FILTERS`, `HERO_OVERLAYS`, `HERO_DECORATIONS`, `MOTIF_RENDERERS` registries; add 4 new `THEME_STYLES` entries plus `motif` values for the existing 6; replace `ThemeMotif`'s if-chain with the `MOTIF_RENDERERS` lookup.
3. `frontend/src/components/InvitationHeroContent.tsx` — resolve `photoFilterKey`/`heroOverlayKey`/`heroDecoration` through the registries as described above; add the `neonGlow` CSS keyframes to `globals.css`.
4. `frontend/src/components/TemplateCard.tsx` — 4 new illustrative branches (thumbnail-style cards for the theme picker), following the existing per-theme hardcoded-markup pattern.
5. `frontend/src/app/templates/[theme]/page.tsx` — add `SAMPLE_NAMES`/`SAMPLE_EVENT_TYPES`/`SAMPLE_ADDRESSES`/`SAMPLE_COVER_IMAGES` entries (cover images point at the 4 `prewed*.jpg` files above).
6. `frontend/src/messages/{pt,en,es}.json` — `templateThemeNames` entries, `templates.themePreview.samples.{newspaper,candlelight,neon,seal}` (description/dressCode/timeline), update every "N themes" copy string (features, howItWorks, templates gallery subtitle/metadata) from 6 → 10.
7. `frontend/src/components/landing/HomeLanding.tsx` — widen `TEMPLATE_THEMES` to 10 entries; change the "Choose your style" grid from `sm:grid-cols-3` to `sm:grid-cols-5` (clean 2-row layout for 10 items).
8. `frontend/src/components/InstantPreview.tsx` — widen `THEME_KEYS` to 10 entries; change the theme-picker grid from `grid-cols-3` to `grid-cols-5` (same reasoning).
9. `frontend/public/showcase/` — no new files needed (reusing `prewed.jpg`, `prewed3.jpg`, `prewed4.jpg`, `prewed5.jpg` as-is).

## Explicitly out of scope

- The folder-per-template "Template Engine" architecture (`templates/casamento/editorial/...`) — considered and rejected in favor of this config-driven extension.
- A full component-level theming system (Gallery/Countdown/RSVP/Timeline/Footer/Button visual presets, typography presets, motion presets, behavior presets, a 17-role palette) — proposed as a follow-up expansion and explicitly deferred: it requires auditing every invitation component's current styling first, none of which is scoped here. This spec only touches the Hero.
- The other 5 event categories (Birthday, Graduation, FifteenYearsParty, BabyShower, GenderReveal) — `ThemeKey` is already orthogonal to `EventType`; no category-specific work is implied here.
- Backend `TemplateRecord` seeding — same known gap already documented for `romantic`/`garden`: these 4 new themes will be fully previewable via `/templates/{theme}` and appear in the landing page's static showcases, but won't appear in the `/templates` gallery grid (backend-driven) until seeded. Not addressed by this spec unless requested separately.
- The new Design System component library (Gift List, Music Player, Guest Book, QR Code) from the original request — a separate, much larger sub-project, not started here.
- New SVG asset files per theme (dividers, ornaments, wax stamps) — not needed; decorations are small hand-authored inline SVGs/CSS, matching the existing repo convention (no icon library, no asset-file convention exists for this).
- A `theme-system/` folder reorganization — the 4 new registries live in the existing `InvitationHero.tsx`, alongside `THEME_STYLES`, which is already this system's established home; moving things into a new directory structure is unrelated to shipping these 4 themes.
- `prewed 2.jpg` (rename to `prewed-2.jpg` before use — space in filename) and `prewed6.jpg` — left as spares for a future 5th/6th personality, not used by this spec.

## Verification

1. `tsc --noEmit` + `eslint` — confirm the widened `ThemeKey` doesn't break exhaustiveness anywhere (same check as `romantic`/`garden`: `TemplateCard.tsx`, `templates/[theme]/page.tsx`'s sample maps, `HomeLanding.tsx`, `InstantPreview.tsx`).
2. Visual check per theme at `/templates/{theme}` for all 4: confirm the photo filter/overlay/decoration render as specified, confirm text stays legible over the photo in all 4 cases (contrast check, especially `neon`'s white text over a busy magenta-graded photo).
3. Confirm the 6 existing themes are visually unchanged (they resolve through the same registries but with the same values `ThemeMotif` already produced for them, and no photo filter/overlay/decoration keys set).
4. `prefers-reduced-motion` check on `neon`'s pulsing glow — confirm it's static (no animation) when reduced motion is on, matching the `.seal-sheen`/`.phone-scroll` convention.
