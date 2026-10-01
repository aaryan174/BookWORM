# Feature: Platform Administration & Analytics

## Purpose
Provides platform administrator monitoring, user management, seller verification, content moderation, and platform revenue metrics reporting.

## Responsibilities
- System-wide user role management (granting seller or admin privileges).
- Moderating flagged book catalog entries or inappropriate reviews.
- Platform financial analytics dashboard (Total Volume, Platform Commission Revenue, Active Sellers, Active Listings).

## Non-responsibilities
- Day-to-day seller listing management (owned by `seller.md`).

## Architecture
`AdminRouter` -> `AdminController` -> `AdminService` -> `UserDAO` / `OrderDAO` / `ListingDAO`.

## Data Model
Aggregates queries over `users`, `orders`, `listings`, `books`.

## API
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id/roles`
- `GET /api/v1/admin/analytics`

## Business Rules
- Only users with `roles: ['admin']` can access administrative routes.
- Administrators cannot revoke their own admin status to prevent locking out all admin accounts.

## Security
- Strict `requireRoles('admin')` middleware gate on all `/api/v1/admin/*` endpoints.

## State Transitions
User Role: `['buyer']` <---> `['buyer', 'seller']` <---> `['buyer', 'seller', 'admin']`

## Error Cases
- `403 Forbidden`: Non-admin user attempt to access admin endpoint.

## Important Decisions
- Perform analytics calculations using Mongo aggregation pipelines to maintain high performance.

## Dependencies
- Mongoose aggregations.

## Testing
- Integration test admin endpoints with non-admin token (`403 Forbidden`) vs admin token (`200 OK`).

## Files
- Backend: `src/controllers/admin.controller.js`, `src/services/admin.service.js`, `src/routes/admin.routes.js`
- Frontend: `src/features/admin/*`

## Change Log
- 2026-09-30: Initial context document created.
