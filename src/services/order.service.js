import { CartService } from './cart.service.js';
import { AddressDAO } from '../dao/address.dao.js';
import { OrderDAO } from '../dao/order.dao.js';
import { ListingDAO } from '../dao/listing.dao.js';
import { CartDAO } from '../dao/cart.dao.js';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/env.config.js';

export class OrderService {
  static calculatePricing(subtotal) {
    const commissionRate = config.financials.commissionRate; // 10%
    const taxRate = config.financials.taxRate; // 5%
    const shippingFee = subtotal >= config.financials.freeShippingThreshold ? 0 : config.financials.shippingFee;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const grandTotal = Math.round((subtotal + taxAmount + shippingFee) * 100) / 100;

    return {
      subtotal,
      taxAmount,
      shippingFee,
      discountAmount: 0,
      grandTotal,
      commissionRate
    };
  }

  static async getCheckoutSummary(userId, addressId) {
    const address = await AddressDAO.findById(addressId);
    if (!address || address.userId.toString() !== userId.toString()) {
      throw new AppError('Invalid delivery address selected', 400);
    }

    const cart = await CartService.getCart(userId);
    const availableItems = cart.items.filter(item => item.isAvailable);

    if (availableItems.length === 0) {
      throw new AppError('Your cart contains no available items for checkout', 400);
    }

    const pricing = this.calculatePricing(cart.subtotal);

    return {
      address,
      items: availableItems,
      pricing
    };
  }

  static async createPendingOrder(userId, addressId) {
    // 1. Release any previous unpaid pending orders for this buyer to restore their reserved stock
    const staleOrders = await OrderDAO.findPendingByBuyerId(userId);
    for (const stale of staleOrders) {
      await OrderDAO.updateOrderStatus(stale._id, 'CANCELLED');
      for (const item of stale.items) {
        await ListingDAO.releaseStock(item.listingId, item.quantity);
      }
    }

    // 2. Calculate summary on available items
    const summary = await this.getCheckoutSummary(userId, addressId);

    const orderNumber = `BW-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderItems = [];

    // Reserve stock atomically for each listing item
    for (const item of summary.items) {
      const reservedListing = await ListingDAO.reserveStock(item.listingId, item.quantity);
      if (!reservedListing) {
        // Rollback any stock reserved in this iteration loop
        for (const prev of orderItems) {
          await ListingDAO.releaseStock(prev.listingId, prev.quantity);
        }
        throw new AppError(`Item "${item.book ? item.book.title : 'Listing'}" sold out or has insufficient stock`, 409);
      }

      const itemSubtotal = item.price * item.quantity;
      const platformCommissionAmount = Math.round(itemSubtotal * summary.pricing.commissionRate * 100) / 100;
      const sellerEarningsAmount = Math.round((itemSubtotal - platformCommissionAmount) * 100) / 100;

      orderItems.push({
        listingId: item.listingId,
        bookId: item.book._id,
        sellerId: item.seller._id,
        bookTitleSnapshot: item.book.title,
        bookIsbnSnapshot: item.book.isbn13,
        coverImageSnapshot: item.book.coverImageUrl,
        conditionSnapshot: item.condition,
        unitPrice: item.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        platformCommissionRate: summary.pricing.commissionRate,
        platformCommissionAmount,
        sellerEarningsAmount,
        itemStatus: 'PENDING'
      });
    }

    const order = await OrderDAO.create({
      orderNumber,
      buyerId: userId,
      items: orderItems,
      shippingAddressSnapshot: {
        fullName: summary.address.fullName,
        streetAddress: summary.address.streetAddress,
        city: summary.address.city,
        state: summary.address.state,
        postalCode: summary.address.postalCode,
        country: summary.address.country,
        phone: summary.address.phone
      },
      pricing: {
        subtotal: summary.pricing.subtotal,
        taxAmount: summary.pricing.taxAmount,
        shippingFee: summary.pricing.shippingFee,
        discountAmount: summary.pricing.discountAmount,
        grandTotal: summary.pricing.grandTotal
      },
      orderStatus: 'PENDING_PAYMENT'
    });

    // NOTE: Cart is NOT cleared here! It is only cleared when payment is verified!
    return order;
  }

  static async cancelPendingOrder(orderId, userId) {
    const order = await OrderDAO.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    if (order.buyerId._id.toString() !== userId.toString()) {
      throw new AppError('Unauthorized access to order', 403);
    }

    if (['PENDING_PAYMENT', 'PAYMENT_PROCESSING'].includes(order.orderStatus)) {
      await OrderDAO.updateOrderStatus(order._id, 'CANCELLED');
      for (const item of order.items) {
        await ListingDAO.releaseStock(item.listingId, item.quantity);
      }
    }

    return order;
  }

  static async getBuyerOrders(userId, query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    return await OrderDAO.findByBuyerId(userId, { page, limit });
  }

  static async getOrderById(orderId, userId, userRoles = []) {
    const order = await OrderDAO.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);

    const isBuyer = order.buyerId._id.toString() === userId.toString();
    const isSeller = order.items.some(item => item.sellerId.toString() === userId.toString());
    const isAdmin = userRoles.includes('admin');

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new AppError('Unauthorized access to this order', 403);
    }

    return order;
  }

  static async updateOrderItemStatus(orderId, itemId, sellerId, itemStatus) {
    const updatedOrder = await OrderDAO.updateItemStatus(orderId, itemId, sellerId, itemStatus);
    if (!updatedOrder) {
      throw new AppError('Order item not found or unauthorized seller', 404);
    }
    return updatedOrder;
  }
}
