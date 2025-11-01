import { create } from 'zustand';

interface UiState {
  isPostComposerOpen: boolean;
  selectedPostId: string | null;
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>;
  openPostComposer: () => void;
  closePostComposer: () => void;
  setSelectedPost: (postId: string | null) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isPostComposerOpen: false,
  selectedPostId: null,
  isSidebarOpen: true,
  theme: 'light',
  notifications: [],

  openPostComposer: () => set({ isPostComposerOpen: true }),

  closePostComposer: () => set({ isPostComposerOpen: false }),

  setSelectedPost: (postId) => set({ selectedPostId: postId }),

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setTheme: (theme) => set({ theme }),

  addNotification: (type, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      notifications: [...state.notifications, { id, type, message }]
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, 5000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  }
}));
