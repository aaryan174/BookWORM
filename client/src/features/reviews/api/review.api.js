import { apiClient } from '../../../utils/apiClient.js';

export const reviewApi = {
  getBookReviews: (bookId, params) => apiClient.get(`/reviews/book/${bookId}`, { params }),
  createReview: (payload) => apiClient.post('/reviews', payload)
};
