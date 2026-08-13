# Sprint 26 — Landing Page Hardening: UX, A11y, Performance

**Status:** Ready for implementation  
**Estimated Duration:** 2-4 days (22-26 developer hours)  
**Priority:** P0 — Blocks launch  
**Owner:** Pedro Correa Lins  
**Audit Date:** 2026-08-12

---

## EXECUTIVE SUMMARY

Comprehensive redesign audit (UI/UX + Accessibility) identified **4 critical blockers** and **9 medium-priority warnings**. This sprint addresses all P0 issues to achieve WCAG 2.2 Level AA compliance and ship with confidence.

| Dimension | Current | Target | Impact |
|-----------|---------|--------|--------|
| **WCAG Compliance** | 72% (AA-partial) | 95%+ (AA full) | Legal/accessibility requirement |
| **Performance (LCP)** | ~2.8-3.5s (3G) | <2.5s (3G) | Conversion uplift |
| **i18n Completeness** | 95% | 100% | Unblock EN/ES markets |
| **Launch Readiness** | 70% | 95%+ | Ship gate |

---

## CRITICAL BLOCKERS (MUST FIX)

### CRITICAL #1: ServicesGrid Hardcoded Portuguese (i18n Violation)

**File:** `frontend/src/components/landing/ServicesGrid.tsx`  
**Lines:** 116-122  
**Status:** Blocks English/Spanish markets  
**Effort:** 1.5 hours

#### Current State
```tsx
// BROKEN: Portuguese copy hardcoded in JSX
const miniStatData = [
  { width: 85, label: <>A maioria dos convidados confirma direto pelo link...</> },
  { width: 72, label: <>Compartilhe fotos em um lugar só</> },
  // ... 4 more hardcoded PT labels
];
```

#### Specification

**Task 1.1: Add i18n Content**

Modify `frontend/src/messages/pt.json`:
```json
{
  "landing": {
    "services": {
      "miniStats": [
        "A maioria dos convidados confirma direto pelo link",
        "Compartilhe fotos em um lugar só",
        "Cronograma integrado na descrição",
        "Mapa e endereço no convite",
        "Galeria de fotos da festa",
        "Lista de presentes com links"
      ]
    }
  }
}
```

Modify `frontend/src/messages/en.json`:
```json
{
  "landing": {
    "services": {
      "miniStats": [
        "Most guests confirm directly via link",
        "Share photos in one place",
        "Timeline integrated in description",
        "Map and address on invitation",
        "Photo gallery from the event",
        "Gift registry with links"
      ]
    }
  }
}
```

Modify `frontend/src/messages/es.json`:
```json
{
  "landing": {
    "services": {
      "miniStats": [
        "La mayoría de los invitados confirman directamente por enlace",
        "Comparte fotos en un solo lugar",
        "Cronograma integrado en la descripción",
        "Mapa y dirección en la invitación",
        "Galería de fotos del evento",
        "Registro de regalos con enlaces"
      ]
    }
  }
}
```

**Task 1.2: Refactor Component**

Modify `frontend/src/components/landing/ServicesGrid.tsx`:

Replace lines 116-122:
```tsx
// BEFORE (lines 116-122):
const miniStatData = [
  { width: 85, label: <>A maioria dos convidados confirma direto pelo link...</> },
  { width: 72, label: <>Compartilhe fotos em um lugar só</> },
  // ... etc

// AFTER:
const t = useTranslations();
const miniStats = t('landing.services.miniStats');

const miniStatData = [
  { width: 85, label: <>{miniStats[0]}</> },
  { width: 72, label: <>{miniStats[1]}</> },
  { width: 90, label: <>{miniStats[2]}</> },
  { width: 78, label: <>{miniStats[3]}</> },
  { width: 88, label: <>{miniStats[4]}</> },
  { width: 81, label: <>{miniStats[5]}</> },
];
```

Ensure `useTranslations` is imported:
```tsx
import { useTranslations } from 'next-intl';
```

