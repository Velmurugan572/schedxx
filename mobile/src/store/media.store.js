import { create } from 'zustand';
import api from '../services/api.js';

export const useMediaStore = create((set, get) => ({
  mediaAssets: [],
  isLoading: false,
  error: null,

  fetchMediaAssets: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/media/workspaces/${workspaceId}`);
      set({ mediaAssets: response.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch media assets.', isLoading: false });
    }
  },

  uploadMediaAsset: async (workspaceId, file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('workspaceId', workspaceId);
      formData.append('file', {
        uri: file.uri,
        name: file.name || 'upload.jpg',
        type: file.type || 'image/jpeg'
      });

      const response = await api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const newAsset = response.data.data;
      set((state) => ({
        mediaAssets: [newAsset, ...state.mediaAssets],
        isLoading: false
      }));
      return { success: true, asset: newAsset };
    } catch (err) {
      const msg = err.response?.data?.message || 'Media upload failed.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  deleteMediaAsset: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/media/${id}`);
      set((state) => ({
        mediaAssets: state.mediaAssets.filter((asset) => asset.id !== id),
        isLoading: false
      }));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete media asset.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  attachMediaToPost: async (postId, mediaAssetId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/media/attach', { postId, mediaAssetId });
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to attach media to post.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  detachMediaFromPost: async (postId, mediaAssetId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/media/detach', { postId, mediaAssetId });
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to detach media from post.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  }
}));

export default useMediaStore;
