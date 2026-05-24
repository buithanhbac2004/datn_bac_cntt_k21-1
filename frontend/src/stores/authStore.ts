// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Thêm cái này bác ơi
import type { AuthState } from '@/types/auth';


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access_token: null, // Cái này sẽ chỉ nằm trên RAM

      setAuth: (user, access_token) => set({ user, access_token }),
      
      logout: () => {
        set({ user: null, access_token: null });
        // Không cần xóa localStorage thủ công vì persist lo rồi
      },
    }),
    {
      name: 'auth-storage',
      // CHỖ NÀY QUAN TRỌNG: Chỉ chọn field 'user' để persist
      // partialize: (state) => ({ user: state.user }), 
    }
  )
);