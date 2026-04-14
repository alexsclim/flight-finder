import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  user: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  return {
    token,
    user: user ? JSON.parse(user) : null,
    login: (token: string, user: any) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user });
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null });
    },
    isAuthenticated: () => !!token,
  };
});
