import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookTitleSnapshot: { type: String, required: true },
  bookIsbnSnapshot: { type: String, required: true },
  coverImageSnapshot: { type: String, required: true },
  conditionSnapshot: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true },
  platformCommissionRate: { type: Number, default: 0.10 },
  platformCommissionAmount: { type: Number, required: true },
  sellerEarningsAmount: { type: Number, required: true },
  itemStatus: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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
  currency: {
    type: String,
    default: 'INR'
  },
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

export const Order = mongoose.model('Order', orderSchema);
