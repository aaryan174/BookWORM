import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true
});

// Request interceptor: attach bearer token from localStorage as fallback/backup
apiClient.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem('bookworm_token');
  if (token && !reqConfig.headers.Authorization) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data;
    let message = errorData?.message || error.message || 'An unexpected error occurred';

    if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      const fieldDetails = errorData.errors
        .map((e) => e.message || (e.field ? `${e.field} is invalid` : null))
        .filter(Boolean)
        .join('. ');
      if (fieldDetails) {
        message = `${message}: ${fieldDetails}`;
      }
    }

    const customError = {
      message,
      statusCode: error.response?.status || 500,
      errors: errorData?.errors || []
    };
    return Promise.reject(customError);
  }
);
