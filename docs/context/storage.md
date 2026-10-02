# Feature: File & Image Storage Service

## Purpose
Provides an abstracted object storage service interface for uploading, optimizing, and serving book cover images and seller listing photos.

## Responsibilities
- Abstracting cloud storage provider integration (ImageKit / Cloudinary / AWS S3 / Local Storage Fallback).
- Image upload validation (file size limits, accepted MIME types `image/jpeg`, `image/png`, `image/webp`).
- Returning CDN image URLs.

## Non-responsibilities
- Storing binary file buffers directly in MongoDB.

## Architecture
`StorageService` -> `ImageKitProvider` / `S3Provider` / `LocalStorageProvider`.

## Data Model
Outputs image URL strings stored in `Book` and `Listing` documents.

## API
- `POST /api/v1/storage/upload`: Authenticated endpoint (sellers/admins) receiving `coverImage` multipart buffer, uploading to ImageKit, returning secure CDN URL.
- `GET /api/v1/storage/auth`: Generates client-side ImageKit authentication parameters (`token`, `expire`, `signature`).

## Business Rules
- Uploaded files must be validated for MIME type (`image/jpeg`, `image/png`, `image/webp`, `image/avif`) and size (< 5MB).
- Binary blobs must never be stored inside MongoDB.

## Security
- Validate file headers to prevent malicious executable file uploads disguised as images.
- Generate unique random filenames to prevent path traversal vulnerabilities.
- Private ImageKit secret key remains strictly on the server and is never exposed to frontend code.

## State Transitions
`TEMP_UPLOAD` -> `PERSISTED_IMAGEKIT_CDN_URL`

## Error Cases
- `400 Bad Request`: File size exceeds limit or invalid image type.
- `502 Bad Gateway`: Cloud storage provider API failure.

## Important Decisions
- Implemented `ImageKit` integration via `StorageService` with deterministic development fallback so local development and CI/CD pipelines run uninterrupted even without live API credentials.

## Dependencies
- `multer`, `imagekit`.

## Testing
- Unit test in `tests/unit/storage.service.test.js`.

## Files
- Backend: `src/services/storage.service.js`, `src/controllers/storage.controller.js`, `src/routes/storage.routes.js`
- Frontend: `client/src/features/books/api/book.api.js`, `client/src/features/seller/pages/SellerDashboardPage.jsx`

## Change Log
- 2026-09-30: Initial context document created.
- 2026-10-03: Implemented ImageKit integration, upload endpoints, and seller dashboard UI file upload.
