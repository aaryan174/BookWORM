import { Order } from '../models/order.model.js';

export class OrderDAO {
  static async findById(id) {
    return await Order.findById(id).populate('buyerId', 'name email');
  }

  static async findByOrderNumber(orderNumber) {
    return await Order.findOne({ orderNumber });
  }

  static async findByRazorpayOrderId(razorpayOrderId) {
    return await Order.findOne({ razorpayOrderId });
  }

  static async create(orderData) {
    return await Order.create(orderData);
  }

  static async findPendingByBuyerId(buyerId) {
    return await Order.find({
      buyerId,
      orderStatus: { $in: ['PENDING_PAYMENT', 'PAYMENT_PROCESSING'] }
    });
  }

  static async findByBuyerId(buyerId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ buyerId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ buyerId })
    ]);
    return { orders, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static async findSellerSales(sellerId, { page = 1, limit = 15 }) {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ 'items.sellerId': sellerId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ 'items.sellerId': sellerId })
    ]);

    return { orders, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static async updateOrderStatus(orderId, orderStatus, razorpayPaymentId = null) {
    const update = { orderStatus };
    if (orderStatus === 'PAID') {
      update.paidAt = new Date();
    }
    if (razorpayPaymentId) {
      update.razorpayPaymentId = razorpayPaymentId;
    }
    return await Order.findByIdAndUpdate(orderId, update, { new: true });
  }

  static async updateItemStatus(orderId, itemId, sellerId, itemStatus) {
    return await Order.findOneAndUpdate(
      { _id: orderId, 'items._id': itemId, 'items.sellerId': sellerId },
      { $set: { 'items.$.itemStatus': itemStatus } },
      { new: true }
    );
  }
}
