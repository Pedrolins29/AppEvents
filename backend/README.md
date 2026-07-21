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

Create two local databases:

```
createdb appevents_dev
createdb appevents_test
```

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
`WebApplicationFactory` against `appevents_test` — no Docker/Testcontainers, since PostgreSQL is
already installed locally for dev. Each test uses a GUID-suffixed email to avoid collisions
instead of resetting the database between runs.

## Adding a new migration

```
dotnet ef migrations add <Name> -p src/AppEvents.Infrastructure -s src/AppEvents.Api -o Persistence/Migrations
dotnet ef database update -p src/AppEvents.Infrastructure -s src/AppEvents.Api
```
