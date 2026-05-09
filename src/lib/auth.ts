import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'manager';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  storeId: number | null;
  name: string;
  branch: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null; // Simulating a token for the sake of completion
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // name of item in the storage (must be unique)
    }
  )
);
