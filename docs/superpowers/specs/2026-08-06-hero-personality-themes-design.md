# Hero personality themes — design spec

## Context

AppEvents currently ships 6 invitation themes (`elegant`, `minimalist`, `floral`, `modern`, `romantic`, `garden`), all defined as flat-color palettes in `THEME_STYLES` (`frontend/src/components/InvitationHero.tsx`). Comparing our live `/templates/romantic` preview against a reference competitor (matrimonio.pro) surfaced the real gap: their templates are **photo-first**, with each variant giving its cover photo a distinct visual "personality" (vintage newsprint, candlelight, neon glow, wax-seal romance) — ours currently apply the same flat color tint over a photo regardless of theme, so opening any invitation feels the same regardless of which theme was picked. That's the missing "wow" factor.

Investigation found the core photo-hero mechanism already exists: `InvitationHeroContent.tsx` already renders `coverImageUrl` full-bleed with a GSAP Ken-Burns zoom and a theme-colored overlay. What's missing is per-theme differentiation of that photo treatment. This spec covers extending the existing theme system with that differentiation — **not** a folder-per-template rewrite (that idea was explicitly considered and rejected as premature: it would require duplicating shared components like RSVP/Countdown/Gallery per template, contradicting the "never duplicate business logic" goal it was proposed alongside, and the current 6-theme config-driven system already satisfies "customize presentation without duplicating components").

Real assets are available: `frontend/public/showcase/prewed.jpg`, `prewed3.jpg`, `prewed4.jpg`, `prewed5.jpg` (plus two spares, `prewed 2.jpg` and `prewed6.jpg`, not used by this spec).

## Goal

Add 4 new `ThemeKey` values — `newspaper`, `candlelight`, `neon`, `seal` — each with a genuinely distinct hero treatment (photo filter + overlay + optional decorative frame), not just a different accent color.

## Architecture

Extend `ThemeStyle` (`frontend/src/components/InvitationHero.tsx`) with three new **optional** fields (existing 6 themes leave them undefined, so this is additive — no behavior change for existing themes):

```ts
export interface ThemeStyle {
  // ...existing fields unchanged...
  photoFilter?: string;          // CSS `filter` value applied to the cover <img>
  heroOverlayGradient?: string;  // CSS `background` gradient, replaces the flat pageBg tint when set
  heroFrame?: "newspaper" | "neonGlow" | "seal"; // optional extra decorative layer
}
```

