# Product Requirements Document (PRD) — Online Book Marketplace

## 1. Executive Summary & Vision
The **Online Book Marketplace** ("BookWORM") is a production-grade multi-vendor e-commerce platform that connects buyers, sellers (independent bookshops, individual sellers, publishers), and platform administrators. Unlike single-vendor online bookstores, BookWORM decouples canonical book catalog metadata from individual seller listings and stock inventory, enabling multiple sellers to offer the same book title in various conditions (New, Like New, Good, Acceptable) at competitive prices.

---

## 2. Product Goals & Non-Goals

### 2.1 Goals
* **Multi-Vendor Capabilities:** Allow any registered user to seamlessly onboard as a seller while retaining buyer capabilities under a single unified account.
* **Canonical Catalog & Listing Decoupling:** Global book metadata (Title, Author, ISBN, Publisher, Edition) is shared, preventing duplicate redundant catalog clutter, while pricing, condition, images, and inventory are owned by individual seller listings.
* **Financial Integrity & Payment Security:** Fully compliant server-side payment verification (Razorpay integration), server-calculated order totals, HMAC signature checks, idempotent webhook processing, and explicit platform fee commission modeling.
* **Atomic Concurrency:** Concurrency-safe inventory reservation and stock deduction to prevent double-selling of rare or limited stock items.
* **Production Engineering Standards:** Clean layered architecture (Backend: Controller-Service-DAO pattern; Frontend: 4-Layer Architecture UI-API-Context-Hook), server-side authorization enforcement, structured error responses, structured logging, audit trails, and 100% testable domain modules.

### 2.2 Non-Goals
* Physical logistics/courier API tracking integration (shipping state transitions are manually updated by sellers/admins in MVP).
* Automatic automated bank payout disbursement via external banking APIs (financial balances & settlement records are generated and tracked in-system; physical payouts are processed via batch accounting).

---

## 3. Target User Personas

| Persona | Primary Role | Key Objectives | Needs & Expectations |
| :--- | :--- | :--- | :--- |
| **Aarav (The Reader/Buyer)** | Buyer | Browse, filter, purchase books, write reviews, track order status. | Fast search, clear pricing, verified seller ratings, secure payments, order history transparency. |
| **Priya (The Bookseller/Seller)** | Seller | List books for sale, manage inventory, adjust prices, fulfill orders, track earnings. | Easy listing workflow, inventory management dashboard, settlement logs, sales analytics. |
| **Vikram (Platform Admin)** | Admin | Moderate listings, manage users, review flag reports, monitor financial commission. | System health overview, audit logs, user role management, catalog moderation. |

---

## 4. User Journeys & Marketplace Workflows

