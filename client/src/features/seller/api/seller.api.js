import { apiClient } from '../../../utils/apiClient.js';

export const sellerApi = {
  onboard: (payload) => apiClient.post('/seller/onboard', payload),
  getProfile: () => apiClient.get('/seller/profile'),
  getListings: (params) => apiClient.get('/seller/listings', { params }),
  createListing: (payload) => apiClient.post('/seller/listings', payload),
  updateListing: (id, payload) => apiClient.patch(`/seller/listings/${id}`, payload),
  deleteListing: (id) => apiClient.delete(`/seller/listings/${id}`),
  getSales: (params) => apiClient.get('/seller/sales', { params })
};
