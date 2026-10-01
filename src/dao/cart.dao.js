import { Cart } from '../models/cart.model.js';

export class CartDAO {
  static async findByUserId(userId) {
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.listingId',
      populate: [
        { path: 'bookId' },
        { path: 'sellerId', select: 'name email' }
      ]
    });

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    return cart;
  }

  static async addItem(userId, listingId, quantity, currentPrice) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const existingIndex = cart.items.findIndex(item => item.listingId.toString() === listingId.toString());

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      cart.items[existingIndex].addedAtPrice = currentPrice;
    } else {
      cart.items.push({ listingId, quantity, addedAtPrice: currentPrice });
    }

    await cart.save();
    return await this.findByUserId(userId);
  }

  static async updateItemQuantity(userId, listingId, quantity) {
    const cart = await Cart.findOne({ userId });
    if (!cart) return null;

    const existingIndex = cart.items.findIndex(item => item.listingId.toString() === listingId.toString());
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = quantity;
      await cart.save();
    }
    return await this.findByUserId(userId);
  }

  static async removeItem(userId, listingId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) return null;

    cart.items = cart.items.filter(item => item.listingId.toString() !== listingId.toString());
    await cart.save();
    return await this.findByUserId(userId);
  }

  static async clearCart(userId) {
    return await Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });
  }
}
