import { create } from 'zustand';
import api from '../services/api.js';
import storage from '../utils/storage.js';

export const usePostStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  localDraft: null, // For auto-save buffer

  fetchPosts: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/posts/workspaces/${workspaceId}`);
      set({ posts: response.data.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load posts.', isLoading: false });
    }
  },

  createPost: async (workspaceId, title, content) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/posts', { workspaceId, title, content });
      const newPost = response.data.data;
      set((state) => ({ posts: [newPost, ...state.posts], isLoading: false }));
      // Clear local draft auto-save on successful backend sync
      await get().clearLocalDraft();
      return { success: true, post: newPost };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create post.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  updatePost: async (postId, title, content) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(`/posts/${postId}`, { title, content });
      const updatedPost = response.data.data;
      set((state) => ({
        posts: state.posts.map((p) => (p.id === postId ? updatedPost : p)),
        isLoading: false
      }));
      await get().clearLocalDraft();
      return { success: true, post: updatedPost };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update post.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  deletePost: async (postId) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/posts/${postId}`);
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== postId),
        isLoading: false
      }));
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete post.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  schedulePost: async (workspaceId, postId, socialAccountId, scheduledAt) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/schedules', {
        workspaceId,
        postId,
        socialAccountId,
        scheduledAt
      });
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to schedule post.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  // AI Content Generator integration
  generateAICopilot: async (workspaceId, prompt, platform, tone) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/ai/generate', {
        workspaceId,
        prompt,
        platform,
        tone
      });
      set({ isLoading: false });
      return { success: true, content: response.data.data.content };
    } catch (err) {
      const msg = err.response?.data?.message || 'AI Content optimization failed.';
      set({ error: msg, isLoading: false });
      return { success: false, message: msg };
    }
  },

  // Local auto-save handlers
  saveLocalDraft: async (title, content) => {
    const draft = { title, content, updatedAt: new Date().toISOString() };
    await storage.setItem('autosave_draft', JSON.stringify(draft));
    set({ localDraft: draft });
  },

  loadLocalDraft: async () => {
    const data = await storage.getItem('autosave_draft');
    if (data) {
      const draft = JSON.parse(data);
      set({ localDraft: draft });
      return draft;
    }
    return null;
  },

  clearLocalDraft: async () => {
    await storage.removeItem('autosave_draft');
    set({ localDraft: null });
  }
}));

export default usePostStore;
