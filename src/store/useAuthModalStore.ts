import { create } from 'zustand';

interface AuthModalStore {
  isOpen: boolean;
  message: string | null;
  defaultMode: 'login' | 'register' | 'forgot-password';
  open: (message?: string, mode?: 'login' | 'register' | 'forgot-password') => void;
  close: () => void;
}

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  message: null,
  defaultMode: 'login',
  open: (message, mode = 'login') =>
    set({
      isOpen: true,
      message: message || null,
      defaultMode: mode,
    }),
  close: () => set({ isOpen: false, message: null }),
}));
