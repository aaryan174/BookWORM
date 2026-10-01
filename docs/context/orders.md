# Feature: Order Management & Concurrency Subsystem

## Purpose
Manages immutable order records, historical snapshot preservation (prices, book titles, seller details, delivery address), atomic stock reservation, and explicit order state lifecycle execution.

## Responsibilities
- Pending order creation.
- Immutable snapshot creation of book metadata, listing prices, platform commission splits, and address details.
- Atomic stock reservation and deduction.
- Buyer order history lookup and seller line item fulfillment tracking.
- Controlled state transitions (`PENDING_PAYMENT` -> `PAID` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`).

## Non-responsibilities
- Payment signature verification (owned by `payments.md`).

## Architecture
`OrderRouter` -> `OrderController` -> `OrderService` -> `OrderDAO` / `ListingDAO` -> `OrderModel`.

## Data Model
- Collection: `orders`
- Key Fields: `orderNumber`, `buyerId`, `items` (embedded snapshots: `listingId`, `bookTitleSnapshot`, `unitPrice`, `quantity`, `platformCommissionAmount`, `sellerEarningsAmount`), `pricing`, `orderStatus`, `razorpayOrderId`.

## API
- `POST /api/v1/orders`
- `GET /api/v1/orders`
- `GET /api/v1/orders/:id`
- `PATCH /api/v1/orders/:id/status`

## Business Rules
- Order records preserve static snapshots of item prices and book metadata at time of purchase. Future changes to listing prices or canonical book titles must not alter historical order records.
- State transitions must strictly follow valid pathways. Direct jump from `PENDING_PAYMENT` to `DELIVERED` is rejected.
- Stock deduction is executed atomically using conditional MongoDB updates (`$inc: { stockQuantity: -quantity }`).

## Security
- Buyers can only access their own orders (`order.buyerId === req.user.id`).
- Sellers can only access order line items containing their seller ID (`item.sellerId === req.user.id`).

## State Transitions
`PENDING_PAYMENT` -> `PAID` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`
`PENDING_PAYMENT` -> `FAILED` / `CANCELLED`

## Error Cases
- `400 Bad Request`: Invalid state transition attempt.
- `409 Conflict`: Insufficient stock available during reservation.

## Important Decisions
- Embed item snapshots directly into the order document to guarantee immutable auditability even if catalog entries are later updated or deleted.

## Dependencies
- Mongoose, `ListingDAO`.

## Testing
- Unit test atomic stock reservation and state transition rules.
- Integration test order creation, retrieval, and status updates.

## Files
- Backend: `src/controllers/order.controller.js`, `src/services/order.service.js`, `src/dao/order.dao.js`, `src/models/order.model.js`
- Frontend: `src/features/orders/*`

## Change Log
- 2026-09-30: Initial context document created.
