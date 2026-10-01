import { useState, useEffect, useCallback } from 'react';
import { orderApi } from '../api/order.api.js';

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderApi.getOrders({ page });
      if (res.success && res.data) {
        setOrders(res.data.orders || []);
        setPagination({
          page: res.data.page,
          limit: res.data.limit,
          total: res.data.total,
          pages: res.data.pages
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    pagination,
    loading,
    error,
    refreshOrders: fetchOrders
  };
};
