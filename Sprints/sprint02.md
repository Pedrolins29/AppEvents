# Sprint 02 - Event Management

## Goal

Allow customers to create and manage events.

## Entities

Event

Fields:

* Id
* Name
* Slug
* EventType
* EventDate
* Description
* Address
* UserId

## Features

* Create Event
* Update Event
* Delete Event
* List Events

## Security

* Ownership validation
* Input sanitization
* Slug validation
* Audit logging

## Acceptance Criteria

* Users can only manage their own events.
* XSS attempts are blocked.
* SQL Injection attempts are blocked.
