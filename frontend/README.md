# AppEvents Frontend

Next.js (App Router) + TypeScript + Tailwind CSS.

```
src/
  app/
    page.tsx                    Landing page (HomeLanding, or SalesLanding behind SALES_LANDING)
    register/, login/,
      verify-email/page.tsx     Auth flow (register requires email confirmation before login)
    criar-convite/              SEO hub + category landing pages with the InstantPreview widget
    events/                     Authenticated dashboard: list, new, [id]/edit, [id]/preview
    e/[slug]/page.tsx           Public invitation page (ISR-cached, RSVP form)
    templates/                  Theme gallery + per-theme preview
  lib/
    apiClient.ts        fetch wrapper: attaches the access token, retries once on 401 via silent refresh
    authApi.ts          register / login / refresh / logout / getMe
    auth-context.tsx     React context holding the access token in memory (never localStorage)
  types/auth.ts          DTOs mirrored from the backend
```

The refresh token lives only in an `HttpOnly` cookie set by the backend; the access token is
kept in memory and re-minted via a silent `/api/auth/refresh` call on load.

## Setup

```
cp .env.example .env.local   # already present locally; edit NEXT_PUBLIC_API_BASE_URL if needed
npm install
dotnet dev-certs https -ep ./aspnet-dev-cert.pem --format Pem --no-password   # once, see note below
npm run dev
```

App at `http://localhost:3000`. Requires the backend running at the URL configured in
`NEXT_PUBLIC_API_BASE_URL` (see [../backend/README.md](../backend/README.md)).

**Why the `dotnet dev-certs` step**: the browser already trusts the backend's self-signed local
HTTPS certificate (via `dotnet dev-certs https --trust`, see backend setup), but Node's own
`fetch` — used by Server Components on the public invitation page (`app/e/[slug]`) — does not
consult the OS certificate store and will fail with `self-signed certificate`. The command above
exports that same certificate to `aspnet-dev-cert.pem` (gitignored, machine-specific — every
developer runs this once); `npm run dev`/`build`/`start` point Node at it via
`NODE_EXTRA_CA_CERTS`. If the backend's dev cert is ever regenerated (`dotnet dev-certs https
--clean` followed by `--trust`), re-run this export.

## Other commands

```
npm run build   # production build
npm run lint    # ESLint
```

## Feature flags & environment variables

All optional, all blank/unset by default — see `.env.example`.

- `SALES_LANDING` (server-only) — `"true"` renders the PLG sales landing (`/`) instead of the
  default, fully-truthful landing. Off until the features its copy sells (see below) actually ship.
- `NEXT_PUBLIC_PREMIUM_UPSELL` — `"true"` shows an optional "unlock premium features" banner next
  to the publish button on the event editor. Never blocks publishing either way; only worth
  turning on once at least one `NEXT_PUBLIC_LASTLINK_CHECKOUT_*` URL below is also set (see
  `lib/checkoutUrls.ts`), otherwise the banner has nothing to link to and stays hidden.
- `NEXT_PUBLIC_LASTLINK_CHECKOUT_WEDDING` / `_BABY_SHOWER` / `_BIRTHDAY_GRADUATION` /
  `_CORPORATE` — the Lastlink hosted checkout URL for each event-type segment, created in the
  Lastlink dashboard (not by this codebase). `_CORPORATE` is reserved but currently unused — there
  is no `Corporate` `EventType` yet. `getCheckoutUrl()` appends `?appeventsRef={userId}.{eventId}`
  so a paid webhook can (best-effort, unverified) be traced back to the purchasing user/event —
  see the backend's `Lastlink:` appsettings section and `PaymentWebhookProcessorService`.
- `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_GOOGLE_ADS_ID` / `NEXT_PUBLIC_TIKTOK_PIXEL_ID` — ad
  pixel IDs (`components/AdPixels.tsx`). Each is independent; an unset id means that pixel's
  script never renders and its domains are never added to the CSP (`next.config.ts`). When set,
  each fires an automatic page view plus an "initiate checkout"-equivalent event on the upsell
  CTA click; true purchase-conversion tracking additionally needs Lastlink's checkout to redirect
  back to `/obrigado` after payment (unverified whether it supports a configurable redirect URL).
- `NEXT_PUBLIC_R2_PUBLIC_BASE_URL` — set once the backend's `Storage:Provider` is switched to `R2`
  (see backend's `Storage:R2:*` appsettings section), to the same value as
  `Storage:R2:PublicBaseUrl`. Adds that origin to the CSP `img-src` so uploaded images actually
  render; unset means the CSP stays at today's local-storage-only baseline.
