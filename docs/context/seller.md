# Feature: Seller Profile & Listings Management

## Purpose
Manages seller onboarding, business profile validation, listing creation, stock management, price updates, and seller earnings/sales reporting.

## Responsibilities
- Seller profile registration (Store Name, Tax ID / GSTIN, Payout info).
- Attaching seller listings (Condition, Format, Price, Quantity, Photos) to canonical books.
- Seller active inventory and stock status management.
- Seller sales dashboard reporting.

## Non-responsibilities
- Payment gateway verification & customer checkout handling (owned by `payments.md` & `checkout.md`).

## Architecture
`SellerRouter` -> `SellerController` -> `SellerService` -> `ListingDAO` / `SellerDAO` -> `ListingModel` / `SellerProfileModel`.

## Data Model
- Collections: `seller_profiles`, `listings`
- Listing Key Fields: `bookId`, `sellerId`, `condition`, `format`, `price`, `stockQuantity`, `images`, `status` (`ACTIVE`, `INACTIVE`, `SOLD_OUT`).

## API
- `POST /api/v1/seller/onboard`
- `GET /api/v1/seller/profile`
- `GET /api/v1/seller/listings`
- `POST /api/v1/seller/listings`
- `PATCH /api/v1/seller/listings/:id`
- `DELETE /api/v1/seller/listings/:id`
- `GET /api/v1/seller/sales`

## Business Rules
- User must complete seller onboarding before creating seller listings.
- Sellers can only modify or delete listings that belong to their own seller ID.
- Setting listing `stockQuantity: 0` automatically transitions listing status to `SOLD_OUT`.

## Security
- Server-side authorization check (`requireRoles('seller')`) on all seller endpoints.
- IDOR checks enforcing `listing.sellerId === req.user.id`.

## State Transitions
Listing: `ACTIVE` <---> `INACTIVE` | `ACTIVE` ----(stock=0)----> `SOLD_OUT`

## Error Cases
- `403 Forbidden`: User attempts seller operation without seller role.
- `404 Not Found`: Listing ID does not exist or belong to seller.

## Important Decisions
- Multi-seller listing model where multiple sellers can list different conditions/prices for the same canonical book.

## Dependencies
- Mongoose, `express-validator`.

## Testing
- Unit test `SellerService.createListing`.
- Integration test listing lifecycle and status transitions.

## Files
- Backend: `src/controllers/seller.controller.js`, `src/services/seller.service.js`, `src/dao/listing.dao.js`
- Frontend: `src/features/seller/*`

## Change Log
- 2026-09-30: Initial context document created.
