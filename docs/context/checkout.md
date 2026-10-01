# Feature: Checkout & Order Summary

## Purpose
Orchestrates the pre-purchase checkout workflow, validates address selection, checks final stock availability, and computes accurate server-authoritative financial breakdowns (subtotal, shipping, tax, grand total).

## Responsibilities
- Address verification for order delivery.
- Live recalculation of prices, taxes, and shipping fees.
- Generating a pending checkout summary token / payload before order creation.

## Non-responsibilities
- Direct payment gateway interaction (owned by `payments.md`).

## Architecture
`CheckoutRouter` -> `CheckoutController` -> `CheckoutService` -> `CartDAO` / `AddressDAO`.

## Data Model
Consumes `Cart` and `Address` documents; outputs an immutable checkout summary structure.

## API
- `POST /api/v1/orders/checkout-summary`

## Business Rules
- User must select a valid delivery address belonging to their user account.
- Backend recalculates all prices; frontend submitted financial totals are ignored.
- Shipping fees: Flat rate (e.g., ₹50) or free for subtotals exceeding ₹999.
- Tax rate: Standard 5% GST calculated on item subtotal.

## Security
- Requires user authentication.
- Strict validation on `addressId`.

## State Transitions
`CART_REVIEW` -> `CHECKOUT_SUMMARY_GENERATED` -> `ORDER_CREATED`

## Error Cases
- `400 Bad Request`: Empty cart or invalid address selection.
- `409 Conflict`: Listing stock changed during checkout attempt.

## Important Decisions
- Perform a final stock validation pass right before generating payment order.

## Dependencies
- `CartService`, `AddressDAO`.

## Testing
- Unit test shipping and tax calculation rules.
- Integration test checkout summary generation with different address inputs.

## Files
- Backend: `src/controllers/order.controller.js`, `src/services/checkout.service.js`
- Frontend: `src/features/checkout/*`

## Change Log
- 2026-09-30: Initial context document created.
