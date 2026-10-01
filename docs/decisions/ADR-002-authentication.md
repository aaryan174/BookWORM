# ADR-002: JWT Authentication delivered via HTTP-Only Cookies

## Status
Accepted

## Context
User sessions need to be maintained securely across SPA client refreshes without exposing auth tokens to Cross-Site Scripting (XSS) attacks or requiring server-side session state storage that hinders scaling.

## Decision
We decided to use **JSON Web Tokens (JWT)** stored in **HTTP-only, SameSite=Strict, Secure cookies**.
- Access Token (expiration: 15 minutes)
- Refresh Token (expiration: 7 days)
Role-based capabilities (`buyer`, `seller`, `admin`) are stored in the JWT payload and verified server-side on every request.

## Alternatives Considered
1. **LocalStorage JWT Storage:** Storing access tokens in `window.localStorage`. Rejected due to high risk of token theft via XSS vulnerabilities.
2. **Server-Side Express Sessions (Redis/Memory):** Session IDs stored in memory/Redis. Rejected to avoid stateful server dependencies for API scalability.

## Consequences
### Benefits
- Protected against client-side script token extraction (XSS).
- Stateless server verification using secret key signature checks.
- Native browser handling of cookie transport on API calls (`withCredentials: true`).
### Costs & Trade-offs
- Frontend cross-origin setup requires explicit CORS `origin` configuration with `credentials: true`.
- Token revocation before expiration requires maintaining a short-lived token blacklist or refresh token invalidation in DB.
