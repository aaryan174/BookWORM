import { apiClient } from '../../../utils/apiClient.js';

export const userApi = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (payload) => apiClient.patch('/users/profile', payload),
  getAddresses: () => apiClient.get('/users/addresses'),
  addAddress: (payload) => apiClient.post('/users/addresses', payload),
  deleteAddress: (id) => apiClient.delete(`/users/addresses/${id}`)
};
