# Feature: Books & Canonical Catalog

## Purpose
Owns the canonical catalog of master book metadata (Title, Author, ISBN, Category, Description) shared across the marketplace.

## Responsibilities
- Catalog entry creation and verification by ISBN-13.
- Full-text search and faceted filtering (by category, author, title, genre).
- Aggregating canonical book average ratings and review counts.

## Non-responsibilities
- Managing seller-specific inventory quantities, pricing, or conditions (owned by `seller.md`).

## Architecture
`BookRouter` -> `BookController` -> `BookService` -> `BookDAO` -> `BookModel`.

## Data Model
- Collection: `books`
- Key Fields: `title`, `authors`, `isbn13`, `isbn10`, `description`, `category`, `genre`, `publisher`, `coverImageUrl`, `averageRating`, `reviewCount`.

## API
- `GET /api/v1/books` (Search, pagination, filters)
- `GET /api/v1/books/:id`
- `GET /api/v1/books/isbn/:isbn`
- `POST /api/v1/books` (Admin / Seller catalog creation)
- `GET /api/v1/books/:id/listings` (Fetch active seller listings for this book)

## Business Rules
- `isbn13` must be unique across the canonical database.
- Canonical book metadata cannot be arbitrarily deleted if active seller listings depend on it.

## Security
- Catalog browsing (`GET`) is public.
- Catalog creation (`POST`) requires authenticated user with `seller` or `admin` role.

## State Transitions
`DRAFT` -> `ACTIVE`

## Error Cases
- `409 Conflict`: Attempting to create a book with an ISBN-13 that already exists.
- `404 Not Found`: Book ID or ISBN query yields no match.

## Important Decisions
- **Decision:** Decouple master book metadata from seller listings to allow price competition among multiple sellers for the exact same book title.

## Dependencies
- Mongoose MongoDB Text Search Indexes.

## Testing
- Unit test `BookService.searchBooks`.
- Integration test ISBN lookup and pagination response envelope.

## Files
- Backend: `src/controllers/book.controller.js`, `src/services/book.service.js`, `src/dao/book.dao.js`, `src/models/book.model.js`
- Frontend: `src/features/books/*`

## Change Log
- 2026-09-30: Initial context document created.
