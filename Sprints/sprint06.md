# Sprint 07 - Lastlink Integration

## Goal

Process purchases using Lastlink.

## Features

* Webhook endpoint
* Order creation
* Access release

## Security

### Mandatory

* Webhook signature validation
* Replay attack prevention
* Idempotency keys
* Audit logs

## Acceptance Criteria

* Fake webhooks are rejected.
* Duplicate webhooks do not create duplicate orders.
* Purchase activates customer account.
