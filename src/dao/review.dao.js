import { Review } from '../models/review.model.js';
import mongoose from 'mongoose';

export class ReviewDAO {
  static async create(reviewData) {
    return await Review.create(reviewData);
  }

  static async findByBookId(bookId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find({ bookId }).populate('buyerId', 'name avatarUrl').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments({ bookId })
    ]);
    return { reviews, total, page, limit, pages: Math.ceil(total / limit) };
  }

  static async findUserReviewForOrder(bookId, buyerId, orderId) {
    return await Review.findOne({ bookId, buyerId, orderId });
  }

  static async calculateAverageRating(bookId) {
    const stats = await Review.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(bookId) } },
      {
        $group: {
          _id: '$bookId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      return {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        reviewCount: stats[0].reviewCount
      };
    }

    return { averageRating: 0, reviewCount: 0 };
  }
}
