import { create } from 'zustand';

interface AppState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  pageTitle: string;
  pageSubtitle: string;
  setPageInfo: (title: string, subtitle?: string) => void;
}

export const useAppStore = create<AppState>()((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  
  pageTitle: 'Tổng quan',
  pageSubtitle: '',
  setPageInfo: (title, subtitle = '') => set({ pageTitle: title, pageSubtitle: subtitle }),
}));