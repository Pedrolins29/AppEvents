# AppEvents

A SaaS platform for digital event invitations (weddings, birthdays, 15th birthday parties,
graduations, baby showers, gender reveals, corporate events). See [start.md](start.md) for the
full product vision and [Sprints/](Sprints/) for the sprint-by-sprint scope and history.

## Features

- **Free invitation creation** — event name, date, description, address, dress code, and up to
  15 timeline items, across 6 event types (wedding, birthday, 15th birthday, graduation, baby
  shower, gender reveal).
- **4 authored themes** (elegant, minimalist, floral, modern), previewable at `/templates` before
  signup.
- **Public invitation page** (`/e/[slug]`) — live countdown, cover/featured photo, up to 10 gallery
  images, Google Maps/Waze links, horizontally-scrollable photo strip, and a themed RSVP form. ISR
  cached (60s) so a burst of guests on event day doesn't hammer the API.
- **RSVP + guest list** — organizers add guests, each gets a personal invite link
  (`/e/{slug}?g={token}`) that prefills their RSVP and tracks Pending/Confirmed/Declined; manual
  "nudge" reminders via a pre-filled WhatsApp (`wa.me`) link or email.
- **`/criar-convite` instant-preview funnel** — a hub + 5 category landing pages
  (`/criar-convite/{casamento,aniversario,formatura,debutantes,cha-de-bebe}`) with a no-login,
  no-database "type your name, see it live" preview widget; the preview auto-converts into a real
  event on the visitor's first login.
- **Dynamic Open Graph images** per invitation (`next/og`) — sharing a link on WhatsApp shows a
  themed, on-brand preview card instead of a generic one.
- **3 languages** (pt/en/es) — pt is the default/primary voice.
- **Auth**: register/login with JWT access tokens + rotating refresh tokens, mandatory email
  confirmation before first login, account lockout after repeated failed logins.
- **Commerce infrastructure** (behind flags, not yet publicly offered): Lastlink checkout links,
  webhook-driven entitlements, ad pixels (Meta/Google/TikTok) — see
  [frontend/README.md](frontend/README.md#feature-flags--environment-variables).

See [Sprints/sprint19.md](Sprints/sprint19.md) for a current funnel/UX audit and the prioritized
list of activation improvements planned next.

## Structure

```
backend/    .NET 10 Web API — Clean Architecture (Domain / Application / Infrastructure / Api)
frontend/   Next.js (App Router) + TypeScript + Tailwind CSS
Sprints/    Sprint-by-sprint scope and security requirements
```

See [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md) for
stack-specific setup.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 24+](https://nodejs.org/) and npm
- PostgreSQL, running locally — recommended via [Docker](https://www.docker.com/) inside WSL2
  (e.g. Ubuntu 24.04) using the `docker-compose.yaml` at the repo root (`docker compose up -d`),
  or a native [PostgreSQL 16+](https://www.postgresql.org/download/) install. See
  [backend/README.md](backend/README.md) for details on all options, including GUI/IDE
  connection settings.

## Running locally

1. Set up the backend (database, secrets, migrations) — see [backend/README.md](backend/README.md).
2. Start the API:
   ```
   cd backend
   dotnet run --project src/AppEvents.Api
   ```
   The API listens on `https://localhost:5001` (Swagger UI at `/swagger` in Development).
3. Start the frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```
   The app is served at `http://localhost:3000`.
4. Register an account at `/register`, confirm the email (Mailpit at `http://localhost:8025` in
   dev — see [backend/README.md](backend/README.md)), then log in at `/login` to reach `/events`.

## Tests

```
cd backend
dotnet test
```

Unit tests run standalone. Integration tests require a running local PostgreSQL instance with
an `appevents_test` database (see [backend/README.md](backend/README.md)).
