import { apiClient } from '../../../utils/apiClient.js';

export const adminApi = {
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  updateUserRoles: (id, payload) => apiClient.patch(`/admin/users/${id}/roles`, payload),
  getAnalytics: () => apiClient.get('/admin/analytics')
};
