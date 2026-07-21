# AppEvents

A SaaS platform for digital event invitations (weddings, birthdays, 15th birthday parties,
graduations, baby showers, gender reveals, corporate events). See [start.md](start.md) for the
full product vision and [Sprints/](Sprints/) for the sprint-by-sprint scope.

This repo is currently at **Sprint 01 — Foundation**: base architecture plus a working
authentication system (register, login, JWT access tokens, refresh token rotation).

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
- [PostgreSQL 16+](https://www.postgresql.org/download/), running locally

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
4. Register an account at `/register`, then log in at `/login` to reach `/dashboard`.

## Tests

```
cd backend
dotnet test
```

Unit tests run standalone. Integration tests require a running local PostgreSQL instance with
an `appevents_test` database (see [backend/README.md](backend/README.md)).
