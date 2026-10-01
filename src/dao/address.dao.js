import { Address } from '../models/address.model.js';

export class AddressDAO {
  static async findByUserId(userId) {
    return await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  static async findById(id) {
    return await Address.findById(id);
  }

  static async create(addressData) {
    if (addressData.isDefault) {
      await Address.updateMany({ userId: addressData.userId }, { isDefault: false });
    }
    return await Address.create(addressData);
  }

  static async unsetDefaults(userId) {
    return await Address.updateMany({ userId }, { isDefault: false });
  }

  static async deleteById(id, userId) {
    return await Address.findOneAndDelete({ _id: id, userId });
  }
}
