# AppEvents Landing Page — Design System Specification

## 1. COLOR TOKENS

### Primary Palette
- **Porcelain**: #fbf8f2 (base light background)
- **Porcelain-2**: #f6efe1 (secondary light, warmth)
- **Ink**: #16130e (dark text, accents)
- **Gold**: #b08d4c (primary accent)
- **Gold-Dark**: #8f7038 (gold hover state)
- **Champagne**: #e8d9bc (warm accent)
- **Muted**: #6a6357 (secondary text, labels)
- **Pinewood**: #0e5c54 (teal/green accent)
- **Border**: #e6dfd0 (dividers, borders)

### Semantic Color Usage
- **Text Primary**: var(--ink)
- **Text Secondary**: var(--muted)
- **Accent**: var(--gold)
- **Interactive Hover**: var(--gold-dark)
- **Background Light**: var(--porcelain)
- **Background Warm**: var(--porcelain-2)

## 2. WASH BACKGROUNDS (Critical Visual Signature)

### wash-a
Uses radial gradients at 12% -10% and 100% 110%
- Primary: champagne (65% opacity) at top-left
- Secondary: porcelain-2 (80% opacity) at bottom-right
- Fallback: var(--porcelain)
- Used in: Hero, Comparison, Testimonials
- Purpose: Subtle depth, luxury feel

### wash-b
Solid background
- Color: var(--porcelain-2)
- Used in: Steps, Templates, FAQ
- Purpose: Neutral warmth, readability

### wash-c
Uses radial gradients at 95% 0% and 0% 100%
- Primary: champagne (60% opacity) at top-right
- Secondary: porcelain (85% opacity) at bottom-left
- Fallback: var(--porcelain-2)
- Used in: Features, Admin section
- Purpose: Subtle accent, visual variation

## 3. TYPOGRAPHY

### Display (Headers)
- **Font**: Cormorant Garamond, serif
- **Weight**: 600 (semi-bold)
- **Usage**: h1, h2, h3, h4
- **Letter-spacing**: -0.01em (h1), normal (h2/h3)

### Body
- **Font**: Inter, Arial, sans-serif
- **Weight**: 400 (regular), 500 (medium), 600 (semi-bold)
- **Line-height**: 1.6 (default)

### Type Scale (Responsive with clamp)
- **h1**: clamp(38px, 5.4vw, 64px) | line-height: 1.1 | letter-spacing: -0.01em
- **h2**: clamp(30px, 4vw, 44px) | line-height: 1.1
- **h3**: 19-22px (varies by context)
- **Body**: 14-17px (varies by context)
- **Small**: 12-13px (labels, caps)

### Eyebrow (Small Caps)
- Font-size: 12px
- Font-weight: 600
- Letter-spacing: 0.28em
- Text-transform: uppercase
- Color: var(--pinewood)

## 4. SPACING & LAYOUT

### Section Padding
- **Desktop**: 88px top/bottom
- **Tablet**: 64px top/bottom
- **Mobile**: 40-56px top/bottom

### Grid Systems
- **Feature Grid**: 3-col (gap: 40px) → 2-col (900px) → 1-col (600px)
- **Template Grid**: 6-col (gap: 22px) → 4-col (1000px) → 3-col (700px) → 2-col (480px)
- **Comparison Grid**: 2-col (gap: 24px) → 1-col (760px)
- **Admin Grid**: 2-col (.9fr 1.1fr, gap: 56px) → 1-col (900px)
- **Steps Grid**: 3-col (gap: 40px) → 1-col (760px)

### Container
- **Max-width**: 1160px
- **Padding**: 0 24px (sides)
- **Centered**: margin: 0 auto

### Gap/Margin Patterns
- **Section spacing**: 88px between sections
- **Card gap**: 22-40px (depends on density)
- **Element spacing**: 10-20px (internal)

## 5. COMPONENT PATTERNS

### Feature Card
- Background: color-mix(var(--porcelain) 85%, transparent)
- Border: 1px var(--border)
- Border-radius: 6px
- Padding: 28px
- Hover: translateY(-4px) + box-shadow lift
- Contains: SVG icon + h3 + p + mini-stat (optional)

