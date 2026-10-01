import { useState, useEffect, useCallback } from 'react';
import { bookApi } from '../api/book.api.js';

export const useBooks = (initialParams = {}) => {
  const [books, setBooks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: 'ALL',
    sort: 'newest',
    page: 1,
    ...initialParams
  });

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookApi.getBooks(filters);
      if (res.success && res.data) {
        setBooks(res.data.books || []);
        setPagination({
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          pages: res.data.pages
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch book catalog');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: newFilters.page || 1 }));
  };

  return {
    books,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    refreshBooks: fetchBooks
  };
};
