'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Compass,
  Search,
  Library,
  Heart,
  History,
  Disc,
  Plus,
  Music,
  Info,
} from 'lucide-react';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

function NavRow({
  href,
  active,
  icon: Icon,
  label,
  trailing,
}: {
  href: string;
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  trailing?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
        active
          ? 'bg-surface border border-border-subtle text-text-primary font-semibold shadow-sm'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface/60 border border-transparent'
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-accent" />
      )}
      <Icon
        className={`w-4 h-4 flex-shrink-0 transition-colors ${
          active ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
        }`}
      />
      <span className="flex-1 truncate">{label}</span>
      {trailing}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePlaylistId = searchParams.get('pl');
  const activeLibraryTab = searchParams.get('tab') ?? 'playlists';

  const likedCount = useLiveQuery(() => db.likedTracks.count(), [], 0);
  const playlists = useLiveQuery(() => db.playlists.toArray(), [], []);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const navItems = [
    { label: 'Explore & Charts', href: '/', icon: Compass },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'My Library', href: '/library', icon: Library },
  ];

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await db.playlists.add({
      id: 'pl_' + Date.now(),
      name: newName.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tracks: [],
    });
    setNewName('');
    setIsCreating(false);
  };

  return (
    <aside className="w-60 flex-shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border-subtle flex flex-col justify-between z-30 hidden md:flex select-none">
      <div className="flex flex-col flex-1 overflow-hidden px-3.5 py-5 space-y-7">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-1 group">
          <div className="w-9 h-9 rounded-[10px] bg-accent flex items-center justify-center text-[#101114] ring-1 ring-white/10 shadow-md shadow-[#C9A94D]/20 transition-transform duration-200 group-hover:scale-105">
            <Disc className="w-[18px] h-[18px] animate-[spin_12s_linear_infinite]" />
          </div>
          <div className="min-w-0">
            <span className="text-[15px] font-bold tracking-tight text-text-primary block leading-none">
              OrbitTune
            </span>
            <span className="text-[9px] text-text-muted tracking-[0.18em] font-semibold uppercase mt-1.5 block">
              Hi-Fi Stream
            </span>
          </div>
        </Link>

        {/* Primary Navigation */}
        <nav className="space-y-1" aria-label="Discover">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em] px-2.5 mb-2 block">
            Discover
          </span>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <NavRow
                  key={item.href}
                  href={item.href}
                  active={isActive}
                  icon={Icon}
                  label={item.label}
                />
              );
            })}
          </div>
        </nav>

        {/* Collection Section */}
        <nav className="space-y-1" aria-label="Collection">
          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em] px-2.5 mb-2 block">
            Collection
          </span>
          <div className="space-y-0.5">
            <NavRow
              href="/library?tab=favorites"
              active={pathname === '/library' && activeLibraryTab === 'favorites'}
              icon={Heart}
              label="Liked Songs"
              trailing={
                likedCount > 0 ? (
                  <span className="text-[10px] font-mono text-text-muted bg-surface border border-border-subtle rounded-md px-1.5 py-0.5 group-hover:text-text-secondary">
                    {likedCount}
                  </span>
                ) : undefined
              }
            />
            <NavRow
              href="/library?tab=history"
              active={pathname === '/library' && activeLibraryTab === 'history'}
              icon={History}
              label="Listening History"
            />
          </div>
        </nav>

        {/* User Playlists */}
        <div className="flex flex-col flex-1 overflow-hidden pt-4 border-t border-border-subtle">
          <div className="flex items-center justify-between px-2.5 mb-2">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em]">
              Playlists
            </span>
            <button
              onClick={() => setIsCreating((v) => !v)}
              aria-label="Create new playlist"
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-subtle transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isCreating && (
            <form onSubmit={handleCreatePlaylist} className="px-1.5 pb-2.5 space-y-1.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist name…"
                autoFocus
                className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border-subtle text-text-primary text-[12px] placeholder:text-text-muted focus:outline-none focus:border-accent/60 transition-colors"
              />
              <div className="flex gap-1.5">
                <button type="submit" className="px-2.5 py-1 rounded-lg bg-accent text-[#101114] text-[11px] font-semibold hover:bg-accent-hover transition-colors">
                  Save
                </button>
                <button type="button" onClick={() => { setIsCreating(false); setNewName(''); }} className="px-2.5 py-1 rounded-lg text-text-secondary text-[11px] hover:text-text-primary hover:bg-surface transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5">
            {playlists && playlists.length > 0 ? (
              playlists.map((pl) => {
                const isActive = activePlaylistId === pl.id;
                return (
                  <Link
                    key={pl.id}
                    href={`/library?tab=playlists&pl=${pl.id}`}
                    className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] truncate transition-colors ${
                      isActive
                        ? 'bg-surface text-text-primary font-medium'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface/60'
                    }`}
                  >
                    <Music className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-accent' : 'text-text-muted'}`} />
                    <span className="truncate">{pl.name}</span>
                  </Link>
                );
              })
            ) : (
              <p className="text-[11px] text-text-muted px-2.5 py-1 italic">No playlists yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info (klik untuk halaman Info) */}
      <Link
        href="/info"
        className="mx-3 mb-3 px-3 py-2.5 rounded-xl border border-border-subtle text-[11px] text-text-muted flex items-center justify-between hover:text-text-primary hover:bg-surface/60 transition-colors"
      >
        <span className="flex items-center gap-1.5 font-semibold">
          <Info className="w-3.5 h-3.5 text-accent" />
          <span>Info</span>
        </span>
        <span className="font-mono text-[10px]">v1.0</span>
      </Link>
    </aside>
  );
}
