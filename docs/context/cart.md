# Feature: Cart Subsystem

## Purpose
Manages persistent shopping cart items, listing quantity validation, stock checks, and pricing calculations for authenticated buyers.

## Responsibilities
- Adding, updating, and removing items in the shopping cart.
- Validating real-time listing availability and stock limits.
- Calculating cart subtotals dynamically from current listing prices.

## Non-responsibilities
- Order creation & payment execution (owned by `orders.md` and `payments.md`).

## Architecture
`CartRouter` -> `CartController` -> `CartService` -> `CartDAO` -> `CartModel`.

## Data Model
- Collection: `carts`
- Key Fields: `userId`, `items: [{ listingId, quantity, addedAtPrice }]`.

## API
- `GET /api/v1/cart`
- `POST /api/v1/cart/items`
- `PATCH /api/v1/cart/items/:listingId`
- `DELETE /api/v1/cart/items/:listingId`
- `DELETE /api/v1/cart`

## Business Rules
- Requested quantity cannot exceed current `stockQuantity` of the seller listing.
- If a listing becomes inactive or sold out, it is flagged in the cart payload as unavailable.
- Prices shown in the cart are recalculated from the database on every `GET /cart` call; prices provided by the frontend client are never trusted.

## Security
- Requires user authentication.
- `userId` is bound to `req.user.id`. Users cannot inspect or manipulate another user's cart.

## State Transitions
`EMPTY` <---> `ACTIVE_ITEMS` ----(checkout complete)----> `CLEARED`

## Error Cases
- `400 Bad Request`: Requested quantity exceeds available stock.
- `404 Not Found`: Listing ID is inactive or no longer exists.

## Important Decisions
- Storing items in MongoDB database persistent carts for authenticated users rather than relying solely on browser LocalStorage.

## Dependencies
- Mongoose, `ListingDAO`.

## Testing
- Unit test `CartService.addItem` and stock constraint verification.
- Integration test cart item add, update, remove lifecycle.

## Files
- Backend: `src/controllers/cart.controller.js`, `src/services/cart.service.js`, `src/dao/cart.dao.js`
- Frontend: `src/features/cart/*`

## Change Log
- 2026-09-30: Initial context document created.
