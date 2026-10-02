import { apiClient } from '../../../utils/apiClient.js';

export const bookApi = {
  getBooks: (params) => apiClient.get('/books', { params }),
  getBookById: (id) => apiClient.get(`/books/${id}`),
  getBookListings: (id) => apiClient.get(`/books/${id}/listings`),
  createBook: (payload) => apiClient.post('/books', payload),

  /**
   * Uploads a book cover image to ImageKit via backend secure upload endpoint
   * @param {File} file
   * @returns {Promise<{ success: boolean, data: { url: string, fileId: string } }>}
   */
  uploadCoverImage: (file) => {
    const formData = new FormData();
    formData.append('coverImage', file);
    return apiClient.post('/storage/upload', formData);
  }
};
