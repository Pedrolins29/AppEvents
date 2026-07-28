# Sprint 08 - Dress Code, Timeline & Showcase Photos

## Goal

Let organizers add richer invitation content (dress code, an event-day timeline) and show real photos instead of placeholders on the templates gallery and the marketing landing page.

## Features

* `DressCode` (text) and `TimelineItems` (ordered time/label list, stored as JSON) added to `Event`
* Event form: dress code input + a `TimelineItemsEditor` for adding/reordering/removing timeline entries
* Public invitation page (`/e/[slug]`) and theme preview page (`/templates/[theme]`) render the dress code and timeline sections when present
* `InvitationPhoneMockup` + `PhotoPlaceholder` components, with a `photoUrl` prop so mockups can show a real photo instead of a placeholder
* Real showcase photos wired into the landing page's "See it in action" cards and into the `/templates/[theme]` hero covers

## Security

* New fields validated server-side (dress code length, timeline item shape) through the existing FluentValidation validators
* No new endpoints — fields ride on the existing authenticated create/update event endpoints

## Acceptance Criteria

* An organizer can set a dress code and a multi-item timeline on an event and see both on the public invitation page
* Theme previews and the landing page show real photos, not placeholders
* Existing events without a dress code or timeline render unaffected (both sections are optional)
