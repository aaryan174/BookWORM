import { ReviewService } from '../services/review.service.js';
import { sendSuccess } from '../utils/response.util.js';
import { asyncHandler } from '../utils/asyncHandler.util.js';

export class ReviewController {
  static createReview = asyncHandler(async (req, res) => {
    const review = await ReviewService.createReview(req.user._id, req.body);
    return sendSuccess(res, 'Review submitted successfully', { review }, 201);
  });

  static getBookReviews = asyncHandler(async (req, res) => {
    const result = await ReviewService.getBookReviews(req.params.bookId, req.query);
    return sendSuccess(res, 'Book reviews fetched successfully', result);
  });
}
