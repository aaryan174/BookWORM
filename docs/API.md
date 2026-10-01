# API Specification & Endpoint Contracts — Online Book Marketplace

## 1. Standard Response Formats

All API responses strictly adhere to uniform JSON envelopes.

### 1.1 Success Response Envelope
```json
{
  "success": true,
  "message": "Books fetched successfully",
  "data": {
    "books": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "pages": 5
    }
  }
}
```

### 1.2 Error Response Envelope
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    }
  ]
}
```

---

## 2. Authentication Endpoints (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user account | Public | `{ name, email, password }` |
| `POST` | `/api/v1/auth/login` | Authenticate user & issue HTTP-only cookies | Public | `{ email, password }` |
| `POST` | `/api/v1/auth/logout` | Clear auth cookies | Authenticated | None |
| `GET` | `/api/v1/auth/me` | Fetch current authenticated user session | Authenticated | None |
| `POST` | `/api/v1/auth/forgot-password` | Initiate password reset email | Public | `{ email }` |
| `POST` | `/api/v1/auth/reset-password` | Complete password reset using token | Public | `{ token, newPassword }` |

---

## 3. User & Profile Endpoints (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/users/profile` | Get current user profile | Authenticated | None |
| `PATCH` | `/api/v1/users/profile` | Update profile details | Authenticated | `{ name, phone, avatarUrl }` |
| `GET` | `/api/v1/users/addresses` | List user addresses | Authenticated | None |
| `POST` | `/api/v1/users/addresses` | Add new address | Authenticated | `{ fullName, streetAddress, city, state, postalCode, country, phone, isDefault }` |
| `DELETE` | `/api/v1/users/addresses/:id` | Delete an address | Authenticated | None |

---

## 4. Book Catalog Endpoints (`/api/v1/books`)

| Method | Endpoint | Description | Auth Required | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/books` | Search & filter canonical books | Public | Query: `search`, `category`, `page`, `limit`, `sort` |
| `GET` | `/api/v1/books/:id` | Get canonical book by ID | Public | None |
| `GET` | `/api/v1/books/isbn/:isbn` | Get canonical book by ISBN | Public | None |
| `POST` | `/api/v1/books` | Create canonical book metadata | Seller / Admin | `{ title, authors, isbn13, category, description, publisher, coverImageUrl }` |
| `GET` | `/api/v1/books/:id/listings` | Get active seller listings for a book | Public | Query: `condition`, `sort` |

---

## 5. Seller Listing Endpoints (`/api/v1/seller`)

| Method | Endpoint | Description | Auth Required | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/seller/onboard` | Register seller profile | Authenticated | `{ storeName, description, gstin, panNumber }` |
| `GET` | `/api/v1/seller/profile` | Get current seller details | Seller | None |
| `GET` | `/api/v1/seller/listings` | Get seller's own listings | Seller | Query: `status`, `page`, `limit` |
| `POST` | `/api/v1/seller/listings` | Create new listing for a book | Seller | `{ bookId, condition, format, price, stockQuantity, images, descriptionNotes }` |
| `PATCH` | `/api/v1/seller/listings/:id` | Update price or inventory | Seller | `{ price, stockQuantity, status }` |
| `DELETE` | `/api/v1/seller/listings/:id` | Deactivate listing | Seller | None |
| `GET` | `/api/v1/seller/sales` | Get seller order line items | Seller | Query: `status`, `page`, `limit` |

---

## 6. Shopping Cart Endpoints (`/api/v1/cart`)

| Method | Endpoint | Description | Auth Required | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cart` | Get current user shopping cart | Authenticated | None |
| `POST` | `/api/v1/cart/items` | Add listing item to cart | Authenticated | `{ listingId, quantity }` |
| `PATCH` | `/api/v1/cart/items/:listingId` | Update cart item quantity | Authenticated | `{ quantity }` |
| `DELETE` | `/api/v1/cart/items/:listingId` | Remove item from cart | Authenticated | None |
| `DELETE` | `/api/v1/cart` | Clear entire cart | Authenticated | None |

---

## 7. Order Endpoints (`/api/v1/orders`)

| Method | Endpoint | Description | Auth Required | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders/checkout-summary` | Validate cart & calculate totals | Authenticated | `{ addressId }` |
| `POST` | `/api/v1/orders` | Create pending order for checkout | Authenticated | `{ addressId }` |
| `GET` | `/api/v1/orders` | List buyer orders | Authenticated | Query: `page`, `limit` |
| `GET` | `/api/v1/orders/:id` | Get order details by ID | Authenticated | None |
| `PATCH` | `/api/v1/orders/:id/status` | Update item status (Seller/Admin) | Seller / Admin | `{ itemId, status }` |

---

## 8. Payment Endpoints (`/api/v1/payments`)

| Method | Endpoint | Description | Auth Required | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/payments/create-order` | Initiate Razorpay order for an order ID | Authenticated | `{ orderId }` |
| `POST` | `/api/v1/payments/verify` | Verify payment HMAC signature & finalize order | Authenticated | `{ orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }` |
| `POST` | `/api/v1/payments/webhook` | Handle Razorpay server-to-server webhook | Public (HMAC Verified) | Raw Body with `X-Razorpay-Signature` |

---

## 9. Reviews Endpoints (`/api/v1/reviews`)

| Method | Endpoint | Description | Auth Required | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reviews/book/:bookId` | Get public reviews for a book | Public | Query: `page`, `limit` |
| `POST` | `/api/v1/reviews` | Create review for verified purchase | Authenticated | `{ bookId, orderId, rating, title, comment }` |

---

## 10. Admin Endpoints (`/api/v1/admin`)

| Method | Endpoint | Description | Auth Required | Body / Params |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/users` | List all system users | Admin | Query: `role`, `page` |
| `PATCH` | `/api/v1/admin/users/:id/roles` | Update user roles | Admin | `{ roles }` |
| `GET` | `/api/v1/admin/analytics` | Overall platform sales & commission stats | Admin | None |
