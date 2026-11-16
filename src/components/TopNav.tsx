'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Search, Moon, Sun, Sparkles, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import AuthModal from '@/components/AuthModal';

export default function TopNav() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const { user, signOut, initAuth } = useAuthStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const saved = localStorage.getItem('orbittune-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
      document.documentElement.classList.toggle('light', saved === 'light');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('orbittune-theme', next);
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
      {/* 1. History Nav Controls (Desktop) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className="w-8 h-8 rounded-full bg-surface hover:bg-surface-hover border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => router.forward()}
          aria-label="Go forward"
          className="w-8 h-8 rounded-full bg-surface hover:bg-surface-hover border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Global Omnibox Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-md mx-2 sm:mx-4 relative group"
      >
        <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-accent transition-colors" />
        <input
          ref={searchInputRef}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search songs, albums, artists, or lyrics..."
          className="w-full pl-10 pr-4 py-1.5 rounded-full bg-surface/90 border border-border-subtle text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-accent/70 focus:bg-surface focus:ring-1 focus:ring-accent/40 transition-all"
        />
      </form>

      {/* 3. Right Utilities: Theme, Quick Links, Auth */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 rounded-full bg-surface hover:bg-surface-hover border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Account / Profile Button */}
        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-surface hover:bg-surface-hover border border-border-subtle text-xs font-semibold text-text-primary transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-[11px] overflow-hidden">
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
                ) : (
                  user.display_name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="max-w-[100px] truncate hidden sm:inline">{user.display_name}</span>
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-sidebar border border-border-subtle shadow-2xl py-2 z-50 text-xs text-text-primary animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-border-subtle">
                  <p className="font-bold truncate">{user.display_name}</p>
                  <p className="text-[11px] text-text-muted truncate">{user.email || `@${user.username}`}</p>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full px-3.5 py-2 text-left hover:bg-surface flex items-center gap-2 text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent hover:bg-accent-hover text-[#101114] text-xs font-bold shadow-md shadow-[#C9A94D]/20 transition-all active:scale-95"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </header>
  );
}
