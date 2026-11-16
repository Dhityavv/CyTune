import { create } from 'zustand';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  isGuest?: boolean;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  initAuth: () => Promise<void>;
  signInAsGuest: (name?: string) => void;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithGithub: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isConfigured: false,

  initAuth: async () => {
    const configured = isSupabaseConfigured();
    set({ isConfigured: configured });

    // Always check for local profile first if available
    const cached = typeof window !== 'undefined' ? localStorage.getItem('orbittune-guest-user') : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        set({ user: parsed, isLoading: false });
        return;
      } catch {
        // ignore
      }
    }

    if (!configured) {
      set({ user: null, isLoading: false });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const u = session.user;
        set({
          user: {
            id: u.id,
            email: u.email,
            username: u.user_metadata?.username || u.email?.split('@')[0] || 'Listener',
            display_name: u.user_metadata?.full_name || u.user_metadata?.display_name || 'Listener',
            avatar_url: u.user_metadata?.avatar_url,
          },
          isLoading: false,
        });
      } else {
        set({ user: null, isLoading: false });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user;
          set({
            user: {
              id: u.id,
              email: u.email,
              username: u.user_metadata?.username || u.email?.split('@')[0] || 'Listener',
              display_name: u.user_metadata?.full_name || u.user_metadata?.display_name || 'Listener',
              avatar_url: u.user_metadata?.avatar_url,
            },
          });
        } else {
          set({ user: null });
        }
      });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  signInAsGuest: (name?: string) => {
    const guestUser: UserProfile = {
      id: `local_${Date.now()}`,
      username: name ? name.toLowerCase().replace(/\s+/g, '_') : 'orbit_guest',
      display_name: name || 'Orbit Listener',
      isGuest: true,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbittune-guest-user', JSON.stringify(guestUser));
    }
    set({ user: guestUser });
  },

  signInWithGoogle: async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { error: 'Supabase remote is not configured. Local profile mode is active.' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message };
  },

  signInWithGithub: async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { error: 'Supabase remote is not configured. Local profile mode is active.' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message };
  },

  signInWithEmail: async (email, password) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      // Automatic seamless local offline fallback if Supabase not configured!
      const localUser: UserProfile = {
        id: `local_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        username: email.split('@')[0],
        display_name: email.split('@')[0],
        isGuest: true,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('orbittune-guest-user', JSON.stringify(localUser));
      }
      set({ user: localUser });
      return {};
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message };
  },

  signUpWithEmail: async (email, password, displayName) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      // Automatic seamless local offline fallback if Supabase not configured!
      const localUser: UserProfile = {
        id: `local_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        username: email.split('@')[0],
        display_name: displayName || email.split('@')[0],
        isGuest: true,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('orbittune-guest-user', JSON.stringify(localUser));
      }
      set({ user: localUser });
      return {};
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
          username: email.split('@')[0],
        },
      },
    });
    return { error: error?.message };
  },

  signOut: async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orbittune-guest-user');
    }
    set({ user: null });
  },
}));
