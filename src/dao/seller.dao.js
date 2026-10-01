import { SellerProfile } from '../models/sellerProfile.model.js';

export class SellerDAO {
  static async findByUserId(userId) {
    return await SellerProfile.findOne({ userId });
  }

  static async findByStoreName(storeName) {
    return await SellerProfile.findOne({ storeName: new RegExp(`^${storeName}$`, 'i') });
  }

  static async create(sellerData) {
    return await SellerProfile.create(sellerData);
  }

  static async updateStatus(userId, status) {
    return await SellerProfile.findOneAndUpdate({ userId }, { status }, { new: true });
  }
}
