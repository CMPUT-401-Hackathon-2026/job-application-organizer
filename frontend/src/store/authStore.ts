import { create } from 'zustand';
import type { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const getStoredAuth = () => {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  if (token && userStr) {
    return { token, user: JSON.parse(userStr) as User };
  }
  return { token: null, user: null };
};

export const useAuthStore = create<AuthStore>((set) => {
  const stored = getStoredAuth();
  return {
    user: stored.user,
    token: stored.token,
    isAuthenticated: !!stored.token && !!stored.user,
    setAuth: (user, token) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('user_profile');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
