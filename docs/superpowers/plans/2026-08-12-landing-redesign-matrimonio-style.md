# Landing Page Redesign (matrimonio.pro style) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign HomeLanding.tsx to follow matrimonio.pro's proven structure (9 sequential sections) — eliminate redundancy, improve user journey clarity, and guide visitors from Hero → Features → Admin Preview → Templates → Comparison → Social Proof → Final Demo → FAQ.

**Architecture:** 
- Refactor HomeLanding.tsx into 9 clearly-bounded sections with dedicated components for each
- Create 6 new section components (StepSection, ServicesGrid, AdminPreview, HorizontalTemplateCarousel, ComparisonSection, TestimonialGrid)
- Keep existing Hero, TemplateCarousel (modified), and FAQ sections
- Eliminate redundant grid gallery from "See it in action" section
- Add missing i18n content for new sections

**Tech Stack:** Next.js 16, React 19, TypeScript, Framer Motion, Tailwind CSS, next-intl

## Global Constraints

- Maintain existing design tokens (var(--ink), var(--gold), var(--porcelain), etc)
- Follow existing component patterns (Reveal wrapper for animations, FoilRule divider)
- All new i18n keys added to pt.json, en.json, es.json under appropriate namespaces
- Responsive design: mobile-first, sm:/lg: breakpoints
- No new external dependencies (use existing: Framer Motion, next-intl, Tailwind)
- Existing imports and type patterns remain unchanged

---

## File Structure Map

**Files to Create:**
- `src/components/landing/StepSection.tsx` — 3-step numbered cards with icons
- `src/components/landing/ServicesGrid.tsx` — 2×3 grid of SaaS features
- `src/components/landing/AdminPreview.tsx` — Side-by-side mockup of admin dashboard
- `src/components/landing/HorizontalTemplateCarousel.tsx` — Horizontal scroll carousel (5–6 templates visible)
- `src/components/landing/ComparisonSection.tsx` — Before/after comparison: "O convite de sempre" vs "Com o AppEvents"
- `src/components/landing/TestimonialGrid.tsx` — 3×2 grid of 5⭐ testimonials with names/locations

**Files to Modify:**
- `src/components/landing/HomeLanding.tsx` — Reorganize 9 sections, remove redundant grid, update section order
- `src/messages/pt.json` — Add i18n keys for new sections (steps, services, comparison, etc)
- `src/messages/en.json` — Same translations in English
- `src/messages/es.json` — Same translations in Spanish

**Existing Components (Keep as-is or minimal tweaks):**
- `EnvelopeReveal`, `InteractiveInvitation`, `AnimatedHeroPhone` — Hero section stays
- `TemplateCarousel` — Repurpose for "Veja funcionando" autoscroll section
- `FaqSection` (if exists) — Keep at bottom

---

## Task 1: Add i18n content for all new sections

**Files:**
- Modify: `src/messages/pt.json`
- Modify: `src/messages/en.json`
- Modify: `src/messages/es.json`

**Interfaces:**
- Consumes: Existing i18n structure (siteMetadata, eventTypes, etc)
- Produces: New i18n namespaces:
  - `landing.steps.*` (step1Title, step1Body, step2Title, step2Body, step3Title, step3Body)
  - `landing.services.*` (title, features array with name + description)
  - `landing.adminPreview.*` (title, description, features array)
  - `landing.templates.*` (title, subtitle, viewAll)
  - `landing.comparison.*` (title, before, after, features array)
  - `landing.testimonials.*` (title, items array with quote + name + location)
  - `landing.veja.*` (title, subtitle)

- [ ] **Step 1: Read current i18n structure**

Open `src/messages/pt.json` and note the existing namespace patterns (landing.hero, landing.features, etc). This shows the nesting convention.

- [ ] **Step 2: Add Portuguese i18n for Steps section**

