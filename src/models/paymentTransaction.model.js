import mongoose from 'mongoose';

const paymentTransactionSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    index: true
  },
  razorpaySignature: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'],
    default: 'CREATED'
  },
  errorDetails: {
    type: Object
  },
  rawWebhookPayload: {
    type: Object
  }
}, { timestamps: true });

export const PaymentTransaction = mongoose.model('PaymentTransaction', paymentTransactionSchema);
