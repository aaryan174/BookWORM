import { UserDAO } from '../dao/user.dao.js';
import { AddressDAO } from '../dao/address.dao.js';
import { AppError } from '../utils/AppError.js';

export class UserService {
  static async updateProfile(userId, updateData) {
    const allowed = ['name', 'phone', 'avatarUrl'];
    const filtered = {};
    Object.keys(updateData).forEach(key => {
      if (allowed.includes(key)) filtered[key] = updateData[key];
    });

    const user = await UserDAO.updateById(userId, filtered);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  static async getAddresses(userId) {
    return await AddressDAO.findByUserId(userId);
  }

  static async addAddress(userId, addressData) {
    return await AddressDAO.create({ ...addressData, userId });
  }

  static async deleteAddress(addressId, userId) {
    const address = await AddressDAO.deleteById(addressId, userId);
    if (!address) throw new AppError('Address not found or unauthorized', 404);
    return address;
  }
}
