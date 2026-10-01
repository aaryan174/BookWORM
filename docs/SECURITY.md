# Security Architecture & Threat Model — Online Book Marketplace

## 1. Security Design Principles & Threat Model
Security is enforced strictly on the server side. The client UI is treated as untrusted.

### Key Security Vectors & Mitigations

| Threat Vector | Vulnerability Type | Mitigation Strategy |
| :--- | :--- | :--- |
| **Authentication Bypass** | Weak session tokens, stolen credentials | HTTP-Only, `SameSite=Strict`, `Secure` JWT cookies; bcrypt password hashing (12 salt rounds); short-lived access tokens (15m) + refresh tokens (7d). |
| **Authorization Bypass / IDOR** | Insecure Direct Object Access (accessing another seller's listing or buyer's order) | Mandatory server-side checks in service layer verifying resource ownership (`order.buyerId === req.user.id` or `listing.sellerId === req.user.id`). |
| **Price / Financial Tampering** | Client submitting modified price in cart/checkout payload | Backend recalculates all price totals, taxes, shipping fees, and commissions directly from database model records. Client price fields are ignored. |
| **Payment Signature Forgery** | Fake payment success payload from browser | Mandatory HMAC-SHA256 signature verification (`crypto.createHmac('sha256', secret)`) on both verification API and Webhook receivers. |
| **NoSQL Injection** | Malicious JSON objects in request query/body (`{ "$gt": "" }`) | Express sanitization middleware, explicit Mongoose schema casting, and input validation schemas (`express-validator`). |
| **Cross-Site Scripting (XSS)** | Malicious scripts in book titles or review text | Input sanitization using `DOMPurify` / `xss` library; Helmet.js CSP headers; React automatic JSX string escaping. |
| **Cross-Site Request Forgery (CSRF)** | Unauthorized request from authenticated user browser | `SameSite=Strict` cookie policy + CSRF anti-forgery headers on state-changing API methods. |
| **Rate Abuse & Brute Force** | Password guessing / API spam | `express-rate-limit` on auth endpoints (5 attempts / 15 mins) and payment endpoints (10 attempts / 1 min). |

---

## 2. Authentication & Cookie Configuration

### 2.1 JWT Cookie Parameters
```js
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};
```

### 2.2 Token Structure
* **Access Token Payload:** `{ userId, roles: ['buyer', 'seller'], iat, exp }`
* **Expiration:** Access Token: 15 minutes; Refresh Token: 7 days.

---

## 3. Server-Side Authorization Enforcement

### 3.1 Role Verification Middleware
```js
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return next(new AppError('Unauthorized access', 401));
    }
    const hasRole = allowedRoles.some(role => req.user.roles.includes(role));
    if (!hasRole) {
      return next(new AppError('Forbidden: Insufficient privileges', 403));
    }
    next();
  };
};
```

---

## 4. Payment Security & Webhook Signature Verification

### 4.1 Payment Verification Algorithmic Steps
1. Client sends `orderId`, `razorpayOrderId`, `razorpayPaymentId`, and `razorpaySignature`.
2. Backend retrieves internal order from DB and computes expected signature:
   `generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpayOrderId + '|' + razorpayPaymentId).digest('hex')`
3. Compare `generatedSignature` with `razorpaySignature` using `crypto.timingSafeEqual()` to prevent timing attacks.
4. Verify that order total matches actual Razorpay payment amount before marking order `PAID`.

---

## 5. Security Headers & CORS Config

```js
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
```
