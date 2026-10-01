# Testing Strategy & Quality Assurance — Online Book Marketplace

## 1. Overview & Testing Pyramid
The testing strategy for **BookWORM** covers unit tests, integration tests, and critical end-to-end flows.

```
       / \
      /   \      E2E Tests (Playwright / Cypress) - Critical User Journeys
     /-----\
    /       \    Integration Tests (Jest + Supertest + MongoMemoryServer) - APIs & DB
   /---------\
  /           \  Unit Tests (Jest / Vitest) - Services, Utilities, Validators
 /-------------\
```

---

## 2. Unit Testing Strategy

### Target Coverage: > 80%

#### Tested Units:
* **Services:** `AuthService`, `BookService`, `CartService`, `OrderService`, `PaymentService`, `SellerService`.
* **Validators:** Schema input validation functions.
* **Utilities:** Commission calculations, token generation, currency formatters.

---

## 3. Integration Testing Strategy

Integration tests evaluate Express API endpoints, middleware execution, database persistence, and authorization enforcement using Jest and `supertest` with an in-memory MongoDB server (`mongodb-memory-server`).

### Key Integration Scenarios:
1. **Auth Suite:**
   * Successful user registration -> password hashing -> HTTP-only cookie set.
   * Duplicate email registration failure (`409 Conflict`).
   * Invalid credentials login failure (`401 Unauthorized`).
2. **Catalog & Listing Suite:**
   * Anonymous user can query books.
   * Non-seller cannot create book listing (`403 Forbidden`).
   * Onboarded seller can post listing attached to canonical book ID.
3. **Cart & Checkout Suite:**
   * Adding item to cart recalculates price subtotal.
   * Checkout with insufficient listing stock returns stock error (`400 Bad Request`).
4. **Payment Suite:**
   * Creating Razorpay order generates valid order ID & transaction record.
   * Valid HMAC signature marks order as `PAID`.
   * Invalid HMAC signature rejects payment (`400 Bad Request`).

---

## 4. End-to-End (E2E) Test Suite

### Critical E2E Workflow:
1. Register Buyer Account.
2. Register Seller Account & create Seller Profile.
3. Seller creates Canonical Book and attaches Listing (Quantity: 5, Price: ₹499).
4. Buyer logs in, searches book by ISBN/Title, adds to cart.
5. Buyer proceeds to checkout, inputs shipping address.
6. System creates pending order, triggers mock payment verification.
7. Order transitions to `PAID`. Stock quantity decrements to 4.
8. Seller opens Sales Dashboard, marks item `SHIPPED`.
9. Buyer views Order History, status reflects `SHIPPED`.