### Comparison Card
- Before: background #fbf1ee, border #f0d9d1
- After: background #eef4ee, border #d7e6d7
- Icons: red-brown (#c65b45) vs. teal (var(--pinewood))

### Testimonial Card
- Width: 320px (flex-shrink: 0)
- Background: color-mix(var(--porcelain) 82%, transparent)
- Border: 1px var(--border)
- Border-radius: 8px
- Padding: 26px
- Contains: stars + quote + who (name · location)

### Button Styles
- **btn-primary**: background var(--gold), color var(--ink)
  - Hover: background var(--gold-dark), scale 1.03, shadow
- **btn-ghost**: transparent, border var(--border), color var(--ink)
  - Hover: background var(--porcelain-2), scale 1.02
- **btn-invert**: background var(--porcelain), color var(--ink)
  - Hover: background var(--champagne), scale 1.03
- All buttons: border-radius 999px, padding 14px 28px

## 6. ANIMATIONS & TRANSITIONS

### Easing Function
- **Default**: cubic-bezier(0.22, 0.61, 0.36, 1)
- **Duration**: 0.2s to 0.3s for micro-interactions, 0.6s-0.7s for larger transitions

### Component Animations
- **Feature Cards**: hover (0.3s) translateY + shadow
- **Phone Mocks**: hover (0.3s) translateY(-5px) scale(1.02)
- **Testimonials**: infinite scroll (38s linear) with pause-on-hover
- **Buttons**: scale + box-shadow transitions (0.25s)
- **Accordion**: details[open] state toggle

### Reduced Motion
- Respect `@media (prefers-reduced-motion: reduce)`
- Disable animations for all if user preference detected

## 7. RESPONSIVE BREAKPOINTS

| Device | Width | Changes |
|--------|-------|---------|
| Mobile | 320px | 1-col grids, stacked layouts, mobile CTA bar visible |
| Tablet | 768px | 2-col grids, nav links visible |
| Desktop | 900px+ | 3-col grids, side-by-side layouts |
| Large | 1160px+ | Max container width, full feature count |

## 8. COMPONENT-TO-SECTION MAPPING

| HTML Section | React Component | Current Status | Action |
|--------------|-----------------|-----------------|--------|
| Hero | EnvelopeReveal + AnimatedHeroPhone | ✅ Exists | Verify wash background, typography |
| Steps | StepSection | ✅ Exists | Verify grid, icon styling |
| Features | ServicesGrid | ⚠️ Exists but needs review | Add mini-stat bars, 3-col grid |
| Comparison | ComparisonSection | ⚠️ Exists | Match #fbf1ee / #eef4ee colors |
| Templates | HorizontalTemplateCarousel | ⚠️ Carousel (vs grid in HTML) | Keep OR switch to 6-col grid |
| Admin | AdminPreview | ⚠️ Exists | Verify 2-col layout, styling |
| Testimonials | TestimonialGrid | ✅ Carousel | Verify infinite loop, pause-on-hover |
| FAQ | FAQ component (in HomeLanding?) | ✅ Exists | Verify accordion styling, transitions |
| Final CTA | Final CTA section | ⚠️ Exists | Verify styling |
| Footer | SiteFooter | ✅ Exists | Verify styling |
| Mobile CTA | MobileCtaBar (new?) | ❌ Missing | Create sticky bottom CTA for mobile |

---

## IMPLEMENTATION PRIORITY

**Phase 1 (Setup - Do First)**
1. Add wash backgrounds to globals.css
2. Update Tailwind config for typography (clamp values)
3. Ensure CSS variables are available in all components

**Phase 2 (Components - Do Next)**
1. ServicesGrid: add mini-stat bars
2. ComparisonSection: update colors to match HTML
3. AdminPreview: verify 2-col layout
4. TestimonialGrid: ensure infinite loop works
5. Final CTA: verify styling

**Phase 3 (Polish)**
1. Mobile CTA bar
2. Responsive testing across breakpoints
3. Hover states, transitions
4. Accessibility audit

---

## NOTES FOR DEVELOPERS

- CSS custom properties should be used in globals.css for all color values
- Tailwind can extend colors via tailwind.config.js
- Wash backgrounds cannot be created purely with Tailwind; use @layer utilities + custom CSS
- Typography should use CSS clamp() for fluid scaling; see examples in globals.css
- All animations should respect prefers-reduced-motion
- Mobile CTA bar should use env(safe-area-inset-bottom) for notch-safe padding
- Templates section: current carousel works well but consider grid for better discoverability
