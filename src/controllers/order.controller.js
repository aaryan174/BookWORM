import { OrderService } from '../services/order.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export class OrderController {
  static getCheckoutSummary = asyncHandler(async (req, res) => {
    const summary = await OrderService.getCheckoutSummary(req.user._id, req.body.addressId);
    return sendSuccess(res, 'Checkout summary calculated', summary);
  });

  static createOrder = asyncHandler(async (req, res) => {
    const order = await OrderService.createPendingOrder(req.user._id, req.body.addressId);
    return sendSuccess(res, 'Order created successfully', { order }, 201);
  });

  static cancelPendingOrder = asyncHandler(async (req, res) => {
    const order = await OrderService.cancelPendingOrder(req.params.id, req.user._id);
    return sendSuccess(res, 'Order cancelled and stock released', { order });
  });

  static getBuyerOrders = asyncHandler(async (req, res) => {
    const result = await OrderService.getBuyerOrders(req.user._id, req.query);
    return sendSuccess(res, 'Orders fetched successfully', result);
  });

  static getOrderById = asyncHandler(async (req, res) => {
    const order = await OrderService.getOrderById(req.params.id, req.user._id, req.user.roles);
    return sendSuccess(res, 'Order details fetched', { order });
  });

  static updateItemStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { itemId, status } = req.body;
    const order = await OrderService.updateOrderItemStatus(id, itemId, req.user._id, status);
    return sendSuccess(res, 'Order item status updated', { order });
  });
}
