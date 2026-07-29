# Sprint 11 - Security Hardening: Registration & CI

## Goal

Close the remaining gaps found in the OWASP security audit: registration had no bot protection,
a public page had a minor script-injection edge case, CI didn't gate on known-vulnerable
dependencies, and cross-user access attempts weren't specifically audit-logged.

## Features

* Honeypot field added to registration (mirrors the existing RSVP honeypot), rejecting
  automated signups server-side
* `</script>` escaped in the public invitation page's JSON-LD payload, closing a script-injection
  edge case if an organizer's description ever contained that literal substring
* CI now runs `dotnet list package --vulnerable` and `npm audit` on every push/PR, gated at the
  `critical` severity threshold (verified against the project's real dependency set first, so it
  doesn't immediately red the build on pre-existing `high`-severity transitive advisories with no
  safe fix yet)
* Cross-user access attempts (hitting another user's event) now produce an explicit
  `"Audit: ..."` warning log line, matching the existing login/lockout/refresh audit-logging
  convention

## Security

* Ordering-safe: the register honeypot mirrors RSVP's proven server-side rejection, not a
  client-only check
* CI vulnerability gate deliberately set to `critical` (not `high`) after confirming `high` would
  fail immediately on unrelated dev-tooling transitive packages with no fix available - avoids a
  gate that trains everyone to ignore CI red

## Acceptance Criteria

* A registration request with the honeypot field filled is rejected with 400
* An event description containing `</script>` can no longer break out of the JSON-LD script tag
* CI fails if a `critical`-severity vulnerable package is introduced
* Attempting to access another user's event produces a traceable audit log line
