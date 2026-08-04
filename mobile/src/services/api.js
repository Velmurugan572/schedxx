import axios from 'axios';
import { ENV } from '../config/env.js';
import { storage } from '../utils/storage.js';

const api = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inject Auth Token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 and Token Refresh Rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await storage.getItem('refreshToken');
        if (refreshToken) {
          // Perform silent token rotation
          const response = await axios.post(`${ENV.API_URL}/auth/refresh`, {
            refreshToken
          });
          const { accessToken, newRefreshToken } = response.data.data;

          await storage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            await storage.setItem('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token failed -> Clear storage and logout trigger
        await storage.removeItem('accessToken');
        await storage.removeItem('refreshToken');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
