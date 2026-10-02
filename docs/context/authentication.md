# Feature: Authentication & Authorization

## Purpose
Provides secure user registration, credential verification, session token issuance via HTTP-only cookies, password reset capabilities, and server-side role-based authorization.

## Responsibilities
- User account creation and password hashing using bcrypt.
- JWT Access and Refresh token generation and verification.
- HTTP-only cookie parsing and clearing on logout.
- Password reset token generation, expiration, and email triggering.
- Middleware for authenticated route protection and role-based access control.

## Non-responsibilities
- User address management (owned by `users.md`).
- Seller store profile validation (owned by `seller.md`).

## Architecture
Integrates `AuthRouter` -> `AuthController` -> `AuthService` -> `UserDAO` -> `UserModel`.
Uses Express middleware (`authenticateUser`, `requireRoles`) to protect downstream routes.

## Data Model
- Collection: `users`
- Key Fields: `email`, `passwordHash`, `roles` (`['buyer', 'seller', 'admin']`), `passwordResetToken`, `passwordResetExpires`.

## API
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

## Business Rules
- Passwords must be hashed with bcrypt (salt rounds = 12). Plain text passwords must never be stored or logged.
- User email addresses must be stored in lowercase and must be unique.
- JWT access tokens expire in 15 minutes; refresh tokens expire in 7 days.
- Roles can be selected during registration: `buyer`, `seller`, or `both`. Selecting `seller` or `both` automatically provisions an initial `SellerProfile` in `SellerDAO`.

## Security
- Auth tokens are strictly delivered via `httpOnly`, `sameSite=strict`, and `secure` (in production) cookies.
- Rate limiting enforced on `/login` and `/register` endpoints to prevent brute-force attacks.

## State Transitions
`UNAUTHENTICATED` --(login/register)--> `AUTHENTICATED` --(logout/token expiry)--> `UNAUTHENTICATED`

## Error Cases
- `400 Bad Request`: Validation failure (weak password, invalid email format).
- `401 Unauthorized`: Invalid credentials, expired JWT, missing auth cookie.
- `409 Conflict`: Email already registered.

## Important Decisions
- **Decision:** Use HTTP-only cookies instead of LocalStorage for JWT storage to protect against XSS token extraction.

## Dependencies
- `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `express-validator`.

## Testing
- Unit test `AuthService.hashPassword`, `AuthService.verifyToken`.
- Integration test `/register`, `/login`, `/logout`, `/me` endpoints.

## Files
- Backend: `src/controllers/auth.controller.js`, `src/services/auth.service.js`, `src/routes/auth.routes.js`, `src/middlewares/auth.middleware.js`
- Frontend: `src/features/auth/*`

## Change Log
- 2026-09-30: Initial context document created.
