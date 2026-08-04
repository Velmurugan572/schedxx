import { create } from 'zustand';
import api from '../services/api.js';
import { storage } from '../utils/storage.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;

      await storage.setItem('accessToken', accessToken);
      await storage.setItem('refreshToken', refreshToken);

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials or connection.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  register: async (email, password, firstName, lastName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/register', { email, password, firstName, lastName });
      const { user, accessToken, refreshToken } = response.data.data;

      await storage.setItem('accessToken', accessToken);
      await storage.setItem('refreshToken', refreshToken);

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please check your inputs or connection.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },

  fetchUserProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/users/me');
      set({ user: response.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch user profile.', isLoading: false });
    }
  },

  logout: async () => {
    const refreshToken = await storage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (err) {
        // Suppress logout network errors
      }
    }
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
    await storage.removeItem('autosave_draft');
    set({ user: null, isAuthenticated: false, error: null });
  },

  checkSession: async () => {
    set({ isLoading: true });
    const token = await storage.getItem('accessToken');
    const refreshToken = await storage.getItem('refreshToken');

    if (token && refreshToken) {
      try {
        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        await storage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          await storage.setItem('refreshToken', newRefreshToken);
        }
        
        // Fetch real user profile on session restore
        const userProfile = await api.get('/users/me');
        set({
          user: userProfile.data.data,
          isAuthenticated: true,
          isLoading: false
        });
      } catch (err) {
        await storage.removeItem('accessToken');
        await storage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  }
}));

export default useAuthStore;
