import { apiClient } from '../../../utils/apiClient.js';

export const orderApi = {
  getCheckoutSummary: (payload) => apiClient.post('/orders/checkout-summary', payload),
  createOrder: (payload) => apiClient.post('/orders', payload),
  getOrders: (params) => apiClient.get('/orders', { params }),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  cancelPendingOrder: (id) => apiClient.post(`/orders/${id}/cancel`),
  updateItemStatus: (id, payload) => apiClient.patch(`/orders/${id}/status`, payload)
};