### 4.1 Buyer Journey
1. **Discovery:** Buyer searches books by title, author, category, or ISBN.
2. **Selection:** Buyer views book details page showing canonical information and available seller listings (sorted by price/condition/rating).
3. **Cart Management:** Buyer selects a seller listing, specifies quantity, and adds to cart. System checks real-time inventory availability.
4. **Checkout:** Buyer selects a shipping address and reviews calculated totals (subtotal, tax, shipping fee, platform charges).
5. **Payment Execution:** Client triggers payment order creation on backend. Backend initiates Razorpay order. Client opens checkout modal. On payment completion, client sends signature parameters to backend. Backend verifies HMAC signature, checks idempotency, reserves stock, creates `PAID` order, and responds with order confirmation.
6. **Fulfillment Tracking:** Buyer monitors order status (`PAID` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`).
7. **Post-Purchase:** Buyer rates and reviews the purchased book listing upon delivery.

### 4.2 Seller Journey
1. **Seller Onboarding:** Buyer completes seller profile (Store Name, Tax ID / GST, Payout Details, Contact Info) to gain `seller` capability.
2. **Listing Creation:** Seller searches for an existing canonical book by ISBN/Title or creates a new catalog entry, then attaches a seller listing (Condition, Format, Price, Quantity, Listing Photos).
3. **Inventory Management:** Seller updates stock, updates pricing, or deactivates listings.
4. **Order Processing:** Seller receives notification of a confirmed sale, packages item, marks status as `SHIPPED` with tracking reference.
5. **Earnings Tracking:** Seller views net earnings (Sale Amount minus Platform Commission minus Gateway Fees) in their Seller Financial Dashboard.

---

## 5. Functional Requirements

### 5.1 Authentication & User Management
* **FR-AUTH-1:** User registration with email, password (bcrypt hash, min 8 chars, 1 uppercase, 1 symbol, 1 number), full name, and optional phone.
* **FR-AUTH-2:** Login issuing HTTP-only secure JWT access & refresh cookies.
* **FR-AUTH-3:** Password reset flow via secure random tokens.
* **FR-AUTH-4:** Unified User model supporting role flags (`isBuyer`, `isSeller`, `isAdmin`).

### 5.2 Catalog & Seller Listing Module
* **FR-CAT-1:** Canonical Book model storing Title, Author, ISBN-10/13, Description, Category, Genre, Publisher, Language, Cover Image, Publication Year.
* **FR-CAT-2:** Book Listing model storing `bookId`, `sellerId`, `condition` (`NEW`, `LIKE_NEW`, `VERY_GOOD`, `GOOD`, `ACCEPTABLE`), `format` (`HARDCOVER`, `PAPERBACK`, `AUDIOBOOK`, `EBOOK`), `price`, `stockQuantity`, `images`, and `status` (`ACTIVE`, `INACTIVE`, `SOLD_OUT`).
* **FR-CAT-3:** Advanced search and filter endpoint supporting regex search on title/author/ISBN, category filter, price range filter, and condition filter.

### 5.3 Cart & Validation Subsystem
* **FR-CRT-1:** User-persistent database cart & guest local session cart synchronization upon login.
* **FR-CRT-2:** Validation step prior to checkout enforcing stock limits, active listing verification, and price recalculation.

### 5.4 Order & Concurrency Subsystem
* **FR-ORD-1:** Immutable Order document capturing buyer details, address snapshot, item price snapshots, quantity, seller breakdown, shipping cost, tax, platform commission fee, total amount, and explicit status lifecycle.
* **FR-ORD-2:** Atomic stock reservation during checkout using MongoDB conditional updates / transactions.

### 5.5 Payment Gateway Subsystem (Razorpay Integration)
* **FR-PAY-1:** Server-side creation of Razorpay Order (`razorpay_order_id`) with currency and calculated amount in paise.
* **FR-PAY-2:** Server-side payment signature verification verifying `razorpay_signature` using HMAC-SHA256 with API secret.
* **FR-PAY-3:** Webhook receiver endpoint for asynchronous payment events (`order.paid`, `payment.failed`, `refund.processed`) with duplicate event idempotency check via `EventLog`.

### 5.6 Seller Dashboard & Financial Settlement
* **FR-SLR-1:** Seller sales summary (Total Revenue, Net Earnings, Pending Orders, Completed Orders).
* **FR-SLR-2:** Explicit marketplace ledger recording platform commission rate (e.g., 10%) per item line.

### 5.7 Reviews & Moderation
* **FR-REV-1:** Verified purchase restriction for reviewing a book listing (only buyers with `DELIVERED` status orders for the book can submit a review).
* **FR-REV-2:** Star rating (1–5) and text review with average rating recalculation on canonical book metadata.

---

## 6. Non-Functional Requirements

### 6.1 Performance & Scalability
* API response latency < 200ms for p95 read operations (book catalog, search).
* Database queries optimized with compound indexes for high-frequency access patterns (ISBN search, seller active listings, buyer orders).

### 6.2 Security
* Server-side authorization enforcement on every API endpoint.
* HTTP-only, `SameSite=Strict`, `Secure` cookie transport for JWT tokens.
* Helmet.js security headers, CORS origin whitelist, Express rate limiting on sensitive routes (`/api/v1/auth/*`, `/api/v1/payments/*`).
* Strict input validation with `express-validator` / `zod` schemas.

### 6.3 Reliability & Idempotency
* Idempotent payment and webhook handling using unique transaction keys and idempotency token ledgers.
* Graceful fallback mechanisms for external storage (ImageKit/S3) and email services.

### 6.4 Maintainability & Testing
* Modular layered structure enforcing separation of concerns.
* Coverage target: > 80% unit test coverage for services and validators; integration tests for core transactions.

---

## 7. MVP Scope vs. Post-MVP Scope

### MVP Scope
* Multi-role authentication (Buyer, Seller, Admin).
* Canonical book management and multi-seller book listing management.
* Full cart, address management, and server-validated checkout.
* Razorpay payment order creation, verification, and idempotent webhook handling.
* Concurrency-safe inventory deduction & order creation.
* Seller sales dashboard & order state update workflow (`PAID` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`).
* Verified buyer book reviews.
* Complete documentation suite (`PRD`, `ARCHITECTURE`, `DATABASE`, `API`, `SECURITY`, `PAYMENTS`, `TESTING`, `DEPLOYMENT`, `DEVELOPMENT`, `context/*`, `decisions/*`).

### Post-MVP Scope
* Real-time automated courier shipping provider API integration.
* Automated seller bank payout gateway payouts via Razorpay Route.
* Algorithmic recommendation engine based on browsing history.
* Real-time WebSocket notifications for order status updates.
