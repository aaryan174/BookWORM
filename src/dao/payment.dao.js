import { PaymentTransaction } from '../models/paymentTransaction.model.js';
import { EventLog } from '../models/eventLog.model.js';

export class PaymentDAO {
  static async createTransaction(transactionData) {
    return await PaymentTransaction.create(transactionData);
  }

  static async findByRazorpayOrderId(razorpayOrderId) {
    return await PaymentTransaction.findOne({ razorpayOrderId });
  }

  static async updateTransactionStatus(razorpayOrderId, status, razorpayPaymentId, razorpaySignature, rawWebhookPayload) {
    return await PaymentTransaction.findOneAndUpdate(
      { razorpayOrderId },
      { status, razorpayPaymentId, razorpaySignature, rawWebhookPayload },
      { new: true }
    );
  }

  // Idempotency check for Razorpay Webhooks
  static async isEventProcessed(eventId) {
    const existing = await EventLog.findOne({ eventId });
    return !!existing;
  }

  static async logEvent(eventId, eventType) {
    return await EventLog.create({ eventId, eventType });
  }
}
