import crypto from 'crypto';
import Razorpay from 'razorpay';
import { config } from '../config/env.config.js';
import { OrderDAO } from '../dao/order.dao.js';
import { PaymentDAO } from '../dao/payment.dao.js';
import { ListingDAO } from '../dao/listing.dao.js';
import { AppError } from '../utils/AppError.js';

export class PaymentService {
  static getRazorpayInstance() {
    return new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret
    });
  }

  static async createPaymentOrder(userId, orderId) {
    const order = await OrderDAO.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    if (order.buyerId._id.toString() !== userId.toString()) {
      throw new AppError('Unauthorized access to this order', 403);
    }

    if (order.orderStatus === 'PAID') {
      throw new AppError('This order has already been paid for', 400);
    }

    // Amount in paise (1 INR = 100 Paise)
    const amountInPaise = Math.round(order.pricing.grandTotal * 100);

    let razorpayOrder;

    try {
      if (config.razorpay.keyId.startsWith('rzp_test_bookworm')) {
        // Mock fallback for test environment
        razorpayOrder = {
          id: `order_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          entity: 'order',
          amount: amountInPaise,
          currency: 'INR',
          status: 'created'
        };
      } else {
        const razorpay = this.getRazorpayInstance();
        razorpayOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: order.orderNumber,
          notes: {
            orderId: order._id.toString(),
            buyerId: userId.toString()
          }
        });
      }
    } catch (err) {
      throw new AppError(`Payment gateway initialization failed: ${err.message}`, 502);
    }

    order.razorpayOrderId = razorpayOrder.id;
    order.orderStatus = 'PAYMENT_PROCESSING';
    await order.save();

    await PaymentDAO.createTransaction({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.pricing.grandTotal,
      currency: 'INR',
      status: 'CREATED'
    });

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: order.pricing.grandTotal,
      amountInPaise,
      currency: 'INR',
      keyId: config.razorpay.keyId
    };
  }

  static async verifyPayment(userId, { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
    const order = await OrderDAO.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    if (order.buyerId._id.toString() !== userId.toString()) {
      throw new AppError('Unauthorized access to order', 403);
    }

    if (order.orderStatus === 'PAID') {
      return order;
    }

    // Verify HMAC Signature
    let isValid = false;

    if (config.razorpay.keyId.startsWith('rzp_test_bookworm')) {
      // Mock signature verification for test environment
      isValid = true;
    } else {
      const generatedSignature = crypto
        .createHmac('sha256', config.razorpay.keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature, 'utf-8'),
        Buffer.from(razorpaySignature, 'utf-8')
      );
    }

    if (!isValid) {
      await PaymentDAO.updateTransactionStatus(razorpayOrderId, 'FAILED', razorpayPaymentId, razorpaySignature);
      await OrderDAO.updateOrderStatus(order._id, 'FAILED');
      throw new AppError('Payment signature verification failed', 400);
    }

    // Signature valid -> Mark transaction & order as PAID
    await PaymentDAO.updateTransactionStatus(razorpayOrderId, 'CAPTURED', razorpayPaymentId, razorpaySignature);
    const updatedOrder = await OrderDAO.updateOrderStatus(order._id, 'PAID', razorpayPaymentId);

    return updatedOrder;
  }

  static async handleWebhook(rawBody, signature) {
    if (!config.razorpay.keyId.startsWith('rzp_test_bookworm')) {
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new AppError('Invalid webhook signature', 400);
      }
    }

    const payload = JSON.parse(rawBody.toString());
    const eventId = payload.event_id || payload.event;
    const eventType = payload.event;

    // Check Webhook Idempotency
    const isProcessed = await PaymentDAO.isEventProcessed(eventId);
    if (isProcessed) {
      return { status: 'already_processed' };
    }

    if (eventType === 'order.paid' || eventType === 'payment.captured') {
      const razorpayOrderId = payload.payload?.payment?.entity?.order_id || payload.payload?.order?.entity?.id;
      const razorpayPaymentId = payload.payload?.payment?.entity?.id;

      if (razorpayOrderId) {
        const order = await OrderDAO.findByRazorpayOrderId(razorpayOrderId);
        if (order && order.orderStatus !== 'PAID') {
          await OrderDAO.updateOrderStatus(order._id, 'PAID', razorpayPaymentId);
          await PaymentDAO.updateTransactionStatus(razorpayOrderId, 'CAPTURED', razorpayPaymentId, signature, payload);
        }
      }
    } else if (eventType === 'payment.failed') {
      const razorpayOrderId = payload.payload?.payment?.entity?.order_id;
      if (razorpayOrderId) {
        const order = await OrderDAO.findByRazorpayOrderId(razorpayOrderId);
        if (order && order.orderStatus === 'PENDING_PAYMENT') {
          await OrderDAO.updateOrderStatus(order._id, 'FAILED');
          // Release stock back
          for (const item of order.items) {
            await ListingDAO.releaseStock(item.listingId, item.quantity);
          }
        }
      }
    }

    await PaymentDAO.logEvent(eventId, eventType);
    return { status: 'processed' };
  }
}
