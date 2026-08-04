import { create } from 'zustand';
import api from '../services/api.js';

export const useAnalyticsStore = create((set) => ({
  workspaceStats: null,
  historyStats: [],
  postStats: {}, // Map of postId -> analytics
  isLoading: false,
  error: null,

  fetchWorkspaceAnalytics: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/analytics/workspaces/${workspaceId}`);
      set({ workspaceStats: response.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load workspace stats.', isLoading: false });
    }
  },

  fetchHistoricalAnalytics: async (workspaceId, metricName = null) => {
    set({ isLoading: true, error: null });
    try {
      const url = `/analytics/workspaces/${workspaceId}/history${metricName ? `?metricName=${metricName}` : ''}`;
      const response = await api.get(url);
      set({ historyStats: response.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load historical performance.', isLoading: false });
    }
  },

  fetchPostAnalytics: async (postId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/analytics/posts/${postId}`);
      const stats = response.data.data;
      set((state) => ({
        postStats: { ...state.postStats, [postId]: stats },
        isLoading: false
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load post metrics.', isLoading: false });
    }
  },

  syncWorkspaceMetrics: async (destinationId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/analytics/sync', { destinationId });
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Sync failed.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  }
}));

export default useAnalyticsStore;
