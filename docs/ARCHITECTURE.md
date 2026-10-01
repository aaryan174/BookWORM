# Architecture Specification — Online Book Marketplace

## 1. Architectural Philosophy & Overview
The **BookWORM** marketplace application is built around strict separation of responsibilities, maintainability, scalability, and security. It avoids monolithic single-file controllers and ad-hoc frontend state.

The system comprises two core components:
1. **Backend Service:** Node.js / Express RESTful API utilizing Mongoose ODM and a Controller-Service-DAO (Data Access Object) layered architecture.
2. **Frontend Client:** Single Page Application built with React adhering to a strict **4-Layer Architecture** (UI Layer -> API Layer -> Context Layer -> Hook Layer) structured by features.

---

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------+
|                           REACT FRONTEND                              |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   |                       Layer 1: UI Layer                       |   |
|   |            (Pages, Reusable Components, Views, Forms)          |   |
|   +-------------------------------+-------------------------------+   |
|                                   |                                   |
|   +-------------------------------+-------------------------------+   |
|   |                      Layer 4: Hook Layer                      |   |
|   |          (useAuth, useBooks, useCart, useCheckout, etc.)        |   |
|   +---------------+---------------+---------------+---------------+   |
|                   |                               |                   |
|   +---------------+---------------+   +-----------+---------------+   |
|   |    Layer 3: Context Layer     |   |    Layer 2: API Layer     |   |
|   | (AuthContext, CartContext)    |   | (auth.api.js, etc.)       |   |
|   +-------------------------------+   +-----------+---------------+   |
+---------------------------------------------------|-------------------+
                                                    | HTTP / REST (JSON)
                                                    v
