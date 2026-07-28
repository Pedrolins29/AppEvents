# Sprint 09 - Event Preview & Navigation Cleanup

## Goal

Let organizers see the actual rendered invitation before publishing, and remove the unnecessary /dashboard step after login.

## Features

* Owner-only event preview page (`/events/{id}/preview`) rendering the real invitation (any theme, draft or published) with a demo RSVP form
* Shared `InvitationBody` rendering extracted so the public page and the preview page stay pixel-identical
* Preview link + live public-URL link added to the events list
* Shared `AppHeader` (logo, Templates link, user name, log out) on the authenticated events/new/edit/templates pages
* `/dashboard` removed as a destination: login goes straight to `/events`, old `/dashboard` links redirect there

## Security

* No new backend endpoints — preview reuses the existing ownership-checked `GET /api/events/{id}` (404, not 403, for non-owners)
* Verified end-to-end: a second user hitting another user's preview URL gets a clean 404, not the event data

## Acceptance Criteria

* Owner can preview any of their events (draft or published) exactly as a guest would see it, without publishing first
* A second user cannot see another user's draft or its data via the preview URL
* Logging in lands directly on `/events`; visiting `/dashboard` still works via redirect, not a 404
