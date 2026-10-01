# Feature: Email & Notification System

## Purpose
Sends transactional notification emails to buyers and sellers for key lifecycle events (registration welcome, password reset tokens, order payment confirmation, shipment alerts).

## Responsibilities
- Rendering HTML email templates for transactional events.
- Abstracting email transport provider (Nodemailer, SendGrid, Mailgun).
- Asynchronous non-blocking dispatch of notification messages.

## Non-responsibilities
- User authentication logic (owned by `authentication.md`).

## Architecture
`NotificationService` -> `EmailTransport` -> `Nodemailer` / `SendGrid`.

## Data Model
System event payloads; optional audit logging of sent messages.

## API
Internal service functions (`sendWelcomeEmail`, `sendPasswordResetEmail`, `sendOrderConfirmationEmail`).

## Business Rules
- Email dispatch failures must not break core database transactions (e.g., if order payment succeeds but email fails, the order remains valid; error is logged).
- Do not log sensitive authentication tokens or credentials in notification logs.

## Security
- Password reset tokens delivered via email expire in 1 hour.
- SMTP passwords strictly managed via environment variables.

## State Transitions
`QUEUED` -> `SENT` | `FAILED`

## Error Cases
- SMTP connection timeout or invalid recipient address.

## Important Decisions
- Wrap email dispatch in try/catch blocks within event listeners or async queues so email failures do not roll back financial transactions.

## Dependencies
- `nodemailer`.

## Testing
- Mock `NotificationService` in integration tests to prevent sending real emails.

## Files
- Backend: `src/services/notification.service.js`, `src/utils/emailTemplates.js`

## Change Log
- 2026-09-30: Initial context document created.
