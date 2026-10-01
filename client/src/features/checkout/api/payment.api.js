import { apiClient } from '../../../utils/apiClient.js';

export const paymentApi = {
  createPaymentOrder: (payload) => apiClient.post('/payments/create-order', payload),
  verifyPayment: (payload) => apiClient.post('/payments/verify', payload)
};
