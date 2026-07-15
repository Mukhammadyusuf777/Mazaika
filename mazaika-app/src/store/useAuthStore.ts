import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('mazaika_user') || 'null'),
  setUser: (user) => {
    if (user) {
      localStorage.setItem('mazaika_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mazaika_user');
    }
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('mazaika_user');
    set({ user: null });
  }
}));
