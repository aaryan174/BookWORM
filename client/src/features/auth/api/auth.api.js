import { apiClient } from '../../../utils/apiClient.js';

export const authApi = {
  register: (payload) => apiClient.post('/auth/register', payload),
  login: (payload) => apiClient.post('/auth/login', payload),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me')
};
