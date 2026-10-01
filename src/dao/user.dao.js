import { User } from '../models/user.model.js';

export class UserDAO {
  static async findById(id) {
    return await User.findById(id);
  }

  static async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+passwordHash');
    }
    return await query;
  }

  static async create(userData) {
    return await User.create(userData);
  }

  static async updateById(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  static async addRole(id, role) {
    return await User.findByIdAndUpdate(id, { $addToSet: { roles: role } }, { new: true });
  }

  static async findAll({ page = 1, limit = 20, role }) {
    const filter = {};
    if (role) filter.roles = role;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);

    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
