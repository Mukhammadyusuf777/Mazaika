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

/** Clears all AI data for a given userId from localStorage */
function clearUserAIData(userId?: string) {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    // Remove all mazaika AI keys: both old format and new user-scoped format
    if (
      key.startsWith('mazaika_ai_') ||
      key.startsWith('mazaika_site_') ||
      (userId && key.includes(userId))
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
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
    const currentUser = JSON.parse(localStorage.getItem('mazaika_user') || 'null');
    clearUserAIData(currentUser?.id);
    localStorage.removeItem('mazaika_user');
    set({ user: null });
  }
}));
