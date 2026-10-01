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
Internal service layer integration called by `BookService` and `SellerService`.

## Business Rules
- Uploaded files must be validated for MIME type (`image/jpeg`, `image/png`, `image/webp`) and size (< 5MB).
- Binary blobs must never be stored inside MongoDB.

## Security
- Validate file headers to prevent malicious executable file uploads disguised as images.
- Generate unique random filenames to prevent path traversal vulnerabilities.

## State Transitions
`TEMP_UPLOAD` -> `PERSISTED_CDN_URL`

## Error Cases
- `400 Bad Request`: File size exceeds limit or invalid image type.
- `502 Bad Gateway`: Cloud storage provider API failure.

## Important Decisions
- Abstract storage behind `StorageService` interface so cloud provider can be changed by updating environment variables without modifying controller or business code.

## Dependencies
- `multer`, `imagekit` / `@aws-sdk/client-s3`.

## Testing
- Mock `StorageService` during unit and integration tests.

## Files
- Backend: `src/services/storage.service.js`, `src/middlewares/upload.middleware.js`

## Change Log
- 2026-09-30: Initial context document created.
