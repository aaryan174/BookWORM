# Database Specification & Data Model — Online Book Marketplace

## 1. Overview & Strategy
The **BookWORM** application uses **MongoDB** with **Mongoose ODM**. The schema design balances canonical data normalization (preventing duplicate book metadata across sellers) with document snapshot embedding for orders (ensuring historical financial records remain immutable even if seller listings or book metadata change later).

---

## 2. ER Diagram / Data Model Relationships

```
+----------------+        1:N        +-------------------+
|      User      |-------------------|   SellerProfile   |
+----------------+                   +-------------------+
        |                                      |
        | 1:N                                  | 1:N
        v                                      v
+----------------+                   +-------------------+
|    Address     |                   |      Listing      |
+----------------+                   +-------------------+
                                               |
+----------------+        1:N                  | N:1
|      Book      |-----------------------------+
+----------------+
        |
        | 1:N
        v
+----------------+
|     Review     |
+----------------+

+----------------+        1:1        +-------------------+
|      User      |-------------------|       Cart        |
+----------------+                   +-------------------+

+----------------+        1:N        +-------------------+
|      User      |-------------------|       Order       |
+----------------+                   +-------------------+
                                               |
                                               | 1:1
                                               v
                                     +-------------------+
                                     | PaymentTransaction|
                                     +-------------------+
```

---

## 3. Detailed Schema Specifications

### 3.1 Users Collection (`users`)
Stores platform user accounts, authentication data, role flags, and profile info.

```js
const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  roles: {
    type: [String],
    enum: ['buyer', 'seller', 'admin'],
    default: ['buyer']
  },
  phone: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false }
}, { timestamps: true });
```
**Indexes:**
* `email: 1` (Unique)

---

### 3.2 Addresses Collection (`addresses`)
Stores user shipping and billing addresses.

```js
const addressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fullName: { type: String, required: true },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });
```
**Indexes:**
* `userId: 1, isDefault: -1`

---

### 3.3 Books Collection (`books`)
Canonical master catalog of books. Managed by platform or verified sellers/admins.

```js
const bookSchema = new Schema({
  title: { type: String, required: true, trim: true, index: 'text' },
  subtitle: { type: String, default: '' },
  authors: [{ type: String, required: true, trim: true, index: true }],
  isbn10: { type: String, default: '', index: true },
  isbn13: { type: String, required: true, unique: true, trim: true, index: true },
  description: { type: String, required: true },
  category: { type: String, required: true, index: true },
  genre: { type: String, default: '' },
  publisher: { type: String, required: true },
  publicationDate: { type: Date },
  edition: { type: String, default: '1st Edition' },
  language: { type: String, default: 'English' },
  coverImageUrl: { type: String, required: true },
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });
```
**Indexes:**
* `isbn13: 1` (Unique)
* `title: "text", authors: "text", description: "text"` (Full-text search)
* `category: 1, averageRating: -1`

---

### 3.4 Seller Profiles Collection (`seller_profiles`)
Stores store business details for users operating as sellers.

```js
const sellerProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  storeName: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  gstin: { type: String, default: '' },
  panNumber: { type: String, default: '' },
  payoutBankDetails: {
    accountNumber: { type: String, select: false },
    ifscCode: { type: String, select: false },
    accountHolderName: { type: String, select: false }
  },
  rating: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['PENDING', 'ACTIVE', 'SUSPENDED'], default: 'ACTIVE' }
}, { timestamps: true });
```

---

### 3.5 Listings Collection (`listings`)
Individual seller items for sale attached to a canonical book.

```js
const listingSchema = new Schema({
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  condition: {
    type: String,
    enum: ['NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE'],
    required: true
  },
  format: {
    type: String,
    enum: ['HARDCOVER', 'PAPERBACK', 'AUDIOBOOK', 'EBOOK'],
    default: 'PAPERBACK'
  },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  stockQuantity: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  descriptionNotes: { type: String, default: '' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'SOLD_OUT'], default: 'ACTIVE', index: true }
}, { timestamps: true });
```
**Indexes:**
* `bookId: 1, status: 1, price: 1`
* `sellerId: 1, status: 1`

---

### 3.6 Carts Collection (`carts`)
Persistent shopping carts for registered users.

```js
const cartItemSchema = new Schema({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  addedAtPrice: { type: Number, required: true }
});

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items: [cartItemSchema],
  expiresAt: { type: Date }
}, { timestamps: true });
```

---

### 3.7 Orders Collection (`orders`)
Immutable financial record of a purchase transaction.

```js
const orderItemSchema = new Schema({
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookTitleSnapshot: { type: String, required: true },
  bookIsbnSnapshot: { type: String, required: true },
  coverImageSnapshot: { type: String, required: true },
  conditionSnapshot: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  platformCommissionRate: { type: Number, default: 0.10 }, // 10%
  platformCommissionAmount: { type: Number, required: true },
  sellerEarningsAmount: { type: Number, required: true },
  itemStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  }
});

const orderSchema = new Schema({
  orderNumber: { type: String, required: true, unique: true, index: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [orderItemSchema],
  shippingAddressSnapshot: {
    fullName: String,
    streetAddress: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  pricing: {
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true, default: 0 },
    shippingFee: { type: Number, required: true, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
  },
  currency: { type: String, default: 'INR' },
  orderStatus: {
    type: String,
    enum: [
      'PENDING_PAYMENT',
      'PAYMENT_PROCESSING',
      'PAID',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUND_PENDING',
      'REFUNDED',
      'FAILED'
    ],
    default: 'PENDING_PAYMENT',
    index: true
  },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String },
  paidAt: { type: Date }
}, { timestamps: true });
```

---

### 3.8 Payment Transactions Collection (`payment_transactions`)
Audit trail for Razorpay interactions and gateway verifications.

```js
const paymentTransactionSchema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  razorpayOrderId: { type: String, required: true, unique: true, index: true },
  razorpayPaymentId: { type: String, index: true },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'],
    default: 'CREATED'
  },
  errorDetails: { type: Object },
  rawWebhookPayload: { type: Object }
}, { timestamps: true });
```

---

### 3.9 Event Log Collection (`event_logs`)
Idempotency and duplicate webhook handling record.

```js
const eventLogSchema = new Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  eventType: { type: String, required: true },
  processedAt: { type: Date, default: Date.now }
}, { timestamps: true });
```

---

### 3.10 Reviews Collection (`reviews`)
Verified buyer ratings and feedback.

```js
const reviewSchema = new Schema({
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, trim: true },
  comment: { type: String, required: true, trim: true }
}, { timestamps: true });

// Prevent multiple reviews per book per buyer order
reviewSchema.index({ bookId: 1, buyerId: 1, orderId: 1 }, { unique: true });
```

---

## 4. Database Concurrency Control & Atomic Stock Deduction
To prevent race conditions when two users purchase the final copy of a listing simultaneously:
1. `ListingDAO.reserveStock(listingId, quantity)` executes an atomic conditional update:
   `db.listings.updateOne({ _id: listingId, stockQuantity: { $gte: quantity } }, { $inc: { stockQuantity: -quantity } })`
2. If `modifiedCount === 0`, stock reservation fails, and an operational stock error is thrown before payment or order confirmation.
