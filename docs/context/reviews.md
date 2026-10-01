# Feature: Verified Buyer Reviews & Ratings

## Purpose
Enables buyers who have completed purchase orders for a book to submit ratings and textual reviews, and automatically recalculates canonical book average ratings.

## Responsibilities
- Verifying buyer order status before accepting review submission.
- Saving reviews and enforcing single-review limits per book per order.
- Re-aggregating canonical book `averageRating` and `reviewCount`.

## Non-responsibilities
- Catalog metadata editing (owned by `books.md`).

## Architecture
`ReviewRouter` -> `ReviewController` -> `ReviewService` -> `ReviewDAO` / `BookDAO` -> `ReviewModel`.

## Data Model
- Collection: `reviews`
- Key Fields: `bookId`, `buyerId`, `orderId`, `rating` (1-5), `title`, `comment`.

## API
- `GET /api/v1/reviews/book/:bookId`
- `POST /api/v1/reviews`

## Business Rules
- Only buyers with a `DELIVERED` status order containing the book can submit a review ("Verified Purchase").
- Star rating must be an integer between 1 and 5.
- On new review creation, update the canonical `Book` document's `averageRating` using a MongoDB aggregation pipeline.

## Security
- Requires authentication for submission.
- Enforces order ownership check (`order.buyerId === req.user.id`).

## State Transitions
`SUBMITTED` -> `PUBLISHED`

## Error Cases
- `403 Forbidden`: Buyer has not purchased the book or order is not yet delivered.
- `409 Conflict`: Buyer has already submitted a review for this order item.

## Important Decisions
- Aggregating ratings asynchronously or on-write via MongoDB `$avg` pipeline to keep catalog queries fast.

## Dependencies
- Mongoose, `OrderDAO`, `BookDAO`.

## Testing
- Unit test rating calculation aggregation logic.
- Integration test verified purchase constraint verification.

## Files
- Backend: `src/controllers/review.controller.js`, `src/services/review.service.js`, `src/models/review.model.js`
- Frontend: `src/features/reviews/*`

## Change Log
- 2026-09-30: Initial context document created.
