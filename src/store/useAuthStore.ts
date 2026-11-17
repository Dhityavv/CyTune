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
  coins: number;
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
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyResetOtpAndSetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  equipCosmetic: (type: 'frame' | 'border' | 'background', itemId: string | null) => { success: boolean; error?: string };
  unlockCosmetic: (itemId: string) => void;
  addCoins: (amount: number, reason?: string) => void;
  buyPremiumWithCoins: () => { success: boolean; error?: string };
  togglePremium: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isConfigured: false,

  initAuth: async () => {
    const configured = isSupabaseConfigured();
    set({ isConfigured: configured });

    // Check for cached logged-in user profile if exists
    const cached = typeof window !== 'undefined' ? localStorage.getItem('orbittune-user') : null;
    let initialUser: UserProfile | null = null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id && parsed.email) {
          initialUser = {
            coins: 500,
            unlockedCosmetics: [],
            ...parsed,
          };
        }
      } catch {
        // ignore invalid cache
      }
    }

    if (!configured) {
      set({ user: initialUser, isLoading: false });
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      set({ user: initialUser, isLoading: false });
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
          username: meta.username || u.email?.split('@')[0] || 'listener',
          display_name: meta.full_name || meta.display_name || u.email?.split('@')[0] || 'Listener',
          avatar_url: meta.avatar_url || '',
          bio: meta.bio || 'Listening to high-fidelity soundscapes on OrbitTune.',
          isGuest: false,
          isPremium: meta.is_premium || false,
          coins: typeof meta.coins === 'number' ? meta.coins : 500,
          equippedFrame: meta.equipped_frame || null,
          equippedBorder: meta.equipped_border || null,
          equippedBackground: meta.equipped_background || null,
          unlockedCosmetics: meta.unlocked_cosmetics || [],
          joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('orbittune-user', JSON.stringify(profileUser));
        }
        set({ user: profileUser, isLoading: false });
      } else {
        // Unauthenticated visitor by default -> NO auto-login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('orbittune-guest-user');
        }
        set({ user: null, isLoading: false });
      }

      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const u = session.user;
          const meta = u.user_metadata || {};
          const profileUser: UserProfile = {
            id: u.id,
            email: u.email,
            username: meta.username || u.email?.split('@')[0] || 'listener',
            display_name: meta.full_name || meta.display_name || u.email?.split('@')[0] || 'Listener',
            avatar_url: meta.avatar_url || '',
            bio: meta.bio || 'Listening to high-fidelity soundscapes on OrbitTune.',
            isGuest: false,
            isPremium: meta.is_premium || false,
            coins: typeof meta.coins === 'number' ? meta.coins : 500,
            equippedFrame: meta.equipped_frame || null,
            equippedBorder: meta.equipped_border || null,
            equippedBackground: meta.equipped_background || null,
            unlockedCosmetics: meta.unlocked_cosmetics || [],
            joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('orbittune-user', JSON.stringify(profileUser));
          }
          set({ user: profileUser });
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('orbittune-user');
          }
          set({ user: null });
        }
      });
    } catch {
      set({ user: initialUser, isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { error: 'Supabase remote is not configured. Please add Supabase credentials.' };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message };
  },

  signInWithEmail: async (email, password) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      // Local fallback mock account
      const localUser: UserProfile = {
        id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        username: email.split('@')[0],
        display_name: email.split('@')[0],
        avatar_url: '',
        bio: 'Exploring synthwave horizons and Hi-Fi acoustic frequencies.',
        isGuest: false,
        isPremium: false,
        coins: 1000,
        equippedFrame: null,
        equippedBorder: null,
        equippedBackground: null,
        unlockedCosmetics: [],
        joinedDate: 'Joined Nov 2026',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('orbittune-user', JSON.stringify(localUser));
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
        id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email,
        username: email.split('@')[0],
        display_name: displayName || email.split('@')[0],
        avatar_url: '',
        bio: 'Exploring synthwave horizons and Hi-Fi acoustic frequencies.',
        isGuest: false,
        isPremium: false,
        coins: 1000,
        equippedFrame: null,
        equippedBorder: null,
        equippedBackground: null,
        unlockedCosmetics: [],
        joinedDate: 'Joined Nov 2026',
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('orbittune-user', JSON.stringify(localUser));
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
          coins: 1000,
        },
      },
    });
    return { error: error?.message };
  },

  sendPasswordResetEmail: async (email: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { success: true };
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to send reset email' };
    }
  },

  verifyResetOtpAndSetPassword: async (email: string, otp: string, newPassword: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { success: true };
    }
    try {
      const { error: otpError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: 'recovery',
      });
      if (otpError) {
        return { success: false, error: otpError.message };
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) {
        return { success: false, error: updateError.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to reset password' };
    }
  },

  signOut: async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orbittune-user');
      localStorage.removeItem('orbittune-guest-user');
    }
    set({ user: null });
  },

  updateProfile: (updates: Partial<UserProfile>) => {
    const current = get().user;
    if (!current) return;
    const updated: UserProfile = { ...current, ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem('orbittune-user', JSON.stringify(updated));
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
          is_premium: updated.isPremium,
          coins: updated.coins,
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
    const current = get().user;
    if (!current) {
      return { success: false, error: 'Silakan masuk ke akun terlebih dahulu.' };
    }

    if (type === 'background' && itemId) {
      if (!current.isPremium) {
        return {
          success: false,
          error: 'Profile Backgrounds memerlukan status Hi-Fi Premium. Beli Premium Pass di Store dengan Orbit Coins.',
        };
      }
    }

    const updated: UserProfile = {
      ...current,
      ...(type === 'frame' ? { equippedFrame: itemId } : {}),
      ...(type === 'border' ? { equippedBorder: itemId } : {}),
      ...(type === 'background' ? { equippedBackground: itemId } : {}),
    };

    get().updateProfile(updated);
    return { success: true };
  },

  unlockCosmetic: (itemId: string) => {
    const current = get().user;
    if (!current) return;
    const currentUnlocked = current.unlockedCosmetics || [];
    if (!currentUnlocked.includes(itemId)) {
      get().updateProfile({
        unlockedCosmetics: [...currentUnlocked, itemId],
      });
    }
  },

  addCoins: (amount: number) => {
    const current = get().user;
    if (!current) return;
    const currentCoins = typeof current.coins === 'number' ? current.coins : 500;
    const newCoins = Math.max(0, currentCoins + amount);
    get().updateProfile({ coins: newCoins });
  },

  buyPremiumWithCoins: () => {
    const current = get().user;
    if (!current) {
      return { success: false, error: 'Silakan masuk ke akun untuk mengaktifkan Premium.' };
    }
    if (current.isPremium) {
      return { success: false, error: 'Kamu sudah memiliki status Hi-Fi Premium Aktif!' };
    }
    const PREMIUM_COST = 5000;
    const currentCoins = typeof current.coins === 'number' ? current.coins : 0;
    if (currentCoins < PREMIUM_COST) {
      return {
        success: false,
        error: `Koin tidak cukup! Butuh ${PREMIUM_COST.toLocaleString()} Orbit Coins (Koinmu saat ini: ${currentCoins.toLocaleString()}). Mainkan mini games Trivia & Guess the Song untuk mengumpulkan koin!`,
      };
    }

    get().updateProfile({
      coins: currentCoins - PREMIUM_COST,
      isPremium: true,
    });
    return { success: true };
  },

  togglePremium: () => {
    const current = get().user;
    if (!current) return;
    get().updateProfile({ isPremium: !current.isPremium });
  },
}));
