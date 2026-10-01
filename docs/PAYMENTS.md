# Payment Architecture & Marketplace Settlement — Online Book Marketplace

## 1. Overview & Provider Choice
The payment system for **BookWORM** is built using **Razorpay** (primary gateway for Indian marketplace transactions).

The payment subsystem handles:
* Server-side payment order initiation
* Client checkout orchestration
* HMAC signature verification
* Server-to-server webhook ingestion with idempotency
* Financial ledger recording (Subtotal, Tax, Shipping, Platform Commission, Seller Net Earnings)

---

## 2. Order & Payment Lifecycle State Transitions

```
[ PENDING_PAYMENT ] ----(Initiate Razorpay Order)----> [ PAYMENT_PROCESSING ]
         |                                                       |
         | (Payment Verification Success)                        | (Payment Fails / Cancelled)
         v                                                       v
     [ PAID ]                                                [ FAILED ]
         |
         +----(Seller Confirms Packaging)----> [ CONFIRMED ]
         |                                          |
         |                                          v
         |                                     [ SHIPPED ]
         |                                          |
         |                                          v
         |                                    [ DELIVERED ]
         |
         +----(Initiate Refund)---------------> [ REFUND_PENDING ] ----> [ REFUNDED ]
```

---

## 3. Detailed Payment Sequence

```
Buyer             React Client            Express Backend         Razorpay API
  |                     |                        |                     |
  |--- Click Checkout ->|                        |                     |
  |                     |-- POST /create-order ->|                     |
  |                     |   (orderId)            |-- razorpay.orders ->|
  |                     |                        |   .create({ amount })|
  |                     |                        |<- order object -----|
  |                     |<- razorpayOrderId -----|                     |
  |                     |                        |                     |
  |--- Complete Pay --->|                        |                     |
  |    (Razorpay Modal) |                        |                     |
  |                     |-- POST /verify ------->|                     |
  |                     |   (signature payload)  |-- Check HMAC ------|
  |                     |                        |   Verify Amount     |
  |                     |                        |   Reserve Stock     |
  |                     |                        |   Mark Order PAID   |
  |                     |<- Order Confirmed -----|                     |
```

---

## 4. Financial Split & Commission Accounting Model

Because BookWORM is a multi-vendor marketplace, financial totals are split per line item upon payment confirmation.

### 4.1 Commission Rules
* **Platform Commission Rate:** 10% (configurable per seller or globally)
* **Calculation:**
  $$\text{Item Subtotal} = \text{Unit Price} \times \text{Quantity}$$
  $$\text{Platform Commission} = \text{Item Subtotal} \times 0.10$$
  $$\text{Seller Net Earnings} = \text{Item Subtotal} - \text{Platform Commission}$$

### 4.2 Example Ledger Breakdown
For an order containing:
* Item A (Listing from Seller X): 1 copy @ ₹500
* Item B (Listing from Seller Y): 2 copies @ ₹250 = ₹500
* **Total Order Subtotal:** ₹1000
* **Shipping Fee:** ₹50
* **Tax (5% GST):** ₹52.50
* **Grand Total Paid by Buyer:** ₹1102.50

**Backend Snapshot Records:**
* **Seller X Record:** Gross ₹500 | Commission (10%): ₹50 | Seller Net: ₹450
* **Seller Y Record:** Gross ₹500 | Commission (10%): ₹50 | Seller Net: ₹450
* **Platform Revenue Record:** Total Commission ₹100 + Shipping ₹50 + Tax ₹52.50

---

## 5. Webhook Security & Idempotency Protocol

### 5.1 Webhook Receiver Endpoint
`POST /api/v1/payments/webhook`

### 5.2 Processing Steps
1. **Signature Verification:** Compute HMAC-SHA256 signature using `X-Razorpay-Signature` header and `RAZORPAY_WEBHOOK_SECRET`. If signature does not match, respond with `400 Bad Request`.
2. **Idempotency Check:** Extract `event_id` from webhook payload. Query `EventLog` collection:
   ```js
   const existingEvent = await EventLog.findOne({ eventId: payload.event_id });
   if (existingEvent) {
     return res.status(200).json({ success: true, message: 'Event already processed' });
   }
   ```
3. **Execute Event Handler:**
   * `order.paid`: Update Order status to `PAID`, record payment ID, deduct stock atomically.
   * `payment.failed`: Update Order status to `FAILED`, release temporary stock locks.
   * `refund.processed`: Update Order status to `REFUNDED`, increment stock quantity.
4. **Log Event:** Save `payload.event_id` into `EventLog` collection.
5. **Acknowledge:** Return `200 OK` response.
