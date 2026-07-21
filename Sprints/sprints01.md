# Sprint 01 - Foundation

## Goal

Create the base architecture of the SaaS.

## Tech Stack

Backend:

* .NET 10 Web API
* Entity Framework Core
* PostgreSQL

Frontend:

* Next.js
* TypeScript
* TailwindCSS

Infrastructure:

* Azure App Service
* Azure Blob Storage
* Azure Database for PostgreSQL

## Deliverables

### Authentication

Create:

* Register
* Login
* JWT Authentication
* Refresh Tokens

### Entities

User
Role

### Security Requirements

Implement:

* BCrypt password hashing
* HTTPS enforcement
* JWT validation
* Rate limiting
* Global exception handler
* Input validation
* Security headers
* Structured logging

### Acceptance Criteria

* User can register.
* User can login.
* Protected endpoints require JWT.
* OWASP A01, A02, A03 controls implemented.
