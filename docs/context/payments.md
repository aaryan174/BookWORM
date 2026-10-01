# Feature: Payment Integration Subsystem (Razorpay)

## Purpose
Handles server-side Razorpay order creation, payment signature verification, HMAC validation, idempotent webhook event processing, and financial ledger transaction auditing.

## Responsibilities
- Creating Razorpay Payment Orders via Razorpay SDK.
- Verifying client payment HMAC signatures (`razorpay_signature`).
- Webhook signature verification and event ingestion.
- Idempotency control via `EventLog` collection.
- Audit trail logging in `PaymentTransaction` collection.

## Non-responsibilities
- UI payment gateway modal rendering (handled by Razorpay Checkout JS script on client).

## Architecture
`PaymentRouter` -> `PaymentController` -> `PaymentService` -> `RazorpayClient` / `PaymentDAO` -> `PaymentTransactionModel` / `EventLogModel`.

## Data Model
- Collections: `payment_transactions`, `event_logs`
- Payment Key Fields: `orderId`, `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`, `amount`, `status`.

## API
- `POST /api/v1/payments/create-order`
- `POST /api/v1/payments/verify`
- `POST /api/v1/payments/webhook`

## Business Rules
- Payment success claimed by client is never trusted without HMAC-SHA256 signature verification on backend.
- Duplicate webhooks sharing the same `event_id` must be safely ignored (`200 OK` response without duplicate stock deduction).
- Verification enforces that order grand total matches the exact amount captured in Razorpay.

## Security
- HMAC signature checks using `crypto.timingSafeEqual` to avoid timing side-channel attacks.
- Razorpay Secret Key is strictly stored in server environment variables and never exposed to the client.

## State Transitions
`CREATED` -> `AUTHORIZED` -> `CAPTURED` | `FAILED`

## Error Cases
- `400 Bad Request`: Invalid signature or payload mismatch.
- `409 Conflict`: Webhook event already processed.

## Important Decisions
- Store raw webhook payloads in `payment_transactions` for audit and compliance requirements.

## Dependencies
- `razorpay` SDK, `crypto`.

## Testing
- Unit test HMAC signature generation and timing-safe comparison.
- Integration test payment order creation and webhook idempotency handling.

## Files
- Backend: `src/controllers/payment.controller.js`, `src/services/payment.service.js`, `src/routes/payment.routes.js`
- Frontend: `src/features/checkout/hooks/usePayment.js`

## Change Log
- 2026-09-30: Initial context document created.
