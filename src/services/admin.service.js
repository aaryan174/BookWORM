import { UserDAO } from '../dao/user.dao.js';
import { User } from '../models/user.model.js';
import { Order } from '../models/order.model.js';
import { Listing } from '../models/listing.model.js';
import { Book } from '../models/book.model.js';
import { AppError } from '../utils/AppError.js';

export class AdminService {
  static async getUsers(query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    return await UserDAO.findAll({ page, limit, role: query.role });
  }

  static async updateUserRoles(userId, roles) {
    const user = await UserDAO.updateById(userId, { roles });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  static async getPlatformAnalytics() {
    const [
      totalUsers,
      totalSellers,
      totalBooks,
      activeListings,
      salesStats
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ roles: 'seller' }),
      Book.countDocuments(),
      Listing.countDocuments({ status: 'ACTIVE' }),
      Order.aggregate([
        { $match: { orderStatus: 'PAID' } },
        {
          $group: {
            _id: null,
            totalGrossVolume: { $sum: '$pricing.grandTotal' },
            totalSubtotal: { $sum: '$pricing.subtotal' },
            totalPaidOrders: { $sum: 1 }
          }
        }
      ])
    ]);

    const grossVolume = salesStats[0] ? salesStats[0].totalGrossVolume : 0;
    const totalSubtotal = salesStats[0] ? salesStats[0].totalSubtotal : 0;
    const paidOrders = salesStats[0] ? salesStats[0].totalPaidOrders : 0;
    const platformCommissionRevenue = Math.round(totalSubtotal * 0.10 * 100) / 100;

    return {
      users: totalUsers,
      sellers: totalSellers,
      books: totalBooks,
      activeListings,
      orders: paidOrders,
      financials: {
        grossVolume,
        totalSubtotal,
        platformCommissionRevenue,
        currency: 'INR'
      }
    };
  }
}
