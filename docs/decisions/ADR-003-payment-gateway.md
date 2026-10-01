# ADR-003: Selection of Razorpay for Payment Gateway Integration

## Status
Accepted

## Context
BookWORM operates primarily as a multi-vendor book marketplace catering to the Indian market. It requires reliable card, UPI, netbanking, and wallet payment support, automated payment order creation, webhook notifications, signature verification, and marketplace fee structures.

## Decision
We decided to integrate **Razorpay** as the primary payment gateway.
The implementation enforces:
1. Server-initiated order creation (`razorpay.orders.create`).
2. Server-side HMAC-SHA256 signature verification (`crypto.createHmac`).
3. Webhook listener with idempotency table checking (`EventLog`).

## Alternatives Considered
1. **Stripe:** Industry standard internationally, but higher transaction fees and regulatory friction for domestic Indian UPI transactions.
2. **PayPal:** Ideal for global cross-border payments, but inefficient for domestic Indian currency (INR) purchases.

## Consequences
### Benefits
- High success rates for Indian payment methods (UPI, Cards, Netbanking).
- Robust webhook system for asynchronous payment updates (`order.paid`, `payment.failed`).
- Clear API documentation and official Node.js SDK support.
### Costs & Trade-offs
- Webhook signature secret and API key secret must be carefully protected in server environment variables.
- Direct automated automated multi-seller payouts via Razorpay Route require verified seller KYC accounts.