`InvitationHeroContent.tsx` changes:
- The cover `<img>` (`bgImageRef`) gets `style={{ filter: theme.photoFilter }}` when set.
- The tint `<div>` currently rendered as `backgroundColor: theme.pageBg, opacity: 0.55` switches to `background: theme.heroOverlayGradient` when that field is set (falls back to today's flat tint otherwise).
- A new conditional block renders one of three small decorative pieces based on `theme.heroFrame`, positioned around the existing eyebrow/title block:
  - `"newspaper"`: a thin double-rule border (two horizontal lines, ~4px apart) above and below the eyebrow, small-caps, masthead-style.
  - `"neonGlow"`: a rounded-rectangle border wrapping the eyebrow+title block with a pulsing `box-shadow` glow — pure CSS `@keyframes` (added to `globals.css`, following the existing `.seal-sheen`/`.phone-scroll` convention: infinite loop + `prefers-reduced-motion` override), not GSAP.
  - `"seal"`: a small circular emblem (concentric ring + tiny center mark, using `theme.gold`) rendered above the eyebrow.
- No changes to the GSAP entrance timeline itself (targets, sequencing, `DURATION.hero` timing) — the new pieces animate in as part of the existing `decorationRef`/`eyebrowRef` fade-up, no new refs needed for `newspaper`/`seal`. `neonGlow`'s pulse is a separate, always-running CSS loop independent of the entrance sequence (same pattern as `.seal-sheen`).

## The 4 personalities

### `newspaper` ("Manchete")
- Photo: `prewed5.jpg` (vintage car, retro fashion — reads as an old print photo)
- `photoFilter: "sepia(0.35) contrast(1.15) brightness(0.95)"`
- `heroOverlayGradient: "linear-gradient(to bottom, rgba(245,239,225,0.78) 0%, rgba(245,239,225,0.35) 40%, rgba(245,239,225,0.15) 100%)"`
- `heroFrame: "newspaper"`
- Palette: `heading: "#221D16"`, `body: "rgba(34,29,22,0.65)"`, `accent: "#8B2E22"` (newsprint red), `pageBg: "#F5EFE1"`, `gold: "#B08D4C"`
- Font: `playfair.className`, `fontStyle: "normal"` (masthead feel — deliberately not italic, unlike `elegant`/`romantic`)

### `candlelight` ("Velas")
- Photo: `prewed3.jpg` (dramatic backlit sunset embrace)
- `photoFilter: "brightness(0.6) saturate(1.15) contrast(1.05)"`
- `heroOverlayGradient: "linear-gradient(to top, rgba(20,12,6,0.75) 0%, rgba(20,12,6,0.35) 45%, rgba(20,12,6,0.05) 100%)"`
- `heroFrame: undefined` (no extra frame — the mood comes from the photo treatment; adding a frame would clutter it)
- Palette: `heading: "#F3E9D8"`, `body: "rgba(243,233,216,0.7)"`, `accent: "#D99A4E"`, `pageBg: "#1A120A"`, `gold: "#E0A85C"`
- Font: `cormorant.className`, `fontStyle: "italic"`

### `neon`
- Photo: `prewed4.jpg` (cool-toned dip-kiss against open sky — grades well into vivid color)
- `photoFilter: "grayscale(0.3) hue-rotate(220deg) saturate(2.2) brightness(0.65) contrast(1.1)"`
- `heroOverlayGradient: "radial-gradient(circle at 50% 40%, rgba(255,0,200,0.35) 0%, rgba(76,0,130,0.55) 45%, rgba(10,0,20,0.75) 100%)"`
- `heroFrame: "neonGlow"`
- Palette: `heading: "#FFFFFF"`, `body: "rgba(255,255,255,0.75)"`, `accent: "#FF3EC9"`, `pageBg: "#12081C"`, `gold: "#4CFFDA"` (repurposed as the glow's secondary/cyan color, not a literal wax-seal gold)
- Font: `spaceGrotesk.className`, `fontStyle: "normal"`

### `seal` ("Lacre & Selo")
- Photo: `prewed.jpg` (pine path, soft golden light)
- `photoFilter: "sepia(0.18) brightness(0.97) contrast(1.05)"`
- `heroOverlayGradient: "linear-gradient(to bottom, rgba(45,30,20,0.15) 0%, rgba(45,30,20,0.45) 100%)"`
- `heroFrame: "seal"`
- Palette: `heading: "#FBF6EC"`, `body: "rgba(251,246,236,0.75)"`, `accent: "#C9A24B"`, `pageBg: "#2A1F16"`, `gold: "#D4AF37"`
- Font: `playfair.className`, `fontStyle: "italic"`

`ThemeMotif` (also in `InvitationHero.tsx`): each new theme needs a branch. `newspaper` gets a small double-rule-and-square-dingbat motif (distinct from `elegant`/`romantic`'s diamond); `candlelight` and `seal` can share the existing diamond motif (`theme === "elegant" || theme === "romantic" || theme === "candlelight" || theme === "seal"`); `neon` gets its own small glowing-dot motif (a filled circle with a soft box-shadow, echoing `heroFrame: "neonGlow"`); no theme needs `Sprig` (botanical) here.

## Implementation touchpoints (same checklist already established for `romantic`/`garden`)

1. `frontend/src/types/template.ts` — widen `ThemeKey` union with the 4 new values.
2. `frontend/src/components/InvitationHero.tsx` — extend `ThemeStyle` interface, add 4 `THEME_STYLES` entries, extend `ThemeMotif`.
3. `frontend/src/components/InvitationHeroContent.tsx` — render `photoFilter`/`heroOverlayGradient`/`heroFrame` as described above; add the `neonGlow` CSS keyframes to `globals.css`.
4. `frontend/src/components/TemplateCard.tsx` — 4 new illustrative branches (thumbnail-style cards for the theme picker), following the existing per-theme hardcoded-markup pattern.
5. `frontend/src/app/templates/[theme]/page.tsx` — add `SAMPLE_NAMES`/`SAMPLE_EVENT_TYPES`/`SAMPLE_ADDRESSES`/`SAMPLE_COVER_IMAGES` entries (cover images point at the 4 `prewed*.jpg` files above).
6. `frontend/src/messages/{pt,en,es}.json` — `templateThemeNames` entries, `templates.themePreview.samples.{newspaper,candlelight,neon,seal}` (description/dressCode/timeline), update every "N themes" copy string (features, howItWorks, templates gallery subtitle/metadata) from 6 → 10.
7. `frontend/src/components/landing/HomeLanding.tsx` — widen `TEMPLATE_THEMES` to 10 entries; change the "Choose your style" grid from `sm:grid-cols-3` to `sm:grid-cols-5` (clean 2-row layout for 10 items).
8. `frontend/src/components/InstantPreview.tsx` — widen `THEME_KEYS` to 10 entries; change the theme-picker grid from `grid-cols-3` to `grid-cols-5` (same reasoning).
9. `frontend/public/showcase/` — no new files needed (reusing `prewed.jpg`, `prewed3.jpg`, `prewed4.jpg`, `prewed5.jpg` as-is).

## Explicitly out of scope

- The folder-per-template "Template Engine" architecture (`templates/casamento/editorial/...`) — considered and rejected in favor of this config-driven extension; if the marketplace-scale vision becomes a real near-term need later, it gets its own separate spec.
- The other 5 event categories (Birthday, Graduation, FifteenYearsParty, BabyShower, GenderReveal) — `ThemeKey` is already orthogonal to `EventType`; no category-specific work is implied here.
- Backend `TemplateRecord` seeding — same known gap already documented for `romantic`/`garden`: these 4 new themes will be fully previewable via `/templates/{theme}` and appear in the landing page's static showcases, but won't appear in the `/templates` gallery grid (backend-driven) until seeded. Not addressed by this spec unless requested separately.
- The new Design System component library (Gift List, Music Player, Guest Book, QR Code) from the original request — a separate, much larger sub-project, not started here.
- `prewed 2.jpg` (rename to `prewed-2.jpg` before use — space in filename) and `prewed6.jpg` — left as spares for a future 5th/6th personality, not used by this spec.

## Verification

1. `tsc --noEmit` + `eslint` — confirm the widened `ThemeKey` doesn't break exhaustiveness anywhere (same check as `romantic`/`garden`: `TemplateCard.tsx`, `templates/[theme]/page.tsx`'s sample maps, `HomeLanding.tsx`, `InstantPreview.tsx`).
2. Visual check per theme at `/templates/{theme}` for all 4: confirm the photo filter/overlay/frame render as specified, confirm text stays legible over the photo in all 4 cases (contrast check, especially `neon`'s white text over a busy magenta-graded photo).
3. Confirm the 6 existing themes are visually unchanged (the new `ThemeStyle` fields are optional and unused by them).
4. `prefers-reduced-motion` check on `neon`'s pulsing glow — confirm it's static (no animation) when reduced motion is on, matching the `.seal-sheen`/`.phone-scroll` convention.
