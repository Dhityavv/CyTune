import { create } from 'zustand';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  isGuest?: boolean;
  isPremium?: boolean;
  equippedFrame?: string | null;
  equippedBorder?: string | null;
  equippedBackground?: string | null;
  unlockedCosmetics?: string[];
  joinedDate?: string;
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
  updateProfile: (updates: Partial<UserProfile>) => void;
  equipCosmetic: (type: 'frame' | 'border' | 'background', itemId: string | null) => { success: boolean; error?: string };
  unlockCosmetic: (itemId: string) => void;
  togglePremium: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest_user',
  username: 'orbit_listener',
  display_name: 'Orbit Listener',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  bio: 'Exploring synthwave horizons, nocturnal soundscapes, and hi-res acoustic frequencies.',
  isGuest: true,
  isPremium: false,
  equippedFrame: 'frame-solar-halo',
  equippedBorder: 'border-animated-gold',
  equippedBackground: null,
  unlockedCosmetics: [
    'frame-solar-halo',
    'frame-celestial-orbit',
    'frame-aurora-ring',
    'border-animated-gold',
    'border-subtle-neon',
    'border-metallic',
  ],
  joinedDate: 'Joined Nov 2026',
};

export const useAuthStore = create<AuthState>((set, get) => ({
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
        // Merge with defaults for any missing new fields
        const fullUser: UserProfile = {
          ...DEFAULT_PROFILE,
          ...parsed,
          unlockedCosmetics: parsed.unlockedCosmetics || DEFAULT_PROFILE.unlockedCosmetics,
        };
        set({ user: fullUser, isLoading: false });
        return;
      } catch {
        // ignore
      }
    }

    if (!configured) {
      // Initialize with default guest profile so user immediately enjoys cosmetics & profile
      set({ user: DEFAULT_PROFILE, isLoading: false });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      set({ user: DEFAULT_PROFILE, isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const profileUser: UserProfile = {
          id: u.id,
          email: u.email,
          username: meta.username || u.email?.split('@')[0] || 'orbit_listener',
          display_name: meta.full_name || meta.display_name || 'Orbit Listener',
          avatar_url: meta.avatar_url || DEFAULT_PROFILE.avatar_url,
          bio: meta.bio || DEFAULT_PROFILE.bio,
          isGuest: false,
          isPremium: meta.is_premium || false,
          equippedFrame: meta.equipped_frame || 'frame-solar-halo',
          equippedBorder: meta.equipped_border || 'border-animated-gold',
          equippedBackground: meta.equipped_background || null,
          unlockedCosmetics: meta.unlocked_cosmetics || DEFAULT_PROFILE.unlockedCosmetics,
          joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };
        set({ user: profileUser, isLoading: false });
      } else {
        set({ user: DEFAULT_PROFILE, isLoading: false });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user;
          const meta = u.user_metadata || {};
          set({
            user: {
              id: u.id,
              email: u.email,
              username: meta.username || u.email?.split('@')[0] || 'orbit_listener',
              display_name: meta.full_name || meta.display_name || 'Orbit Listener',
              avatar_url: meta.avatar_url || DEFAULT_PROFILE.avatar_url,
              bio: meta.bio || DEFAULT_PROFILE.bio,
              isGuest: false,
              isPremium: meta.is_premium || false,
              equippedFrame: meta.equipped_frame || 'frame-solar-halo',
              equippedBorder: meta.equipped_border || 'border-animated-gold',
              equippedBackground: meta.equipped_background || null,
              unlockedCosmetics: meta.unlocked_cosmetics || DEFAULT_PROFILE.unlockedCosmetics,
              joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            },
          });
        }
      });
    } catch {
      set({ user: DEFAULT_PROFILE, isLoading: false });
    }
  },

  signInAsGuest: (name?: string) => {
    const guestUser: UserProfile = {
      ...DEFAULT_PROFILE,
      id: `local_${Date.now()}`,
      username: name ? name.toLowerCase().replace(/\s+/g, '_') : 'orbit_listener',
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
      const localUser: UserProfile = {
        ...DEFAULT_PROFILE,
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
      const localUser: UserProfile = {
        ...DEFAULT_PROFILE,
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
    set({ user: DEFAULT_PROFILE });
  },

  updateProfile: (updates: Partial<UserProfile>) => {
    const current = get().user || DEFAULT_PROFILE;
    const updated: UserProfile = { ...current, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbittune-guest-user', JSON.stringify(updated));
    }
    set({ user: updated });

    // Sync to Supabase if connected
    const supabase = getSupabaseBrowserClient();
    if (supabase && !updated.isGuest) {
      supabase.auth.updateUser({
        data: {
          display_name: updated.display_name,
          username: updated.username,
          bio: updated.bio,
          avatar_url: updated.avatar_url,
          equipped_frame: updated.equippedFrame,
          equipped_border: updated.equippedBorder,
          equipped_background: updated.equippedBackground,
          unlocked_cosmetics: updated.unlockedCosmetics,
        },
      }).catch(() => {
        // ignore background sync errors
      });
    }
  },

  equipCosmetic: (type, itemId) => {
    const current = get().user || DEFAULT_PROFILE;

    // Strict Premium Check for backgrounds
    if (type === 'background' && itemId) {
      if (!current.isPremium) {
        return {
          success: false,
          error: 'Profile Backgrounds are exclusive to Hi-Fi Premium members. Upgrade to unlock this atmosphere.',
        };
      }
    }

    const updated: UserProfile = {
      ...current,
      ...(type === 'frame' ? { equippedFrame: itemId } : {}),
      ...(type === 'border' ? { equippedBorder: itemId } : {}),
      ...(type === 'background' ? { equippedBackground: itemId } : {}),
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('orbittune-guest-user', JSON.stringify(updated));
    }
    set({ user: updated });

    return { success: true };
  },

  unlockCosmetic: (itemId: string) => {
    const current = get().user || DEFAULT_PROFILE;
    const currentUnlocked = current.unlockedCosmetics || [];
    if (!currentUnlocked.includes(itemId)) {
      const updatedList = [...currentUnlocked, itemId];
      const updated: UserProfile = {
        ...current,
        unlockedCosmetics: updatedList,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('orbittune-guest-user', JSON.stringify(updated));
      }
      set({ user: updated });
    }
  },

  togglePremium: () => {
    const current = get().user || DEFAULT_PROFILE;
    const nextPremium = !current.isPremium;
    const updated: UserProfile = {
      ...current,
      isPremium: nextPremium,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbittune-guest-user', JSON.stringify(updated));
    }
    set({ user: updated });
  },
}));
