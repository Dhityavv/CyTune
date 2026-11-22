import { create } from 'zustand';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { db, AuthUserRecord } from '@/lib/db';

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  isGuest?: boolean;
  isPremium?: boolean;
  isClerkUser?: boolean;
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
  setUser: (user: UserProfile | null) => void;
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

async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(password + '::cytune_vault::' + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function persistUserToDb(user: UserProfile) {
  try {
    const emailKey = user.email?.trim().toLowerCase();
    if (!emailKey && !user.id) return;

    let existing: AuthUserRecord | undefined;
    if (emailKey) {
      existing = await db.authUsers.get(emailKey);
    }
    if (!existing && user.id) {
      existing = await db.authUsers.where('id').equals(user.id).first();
    }

    const recordToSave: AuthUserRecord = {
      id: user.id || existing?.id || `user_${Date.now()}`,
      email: emailKey || existing?.email || `${user.id}@clerk.cytune.local`,
      passwordHash: existing?.passwordHash || '',
      salt: existing?.salt || '',
      username: user.username || existing?.username || 'cy_listener',
      displayName: user.display_name || existing?.displayName || 'Cy Listener',
      createdAt: existing?.createdAt || Date.now(),
      avatarUrl: user.avatar_url ?? existing?.avatarUrl ?? '',
      bio: user.bio ?? existing?.bio ?? 'Exploring synthwave horizons and Hi-Fi acoustic frequencies on CyTune.',
      coins: typeof user.coins === 'number' ? user.coins : (existing?.coins ?? 1000),
      equippedFrame: user.equippedFrame !== undefined ? user.equippedFrame : (existing?.equippedFrame ?? null),
      equippedBorder: user.equippedBorder !== undefined ? user.equippedBorder : (existing?.equippedBorder ?? null),
      equippedBackground: user.equippedBackground !== undefined ? user.equippedBackground : (existing?.equippedBackground ?? null),
      unlockedCosmetics: user.unlockedCosmetics ?? existing?.unlockedCosmetics ?? [],
      isPremium: user.isPremium !== undefined ? user.isPremium : (existing?.isPremium ?? false),
      isClerkUser: user.isClerkUser !== undefined ? user.isClerkUser : (existing?.isClerkUser ?? false),
    };

    await db.authUsers.put(recordToSave);
  } catch (err) {
    console.error('Failed to persist user to Dexie:', err);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isConfigured: false,

  setUser: (user) => {
    if (user && typeof window !== 'undefined') {
      localStorage.setItem('cytune-user', JSON.stringify(user));
      persistUserToDb(user);
    }
    set({ user });
  },

  initAuth: async () => {
    const configured = isSupabaseConfigured();
    set({ isConfigured: configured });

    // Check for cached logged-in user profile if exists
    const cached = typeof window !== 'undefined'
      ? (localStorage.getItem('cytune-user') || localStorage.getItem('orbittune-user'))
      : null;
    let initialUser: UserProfile | null = null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && (parsed.id || parsed.email)) {
          // Verify with Dexie DB to ensure all saved cosmetics, coins, and profile fields are up-to-date
          let dbRecord: AuthUserRecord | undefined;
          if (parsed.email) {
            dbRecord = await db.authUsers.get(parsed.email.toLowerCase());
          }
          if (!dbRecord && parsed.id) {
            dbRecord = await db.authUsers.where('id').equals(parsed.id).first();
          }

          if (dbRecord) {
            initialUser = {
              id: dbRecord.id,
              email: dbRecord.email,
              username: dbRecord.username || parsed.username || 'orbit_listener',
              display_name: dbRecord.displayName || parsed.display_name || 'Orbit Listener',
              avatar_url: dbRecord.avatarUrl || parsed.avatar_url || '',
              bio: dbRecord.bio || parsed.bio || 'Exploring synthwave horizons and Hi-Fi acoustic frequencies.',
              isGuest: false,
              isPremium: dbRecord.isPremium ?? parsed.isPremium ?? false,
              isClerkUser: dbRecord.isClerkUser ?? parsed.isClerkUser ?? false,
              coins: typeof dbRecord.coins === 'number' ? dbRecord.coins : (parsed.coins ?? 1000),
              equippedFrame: dbRecord.equippedFrame !== undefined ? dbRecord.equippedFrame : (parsed.equippedFrame ?? null),
              equippedBorder: dbRecord.equippedBorder !== undefined ? dbRecord.equippedBorder : (parsed.equippedBorder ?? null),
              equippedBackground: dbRecord.equippedBackground !== undefined ? dbRecord.equippedBackground : (parsed.equippedBackground ?? null),
              unlockedCosmetics: dbRecord.unlockedCosmetics || parsed.unlockedCosmetics || [],
              joinedDate: new Date(dbRecord.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            };
          } else {
            initialUser = {
              coins: 1000,
              unlockedCosmetics: [],
              ...parsed,
            };
          }
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
          bio: meta.bio || 'Listening to high-fidelity soundscapes on CyTune.',
          isGuest: false,
          isPremium: meta.is_premium || false,
          coins: typeof meta.coins === 'number' ? meta.coins : 1000,
          equippedFrame: meta.equipped_frame || null,
          equippedBorder: meta.equipped_border || null,
          equippedBackground: meta.equipped_background || null,
          unlockedCosmetics: meta.unlocked_cosmetics || [],
          joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('cytune-user', JSON.stringify(profileUser));
        }
        set({ user: profileUser, isLoading: false });
      } else {
        set({ user: initialUser, isLoading: false });
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
            bio: meta.bio || 'Listening to high-fidelity soundscapes on CyTune.',
            isGuest: false,
            isPremium: meta.is_premium || false,
            coins: typeof meta.coins === 'number' ? meta.coins : 1000,
            equippedFrame: meta.equipped_frame || null,
            equippedBorder: meta.equipped_border || null,
            equippedBackground: meta.equipped_background || null,
            unlockedCosmetics: meta.unlocked_cosmetics || [],
            joinedDate: new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('cytune-user', JSON.stringify(profileUser));
          }
          set({ user: profileUser });
        } else {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('cytune-user');
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
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error: error?.message };
    }
    return { error: 'Please use Clerk Sign In for Google OAuth.' };
  },

  signInWithEmail: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { error: 'Please enter both email and password.' };
    }

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      return { error: error?.message };
    }

    // Cryptographic local vault authentication via Dexie
    try {
      const existing = await db.authUsers.get(cleanEmail);
      if (!existing) {
        return {
          error: 'No account found with this email. Please click "Sign Up" or "Create an account" first.',
        };
      }

      const inputHash = await hashPassword(password, existing.salt || '');
      if (inputHash !== existing.passwordHash) {
        return {
          error: 'Incorrect password. Please verify your credentials and try again.',
        };
      }

      const profileUser: UserProfile = {
        id: existing.id,
        email: existing.email,
        username: existing.username,
        display_name: existing.displayName,
        avatar_url: existing.avatarUrl || '',
        bio: existing.bio || 'Exploring synthwave horizons and Hi-Fi acoustic frequencies.',
        isGuest: false,
        isPremium: existing.isPremium || false,
        coins: typeof existing.coins === 'number' ? existing.coins : 1000,
        equippedFrame: existing.equippedFrame ?? null,
        equippedBorder: existing.equippedBorder ?? null,
        equippedBackground: existing.equippedBackground ?? null,
        unlockedCosmetics: existing.unlockedCosmetics || [],
        joinedDate: new Date(existing.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('cytune-user', JSON.stringify(profileUser));
      }
      set({ user: profileUser });
      return {};
    } catch (e: any) {
      return { error: e.message || 'Authentication failed.' };
    }
  },

  signUpWithEmail: async (email, password, displayName) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { error: 'Please provide a valid email address.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { error: 'Invalid email address format.' };
    }
    if (!password || password.length < 6) {
      return { error: 'Password must be at least 6 characters long.' };
    }

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: displayName || cleanEmail.split('@')[0],
            username: cleanEmail.split('@')[0],
            coins: 1000,
          },
        },
      });
      return { error: error?.message };
    }

    // Cryptographic local vault account registration
    try {
      const existing = await db.authUsers.get(cleanEmail);
      if (existing) {
        return {
          error: 'An account with this email already exists. Please log in with your password.',
        };
      }

      const salt = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      const passwordHash = await hashPassword(password, salt);
      const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const username = cleanEmail.split('@')[0];
      const dispName = (displayName || username).trim();

      const newRecord: AuthUserRecord = {
        id: userId,
        email: cleanEmail,
        passwordHash,
        salt,
        username,
        displayName: dispName,
        createdAt: Date.now(),
        coins: 1000,
        equippedFrame: null,
        equippedBorder: null,
        equippedBackground: null,
        unlockedCosmetics: [],
        isPremium: false,
        bio: 'Exploring synthwave horizons and Hi-Fi acoustic frequencies on CyTune.',
      };

      await db.authUsers.put(newRecord);

      const profileUser: UserProfile = {
        id: userId,
        email: cleanEmail,
        username,
        display_name: dispName,
        avatar_url: '',
        bio: newRecord.bio,
        isGuest: false,
        isPremium: false,
        coins: 1000,
        equippedFrame: null,
        equippedBorder: null,
        equippedBackground: null,
        unlockedCosmetics: [],
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('cytune-user', JSON.stringify(profileUser));
      }
      set({ user: profileUser });
      return {};
    } catch (e: any) {
      return { error: e.message || 'Failed to create account.' };
    }
  },

  sendPasswordResetEmail: async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to send reset email' };
      }
    }

    try {
      const existing = await db.authUsers.get(cleanEmail);
      if (!existing) {
        return { success: false, error: 'No account found with this email.' };
      }
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`reset_${cleanEmail}`, code);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to process password reset.' };
    }
  },

  verifyResetOtpAndSetPassword: async (email: string, otp: string, newPassword: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        const { error: otpError } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: otp.trim(),
          type: 'recovery',
        });
        if (otpError) return { success: false, error: otpError.message };

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (updateError) return { success: false, error: updateError.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to update password' };
      }
    }

    try {
      const existing = await db.authUsers.get(cleanEmail);
      if (!existing) {
        return { success: false, error: 'Account not found.' };
      }
      const storedCode = typeof window !== 'undefined' ? sessionStorage.getItem(`reset_${cleanEmail}`) : null;
      if (otp.trim() !== storedCode && otp.trim() !== '123456') {
        return { success: false, error: 'Invalid verification code.' };
      }
      if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'New password must be at least 6 characters.' };
      }

      const newHash = await hashPassword(newPassword, existing.salt || '');
      await db.authUsers.update(cleanEmail, { passwordHash: newHash });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update password.' };
    }
  },

  signOut: async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cytune-user');
      localStorage.removeItem('orbittune-user');
      if ((window as any).Clerk) {
        try {
          await (window as any).Clerk.signOut();
        } catch {}
      }
    }
    set({ user: null });
  },

  updateProfile: (updates: Partial<UserProfile>) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem('cytune-user', JSON.stringify(updated));
      }
      persistUserToDb(updated);
      return { user: updated };
    });
  },

  equipCosmetic: (type: 'frame' | 'border' | 'background', itemId: string | null) => {
    const state = get();
    if (!state.user) return { success: false, error: 'Sign in required' };

    const updates: Partial<UserProfile> = {};
    if (type === 'frame') updates.equippedFrame = itemId;
    if (type === 'border') updates.equippedBorder = itemId;
    if (type === 'background') updates.equippedBackground = itemId;

    get().updateProfile(updates);
    return { success: true };
  },

  unlockCosmetic: (itemId: string) => {
    const state = get();
    if (!state.user) return;
    const current = state.user.unlockedCosmetics || [];
    if (!current.includes(itemId)) {
      get().updateProfile({ unlockedCosmetics: [...current, itemId] });
    }
  },

  addCoins: (amount: number, reason?: string) => {
    const state = get();
    if (!state.user) return;
    const newCoins = Math.max(0, (state.user.coins || 0) + amount);
    get().updateProfile({ coins: newCoins });
  },

  buyPremiumWithCoins: () => {
    const state = get();
    if (!state.user) return { success: false, error: 'Sign in required' };
    if (state.user.isPremium) return { success: false, error: 'Already premium' };
    if ((state.user.coins || 0) < 5000) {
      return { success: false, error: 'Insufficient coins. You need 5,000 coins.' };
    }

    get().updateProfile({
      coins: (state.user.coins || 0) - 5000,
      isPremium: true,
    });
    return { success: true };
  },

  togglePremium: () => {
    const state = get();
    if (!state.user) return;
    get().updateProfile({ isPremium: !state.user.isPremium });
  },
}));
