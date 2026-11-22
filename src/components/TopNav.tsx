'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import { Search, Moon, Sun, Sparkles, User, LogOut, Palette, Settings, Gamepad2, ExternalLink, Info, Crown } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';

export default function TopNav() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const { user, signOut, initAuth } = useAuthStore();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const saved = localStorage.getItem('cytune-theme') || localStorage.getItem('orbittune-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
      document.documentElement.classList.toggle('light', saved === 'light');
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('cytune-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    document.documentElement.classList.toggle('light', next === 'light');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-canvas/80 backdrop-blur-xl border-b border-border-subtle px-4 sm:px-8 flex items-center justify-between gap-3 select-none">
      {/* Brand link for compact view */}
      <div className="flex items-center gap-3 shrink-0">
        <AppLink href="/" className="flex items-center gap-2 group md:hidden" aria-label="CyTune Home">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-[#101114] font-bold text-xs shadow-md shadow-[#C9A94D]/25">
            C
          </div>
          <span className="font-bold text-sm tracking-tight text-text-primary">CyTune</span>
        </AppLink>
      </div>

      {/* Global Omnibox Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-lg mx-2 sm:mx-4 relative group"
      >
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
        <input
          ref={searchInputRef}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, albums, artists, or lyrics..."
          className="w-full pl-10 pr-4 py-2 rounded-full bg-surface/90 border border-border-subtle text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-accent/70 focus:bg-surface focus:ring-1 focus:ring-accent/40 transition-all"
        />
      </form>

      {/* Right Utilities: Theme, Quick Links, Auth */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 rounded-full bg-surface hover:bg-surface-hover border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Coins indicator if logged in */}
        {user && (
          <AppLink
            href="/store"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 hover:bg-accent/25 border border-accent/30 text-accent text-xs font-mono font-bold transition-all shadow-sm"
            aria-label="Orbit Coins"
          >
            <span className="text-xs">🪙</span>
            <span>{(user.coins ?? 500).toLocaleString()}</span>
          </AppLink>
        )}

        {/* User Account / Profile Menu */}
        {user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-surface hover:bg-surface-hover border border-border-subtle text-xs font-semibold text-text-primary transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-[11px] overflow-hidden shrink-0">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                ) : (
                  user.display_name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="max-w-[110px] truncate hidden sm:inline font-medium">{user.display_name}</span>
              {user.isPremium && <Crown className="w-3 h-3 text-accent shrink-0" />}
            </button>

            {/* Expanded Account Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-sidebar border border-border-subtle shadow-2xl py-2 z-50 text-xs text-text-primary animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
              >
                {/* User info banner */}
                <div className="px-4 py-2.5 border-b border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-text-primary truncate">{user.display_name}</p>
                    {user.isPremium && <Crown className="w-3.5 h-3.5 text-accent shrink-0" />}
                  </div>
                  <p className="text-[11px] text-text-muted truncate mt-0.5">
                    {user.email || `@${user.username}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-accent/15 text-accent font-mono">
                      🪙 {(user.coins ?? 500).toLocaleString()} Coins
                    </span>
                    {user.isPremium && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-accent text-[#101114]">
                        Hi-Fi Premium
                      </span>
                    )}
                  </div>
                </div>

                {/* Navigation links */}
                <div className="py-1">
                  <AppLink
                    href="/profile"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-4 py-2 hover:bg-surface flex items-center gap-2.5 text-text-primary hover:text-accent transition-colors"
                  >
                    <User className="w-4 h-4 text-accent" />
                    <span>View Profile</span>
                  </AppLink>

                  <AppLink
                    href="/profile/edit"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-4 py-2 hover:bg-surface flex items-center gap-2.5 text-text-primary hover:text-accent transition-colors"
                  >
                    <Settings className="w-4 h-4 text-text-muted" />
                    <span>Edit Profile</span>
                  </AppLink>

                  <AppLink
                    href="/store"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-4 py-2 hover:bg-surface flex items-center gap-2.5 text-text-primary hover:text-accent transition-colors"
                  >
                    <Palette className="w-4 h-4 text-text-muted" />
                    <span>Cosmetic Store</span>
                  </AppLink>

                  <AppLink
                    href="/games"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-4 py-2 hover:bg-surface flex items-center gap-2.5 text-text-primary hover:text-accent transition-colors"
                  >
                    <Gamepad2 className="w-4 h-4 text-text-muted" />
                    <span>Mini Games</span>
                  </AppLink>

                  <AppLink
                    href="/info"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-4 py-2 hover:bg-surface flex items-center gap-2.5 text-text-primary hover:text-accent transition-colors"
                  >
                    <Info className="w-4 h-4 text-text-muted" />
                    <span>About & Support</span>
                  </AppLink>
                </div>

                {/* Sign out */}
                <div className="border-t border-border-subtle pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-surface flex items-center gap-2.5 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => useAuthModalStore.getState().open()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent hover:bg-accent-hover text-[#101114] text-xs font-bold shadow-md shadow-[#C9A94D]/20 transition-all active:scale-95 cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
