import { PaymentService } from '../services/payment.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export class PaymentController {
  static createOrder = asyncHandler(async (req, res) => {
    const paymentOrder = await PaymentService.createPaymentOrder(req.user._id, req.body.orderId);
    return sendSuccess(res, 'Razorpay payment order initialized', paymentOrder);
  });

  static verifyPayment = asyncHandler(async (req, res) => {
    const order = await PaymentService.verifyPayment(req.user._id, req.body);
    return sendSuccess(res, 'Payment verified and order confirmed successfully', { order });
  });

  static webhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const result = await PaymentService.handleWebhook(req.body, signature);
    return sendSuccess(res, 'Webhook event received', result);
  });
}
