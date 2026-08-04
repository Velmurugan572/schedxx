import { create } from 'zustand';
import api from '../services/api.js';

export const useWorkspaceStore = create((set) => ({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/workspaces');
      const workspaces = response.data.data.map(ws => ({
        id: ws.id,
        name: ws.name,
        role: ws.members?.[0]?.role || 'MEMBER'
      }));
      set({ workspaces, isLoading: false });
      if (workspaces.length > 0 && !useWorkspaceStore.getState().activeWorkspace) {
        set({ activeWorkspace: workspaces[0] });
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch workspaces. Check connection.';
      set({ error: message, isLoading: false });
    }
  },

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace });
  },

  createWorkspace: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/workspaces', { name });
      const { workspace, member } = response.data.data;
      const newWs = {
        id: workspace.id,
        name: workspace.name,
        role: member.role || 'OWNER'
      };
      set((state) => ({
        workspaces: [...state.workspaces, newWs],
        activeWorkspace: newWs,
        isLoading: false
      }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create workspace.';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  }
}));

export default useWorkspaceStore;
