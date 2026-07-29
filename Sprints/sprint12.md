# Sprint 12 - Email Verification & Locale-Aware Confirmation Emails

## Goal

Close a real account-abuse gap: registering with any email — even one the registrant doesn't
own — created a fully active account immediately. Require confirmation before login, and since
the platform is already trilingual (PT/EN/ES), send that confirmation in whatever language the
user was actually using when they signed up.

## Features

* Registration sends a confirmation email (via the existing Mailpit/SMTP infrastructure) with a
  single-use, 24h-expiring link; the account can't log in until it's confirmed
* Login on an unconfirmed account returns a distinct `403` (not the generic `401` used for bad
  credentials), so the frontend can offer a "resend confirmation email" action instead of a
  confusing login failure
* New `/verify-email` page handles the confirmation link: success, already-confirmed (idempotent
  - safe against email-scanner link prefetching), and expired/invalid with an inline resend form
* `POST /api/auth/resend-confirmation`, rate-limited tighter than the other auth endpoints (3/15
  min/IP) since it accepts an arbitrary target email with no ownership proof
* The confirmation email is now sent in the language the user had the platform set to at
  signup (PT/EN/ES) - captured via the frontend's `useLocale()` at registration, stored on the
  user (`PreferredLocale`) so a later resend matches too, and rendered through a small
  backend-side template set per locale (the backend has no i18n runtime of its own, so this is a
  deliberately hand-maintained mirror of the relevant frontend copy, not a shared source)

## Security

* Confirmation-check ordering in `LoginAsync` matters: it runs only *after* a successful password
  verify, so an attacker can't learn "this unconfirmed account exists" for an arbitrary email
  without already knowing its password - same enumeration class the existing generic
  unknown-email `401` already guards against
* `ResendConfirmationAsync` is enumeration-safe by design: unknown or already-confirmed emails get
  an identical `204` response with nothing sent
* Locale input on `RegisterRequest` is validated against a fixed allow-list (en/pt/es); an
  unsupported value is rejected with `400`, not silently coerced

## Acceptance Criteria

* A freshly registered account cannot log in until the emailed link is confirmed
* Confirming twice with the same link is idempotent (not an error)
* A wrong password and an unconfirmed account produce different, distinguishable status codes
* Registering while the platform is set to Portuguese sends a Portuguese confirmation email
  (subject and body); resending later uses the same stored language
* Resending confirmation for an unknown or already-confirmed email is indistinguishable from a
  real pending account, at the HTTP layer
