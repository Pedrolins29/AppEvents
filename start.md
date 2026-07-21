# PROJECT VISION - EVENT INVITATION SAAS

## Context

We are building a SaaS platform focused on digital invitations for social events.

The initial goal is to validate market demand through a simple, scalable, secure, and mobile-first MVP.

The platform should allow customers to create, customize, publish, and manage digital invitations for multiple event types.

The project must be designed from the beginning to support future upsells, order bumps, marketing integrations, and event monetization features.

---

# Business Goal

Provide a premium digital invitation experience that can be created in less than 10 minutes without technical knowledge.

Primary audience:

* Weddings
* Birthday parties
* 15th birthday celebrations
* Graduation parties
* Baby showers
* Gender reveal parties
* Corporate celebrations

The business model will initially focus on:

* One-time event purchases
* Order bumps
* Upsells

Recurring subscriptions may be considered in future versions.

---

# MVP Scope

The MVP should focus exclusively on validating whether users are willing to pay for digital invitations.

The following features are mandatory:

## Authentication

* User registration
* User login
* JWT authentication
* Refresh tokens

---

## Event Management

Users must be able to:

* Create events
* Edit events
* Delete events
* Publish events

Event types:

* Wedding
* Birthday
* Graduation
* 15 Years Party
* Baby Shower
* Gender Reveal

---

## Invitation Templates

The system must provide customizable templates.

Initial templates:

* Elegant
* Minimalist
* Floral
* Modern

Each template must support:

* Cover image
* Event title
* Event description
* Event date
* Event location
* Background music

---

## Public Invitation Page

Each event must generate a public URL.

Example:

https://platform.com/e/john-and-mary

Features:

* Hero section
* Countdown timer
* Event story
* Location
* RSVP
* Mobile optimized experience

---

## RSVP

Guests must be able to:

* Confirm attendance
* Decline invitation

Organizer dashboard must display:

* Total guests
* Confirmed guests
* Pending guests

---

## Maps Integration

The invitation page must support:

* Google Maps
* Waze

Users should be able to open navigation apps directly.

---

## Checkout Integration

The platform must integrate with Lastlink.

Flow:

Customer Purchase
→ Lastlink Checkout
→ Webhook
→ Platform Activation

The platform does not process payments directly.

Lastlink is the payment provider.

---

## Marketing Tracking

The platform must support custom tracking integrations.

Users must be able to configure:

* Meta Pixel
* Google Tag Manager
* Google Analytics

Tracking scripts should be injected dynamically into invitation pages.

---

# Future Roadmap (Not Part of MVP)

These features must NOT be implemented during MVP but the architecture should support them.

## Order Bumps

* Event Logo Generator
* Collaborative Photo Album

## Upsells

* Custom Domain
* WhatsApp Automation
* QR Code Check-in
* Gift Registry (PIX)
* AI Generated Invitation Content

---

# Architecture Requirements

Architecture style:

Modular Monolith

Future-ready for microservices extraction.

Modules:

* Identity
* Events
* Templates
* Invitations
* RSVP
* Orders
* Tracking

---

# Technology Stack

## Backend

* .NET 10
* ASP.NET Core Web API
* Entity Framework Core
* FluentValidation
* Serilog

---

## Frontend

* Next.js
* TypeScript
* Tailwind CSS

---

## Database

* PostgreSQL

---

## Cache

* Redis

(Optional during MVP)

---

## Messaging

* RabbitMQ

(Optional during MVP)

---

## Storage

* Azure Blob Storage

Storage policy:

Allowed:

* Images
* Logos
* Invitation assets

Not allowed during MVP:

* User uploaded videos

---

## Cloud

Microsoft Azure

Services:

* Azure App Service or Container Apps
* Azure PostgreSQL
* Azure Blob Storage
* Azure Key Vault
* Application Insights

---

# Security Requirements

Security is mandatory from Sprint 1.

The project must comply with OWASP Top 10 recommendations.

Mandatory protections:

* SQL Injection prevention
* XSS prevention
* CSRF protection
* Authentication hardening
* Authorization validation
* Security headers
* HTTPS only
* Secure password hashing
* Rate limiting
* Input validation
* Output encoding
* Audit logging
* Dependency scanning
* Secrets management

---

# Performance Requirements

Invitation pages should:

* Load in less than 3 seconds
* Achieve Lighthouse score above 90
* Be mobile-first
* Support thousands of concurrent visitors

---

# Mobile First Requirement

This platform is primarily consumed through smartphones.

All invitation experiences must be designed mobile-first.

Target widths:

* 390px
* 414px
* 430px

Desktop support is secondary.

---

# Coding Standards

Follow:

* Clean Architecture principles
* SOLID principles
* Domain Driven Design concepts where appropriate
* Repository Pattern only when necessary
* CQRS only when justified
* RESTful APIs
* Structured logging
* Testable code

---

# Deliverable Expectations

When implementing features:

* Generate production-ready code
* Generate tests when applicable
* Follow security requirements
* Follow architecture standards
* Avoid overengineering
* Prioritize MVP validation speed

Always favor simplicity, maintainability, security, and scalability.
