'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export default function Sidebar() {
  const pathname = usePathname();

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
    <aside className="w-56 lg:w-60 flex-shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border-subtle flex flex-col justify-between z-30 hidden md:flex select-none">
      <div className="flex flex-col flex-1 overflow-hidden p-4 space-y-6">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-2.5 px-2 pt-2 group">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-text-primary shadow-md shadow-[#D4AF37]/25 transition-transform group-hover:scale-105">
            <Disc className="w-5 h-5 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <span className="text-[15px] font-bold tracking-tight text-text-primary block leading-none">
              OrbitTune
            </span>
            <span className="text-[10px] text-text-muted tracking-wider font-semibold uppercase mt-1 block">
              Hi-Fi Stream
            </span>
          </div>
        </Link>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-2 mb-1.5 block">
            Discover
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-surface text-text-primary shadow-sm font-semibold border border-border-subtle'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-accent' : 'text-text-muted'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Collection Section */}
        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-2 mb-1.5 block">
            Collection
          </span>

          <Link
            href="/library?tab=favorites"
            className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface/60 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-rose-500/80 group-hover:text-rose-500 transition-colors" />
              <span>Liked Songs</span>
            </div>
            {likedCount > 0 && (
              <span className="text-[11px] text-text-muted group-hover:text-text-secondary font-mono">
                {likedCount}
              </span>
            )}
          </Link>

          <Link
            href="/library?tab=history"
            className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface/60 transition-colors group"
          >
            <History className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
            <span>Listening History</span>
          </Link>
        </div>

        {/* User Playlists */}
        <div className="flex flex-col flex-1 overflow-hidden pt-2 border-t border-border-subtle">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
              Playlists
            </span>
            <button
              onClick={() => setIsCreating((v) => !v)}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
              title="Create new playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isCreating && (
            <form onSubmit={handleCreatePlaylist} className="px-1 pb-2 space-y-1.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist name..."
                autoFocus
                className="w-full px-2.5 py-1.5 rounded-lg bg-sidebar border border-border-subtle text-text-primary text-[12px] focus:outline-none focus:border-accent"
              />
              <div className="flex gap-1.5">
                <button type="submit" className="px-2.5 py-1 rounded-lg bg-text-primary text-canvas text-[11px] font-semibold hover:opacity-90">
                  Save
                </button>
                <button type="button" onClick={() => { setIsCreating(false); setNewName(''); }} className="px-2.5 py-1 rounded-lg text-text-secondary text-[11px] hover:text-text-primary">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 ">
            {playlists && playlists.length > 0 ? (
              playlists.map((pl) => (
                <Link
                  key={pl.id}
                  href={`/library?tab=playlists`}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-text-secondary hover:text-text-primary hover:bg-surface/60 truncate transition-colors"
                >
                  <Music className="w-3 h-3 text-text-muted flex-shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </Link>
              ))
            ) : (
              <p className="text-[11px] text-text-muted px-2 py-1 italic">No playlists created</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info (klik untuk halaman Info) */}
      <Link
        href="/info"
        className="p-3 border-t border-border-subtle text-[11px] text-text-muted flex items-center justify-between hover:text-text-primary hover:bg-surface/40 transition-colors font-bold"
      >
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-accent" />
          <span>Info</span>
        </span>
        <span className="font-mono text-[10px]">v1.0</span>
      </Link>
    </aside>
  );
}
