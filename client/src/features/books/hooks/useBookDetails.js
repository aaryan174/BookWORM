import { useState, useEffect, useCallback } from 'react';
import { bookApi } from '../api/book.api.js';

export const useBookDetails = (bookId) => {
  const [book, setBook] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookData = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      setError(null);
      const [bookRes, listingsRes] = await Promise.all([
        bookApi.getBookById(bookId),
        bookApi.getBookListings(bookId)
      ]);

      if (bookRes.success && bookRes.data.book) {
        setBook(bookRes.data.book);
      }
      if (listingsRes.success && listingsRes.data.listings) {
        setListings(listingsRes.data.listings);
      }
    } catch (err) {
      setError(err.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBookData();
  }, [fetchBookData]);

  return {
    book,
    listings,
    loading,
    error,
    refreshDetails: fetchBookData
  };
};
