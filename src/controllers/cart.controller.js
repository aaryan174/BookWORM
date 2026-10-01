import { CartService } from '../services/cart.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export class CartController {
  static getCart = asyncHandler(async (req, res) => {
    const cart = await CartService.getCart(req.user._id);
    return sendSuccess(res, 'Cart fetched successfully', { cart });
  });

  static addItem = asyncHandler(async (req, res) => {
    const { listingId, quantity } = req.body;
    const cart = await CartService.addItem(req.user._id, listingId, quantity);
    return sendSuccess(res, 'Item added to cart', { cart });
  });

  static updateQuantity = asyncHandler(async (req, res) => {
    const { listingId } = req.params;
    const { quantity } = req.body;
    const cart = await CartService.updateItemQuantity(req.user._id, listingId, quantity);
    return sendSuccess(res, 'Cart item quantity updated', { cart });
  });

  static removeItem = asyncHandler(async (req, res) => {
    const { listingId } = req.params;
    const cart = await CartService.removeItem(req.user._id, listingId);
    return sendSuccess(res, 'Item removed from cart', { cart });
  });

  static clearCart = asyncHandler(async (req, res) => {
    const cart = await CartService.clearCart(req.user._id);
    return sendSuccess(res, 'Cart cleared successfully', { cart });
  });
}
