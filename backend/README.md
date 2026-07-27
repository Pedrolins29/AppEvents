# AppEvents Backend

.NET 10 Web API, following Clean Architecture with a folder-per-module layout (see
`src/*/Identity/` — future modules like `Events`, `Templates`, etc. slot in as sibling folders
in each layer).

```
src/
  AppEvents.Domain/          Entities, no external dependencies
  AppEvents.Application/     DTOs, validators, service interfaces, AuthService
  AppEvents.Infrastructure/  EF Core, repositories, JWT, password hashing
  AppEvents.Api/             Controllers, middleware, DI wiring, Program.cs
tests/
  AppEvents.UnitTests/       Validators, AuthService (mocked deps), hashing, JWT claims
  AppEvents.IntegrationTests/ Full HTTP pipeline against a real local Postgres test DB
```

Reference direction: `Api → Application, Infrastructure` · `Infrastructure → Application, Domain`
· `Application → Domain` · `Domain → nothing`.

## Setup

### 1. PostgreSQL

**Option A — Docker via WSL2/Ubuntu (recommended on Windows).** A `docker-compose.yaml` at the
repo root runs Postgres 17 and creates both databases (`appevents_dev` via `POSTGRES_DB`,
`appevents_test` via an init script) on first start. Docker Engine runs natively inside a WSL2
Linux distro (e.g. Ubuntu 24.04) rather than through Docker Desktop — lighter weight, no separate
app to run. Run the compose commands from inside that distro:

```
# from a WSL2/Ubuntu terminal, in the repo's Windows path mounted at /mnt/c/...
cd /mnt/c/Users/<you>/Souce/AppEvents
docker compose up -d
```

Or stay in a Windows terminal and prefix each command with `wsl -d <distro> --`:

```
wsl -d Ubuntu-24.04 -- docker compose -f /mnt/c/Users/<you>/Souce/AppEvents/docker-compose.yaml up -d
```

WSL2 automatically forwards the container's port to Windows — `localhost:5432` (or `127.0.0.1`)
reaches it from Windows-side tools (`psql`, the app, GUI clients) with no extra networking setup.

Default credentials: `postgres` / `postgres_dev_password` (override by copying `.env.example` to
`.env` at the repo root and setting `POSTGRES_PASSWORD`). Common commands:

```
docker compose up -d      # start (creates the container + volume on first run)
docker compose stop       # stop the container; data is kept in the named volume
docker compose start      # resume a stopped container
docker compose down       # remove the container; data still survives (named volume persists)
docker compose down -v    # remove the container AND the volume — this deletes all data
```

**Option B — Docker Desktop or a native install.** If you have Docker Desktop installed, the same
`docker compose` commands work directly from a Windows terminal instead — no WSL prefix needed.
Without Docker at all, install PostgreSQL 16+ locally and create the two databases yourself:

```
createdb appevents_dev
createdb appevents_test
```

#### Connecting a GUI client / IDE extension

Point it at:

| Setting  | Value |
|----------|-------|
| Host     | `localhost` (or `127.0.0.1`) |
| Port     | `5432` |
| User     | `postgres` |
| Password | `postgres_dev_password` (or your `.env` override) |
| Database | `appevents_dev` |
| SSL mode | **disable** |

The container has no SSL certificate configured, so an extension defaulting to "require"/"prefer"
SSL will fail to connect (often silently, or with a generic timeout/error) — explicitly disabling
SSL is usually the fix if a client that should work "just won't connect."

### 2. Secrets

Connection strings and the JWT signing key are never committed — they live in
[.NET user-secrets](https://learn.microsoft.com/aspnet/core/security/app-secrets), scoped per
project.

```
cd src/AppEvents.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:AppEventsDb" "Host=localhost;Port=5432;Database=appevents_dev;Username=postgres;Password=<your-local-password>"
dotnet user-secrets set "Jwt:SigningKey" "<a random 256-bit+ base64 string>"
```

For integration tests (they hit `appevents_test` directly, not through the Api's secrets):

```
cd tests/AppEvents.IntegrationTests
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:AppEventsDb" "Host=localhost;Port=5432;Database=appevents_test;Username=postgres;Password=<your-local-password>"
dotnet user-secrets set "Jwt:SigningKey" "<any test signing key>"
```

### 3. Migrations

`dotnet-ef` is pinned via a local tool manifest — no global install needed.

```
dotnet tool restore
dotnet ef database update -p src/AppEvents.Infrastructure -s src/AppEvents.Api
```

This also seeds the `Admin` and `Customer` roles.

### 4. Run

```
dotnet dev-certs https --trust   # once, for local HTTPS
dotnet run --project src/AppEvents.Api
```

API at `https://localhost:5001`, Swagger UI at `/swagger` (Development only).

## Tests

```
dotnet test
```

Unit tests mock all dependencies. Integration tests run the full ASP.NET Core pipeline via
`WebApplicationFactory` against `appevents_test` — no Testcontainers; they connect to whichever
Postgres instance is up (Docker or native, per the setup above). Each test uses a GUID-suffixed
email to avoid collisions instead of resetting the database between runs.

## Adding a new migration

```
dotnet ef migrations add <Name> -p src/AppEvents.Infrastructure -s src/AppEvents.Api -o Persistence/Migrations
dotnet ef database update -p src/AppEvents.Infrastructure -s src/AppEvents.Api
```
