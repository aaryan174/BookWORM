import { apiClient } from '../../../utils/apiClient.js';

export const cartApi = {
  getCart: () => apiClient.get('/cart'),
  addItem: (payload) => apiClient.post('/cart/items', payload),
  updateQuantity: (listingId, payload) => apiClient.patch(`/cart/items/${listingId}`, payload),
  removeItem: (listingId) => apiClient.delete(`/cart/items/${listingId}`),
  clearCart: () => apiClient.delete('/cart')
};
