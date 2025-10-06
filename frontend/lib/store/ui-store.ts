import { create } from 'zustand';

/**
 * UI状态接口 - UI state interface
 */
interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

/**
 * UI状态存储 - UI state store
 * 管理全局UI状态 - Manages global UI state
 */
export const useUIStore = create<UIState>()((set) => ({
  theme: 'light',
  sidebarOpen: false,

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  setSidebarOpen: (open) =>
    set({
      sidebarOpen: open,
    }),
}));
