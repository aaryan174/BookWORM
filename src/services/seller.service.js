import { SellerDAO } from '../dao/seller.dao.js';
import { ListingDAO } from '../dao/listing.dao.js';
import { UserDAO } from '../dao/user.dao.js';
import { BookDAO } from '../dao/book.dao.js';
import { OrderDAO } from '../dao/order.dao.js';
import { AppError } from '../utils/AppError.js';

export class SellerService {
  static async onboardSeller(userId, { storeName, description, gstin, panNumber }) {
    const existingSeller = await SellerDAO.findByUserId(userId);
    if (existingSeller) {
      throw new AppError('Seller profile already exists for this account', 409);
    }

    const storeCheck = await SellerDAO.findByStoreName(storeName);
    if (storeCheck) {
      throw new AppError('Store name is already taken. Please choose another.', 409);
    }

    const sellerProfile = await SellerDAO.create({
      userId,
      storeName,
      description,
      gstin,
      panNumber,
      status: 'ACTIVE'
    });

    await UserDAO.addRole(userId, 'seller');
    return sellerProfile;
  }

  static async getSellerProfile(userId) {
    const profile = await SellerDAO.findByUserId(userId);
    if (!profile) throw new AppError('Seller profile not found', 404);
    return profile;
  }

  static async createListing(userId, listingData) {
    const book = await BookDAO.findById(listingData.bookId);
    if (!book) throw new AppError('Canonical book not found', 404);

    const status = listingData.stockQuantity === 0 ? 'SOLD_OUT' : 'ACTIVE';
    return await ListingDAO.create({
      ...listingData,
      sellerId: userId,
      status
    });
  }

  static async getSellerListings(userId, query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    return await ListingDAO.findBySellerId(userId, { page, limit, status: query.status });
  }

  static async updateListing(userId, listingId, updateData) {
    if (updateData.stockQuantity !== undefined) {
      if (updateData.stockQuantity === 0) {
        updateData.status = 'SOLD_OUT';
      } else if (updateData.status !== 'INACTIVE') {
        updateData.status = 'ACTIVE';
      }
    }

    const listing = await ListingDAO.updateById(listingId, userId, updateData);
    if (!listing) throw new AppError('Listing not found or unauthorized', 404);
    return listing;
  }

  static async deleteListing(userId, listingId) {
    const listing = await ListingDAO.deleteById(listingId, userId);
    if (!listing) throw new AppError('Listing not found or unauthorized', 404);
    return listing;
  }

  static async getSellerSales(userId, query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '15', 10);
    return await OrderDAO.findSellerSales(userId, { page, limit });
  }
}
