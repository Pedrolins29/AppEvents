# Visual Component Analysis: HTML Reference vs. React Implementation

## Component-by-Component Breakdown

### 1. HERO SECTION

#### HTML Reference
- Background: Ink (#16130e) with light text
- Layout: 2-col grid (text | phone mock)
- Text color: var(--porcelain)
- Typography: h1 large responsive, eyebrow gold caps
- CTA buttons: primary (gold bg) + ghost (border, white text)
- Trust badges: "Milhares de convites" + "Grátis para criar"
- Event pills: clickable tags for event types

#### Current React (HomeLanding.tsx lines 214-275)
- Status: ✅ Exists and mostly correct
- Implementation: Ink background, 2-col grid layout
- Buttons: gold button + border button with proper styling
- Action: Verify clamp() typography for h1, ensure eyebrow styling matches spec

---

### 2. STEPS SECTION

#### HTML Reference
- Background: wash-b (solid porcelain-2)
- Layout: 3-col grid (gap: 40px)
- Components: .step (3 items, numbered circles)
  - .step-num: 52px circle, background var(--gold), centered text
  - h3: 21px
  - p: 15px, color var(--muted)
- Pattern: Numbered sequence indicates process flow

#### Current React (StepSection.tsx)
- Status: ✅ Component exists and imported
- Layout: 3-col grid expected
- Action: Verify 3-col grid responsive, verify circle styling (52px diameter), apply wash-b background

---

### 3. SERVICES / FEATURES SECTION

#### HTML Reference
- Background: wash-c (radial gradients)
- Layout: 3-col grid (gap: 24px, auto-responsive)
- Component: .feature-card (6 total)
  - Padding: 28px
  - Border: 1px var(--border)
  - Border-radius: 6px
  - Hover: translateY(-4px) + shadow lift
  - Contains:
    - SVG icon (color: var(--gold))
    - h3 (19px)
    - p (14px, color var(--muted))
    - .mini-stat (optional):
      - .mini-stat-bar: 6px height, background var(--border), child span width 80%
      - .mini-stat-label: 12.5px, color var(--muted), contains <b> for bold text

#### Current React (ServicesGrid.tsx)
- Status: ⚠️ Component exists but may be missing features
- Gap: Mini-stat bar pattern (width % indicator + label)
- Action: 
  1. Apply wash-c background to section
  2. Add mini-stat component with bar + label pattern
  3. Verify 3-col grid with 24px gap
  4. Ensure hover translateY(-4px) effect
  5. Verify SVG icon color uses var(--gold)

---

### 4. COMPARISON SECTION

#### HTML Reference
- Background: wash-a (radial gradients)
- Layout: 2-col grid (gap: 24px), stacks on mobile (760px)
- Cards:
  - .cmp-before: background #fbf1ee, border #f0d9d1, SVG color #c65b45 (red-brown ✕)
  - .cmp-after: background #eef4ee, border #d7e6d7, SVG color var(--pinewood) (teal ✓)
- Content: h3 + ul (4 list items each)
- Pattern: Before/After comparison structure emphasizes transformation

#### Current React (ComparisonSection.tsx)
- Status: ⚠️ Component exists but colors may not match exactly
- Gap: Soft colors #fbf1ee / #eef4ee vs. default theme
- Action: 
  1. Apply wash-a background to section
  2. Update card colors: before #fbf1ee / #eef4ee
  3. Update borders: before #f0d9d1 / after #d7e6d7
  4. Update icon colors: before #c65b45 / after var(--pinewood)
  5. Verify 2-col grid, responsive stacking at 760px

---

### 5. TEMPLATES SECTION

#### HTML Reference
- Background: wash-b (solid porcelain-2)
- Layout: 6-col grid (gap: 22px)
  - 1000px: 4-col
  - 700px: 3-col
  - 480px: 2-col
- Above grid:
  - .tpl-filters: 7 category pills
  - .tpl-swatches: 8 color circles
- Components: .phone-mock-wrap (12 total)
  - .phone-mock: aspect-ratio 9/17.5, border 5px var(--ink), background var(--ink)
  - .accent-bar: 4px height top, color varies per template
  - .mock-menu: 20x20px circle, top-right corner
  - .mock-refresh: 24x24px circle, bottom-right corner
  - Below: .mock-name (template name label)
  - Hover: translateY(-5px) scale(1.02) + shadow lift

#### Current React (HorizontalTemplateCarousel.tsx)
- Status: ⚠️ Uses horizontal carousel instead of grid
- Gap: UX pattern (carousel vs. grid discovery)
- Advantage: Carousel is better for mobile scrolling
- Action: 
  1. Keep carousel for now (works well mobile-first)
  2. Consider grid option for future desktop discoverability
  3. Apply wash-b background to section
  4. Verify hover effects (scale, shadow)

---

### 6. ADMIN SECTION

#### HTML Reference
- Background: wash-c (radial gradients)
- Layout: .admin-grid (2-col: .9fr 1.1fr, gap: 56px, stacks on 900px)
- Left side: .admin-shot
  - Contains image
  - Border-radius: 12px
  - Box-shadow: 0 30px 60px -30px rgba(22, 19, 14, 0.4)
  - Aspect-ratio: 16/11
- Right side: .admin-list (4 items)
  - .admin-item: display flex, gap 14px
    - .dot: 9px circle, background var(--pinewood)
    - h4: 16.5px, font-weight 700
    - p: 14px, color var(--muted), margin-top 4px

#### Current React (AdminPreview.tsx)
- Status: ✅ Component exists
- Layout: Expected 2-col grid at correct proportions
- Action: 
  1. Apply wash-c background to section
  2. Verify 2-col grid (.9fr 1.1fr proportions)
  3. Verify image shadow: 0 30px 60px -30px rgba(22, 19, 14, 0.4)
  4. Verify list items: dot (9px, pinewood) + h4 + p layout
  5. Test responsive stacking at 900px

---

### 7. TESTIMONIALS SECTION

#### HTML Reference
- Background: wash-a (radial gradients)
- Layout: .testi-viewport (overflow: hidden, gradient mask)
  - .testi-track: flex, gap 22px, width max-content
  - Animation: testiScroll 38s linear infinite
  - Hover: animation-play-state: paused
- Component: .testi-card (width: 320px, flex-shrink: 0)
  - Background: color-mix(var(--porcelain) 82%, transparent)
  - Border: 1px var(--border)
  - Border-radius: 8px
  - Padding: 26px
  - Contains:
    - .stars: ★★★★★ (color var(--gold))
    - .quote: p 14.5px, color var(--ink)
    - .who: 13px, color var(--muted), contains <b> for name

#### Current React (TestimonialGrid.tsx)
- Status: ✅ Component exists with Framer Motion
- Advantage: Framer Motion handles pause-on-hover better than CSS
- Action: 
  1. Apply wash-a background to section
  2. Verify infinite loop works (duplicate items or loop flag)
  3. Verify pause-on-hover works
  4. Verify card styling: border, border-radius, padding
  5. Verify stars color (var(--gold))

---

### 8. FAQ SECTION

#### HTML Reference
- Background: wash-b (solid porcelain-2)
- Layout: .faq-list (max-width: 720px, centered, flex column, gap 10px)
- Component: <details class="faq-item">
  - Border: 1px var(--border)
  - Border-radius: 6px
  - Background: color-mix(var(--porcelain) 82%, transparent)
  - Padding: 20px 22px
  - <summary>: cursor pointer, display flex, justify-between
    - Font-weight: 600
    - Font-size: 15.5px
    - SVG icon (chevron, rotates 180° on open)
  - <p>: margin-top 12px, color var(--muted-foreground), font-size 14.5px

#### Current React (HomeLanding.tsx lines 335-380)
- Status: ✅ Component exists with details/summary
- Implementation: Accordion with chevron icon, smooth open/close
- Action: 
  1. Apply wash-b background to section
  2. Verify details styling: border, border-radius, background, padding
  3. Verify summary styling: flex layout, cursor pointer
  4. Verify chevron rotates 180° on open
  5. Verify text styling: font-weight, font-size, color

---

### 9. "SEE IN ACTION" / SHOWCASE SECTION

#### HTML Reference
- Background: Gradient dark (Porcelain → Ink)
- Layout: Centered content with TemplateCarousel
- Contains:
  - Eyebrow: small caps, gold text
  - h2: responsive, light weight
  - FoilRule divider
  - Subtitle: light gold text
  - Interactive carousel showcase

#### Current React (HomeLanding.tsx lines 308-333)
- Status: ✅ Exists with proper gradient
- Implementation: gradient-to-b from-porcelain via-dark to-ink
- Action: 
  1. Verify gradient colors match spec
  2. Verify TemplateCarousel styling
  3. Verify section padding and layout

---

### 10. FINAL CTA SECTION

#### HTML Reference
- Background: linear-gradient(to bottom, porcelain-2 0%, champagne 22%, ink 62%, ink 100%)
- Color: var(--porcelain) (text)
- Padding: 96px 0
- Text-align: center
- Contains:
  - h2: clamp(32px, 4.6vw, 48px), color var(--porcelain)
  - p: 16px, color #c9bfa9 (light champagne), max-width 44ch
  - .btn: btn-primary variant, margin-top 32px
  - .foil-rule: 56px width, 1px height, background var(--gold)

#### Current React (HomeLanding.tsx lines 382-401)
- Status: ⚠️ Exists but background may not match spec exactly
- Current: bg-ink (solid)
- Action: 
  1. Add gradient background: linear-gradient(to bottom, porcelain-2 0%, champagne 22%, ink 62%, ink 100%)
  2. Verify h2 styling with clamp()
  3. Verify text color for subtitle (#c9bfa9)
  4. Verify button styling (gold bg, ink text)
  5. Verify foil rule styling (56px width)

---

### 11. FOOTER SECTION

#### HTML Reference
- Background: var(--ink)
- Padding: 56px 0 32px
- Layout: .foot-grid (4-col: 1.4fr 1fr 1fr 1fr, stacks on 760px to 2-col)
- Contains: .foot-grid h5 (uppercase links), .foot-bottom (copyright + legal)
- Color: var(--champagne)

#### Current React (SiteFooter)
- Status: ✅ Component exists
- Action: 
  1. Verify background: var(--ink)
  2. Verify layout grid and responsive stacking
  3. Verify text color (var(--champagne))
  4. Verify padding: 56px 0 32px

---

### 12. MOBILE CTA BAR (New Component)

#### HTML Reference
- Component: .mobile-cta-bar
- Display: none (desktop), block (max-width: 640px)
- Position: fixed bottom, z-index 50
- Background: color-mix(var(--porcelain) 94%, transparent)
- Backdrop-filter: blur(10px)
- Border-top: 1px var(--border)
- Padding: 12px 16px calc(12px + env(safe-area-inset-bottom))
- Contains: .btn (width: 100%)
- Body effect: padding-bottom 76px (make room for sticky bar)

#### Current React
- Status: ❌ Missing
- Action: 
  1. Create new MobileCtaBar component
  2. Add to HomeLanding.tsx layout
  3. Ensure fixed positioning, backdrop blur
  4. Use safe-area-inset-bottom for notch safety
  5. Add body padding to avoid overlap

---

## SUMMARY TABLE

| Component | Status | Priority | Action Items |
|-----------|--------|----------|--------------|
| Hero | ✅ Good | P2 | Verify clamp typography |
| Steps | ✅ Good | P2 | Verify grid, circle sizing, wash-b background |
| Services | ⚠️ Needs work | P1 | Add mini-stat bars, wash-c background |
| Comparison | ⚠️ Needs work | P1 | Update colors #fbf1ee/#eef4ee, wash-a background |
| Templates | ⚠️ Different | P2 | Keep carousel, apply wash-b background |
| Admin | ✅ Good | P2 | Verify layout, shadow, wash-c background |
| Testimonials | ✅ Good | P2 | Apply wash-a background, verify infinite loop |
| FAQ | ✅ Good | P2 | Apply wash-b background, verify accordion |
| Showcase | ✅ Good | P2 | Verify gradient styling |
| Final CTA | ⚠️ Needs work | P1 | Add gradient background |
| Footer | ✅ Good | P2 | Verify styling |
| Mobile CTA | ❌ Missing | P1 | Create new component |

---

## CRITICAL GAPS TO CLOSE

1. **Wash backgrounds not applied** → Add to globals.css, apply to sections
2. **Mini-stat bars in features** → Add component or inline JSX
3. **Comparison card colors** → Exact #fbf1ee / #eef4ee match required
4. **Final CTA gradient** → Linear gradient background essential
5. **Mobile CTA bar** → New sticky component
6. **Typography clamp()** → Verify responsive sizing via Tailwind config
