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
  Radio,
  HelpCircle,
  BarChart2,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

function NavRow({
  href,
  active,
  icon: Icon,
  label,
  collapsed,
  trailing,
}: {
  href: string;
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`group relative flex items-center ${collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2'} rounded-xl text-[13px] font-medium transition-all duration-200 hover:translate-x-0.5 active:scale-[0.98] ${
        active
          ? 'bg-surface border border-border-subtle text-text-primary font-semibold shadow-sm ring-1 ring-accent/20'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface/60 border border-transparent hover:border-border-subtle'
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
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && trailing}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activePlaylistId = pathname === '/playlist' ? searchParams.get('id') : null;
  const activeLibraryTab = searchParams.get('tab') ?? 'playlists';

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  // Persist sidebar state
  useEffect(() => {
    const saved = localStorage.getItem('orbittune-sidebar-collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('orbittune-sidebar-collapsed', String(next));
  };

  const likedCount = useLiveQuery(() => db.likedTracks.count(), [], 0);
  const playlists = useLiveQuery(() => db.playlists.toArray(), [], []);

  const primaryNav = [
    { label: 'Explore & Charts', href: '/', icon: Compass },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'My Library', href: '/library', icon: Library },
  ];

  const discoveryNav = [
    { label: 'Find My Song', href: '/find-my-song', icon: Sparkles },
    { label: 'Listening Room', href: '/room', icon: Radio },
    { label: 'Music Quiz', href: '/quiz', icon: HelpCircle },
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
    <aside
      className={`${
        isCollapsed ? 'w-18' : 'w-60'
      } flex-shrink-0 h-screen sticky top-0 bg-sidebar border-r border-border-subtle flex flex-col justify-between z-30 hidden md:flex select-none transition-all duration-200`}
    >
      <div className="flex flex-col flex-1 overflow-hidden px-3 py-4 space-y-5">
        {/* Brand Header + Collapse Button */}
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-[#101114] ring-1 ring-white/10 shadow-md shadow-[#C9A94D]/20 transition-transform duration-200 group-hover:scale-105 shrink-0">
              <Disc className="w-4 h-4 animate-[spin_12s_linear_infinite]" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-sm font-bold tracking-tight text-text-primary block leading-none">
                  OrbitTune
                </span>
                <span className="text-[8px] text-text-muted tracking-[0.18em] font-semibold uppercase mt-1 block">
                  Hi-Fi Stream
                </span>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-0.5" aria-label="Primary">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <NavRow
                key={item.href}
                href={item.href}
                active={isActive}
                icon={Icon}
                label={item.label}
                collapsed={isCollapsed}
              />
            );
          })}
        </nav>

        {/* Discovery & Social */}
        <nav className="space-y-0.5 pt-2 border-t border-border-subtle" aria-label="Discovery">
          {!isCollapsed && (
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em] px-2.5 mb-1.5 block">
              Discovery & Social
            </span>
          )}
          {discoveryNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <NavRow
                key={item.href}
                href={item.href}
                active={isActive}
                icon={Icon}
                label={item.label}
                collapsed={isCollapsed}
              />
            );
          })}
        </nav>

        {/* Collection Section */}
        <nav className="space-y-0.5 pt-2 border-t border-border-subtle" aria-label="Collection">
          {!isCollapsed && (
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em] px-2.5 mb-1.5 block">
              Collection
            </span>
          )}
          <NavRow
            href="/library?tab=favorites"
            active={pathname === '/library' && activeLibraryTab === 'favorites'}
            icon={Heart}
            label="Liked Songs"
            collapsed={isCollapsed}
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
            label="History"
            collapsed={isCollapsed}
          />
        </nav>

        {/* User Playlists (only in expanded mode) */}
        {!isCollapsed && (
          <div className="flex flex-col flex-1 overflow-hidden pt-2 border-t border-border-subtle">
            <div className="flex items-center justify-between px-2.5 mb-1.5">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em]">
                Playlists
              </span>
              <button
                type="button"
                onClick={() => setIsCreating((v) => !v)}
                aria-label="Create new playlist"
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface border border-transparent hover:border-border-subtle transition-colors"
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
                      href={`/playlist?id=${pl.id}`}
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
        )}
      </div>

      {/* Footer Info */}
      <Link
        href="/info"
        title="Info"
        className={`mx-2.5 mb-3 ${isCollapsed ? 'px-2 justify-center' : 'px-3 justify-between'} py-2 rounded-xl border border-border-subtle text-[11px] text-text-muted flex items-center hover:text-text-primary hover:bg-surface/60 transition-colors`}
      >
        <span className="flex items-center gap-1.5 font-semibold">
          <Info className="w-3.5 h-3.5 text-accent" />
          {!isCollapsed && <span>Info</span>}
        </span>
        {!isCollapsed && <span className="font-mono text-[10px]">v1.0</span>}
      </Link>
    </aside>
  );
}