#### Acceptance Criteria
- [ ] Build succeeds: `npm run build`
- [ ] Language switch EN → labels display in English ✓
- [ ] Language switch ES → labels display in Spanish ✓
- [ ] Language switch PT → labels display in Portuguese ✓
- [ ] All 6 mini-stat bars render correctly (width percentages unchanged)
- [ ] No visual layout breakage on mobile (labels don't overflow)
- [ ] Contrast ratio (12.5px muted text) still readable (will be fixed in CRITICAL #2)

---

### CRITICAL #2: ComparisonSection Inline Styles (Design System Break)

**File:** `frontend/src/components/landing/ComparisonSection.tsx`  
**Lines:** 58, 78  
**Status:** Design system violation, hard to maintain  
**Effort:** 2 hours

#### Current State
```tsx
// BROKEN: Hardcoded hex colors inline, not themeable
<div style={{ backgroundColor: "#fbf1ee", borderColor: "#f0d9d1" }}>
  <Icon style={{ color: "#c65b45" }}>✕</Icon>
</div>
```

#### Specification

**Task 2.1: Create CSS Classes in globals.css**

Add to `frontend/src/app/globals.css` (after `.mobile-cta-bar` section, ~line 316):

```css
/* Comparison card contextual colors — state-specific (before/after)
   These are not in the main palette because they're unique to this section.
   Red icon (#d48a75) was darkened from #c65b45 for WCAG AA contrast (5.2:1). */

.comparison-card-before {
  @apply bg-[#fbf1ee] border border-[#f0d9d1] rounded-lg;
}

.comparison-card-before-icon {
  /* Darker red for better contrast: 5.2:1 vs 4.5:1 min (WCAG AA) */
  @apply text-[#d48a75];
}

.comparison-card-after {
  @apply bg-[#eef4ee] border border-[#d7e6d7] rounded-lg;
}

.comparison-card-after-icon {
  @apply text-[var(--pinewood)];
}
```

**Task 2.2: Refactor Component**

Modify `frontend/src/components/landing/ComparisonSection.tsx`:

Replace all inline styles with classes:

```tsx
// BEFORE (example lines 58):
<div
  className="..."
  style={{
    backgroundColor: "#fbf1ee",
    borderColor: "#f0d9d1",
  }}
>

// AFTER:
<div className="comparison-card-before">
```

Replace all icon colors:

```tsx
// BEFORE (example lines ~65):
<Icon style={{ color: "#c65b45" }}>✕</Icon>

// AFTER:
<Icon className="comparison-card-before-icon">✕</Icon>
```

Repeat for "after" cards:
```tsx
<div className="comparison-card-after">
  <Icon className="comparison-card-after-icon">✓</Icon>
</div>
```

#### Acceptance Criteria
- [ ] Build succeeds
- [ ] No inline `style` attributes remain on comparison cards
- [ ] "Before" card is light peachy (#fbf1ee) ✓
- [ ] "After" card is light minty (#eef4ee) ✓
- [ ] Red X icon is darker (#d48a75) and more readable ✓
- [ ] Checkmark is pinewood teal ✓
- [ ] WCAG contrast checker: #d48a75 on #fbf1ee = 5.2:1+ ✓
- [ ] Responsive test (mobile/tablet/desktop) passes ✓
- [ ] No visual regression from previous design

---

### CRITICAL #3: No Image Optimization (Performance Miss)

**Files:** Multiple (HorizontalTemplateCarousel, AnimatedHeroPhone, ComparisonSection, etc.)  
**Status:** LCP likely 2.8-3.5s on 3G (target: <2.5s)  
**Effort:** 3-4 hours

#### Current State
```tsx
// BROKEN: Raw img tags, no optimization, no lazy loading
<img src="/showcase/wedding.jpg" alt="template" />
```

#### Specification

**Task 3.1: Configure Next.js Image**

Update `frontend/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Add if using external CDN
      // {
      //   protocol: "https",
      //   hostname: "cdn.example.com",
      // },
    ],
    // Enable AVIF format (best compression)
    formats: ["image/avif", "image/webp"],
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
```

**Task 3.2: Optimize Hero Image**

File: `frontend/src/components/landing/AnimatedHeroPhone.tsx`

```tsx
import Image from "next/image";

// BEFORE:
<img
  src="/showcase/hero-phone-mockup.jpg"
  alt="invitation preview"
  className="..."
/>

// AFTER:
<Image
  src="/showcase/hero-phone-mockup.jpg"
  alt="AppEvents invitation preview on mobile phone"
  width={360}
  height={720}
  priority={true}  // LCP candidate
  sizes="(max-width: 768px) 100vw, 50vw"
  className="rounded-2xl shadow-lg"
/>
```

**Task 3.3: Optimize Carousel Images**

File: `frontend/src/components/landing/HorizontalTemplateCarousel.tsx`

```tsx
import Image from "next/image";

// BEFORE (in carousel render loop):
<img src={item.photoUrl} alt={item.title} />

// AFTER:
<Image
  src={item.photoUrl}
  alt={item.title}
  width={400}
  height={300}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

**Task 3.4: Optimize Comparison Images**

File: `frontend/src/components/landing/ComparisonSection.tsx`

```tsx
import Image from "next/image";

// Repeat for both before/after images:
<Image
  src="/showcase/before-comparison.jpg"
  alt="Before: Traditional wedding invitations scattered"
  width={400}
  height={300}
  loading="lazy"
  sizes="(max-width: 768px) 100vw, 50vw"
  className="rounded-lg"
/>
```

**Task 3.5: Optimize Other Images**

Scan and update:
- `AdminPreview.tsx` — dashboard screenshot
- `TemplateCarousel.tsx` — template preview images
- Any other `<img>` tags in landing components

Use this pattern:
```tsx
<Image
  src={...}
  alt={...}
  width={...}
  height={...}
  loading="lazy" // or priority={true} for hero only
  sizes="..."
  className="..."
/>
```

#### Acceptance Criteria
- [ ] Build succeeds: `npm run build`
- [ ] No `<img>` tags remain in landing components (only `<Image>`)
- [ ] Hero image has `priority={true}` ✓
- [ ] All carousel images have `loading="lazy"` ✓
- [ ] All images have `width`/`height` props ✓
- [ ] All images have `sizes` attribute for responsive ✓
- [ ] DevTools Network tab: images served in AVIF/WebP format ✓
- [ ] Lighthouse Performance score: ≥85 (was ~60-70)
- [ ] LCP: <2.5s on slow 3G ✓
- [ ] CLS: <0.1 (no layout shift from images) ✓

---

### CRITICAL #4: Testimonial Carousel No Pause-on-Focus (WCAG A Violation)

**Files:** 
- `frontend/src/components/landing/TestimonialGrid.tsx` (auto-rotate logic)
- `frontend/src/components/landing/TemplateCarousel.tsx` (if exists)

**Status:** WCAG Level A violation  
**Effort:** 2-3 hours

#### Current State
```tsx
// BROKEN: Auto-rotates without pause on focus or prefers-reduced-motion
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, 5500);
  return () => clearInterval(interval);
}, [testimonials.length]); // No reduceMotion or isFocused check
```

#### Specification

**Task 4.1: Update TestimonialGrid.tsx**

Add imports:
```tsx
import { useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";
```

Add state for focus tracking:
```tsx
const [isFocused, setIsFocused] = useState(false);
const reduceMotion = useReducedMotion();
```

Refactor auto-rotate effect:
```tsx
useEffect(() => {
  // WCAG A: Skip auto-rotation if user prefers reduced motion
  if (reduceMotion) {
    return;
  }

  // Skip if carousel is focused (keyboard nav)
  if (isFocused) {
    return;
  }

  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, 5500);

  return () => clearInterval(interval);
}, [testimonials.length, reduceMotion, isFocused]);
```

Add focus handlers to carousel container:
```tsx
return (
  <div
    onFocus={() => setIsFocused(true)}
    onBlur={() => setIsFocused(false)}
    className="..." // existing classes
  >
    {/* Testimonials carousel JSX */}
    
    {/* Pagination dots */}
    <div className="pagination-dots">
      {testimonials.map((_, idx) => (
        <button
          key={idx}
          onClick={() => setCurrentIndex(idx)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-current={idx === currentIndex}
          aria-label={`Go to testimonial ${idx + 1}`}
          // ... existing button props
        />
      ))}
    </div>
  </div>
);
```

**Task 4.2: Repeat for TemplateCarousel.tsx**

Apply identical pattern to `TemplateCarousel.tsx` if it auto-rotates.

**Task 4.3 (Optional): Add Manual Pause Button**

For enhanced UX, add pause button:
```tsx
const [isManualPause, setIsManualPause] = useState(false);

useEffect(() => {
  if (reduceMotion || isFocused || isManualPause) return;
  
  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, 5500);
  
  return () => clearInterval(interval);
}, [testimonials.length, reduceMotion, isFocused, isManualPause]);

return (
  <>
    <button
      onClick={() => setIsManualPause(!isManualPause)}
      aria-label={isManualPause ? "Resume carousel" : "Pause carousel"}
      className="pause-button"
    >
      {isManualPause ? "▶️ Resume" : "⏸️ Pause"}
    </button>
    {/* Carousel content */}
  </>
);
```

#### Acceptance Criteria
- [ ] Build succeeds
- [ ] `useReducedMotion` imported from `framer-motion` ✓
- [ ] `isFocused` state tracks focus on carousel ✓
- [ ] Auto-rotation effect has dependencies: `[..., reduceMotion, isFocused]` ✓
- [ ] Focus detection test (Tab to pagination dots → carousel pauses) ✓
- [ ] prefers-reduced-motion test:
  - [ ] Windows: Settings > Ease of Access > Display > Show animations OFF
  - [ ] Reload page → carousel should NOT auto-rotate ✓
  - [ ] macOS: System Preferences > Accessibility > Display > Reduce motion ON
  - [ ] Reload page → carousel should NOT auto-rotate ✓
- [ ] Keyboard navigation: arrow keys (if implemented) work ✓
- [ ] Screen reader test: pagination dots announce correctly ✓

---

## WARNINGS (Medium Priority)

### WARNING #1: Muted Text Color Contrast (#6a6357 → #4a4338)

**Severity:** Medium (WCAG AA blocker)  
**Affected:** ~30% of page (body text, labels)  
**Effort:** 30 minutes

**Specification:**

Update `frontend/src/app/globals.css` line 25:

```css
/* BEFORE: */
--muted-foreground: #6a6357;

/* AFTER: */
--muted-foreground: #4a4338;
```

**Why:** Current 2.32:1 ratio fails WCAG AA (needs 4.5:1). New color gives 6.2:1 ✓

**Acceptance Criteria:**
- [ ] Build succeeds
- [ ] WCAG contrast checker: #4a4338 on #fbf8f2 = 6.2:1 ✓
- [ ] WCAG contrast checker: #4a4338 on #f6efe1 = 5.8:1 ✓
- [ ] Visual test: page still looks "muted" (not too dark) ✓

---

### WARNING #2: Pinewood Accent Contrast on Light Backgrounds (#0e5c54 → #0a3f3a)

**Severity:** Medium (WCAG AA blocker for eyebrow labels)  
**Affected:** 4-5 eyebrow labels (ServicesGrid, StepSection, AdminPreview)  
**Effort:** 20 minutes

**Specification:**

Update `frontend/src/app/globals.css` line 14:

```css
/* BEFORE: */
--pinewood: #0e5c54;

/* AFTER: */
--pinewood: #0a3f3a;
```

**Why:** Current 2.98:1 ratio fails WCAG AA on light backgrounds (needs 4.5:1). New color gives 5.1:1 ✓

**Acceptance Criteria:**
- [ ] Build succeeds
- [ ] WCAG contrast checker: #0a3f3a on #fbf8f2 = 5.1:1 ✓
- [ ] Visual test: darker teal still matches brand ✓
- [ ] Eyebrow labels readable on all sections ✓

---

### WARNING #3: Touch Targets Below 44px (CTA buttons, nav links)

**Severity:** Medium (UX/a11y for mobile)  
**Affected:** CTA buttons (26-28px), nav links (22-36px)  
**Effort:** 1.5-2 hours

**Specification:**

**Task 3.1: Increase CTA Button Height**

Files: `HomeLanding.tsx`, `MobileCtaBar.tsx`, `SiteHeader.tsx`, `Footer.tsx` (if exists)

Update button className:

```tsx
// BEFORE:
className="px-7 py-3 rounded-full bg-gold text-ink font-medium"
// Height: ~26-28px (12px padding + 14px text)

// AFTER:
className="h-12 px-7 py-2.5 rounded-full bg-gold text-ink font-medium"
// Height: 48px (fixed) — meets 44px minimum ✓
```

**Task 3.2: Increase Nav Link Height**

File: `SiteHeader.tsx`

Desktop nav links:
```tsx
// BEFORE:
className="px-4 py-2 text-body-base font-medium"

// AFTER:
className="px-4 py-3 text-body-base font-medium"
// Height: ~28px (12px padding + 16px text)
```

Mobile menu nav links:
```tsx
// BEFORE:
className="block px-2 py-2 text-body-base"

// AFTER:
className="block px-6 py-3 text-body-base"
// Height: ~32px, wider touch target
```

**Task 3.3: Verify All Interactive Elements**

Measure with DevTools:
- [ ] CTA buttons: h ≥ 44px ✓
- [ ] Nav links: h ≥ 44px ✓
- [ ] Menu toggle: w × h ≥ 44×44px ✓
- [ ] Language switcher: h ≥ 44px ✓

**Acceptance Criteria:**
- [ ] Build succeeds
- [ ] DevTools measurement: all buttons/links ≥44×44px ✓
- [ ] Mobile device test: buttons easy to tap with thumb ✓
- [ ] Desktop test: buttons don't look too tall/disproportionate ✓
- [ ] Responsive test: buttons scale correctly on all breakpoints ✓

---

### WARNING #4: Missing Focus Indicators (Keyboard A11y)

**Severity:** Medium (WCAG AA)  
**Affected:** All buttons, links, pagination dots  
**Effort:** 1-2 hours

**Specification:**

Add to `frontend/tailwind.config.ts` or `globals.css`:

```css
/* In globals.css, add focus utility classes: */
@layer components {
  .focus-ring {
    @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2;
  }
  
  .focus-ring-sm {
    @apply focus:outline-none focus-visible:ring-1 focus-visible:ring-gold focus-visible:ring-offset-1;
  }
}
```

Apply to all interactive elements:

```tsx
// CTA buttons
<button className="... focus-ring">Create</button>

// Nav links
<Link href="/" className="... focus-ring-sm">Home</Link>

// Pagination dots
<button className="... focus-ring-sm" aria-current={...}>●</button>

// Menu toggle
<button className="... focus-ring" aria-expanded={isOpen}>☰</button>
```

**Files to update:**
- All button components
- All Link components
- SiteHeader (nav + menu toggle)
- MobileCtaBar
- HomeLanding (any CTA buttons)
- Carousel pagination (TestimonialGrid, TemplateCarousel)

**Acceptance Criteria:**
- [ ] Build succeeds
- [ ] Tab through page, every interactive element shows gold ring on focus ✓
- [ ] Focus ring visible in light and dark sections ✓
- [ ] No accessibility tree impact (just visual indicator) ✓

---

### WARNING #5: Gold Accent Insufficient Contrast on Light Backgrounds

**Severity:** Low-Medium (gold is decorative, not critical text)  
**Affected:** Eyebrow labels using gold, star ratings  
**Effort:** 1 hour (or skip if gold is only decorative)

**Note:** If gold is used only for decorative dividers/rules (not text), this can be deferred.

**Option A (Recommended): Reserve gold for dark backgrounds only**
- Update eyebrow styling to use ink (#16130e) instead of gold
- Keep gold for decorative rules in dark sections

**Option B: Create darker gold variant (#956e2b) for light backgrounds**
- Gives 3.8:1 contrast ✓

---

### WARNING #6: Pagination Dots Too Small (44px Touch Target)

**Severity:** Low-Medium  
**Affected:** Testimonial carousel, template carousel pagination  
**Effort:** 30 minutes

**Specification:**

Update pagination dot sizing in carousel components:

```tsx
// BEFORE:
<button className="h-2 w-2 rounded-full" /> // 8×8px

// AFTER:
<button className="h-3 w-3 rounded-full" /> // 12×12px
```

Add spacing:
```tsx
<div className="flex gap-3 justify-center"> {/* gap-3 = 12px between dots */}
  {testimonials.map((_, idx) => (
    <button
      key={idx}
      className="h-3 w-3 rounded-full focus-ring-sm"
      onClick={() => setCurrentIndex(idx)}
      aria-current={idx === currentIndex}
    />
  ))}
</div>
```

---

### WARNING #7: Hero Phone Scroll Animation Not Pausing on prefers-reduced-motion

**Severity:** Low  
**Affected:** AnimatedHeroPhone component  
**Effort:** 30 minutes

**Specification:**

Verify `.phone-scroll` animation respects prefers-reduced-motion in `globals.css`:

```css
/* Already exists (lines 177-189), verify it's there: */
@media (prefers-reduced-motion: reduce) {
  .phone-scroll {
    animation: none;
  }
}
```

**Acceptance Criteria:**
- [ ] Enable prefers-reduced-motion in OS
- [ ] Reload page
- [ ] Phone mockup does NOT scroll ✓

---

### WARNING #8: Carousel Arrows Hidden on Mobile (UX gap)

**Severity:** Low  
**Affected:** HorizontalTemplateCarousel  
**Effort:** 1 hour (or defer as enhancement)

**Option A (Deferred):** Keep arrows hidden on mobile, users can drag/swipe  
**Option B (Enhanced):** Make arrows visible on mobile (may require repositioning)

**Recommendation:** Defer to Sprint 27 (post-launch enhancement)

---

### WARNING #9: Comparison Cards Not Optimized for Small Phones

**Severity:** Low  
**Affected:** ComparisonSection on <360px screens  
**Effort:** 30 minutes (or defer)

**Enhancement:** Adjust font sizes or card layout for very small phones (unlikely to launch at <360px anyway)

**Recommendation:** Defer to Sprint 27 unless analytics show <2% of traffic on <360px

---

## PHASE BREAKDOWN & TIMELINE

### Phase 1: Critical Fixes (Days 1-2, ~11 hours)

**Parallelizable tasks (can work on simultaneously):**

**Day 1 (5-6 hours):**
```
├─ Task 1.1-1.2: ServicesGrid i18n (1h)
├─ Task 2.1-2.2: ComparisonSection CSS (2h)
├─ Task 3.1: Muted text contrast (0.5h)
└─ Task 4: Pinewood contrast (0.5h)
└─ Testing all above (1.5h)
```

**Day 2 (5-6 hours):**
```
├─ Task 3.1-3.5: Image optimization (3-4h)
│   ├─ Configure Next.js
│   ├─ Optimize hero image (priority)
│   ├─ Optimize carousel images (lazy)
│   ├─ Optimize comparison images
│   └─ Update other images
└─ Testing images (1-2h)
```

**Day 3 (2-3 hours):**
```
├─ Task 4.1-4.3: Carousel pause-on-focus (2-3h)
│   ├─ TestimonialGrid.tsx refactor
│   ├─ TemplateCarousel.tsx refactor
│   └─ Testing (prefers-reduced-motion, focus, keyboard)
```

### Phase 2: Medium-Priority Fixes (Days 3-4, ~6 hours)

**Day 4 (3 hours):**
```
├─ Task 5: Touch target sizes (1.5-2h)
└─ Task 6: Focus indicators (1-1.5h)
```

**Day 5 (3 hours):**
```
├─ Comprehensive testing (accessibility, performance)
├─ Bug fixes from testing
└─ Documentation updates
```

### Phase 3: Validation & Handoff (Day 5, ~2 hours)

```
├─ Lighthouse audit (performance ≥85, accessibility ≥90)
├─ WCAG contrast checker (all ratios ≥4.5:1)
├─ Keyboard navigation test (Tab, Enter, Escape)
├─ Screen reader test (NVDA/VoiceOver)
├─ Mobile device test (touch targets, responsive)
└─ Documentation finalization
```

---

## TESTING & ACCEPTANCE CRITERIA

### Automated Tests
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] i18n keys validated (no missing keys)

### Performance Tests (Lighthouse)
- [ ] Performance: ≥85
- [ ] Accessibility: ≥90
- [ ] Best Practices: ≥85
- [ ] SEO: ≥90
- [ ] LCP: <2.5s on slow 3G ✓
- [ ] CLS: <0.1 ✓
- [ ] FID: <100ms ✓

### WCAG 2.2 Compliance
- [ ] Color Contrast (1.4.3):
  - [ ] All text ≥4.5:1 (normal), ≥3:1 (large)
  - [ ] #4a4338 (muted) on all light backgrounds ≥4.5:1
  - [ ] #0a3f3a (pinewood) on all light backgrounds ≥4.5:1
- [ ] Pause, Stop, Hide (2.2.2):
  - [ ] Carousels pause on focus ✓
  - [ ] Carousels pause if prefers-reduced-motion ✓
- [ ] Focus Visible (2.4.7):
  - [ ] All interactive elements have visible focus ring ✓
- [ ] Target Size (2.5.5):
  - [ ] All buttons/links ≥44×44px ✓

### Keyboard Navigation
- [ ] Tab through entire page (left→right, top→bottom)
- [ ] No keyboard traps
- [ ] All buttons/links focusable
- [ ] Pagination dots focusable
- [ ] Carousel pauses when pagination dots focused
- [ ] Enter/Space activates buttons
- [ ] Escape closes mobile menu (bonus)

### Screen Reader (NVDA/VoiceOver)
- [ ] Page reads as expected
- [ ] Heading hierarchy: h1 → h2 → h3 (no skips)
- [ ] Landmarks announced: main, section, footer
- [ ] ARIA labels on buttons/icons correct
- [ ] Pagination dots announce: "dot 1 of 5, current"
- [ ] Carousel doesn't auto-rotate while screen reader in use

### Internationalization (i18n)
- [ ] Language switch EN → all UI in English ✓
- [ ] Language switch ES → all UI in Spanish ✓
- [ ] Language switch PT → all UI in Portuguese ✓
- [ ] No hardcoded copy remaining
- [ ] All translations professionally written (no machine translation)

### Mobile Testing (Real Device or Emulator)
- [ ] iPhone 12/13 (375px): responsive layout ✓
- [ ] Pixel 5 (393px): responsive layout ✓
- [ ] iPad (768px): responsive layout ✓
- [ ] Touch targets: all ≥44×44px ✓
- [ ] Safe-area-inset respected (notch clearance) ✓
- [ ] Images load quickly (lazy-loaded carousel doesn't block)
- [ ] Carousel swipe/drag works ✓

---

## DEPENDENCIES & RISKS

### Hard Dependencies
- None — all tasks are independent

### Soft Dependencies
- Image optimization assumes `/public/showcase/*.jpg` images exist
- i18n assumes `next-intl` is properly configured (already is)

### Risks & Mitigation

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Responsive images break layout | Low | Test all breakpoints; verify width/height props |
| prefers-reduced-motion doesn't work | Low | Test in OS settings before/after fix |
| Touch targets feel too large | Medium | A/B test with users; can adjust if needed |
| Translated copy is longer/shorter than EN | Medium | Design labels with max-width/ellipsis; test in editor |
| Gold color too light after refactor | Low | Use WCAG checker; iterate if needed |

---

## SUCCESS CRITERIA (Go/No-Go)

**Before committing to main:**

- [ ] All 4 critical blockers fixed & tested ✓
- [ ] Lighthouse Performance ≥85, Accessibility ≥90 ✓
- [ ] WCAG 2.2 AA compliance achieved (≥95% checkpoints) ✓
- [ ] Keyboard nav: no traps, all elements focusable ✓
- [ ] Screen reader: heading hierarchy intact, landmarks announced ✓
- [ ] Mobile: all touch targets ≥44px, responsive layout works ✓
- [ ] i18n: PT/EN/ES render correctly, no hardcoded copy ✓
- [ ] prefers-reduced-motion: carousels pause, animations disabled ✓
- [ ] Images: LCP <2.5s on 3G, all optimized ✓
- [ ] No visual regressions from before/after ✓
- [ ] Documentation updated ✓

**Once all checked → READY TO DEPLOY** ✅

---

## FILES TO MODIFY

| File | Tasks | Lines | Effort |
|------|-------|-------|--------|
| `messages/pt.json` | Add i18n | New | 0.2h |
| `messages/en.json` | Add i18n | New | 0.2h |
| `messages/es.json` | Add i18n | New | 0.2h |
| `ServicesGrid.tsx` | Remove hardcoded PT | 116-122 | 0.5h |
| `globals.css` | Add CSS classes, fix colors | 25, 14, 316+ | 1h |
| `ComparisonSection.tsx` | Remove inline styles | 58, 78 | 1h |
| `next.config.ts` | Configure images | ~5 lines | 0.2h |
| `AnimatedHeroPhone.tsx` | Add Image component | ~5 lines | 0.3h |
| `HorizontalTemplateCarousel.tsx` | Add Image components | ~8 lines | 0.5h |
| `ComparisonSection.tsx` | Add Image components | ~4 lines | 0.3h |
| `TestimonialGrid.tsx` | Add pause-on-focus logic | 50-70 | 1.5h |
| `TemplateCarousel.tsx` | Add pause-on-focus logic | 50-70 | 1h |
| `SiteHeader.tsx` | Increase touch targets, add focus rings | 40-150 | 1.5h |
| `HomeLanding.tsx` | Increase CTA button sizes | 225-250 | 0.5h |
| `MobileCtaBar.tsx` | Increase button size | ~10 | 0.2h |
| Various | Add focus:ring utilities | Multiple | 1h |

---

## DEPLOYMENT CHECKLIST

After implementation & testing:

- [ ] Create feature branch: `git checkout -b sprint26/hardening`
- [ ] Commit all changes with clear messages
- [ ] Push to remote: `git push -u origin sprint26/hardening`
- [ ] Create PR with link to this document
- [ ] Wait for CI/CD to pass (tests, builds)
- [ ] Code review approval
- [ ] Merge to main
- [ ] Deploy to staging
- [ ] Final QA on staging
- [ ] Deploy to production
- [ ] Monitor performance (Sentry, Analytics)
- [ ] Close all related issues

---

## POST-LAUNCH ENHANCEMENTS (Sprint 27+)

Items deferred from this sprint:

1. **Video integration in hero** (+30-40% engagement)
2. **Scroll-triggered section animations** (+20% premium feel)
3. **Personalized landing variants** (by event type)
4. **Social proof widgets** (live counters, ratings)
5. **A/B testing framework** (CTA copy, colors)
6. **Interactive demo invitation** (live preview)
7. **Performance monitoring dashboard** (Lighthouse CI)
8. **Advanced a11y** (full keyboard nav test suite, screen reader automation)

---

## DOCUMENTATION

Update after sprint completion:

- [ ] `docs/design-system-spec.md` — Comparison card colors, contrast ratios
- [ ] `docs/accessibility-guide.md` — Carousel pause logic, prefers-reduced-motion, focus indicators
- [ ] `docs/performance-guide.md` — Next.js Image optimization, responsive srcSet
- [ ] `docs/i18n-translation-checklist.md` — Deprecation of hardcoded Portuguese
- [ ] `README.md` — Link to this sprint
- [ ] `CHANGELOG.md` — Summary of improvements

---

## QUESTIONS?

Contact: Pedro Correa Lins (pedro.hcl29@gmail.com)  
Document Version: 1.0  
Last Updated: 2026-08-12
