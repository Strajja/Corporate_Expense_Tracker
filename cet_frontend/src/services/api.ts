import axios from 'axios';

// Initialize Axios instance with backend base URL and default JSON headers
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically attaches the JWT authorization bearer token to outgoing requests.
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      // Using .set() provides a safer way to mutate headers in Axios v1+
      if (token && config.headers) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Intercepts failed requests and forcefully logs out the user on authentication errors (401/403).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if ((error.response?.status === 401 || error.response?.status === 403) && typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('username');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default api;