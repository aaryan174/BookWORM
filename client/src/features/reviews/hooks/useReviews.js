import { useState, useEffect, useCallback } from 'react';
import { reviewApi } from '../api/review.api.js';
import { useToast } from '../../../contexts/ToastContext.jsx';

export const useReviews = (bookId) => {
  const { addToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async (page = 1) => {
    if (!bookId) return;
    try {
      setLoading(true);
      const res = await reviewApi.getBookReviews(bookId, { page });
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setPagination({
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total
        });
      }
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReview = async (payload) => {
    try {
      setSubmitting(true);
      const res = await reviewApi.createReview(payload);
      addToast('Review submitted successfully!', 'success');
      await fetchReviews();
      return res;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    reviews,
    pagination,
    loading,
    submitting,
    submitReview,
    refreshReviews: fetchReviews
  };
};