+-----------------------------------------------------------------------+
|                            EXPRESS BACKEND                            |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   |                       HTTP Router & Middleware                |   |
|   |        (Auth, Security, Rate Limit, Validators, Cors)         |   |
|   +-------------------------------+-------------------------------+   |
|                                   |                                   |
|   +-------------------------------+-------------------------------+   |
|   |                          Controllers                          |   |
|   |       (Req Extraction, HTTP Response, Error Forwarding)       |   |
|   +-------------------------------+-------------------------------+   |
|                                   |                                   |
|   +-------------------------------+-------------------------------+   |
|   |                           Services                            |   |
|   |     (Business Rules, Orchestration, Financial Calculation)    |   |
|   +-------------------------------+-------------------------------+   |
|                                   |                                   |
|   +-------------------------------+-------------------------------+   |
|   |                     DAO (Data Access Object)                   |   |
|   |      (MongoDB Aggregations, Queries, Mongoose Operations)     |   |
|   +-------------------------------+-------------------------------+   |
|                                   |                                   |
|   +-------------------------------+-------------------------------+   |
|   |                         Models & Database                     |   |
|   |             (Mongoose Schemas, MongoDB Collections)           |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
```

---

## 3. Backend Architecture: Layered Responsibilities

The backend repository layout follows standard separation of concerns:

```text
server/ (or root src/)
├── src/
│   ├── config/          # Environment configuration, database connection, secrets
│   ├── controllers/     # HTTP Handlers (extract params, call service, respond)
│   ├── dao/             # Data Access Objects (pure DB queries & aggregations)
│   ├── middlewares/     # Auth, Roles, Request Validation, Error Handler, Security
│   ├── models/          # Mongoose Schemas & Schema Indexes
│   ├── routes/          # Express Routers mapping endpoints to middlewares & controllers
│   ├── seeds/           # Initial catalog & test database seeds
│   ├── services/        # Domain Business Logic (Auth, Book, Cart, Order, Payment)
│   ├── utils/           # Shared helper functions (logger, response formatters, async wrap)
│   ├── validators/      # Express-validator / schema validation rules
│   ├── app.js           # Express App setup (middlewares, routes)
│   └── server.js        # Server listener entrypoint
```

### 3.1 Layer Responsibilities

#### Routes Layer
* **Role:** Map HTTP verb & URI path to middleware chains and controller methods.
* **Rules:** Absolutely no business logic or database queries allowed in routes.

#### Controllers Layer
* **Role:** Handle HTTP requests and responses. Extract validated request inputs (`req.body`, `req.params`, `req.query`), invoke appropriate Service methods, format standard JSON HTTP response (`success`, `message`, `data`), and forward uncaught errors via `next(err)`.
* **Rules:** Keep controllers thin. Controllers must not invoke DAO or Mongoose models directly; all domain operations must pass through Services.

#### Services Layer
* **Role:** Contain core business logic, workflow orchestration, transaction management, price calculation, payment signature verification, commission split calculation, and state transition enforcement.
* **Rules:** Services are decoupled from Express `req` and `res` objects. They take pure JavaScript data parameters and return plain results or throw custom `AppError` instances.

#### DAO (Data Access Object) Layer
* **Role:** Encapsulate MongoDB query logic, aggregation pipelines, complex filtering, and document updates.
* **Rules:** Controller/Service layers rely on DAO methods (e.g., `BookDAO.findActiveListings(filter, pagination)`) rather than scattering `.find()`, `.aggregate()`, or `.findOneAndUpdate()` across the codebase.

#### Models Layer
* **Role:** Define Mongoose schemas, document properties, strict typing, schema validations, hooks (e.g., password hashing `pre('save')`), and indexes.

#### Validators & Middlewares Layer
* **Role:** Validate incoming payload before controllers execute. Handle cross-cutting concerns: JWT authentication token parsing, role verification (`requireRole('seller')`), rate limiting, security headers, request logging, and centralized error handling.

---

## 4. Frontend Architecture: 4-Layer Feature-Driven Structure

The client side uses React with a clean feature-driven layout and strict 4-layer architectural boundary.

```text
client/src/
├── app/                 # Main App configuration, router setup, global providers
├── components/          # Reusable UI primitives (Button, Modal, Input, Badge, Table)
├── features/            # Feature-based domain modules
│   ├── auth/            # Authentication (pages, components, hooks, api, context)
│   ├── books/           # Book catalog & listing feature
│   ├── cart/            # Cart & inventory reservation UI
│   ├── checkout/        # Checkout workflow & address selector
│   ├── orders/          # Buyer order history & tracking
│   ├── seller/          # Seller onboarding, inventory & sales dashboard
│   ├── reviews/         # Verified buyer review system
│   └── profile/         # User profile management
├── layouts/             # Page layouts (Navbar, Footer, Sidebar, AuthLayout)
├── hooks/               # Global utility hooks (useDebounce, useLocalStorage)
├── contexts/            # Global context providers (ThemeContext, ToastContext)
└── utils/               # Reusable formatting utilities (currency, date)
```

### 4.1 Layer Breakdown

1. **Layer 1 — UI Layer (Presentation):**
   React pages and visual components responsible solely for rendering HTML/JSX, handling user events, displaying loading spinners, and rendering error state messages. No inline `fetch` or Axios calls allowed.
2. **Layer 2 — API Layer (Data Fetching):**
   Axios instance configured with base URL, credentials (`withCredentials: true`), and interceptors. Feature API files (e.g., `book.api.js`, `order.api.js`) encapsulate endpoint paths and payloads.
3. **Layer 3 — Context Layer (Shared State):**
   React Context providers for state that must be globally shared across multiple disjoint UI components (e.g., `AuthContext` for current user session, `CartContext` for cart item count badge).
4. **Layer 4 — Hook Layer (Orchestration):**
   Custom hooks (e.g., `useBooks`, `useCheckout`, `useCart`) serve as the glue between UI components, Context, and API layer. The UI calls `hook.fetchBooks(params)` without knowing endpoint details.

---

## 5. Domain Boundaries & System Interfaces

| Domain Module | Primary Entities | Key Services | Dependencies |
| :--- | :--- | :--- | :--- |
| **Authentication** | `User` | `AuthService` | JWT, bcrypt, Cookie parser |
| **Users & Profiles** | `User`, `Address` | `UserService` | Auth |
| **Books & Catalog** | `Book`, `Category` | `BookService`, `CatalogDAO` | Storage |
| **Seller Listings** | `SellerProfile`, `Listing` | `SellerService`, `ListingDAO` | User, Book |
| **Cart Subsystem** | `Cart` | `CartService`, `CartDAO` | Listing, Stock Check |
| **Orders & Concurrency**| `Order`, `OrderItem` | `OrderService`, `OrderDAO` | Cart, Stock Concurrency |
| **Payments** | `PaymentTransaction`, `EventLog` | `PaymentService`, `RazorpayClient` | Order, Crypto HMAC |
| **Reviews & Ratings** | `Review` | `ReviewService` | Book, Order Verified Purchase |

---

## 6. Observability & Error Handling Architecture

* **Centralized AppError Class:** Subclasses `Error` with HTTP status code, operational flag, and optional field error array.
* **Global Error Middleware:** Intercepts uncaught errors, formats structured JSON responses, suppresses stack traces in production, and logs errors using a structured logger (Winston / Morgan).
* **Correlation IDs:** Request correlation headers (`X-Request-ID`) attached to every request trace for payment verification and database operations.
