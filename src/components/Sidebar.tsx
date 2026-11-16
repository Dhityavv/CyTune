'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Compass,
  Search,
  Library,
  Radio,
  Sparkles,
  BarChart2,
  Plus,
  Music,
  Disc,
  Gamepad2,
  Palette,
  Info,
  ListMusic,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

interface NavItemProps {
  href: string;
  active: boolean;
  icon: any;
  label: string;
  isExpanded: boolean;
  badge?: React.ReactNode;
  onNavigate?: () => void;
}

function NavItem({
  href,
  active,
  icon: Icon,
  label,
  isExpanded,
  badge,
  onNavigate,
}: NavItemProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      onClick={onNavigate}
      className={`group relative flex items-center ${
        isExpanded ? 'gap-3.5 px-3.5 py-2.5' : 'justify-center p-3'
      } rounded-xl text-[13px] font-medium transition-colors duration-150 active:scale-[0.98] ${
        active
          ? 'bg-surface border border-border-subtle text-text-primary font-semibold shadow-sm ring-1 ring-accent/25'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface/70 border border-transparent hover:border-border-subtle'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-accent" />
      )}
      <Icon
        className={`w-5 h-5 flex-shrink-0 transition-colors ${
          active ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'
        }`}
      />
      {isExpanded && <span className="flex-1 truncate tracking-tight">{label}</span>}
      {isExpanded && badge}

      {/* Floating Tooltip when collapsed */}
      {!isExpanded && (
        <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
          {label}
        </div>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePlaylistId = pathname === '/playlist' ? searchParams.get('id') : null;
  const activeLibraryTab = searchParams.get('tab') ?? 'playlists';

  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Expanded strictly when pointer is inside the sidebar or keyboard focus is active
  const isExpanded = isHovered || isFocused;

  const handlePointerEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    // 80ms gentle grace period to avoid micro-flicker at outer boundary
    leaveTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 80);
  };

  // When clicking a navigation link, immediately clear keyboard focus pin
  // so the sidebar collapses naturally when mouse leaves!
  const handleNavigate = () => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setIsFocused(false);
  };

  const playlists = useLiveQuery(() => db.playlists.toArray(), [], []);

  const primaryNav = [
    { label: 'Explore & Charts', href: '/', icon: Compass },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'My Library', href: '/library', icon: Library },
  ];

  const discoveryNav = [
    { label: 'Mini Games', href: '/games', icon: Gamepad2 },
    { label: 'Cosmetic Store', href: '/store', icon: Palette },
    { label: 'Listening Room', href: '/room', icon: Radio },
    { label: 'Find My Song', href: '/find-my-song', icon: Sparkles },
    { label: 'Listening Insights', href: '/insights', icon: BarChart2 },
  ];

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const id = 'pl_' + Date.now();
    await db.playlists.add({
      id,
      name: newName.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tracks: [],
    });
    setNewName('');
    setIsCreating(false);
  };

  return (
    /* Outer layout column: preserves permanent 80px space so page content NEVER shifts */
    <div className="relative shrink-0 w-20 h-screen hidden md:block z-40 select-none">
      {/* Interactive sidebar element: Pointer events are bound directly to aside
          so the hit-test area dynamically matches the full width (80px or 256px) */}
      <aside
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFocused(false);
          }
        }}
        className={`absolute top-0 left-0 h-full bg-sidebar/95 backdrop-blur-2xl border-r border-border-subtle flex flex-col justify-between transition-[width,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 ${
          isExpanded
            ? 'w-64 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-border-subtle'
            : 'w-20 shadow-lg'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-hidden px-3 py-4 space-y-5">
          {/* Brand Header */}
          <div className="flex items-center px-2 pt-1">
            <Link
              href="/"
              onClick={handleNavigate}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-[#101114] ring-1 ring-white/10 shadow-lg shadow-[#C9A94D]/25 transition-transform duration-200 group-hover:scale-105 shrink-0">
                <Disc className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
              </div>
              {isExpanded && (
                <div className="min-w-0 transition-opacity duration-150">
                  <span className="text-sm font-bold tracking-tight text-text-primary block leading-none">
                    OrbitTune
                  </span>
                  <span className="text-[9px] text-accent tracking-[0.16em] font-bold uppercase mt-1 block">
                    Hi-Fi Stream
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="flex-1 overflow-y-auto space-y-5 scrollbar-none pr-0.5">
            {/* Primary Nav */}
            <div className="space-y-1">
              {primaryNav.map((item) => {
                const active = pathname === item.href && (item.href !== '/library' || !activePlaylistId);
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    active={active}
                    icon={item.icon}
                    label={item.label}
                    isExpanded={isExpanded}
                    onNavigate={handleNavigate}
                  />
                );
              })}
            </div>

            {/* Discovery / Entertainment Section */}
            <div className="space-y-1 pt-2 border-t border-border-subtle">
              {isExpanded && (
                <span className="px-3 text-[10px] font-bold text-text-muted uppercase tracking-[0.14em] block pb-1">
                  Entertainment
                </span>
              )}
              {discoveryNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    active={active}
                    icon={item.icon}
                    label={item.label}
                    isExpanded={isExpanded}
                    onNavigate={handleNavigate}
                  />
                );
              })}
            </div>

            {/* Playlists Section (Exclusively for user playlists) */}
            <div className="space-y-1 pt-2 border-t border-border-subtle">
              {isExpanded ? (
                <>
                  <div className="flex items-center justify-between px-3 pb-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.14em]">
                      Playlists
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreating(!isCreating)}
                      aria-label="Create playlist"
                      className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isCreating && (
                    <form onSubmit={handleCreatePlaylist} className="px-1 py-1">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Playlist name..."
                        autoFocus
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-accent/40 text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
                      />
                    </form>
                  )}

                  <div className="space-y-0.5">
                    {playlists.length > 0 ? (
                      playlists.map((pl) => (
                        <Link
                          key={pl.id}
                          href={`/playlist?id=${pl.id}`}
                          onClick={handleNavigate}
                          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs transition-colors truncate ${
                            activePlaylistId === pl.id
                              ? 'bg-surface text-accent font-semibold'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                          }`}
                        >
                          <Music className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{pl.name}</span>
                        </Link>
                      ))
                    ) : (
                      <p className="px-3.5 py-2 text-[11px] text-text-muted italic">
                        No playlists yet
                      </p>
                    )}
                  </div>
                </>
              ) : (
                /* Collapsed Playlists Indicator */
                <NavItem
                  href="/library?tab=playlists"
                  active={pathname === '/library' && activeLibraryTab === 'playlists'}
                  icon={ListMusic}
                  label="Playlists"
                  isExpanded={false}
                  onNavigate={handleNavigate}
                />
              )}
            </div>
          </div>
        </div>

        {/* Restored Info & Support Button (Accessible in both Collapsed and Expanded states) */}
        <div className="p-2.5 border-t border-border-subtle bg-sidebar/80">
          <Link
            href="/info"
            onClick={handleNavigate}
            aria-label="About & Support"
            className={`group relative flex items-center ${
              isExpanded ? 'gap-3 px-3 py-2' : 'justify-center p-2.5'
            } rounded-xl text-xs font-medium transition-colors ${
              pathname === '/info'
                ? 'bg-surface border border-border-subtle text-accent font-semibold shadow-sm ring-1 ring-accent/25'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface/70 border border-transparent hover:border-border-subtle'
            }`}
          >
            <Info
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                pathname === '/info' ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'
              }`}
            />
            {isExpanded && (
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="truncate font-semibold">About & Support</span>
                <span className="text-[10px] text-text-muted font-mono">v3.0</span>
              </div>
            )}
            {!isExpanded && (
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-surface-elevated border border-border-subtle text-text-primary text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                About & Support
              </div>
            )}
          </Link>
        </div>
      </aside>
    </div>
  );
}
