# Feature: Users & Profile Management

## Purpose
Manages platform user profile information, contact preferences, and delivery shipping addresses.

## Responsibilities
- User profile retrieval and updates (name, phone, avatar).
- Buyer delivery address CRUD operations.
- Default address selection logic.

## Non-responsibilities
- Password changes & auth session token management (owned by `authentication.md`).
- Seller store profile management (owned by `seller.md`).

## Architecture
`UserRouter` -> `UserController` -> `UserService` -> `UserDAO` / `AddressDAO` -> `UserModel` / `AddressModel`.

## Data Model
- Collections: `users`, `addresses`
- Address Key Fields: `userId`, `fullName`, `streetAddress`, `city`, `state`, `postalCode`, `country`, `phone`, `isDefault`.

## API
- `GET /api/v1/users/profile`
- `PATCH /api/v1/users/profile`
- `GET /api/v1/users/addresses`
- `POST /api/v1/users/addresses`
- `DELETE /api/v1/users/addresses/:id`

## Business Rules
- Each user can set at most one address as `isDefault: true`. Marking a new address as default resets all other addresses for that user.
- Users can only read, update, or delete their own addresses (IDOR protection).

## Security
- All user profile and address routes require active authentication middleware.
- `userId` is extracted directly from `req.user.id` on the server.

## State Transitions
Not applicable for static profiles; address list updates atomically.

## Error Cases
- `404 Not Found`: Address ID does not exist or does not belong to the user.
- `400 Bad Request`: Invalid phone or missing required postal code fields.

## Important Decisions
- Addresses are stored as separate documents rather than embedded subdocuments in `users` to allow scalable index management and easy historical snapshot cloning in orders.

## Dependencies
- `express-validator`, Mongoose.

## Testing
- Unit test `UserService.setDefaultAddress`.
- Integration test address creation and default switching.

## Files
- Backend: `src/controllers/user.controller.js`, `src/services/user.service.js`, `src/routes/user.routes.js`, `src/dao/address.dao.js`
- Frontend: `src/features/profile/*`

## Change Log
- 2026-09-30: Initial context document created.
