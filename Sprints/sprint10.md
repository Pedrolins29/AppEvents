# Sprint 10 - Internationalization (PT/EN/ES)

## Goal

Support Portuguese, English, and Spanish across the whole platform, with the right language detected automatically and a manual switcher always available.

## Features

* `next-intl` wired via Next 16's "App Router without i18n routing" mode — no `/pt/...`, `/en/...` URL prefixes, same URLs in every language
* `proxy.ts` resolves locale from a `NEXT_LOCALE` cookie, falling back to the browser's `Accept-Language` header on first visit (default `pt`) — no IP geolocation
* `LanguageSwitcher` mounted on every page surface: `SiteHeader`, `AppHeader`, and directly on `InvitationBody`/`templates/[theme]` (which have no shared header)
* Full translation coverage: landing page, header/footer, login/register, dashboard/events CRUD (list, new, edit, preview), templates gallery + theme preview (including its sample demo content), the public guest invitation (`/e/[slug]`) and RSVP flow, and all page metadata (titles/descriptions)
* `EVENT_TYPE_LABELS`/new `RsvpStatus` labels became `getEventTypeLabels(t)`/`getRsvpStatusLabels(t)` functions instead of static exports, since translated labels need a translator instance
* `formatEventDate` now takes an explicit locale instead of relying on the runtime's ambiguous default

## Fixed along the way

* `frontend/proxy.ts` at the project root is silently ignored in this project's `src/`-layout — must live at `frontend/src/proxy.ts`, next to `app/`
* `SiteFooter`/`InvitationBody` can't be async Server Components using `getTranslations` — both get rendered inline inside `"use client"` pages (`login`, `register`, `templates`, `events/[id]/preview`), which pulls them into the client bundle where the server-only translation API throws. Converted both to Client Components with `useTranslations`, matching `SiteHeader`'s already-established pattern

## Acceptance Criteria

* A fresh visitor's browser language (pt/en/es) is detected correctly with no flash of the wrong language; any other language falls back to Portuguese
* An explicit switch via the dropdown persists across every subsequent page, in a new tab, and overrides the browser-language default from then on
* No page — including the ones with no shared header (guest invitation, theme preview) — leaves a visitor without a way to change language
