import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000,
  });

  // Add request interceptor to automatically include auth token
  apiClient.interceptors.request.use(
    (config) => {
      const accessToken = Cookies.get('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        Cookies.remove('accessToken');
        window.location.href = '/auth';
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
};

export const apiClient = createApiClient(); 