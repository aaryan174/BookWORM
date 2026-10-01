import { CartDAO } from '../dao/cart.dao.js';
import { ListingDAO } from '../dao/listing.dao.js';
import { AppError } from '../utils/AppError.js';

export class CartService {
  static async getCart(userId) {
    const cart = await CartDAO.findByUserId(userId);
    return this.calculateCartTotals(cart);
  }

  static async addItem(userId, listingId, quantity = 1) {
    const listing = await ListingDAO.findById(listingId);
    if (!listing || listing.status !== 'ACTIVE') {
      throw new AppError('This seller listing is no longer available', 400);
    }

    if (listing.stockQuantity < quantity) {
      throw new AppError(`Only ${listing.stockQuantity} items available in stock`, 400);
    }

    const cart = await CartDAO.addItem(userId, listingId, quantity, listing.price);
    return this.calculateCartTotals(cart);
  }

  static async updateItemQuantity(userId, listingId, quantity) {
    const listing = await ListingDAO.findById(listingId);
    if (!listing || listing.status !== 'ACTIVE') {
      throw new AppError('This listing is no longer available', 400);
    }

    if (listing.stockQuantity < quantity) {
      throw new AppError(`Only ${listing.stockQuantity} items available in stock`, 400);
    }

    const cart = await CartDAO.updateItemQuantity(userId, listingId, quantity);
    return this.calculateCartTotals(cart);
  }

  static async removeItem(userId, listingId) {
    const cart = await CartDAO.removeItem(userId, listingId);
    return this.calculateCartTotals(cart);
  }

  static async clearCart(userId) {
    await CartDAO.clearCart(userId);
    return { items: [], subtotal: 0, totalItems: 0 };
  }

  static calculateCartTotals(cart) {
    let subtotal = 0;
    let totalItems = 0;
    const formattedItems = [];

    if (cart && cart.items) {
      cart.items.forEach(item => {
        const listing = item.listingId;
        const isAvailable = listing && listing.status === 'ACTIVE' && listing.stockQuantity >= item.quantity;
        const itemPrice = listing ? listing.price : item.addedAtPrice;
        const itemTotal = itemPrice * item.quantity;

        if (isAvailable) {
          subtotal += itemTotal;
          totalItems += item.quantity;
        }

        formattedItems.push({
          _id: item._id,
          listingId: listing ? listing._id : item.listingId,
          book: listing ? listing.bookId : null,
          seller: listing ? listing.sellerId : null,
          condition: listing ? listing.condition : 'N/A',
          format: listing ? listing.format : 'N/A',
          price: itemPrice,
          quantity: item.quantity,
          itemTotal,
          isAvailable,
          stockAvailable: listing ? listing.stockQuantity : 0
        });
      });
    }

    return {
      _id: cart._id,
      items: formattedItems,
      subtotal,
      totalItems
    };
  }
}
