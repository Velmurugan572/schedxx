import { create } from 'zustand';
import api from '../services/api.js';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notifications');
      const list = response.data.data;
      const unread = list.filter((n) => !n.read).length;
      set({ notifications: list, unreadCount: unread, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch notifications.', isLoading: false });
    }
  },

  markAsRead: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.patch(`/notifications/${id}/read`);
      await get().fetchNotifications(); // Auto refresh
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to mark notification as read.', isLoading: false });
    }
  },

  markAllAsRead: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.patch('/notifications/read-all');
      await get().fetchNotifications(); // Auto refresh
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to mark all as read.', isLoading: false });
    }
  },

  deleteNotification: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/notifications/${id}`);
      await get().fetchNotifications(); // Auto refresh
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete notification.', isLoading: false });
    }
  }
}));

export default useNotificationStore;