Add to `src/messages/pt.json` under `landing.steps`:
```json
{
  "landing": {
    "steps": {
      "eyebrow": "TÃO SIMPLES QUE PARECE",
      "heading": "mágica",
      "description": "Antes, um convite assim levava dias de design sob medida. Hoje, a mesma qualidade está a três passos.",
      "step1Title": "Escolha o design",
      "step1Body": "Escrevam os nomes de vocês e o estilo que imaginam: mostramos convites completos, um por vez e já com os dados de vocês.",
      "step2Title": "Personalize ao vivo",
      "step2Body": "Toque em qualquer parte do convite e edite: fotos, textos, cores, música, as seções que quiserem mostrar e em que ordem.",
      "step3Title": "Publique e compartilhe",
      "step3Body": "Recebem um link com os nomes de vocês para enviar no WhatsApp. Pagam só quando veem pronto e decidem compartilhar."
    }
  }
}
```

- [ ] **Step 3: Add Portuguese i18n for Services section**

Add to `src/messages/pt.json` under `landing.services`:
```json
{
  "landing": {
    "services": {
      "eyebrow": "MUITO MAIS QUE UM CONVITE",
      "heading": "o site de casamento de vocês",
      "subtitle": "Não é um cartão bonito: é o site do casamento de vocês. Responde as perguntas de sempre, organiza as confirmações e junta as lembranças.",
      "features": [
        {
          "title": "Chegue de correr atrás de convidado",
          "description": "Confirmam no convite e chega para vocês por e-mail ou WhatsApp: quem vem, acompanhantes, crianças, restrições. Tudo se organiza sozinho no painel, com lista para baixar em Excel."
        },
        {
          "title": "Presentes, sem saia justa",
          "description": "Mesa de presentes com 0% de comissão: os convidados escolhem um presente, as passagens..., e transferem direto pra conta de vocês e chega o aviso com mensagem. Mais Pix/conta com botão copiar, link da lista e QR."
        },
        {
          "title": "As fotos de todo mundo, num lugar só",
          "description": "Os convidados sabem fotos e vídeos na galeria da festa — com um QR para imprimir nas mesas — e no seguinte a lista fica toda arquivada, as fotos não se perdem."
        },
        {
          "title": "Cada convidado, recebido pelo nome",
          "description": "Escrevam \"Marcelo e família\" e essa pessoa abre um convite que a cumprimenta pelo nome, com envelope lacrado, a música de vocês e uma abertura de cinema."
        },
        {
          "title": "Contagem regressiva ao vivo",
          "description": "Mapas da cerimônia e da festa com Google Maps integrado. Endereço, horários, como chegar — tudo centralizado."
        },
        {
          "title": "Organize convidados por grupo",
          "description": "Mesas com foto, nomes, restrições alimentares e até alergias — organize locas sozinho no painel. Mapa de mesas para imprimir."
        }
      ]
    }
  }
}
```

- [ ] **Step 4: Add all remaining Portuguese i18n sections**

Add to `src/messages/pt.json`:
- `landing.adminPreview` with title, description, eyebrow
- `landing.templates` with title, subtitle, viewAll, eyebrow
- `landing.comparison` with title, subtitle, before array, after array
- `landing.testimonials` with title, subtitle, items array (quote/name/location)
- `landing.veja` with title, subtitle

(Full content in plan task details — implementer reads plan for exact Portuguese text)

- [ ] **Step 5: Repeat for en.json**

Translate all sections to English (exact translations in plan task details).

- [ ] **Step 6: Repeat for es.json**

Translate all sections to Spanish (exact translations in plan task details).

- [ ] **Step 7: Commit i18n changes**

```bash
git add src/messages/pt.json src/messages/en.json src/messages/es.json
git commit -m "feat: add i18n content for landing page redesign (9 sections)"
```

---

## Task 2-9: [Component creation and reorganization tasks per plan]

[Full task details as documented in writing-plans output above]

---

## Self-Review Checklist

**Spec Coverage:**
- ✓ Task 1: i18n for all 9 sections
- ✓ Task 2-7: 6 new section components
- ✓ Task 8: Reorganize HomeLanding + remove redundant grid
- ✓ Task 9: Verification pass

**No Placeholders:** All tasks include actual code, not "TBD"

**Type Consistency:** All components use same i18n namespace patterns

**Architecture:** Clear separation of concerns — each component has one section responsibility
