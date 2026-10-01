import { apiClient } from '../../../utils/apiClient.js';

export const bookApi = {
  getBooks: (params) => apiClient.get('/books', { params }),
  getBookById: (id) => apiClient.get(`/books/${id}`),
  getBookListings: (id) => apiClient.get(`/books/${id}/listings`),
  createBook: (payload) => apiClient.post('/books', payload)
};
