import { ReviewDAO } from '../dao/review.dao.js';
import { OrderDAO } from '../dao/order.dao.js';
import { BookDAO } from '../dao/book.dao.js';
import { AppError } from '../utils/AppError.js';

export class ReviewService {
  static async createReview(userId, { bookId, orderId, rating, title, comment }) {
    const order = await OrderDAO.findById(orderId);
    if (!order) throw new AppError('Purchase order not found', 404);

    if (order.buyerId._id.toString() !== userId.toString()) {
      throw new AppError('Unauthorized: Order does not belong to your account', 403);
    }

    const hasBook = order.items.some(
      item => item.bookId.toString() === bookId.toString() && (item.itemStatus === 'DELIVERED' || order.orderStatus === 'PAID')
    );

    if (!hasBook) {
      throw new AppError('Verified purchase required. You can only review books from paid/delivered orders.', 403);
    }

    const existingReview = await ReviewDAO.findUserReviewForOrder(bookId, userId, orderId);
    if (existingReview) {
      throw new AppError('You have already submitted a review for this book order', 409);
    }

    const review = await ReviewDAO.create({
      bookId,
      buyerId: userId,
      orderId,
      rating,
      title,
      comment
    });

    // Recalculate average rating on canonical book
    const stats = await ReviewDAO.calculateAverageRating(bookId);
    await BookDAO.updateRatingStats(bookId, stats.averageRating, stats.reviewCount);

    return review;
  }

  static async getBookReviews(bookId, query) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    return await ReviewDAO.findByBookId(bookId, { page, limit });
  }
}
