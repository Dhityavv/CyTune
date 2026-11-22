'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppLink from '@/components/AppLink';
import { Heart, ListMusic, History, Play, Shuffle, Plus, Trash2, Music, Download, Upload } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { usePlayerStore } from '@/store/usePlayerStore';
import TrackRow, { TrackTableHeader } from '@/components/TrackRow';
import CoverImage from '@/components/CoverImage';
import { Track } from '@/types/music';
import { clickable } from '@/lib/a11y';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const mins = Math.floor(diffMs / (60 * 1000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');
  const validTab = (tabParam === 'favorites' || tabParam === 'playlists' || tabParam === 'history') ? tabParam : null;

  const [selectedTab, setSelectedTab] = useState<'favorites' | 'playlists' | 'history'>('favorites');
  const activeTab = validTab || selectedTab;
  const setActiveTab = (tab: 'favorites' | 'playlists' | 'history') => {
    setSelectedTab(tab);
    router.replace(`/library?tab=${tab}`, { scroll: false });
  };

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  // Deep-link compatibility: /library?pl=<id> now opens the dedicated playlist page.
  const playlistParam = searchParams.get('pl');
  useEffect(() => {
    if (playlistParam) router.replace(`/playlist?id=${playlistParam}`);
  }, [playlistParam, router]);

  const user = useAuthStore((s) => s.user);
  const playTrack = usePlayerStore((s) => s.playTrack);

  const favorites = useLiveQuery(async () => {
    const all = await db.likedTracks.orderBy('likedAt').reverse().toArray();
    if (!user) {
      return all.filter((t) => !t.userId || t.userId === 'guest');
    }
    return all.filter((t) => !t.userId || t.userId === user.id || t.userId === 'guest');
  }, [user?.id]);

  const history = useLiveQuery(async () => {
    const raw = await db.history.orderBy('playedAt').reverse().toArray();
    const activeUserId = user?.id || 'guest';
    const filtered = raw.filter((h) => !h.userId || h.userId === activeUserId);
    const seen = new Set<string>();
    return filtered.filter((h) => {
      if (seen.has(h.trackId)) return false;
      seen.add(h.trackId);
      return true;
    }).slice(0, 50);
  }, [user?.id]);

  const playlists = useLiveQuery(async () => {
    const all = await db.playlists.orderBy('updatedAt').reverse().toArray();
    if (!user) {
      return all.filter((p) => !p.userId || p.userId === 'guest');
    }
    return all.filter((p) => !p.userId || p.userId === user.id || p.userId === 'guest');
  }, [user?.id]);

  const handlePlayAll = (tracks: Track[], shuffle: boolean = false) => {
    if (!tracks || tracks.length === 0) return;
    if (shuffle) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPlaylistName.trim();
    if (!name) {
      setCreateError('Enter a playlist name.');
      return;
    }
    const duplicate = (playlists ?? []).find((p) => p.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) {
      setCreateError(`A playlist named “${duplicate.name}” already exists.`);
      return;
    }

    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pl_${Date.now()}`;
    await db.playlists.add({
      id,
      name,
      description: newPlaylistDescription.trim(),
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: user?.id || 'guest',
    });

    setNewPlaylistName('');
    setNewPlaylistDescription('');
    setCreateError('');
    setIsCreatingPlaylist(false);
    router.push(`/playlist?id=${id}`);
  };

  const handleDeletePlaylist = async (id: string, name: string) => {
    if (confirm(`Delete playlist "${name}"?`)) {
      await db.playlists.delete(id);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear your listening history?')) {
      await db.history.clear();
    }
  };

  // ---- CSV Import / Export for playlists ----
  const handleExportCsv = async () => {
    const all = await db.playlists.toArray();
    if (!all.length) {
      alert('No playlists to export.');
      return;
    }
    const esc = (v: string) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows: string[] = ['playlist,trackId,title,artist,album,duration,thumbnail'];
    for (const pl of all) {
      for (const t of pl.tracks || []) {
        rows.push(
          [esc(pl.name), esc(t.id), esc(t.title), esc(t.artist), esc(t.album || ''), t.duration || 0, esc(t.thumbnail || '')].join(',')
        );
      }
      if (!pl.tracks || pl.tracks.length === 0) {
        rows.push([esc(pl.name), '', '', '', '', 0, ''].join(','));
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cytune-playlists-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = async (file: File) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      alert('CSV is empty or invalid.');
      return;
    }
    // simple CSV parse (quoted fields)
    const parseLine = (line: string): string[] => {
      const out: string[] = [];
      let cur = '';
      let inQ = false;
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (inQ) {
          if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
          else if (c === '"') { inQ = false; }
          else { cur += c; }
        } else {
          if (c === '"') { inQ = true; }
          else if (c === ',') { out.push(cur); cur = ''; }
          else { cur += c; }
        }
      }
      out.push(cur);
      return out;
    };
    const header = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
    const idx = (name: string) => header.indexOf(name);
    const groups: Record<string, Track[]> = {};
    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      const plName = cols[idx('playlist')]?.trim();
      if (!plName) continue;
      const title = cols[idx('title')]?.trim();
      if (!title) {
        if (!groups[plName]) groups[plName] = [];
        continue;
      }
      const track: Track = {
        id: cols[idx('trackid')]?.trim() || `imp_${Date.now()}_${i}`,
        title,
        artist: cols[idx('artist')]?.trim() || 'Unknown',
        album: cols[idx('album')]?.trim() || '',
        duration: Number(cols[idx('duration')]) || 0,
        thumbnail: cols[idx('thumbnail')]?.trim() || '',
      };
      if (!groups[plName]) groups[plName] = [];
      groups[plName].push(track);
    }
    let count = 0;
    for (const [name, tracks] of Object.entries(groups)) {
      await db.playlists.add({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pl_${Date.now()}_${count}`,
        name,
        description: 'Imported from CSV',
        tracks,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      count++;
    }
    alert(`Imported ${count} playlist(s).`);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleImportCsv(f);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      {/* 1. Library Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            My Library
          </h1>
          <p className="text-[13px] text-text-secondary mt-0.5">
            Personal collection, liked songs, custom playlists, and offline playback history.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-2xl border border-border-subtle self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'favorites'
                ? 'bg-accent text-[#101114] shadow-md shadow-[#C9A94D]/25'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Liked Songs ({favorites?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'playlists'
                ? 'bg-accent text-[#101114] shadow-md shadow-[#C9A94D]/25'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Playlists ({playlists?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-accent text-[#101114] shadow-md shadow-[#C9A94D]/25'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* 2. Tab: Liked Songs */}
      {activeTab === 'favorites' && (
        <div className="space-y-6">
          {favorites && favorites.length > 0 ? (
            <>
              {/* Liked Songs Editorial Spotlight Banner */}
              <div className="relative rounded-2xl overflow-hidden bg-surface/70 border border-border-subtle p-6 sm:p-8 flex items-center gap-6 shadow-2xl">
                <div
                  className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
                />

                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#B08B3E] to-[#C9A94D] flex items-center justify-center text-[#101114] shadow-xl shadow-[#6E5A20]/40 ring-1 ring-white/10 flex-shrink-0 z-10">
                  <Heart className="w-12 h-12 fill-current" />
                </div>

                <div className="space-y-3 min-w-0 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
                    Auto Playlist
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                    Liked Songs
                  </h2>
                  <p className="text-xs text-text-secondary">
                    {favorites.length} tracks saved locally on this device.
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => handlePlayAll(favorites, false)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-lg shadow-[#C9A94D]/25 active:scale-95 transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play All</span>
                    </button>
                    <button
                      onClick={() => handlePlayAll(favorites, true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle hover:border-border-hover font-medium text-xs active:scale-95 transition-all"
                    >
                      <Shuffle className="w-3.5 h-3.5 text-accent" />
                      <span>Shuffle</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tracks List */}
              <div className="bg-surface/40 p-3 rounded-2xl border border-border-subtle shadow-sm">
                <TrackTableHeader />
                <div className="space-y-1">
                  {favorites.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-text-muted mx-auto border border-border-subtle">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary">No liked songs yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Tap the heart icon on any song while listening to add it to your favorite collection.
              </p>
              <AppLink
                href="/search"
                className="inline-block px-5 py-2.5 rounded-full bg-accent text-[#101114] text-xs font-bold hover:bg-accent-hover transition-colors shadow-md shadow-[#C9A94D]/20"
              >
                Find Songs
              </AppLink>
            </div>
          )}
        </div>
      )}

      {/* 3. Tab: Custom Playlists */}
      {activeTab === 'playlists' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold text-text-primary">Your Playlists</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text-primary text-xs font-semibold border border-border-subtle transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text-primary text-xs font-semibold border border-border-subtle transition-all cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import CSV</span>
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleImportFileChange} />
              </label>
              <button
                onClick={() => setIsCreatingPlaylist(!isCreatingPlaylist)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-[#101114] text-xs font-bold transition-all shadow-md shadow-[#C9A94D]/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Playlist</span>
              </button>
            </div>
          </div>

          {/* Inline Create Form */}
          {isCreatingPlaylist && (
            <form onSubmit={handleCreatePlaylist} className="p-4 rounded-2xl bg-surface border border-border-subtle max-w-md space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                New Playlist
              </h3>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => {
                  setNewPlaylistName(e.target.value);
                  setCreateError('');
                }}
                placeholder="Playlist name..."
                autoFocus
                aria-label="Playlist name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-sidebar border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                placeholder="Description (optional)"
                aria-label="Playlist description"
                className="w-full px-3.5 py-2.5 rounded-xl bg-sidebar border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
              />
              {createError && (
                <p role="alert" className="text-[11px] text-red-400">
                  {createError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-accent text-[#101114] font-semibold text-xs hover:bg-accent-hover transition-colors"
                >
                  Create Playlist
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingPlaylist(false);
                    setNewPlaylistName('');
                    setNewPlaylistDescription('');
                    setCreateError('');
                  }}
                  className="px-4 py-2 rounded-xl bg-surface-hover text-text-primary text-xs font-semibold hover:bg-surface-active transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {playlists && playlists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => router.push(`/playlist?id=${pl.id}`)}
                  {...clickable(() => router.push(`/playlist?id=${pl.id}`))}
                  className="group relative p-3.5 rounded-2xl bg-surface/60 hover:bg-surface-hover border border-border-subtle hover:border-border-hover transition-all cursor-pointer flex flex-col shadow-md hover:shadow-xl hover:shadow-black/50"
                >
                  <div className="relative aspect-square rounded-xl bg-sidebar overflow-hidden flex items-center justify-center mb-3 shadow-sm ring-1 ring-border-subtle">
                    {pl.tracks[0]?.thumbnail ? (
                      <CoverImage
                        src={pl.tracks[0].thumbnail}
                        alt={pl.name}
                        size="lg"
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                      />
                    ) : (
                      <Music className="w-8 h-8 text-text-muted group-hover:text-accent transition-colors" />
                    )}
                    {pl.tracks.length > 0 && (
                      <div className="absolute inset-0 bg-canvas/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="w-10 h-10 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-lg shadow-[#C9A94D]/30">
                          <Play className="w-4 h-4 fill-current translate-x-0.5" />
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-text-primary text-[13px] truncate">{pl.name}</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">{pl.tracks.length} songs</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(pl.id, pl.name);
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-canvas/70 backdrop-blur-md border border-border-subtle text-text-primary opacity-0 group-hover:opacity-100 hover:bg-red-600/80 transition-all"
                    aria-label={`Delete playlist ${pl.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center text-text-muted mx-auto">
                <ListMusic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary">No custom playlists</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Create a playlist to organize your favorite tracks your own way.
              </p>
              <button
                onClick={() => setIsCreatingPlaylist(true)}
                className="px-5 py-2.5 rounded-full bg-accent text-[#101114] text-xs font-bold hover:bg-accent-hover transition-colors shadow-md shadow-[#C9A94D]/20"
              >
                Create Your First Playlist
              </button>
            </div>
          )}

        </div>
      )}

      {/* 4. Tab: Listening History */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-base font-bold text-text-primary flex items-baseline gap-2.5">
              Playback History
              {history && history.length > 0 && (
                <span className="text-[11px] font-mono text-text-muted">{history.length}</span>
              )}
            </h2>
            {history && history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-red-400 hover:bg-surface border border-border-subtle hover:border-red-400/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history && history.length > 0 ? (
            <div className="bg-surface/40 p-3 rounded-2xl border border-border-subtle shadow-sm">
              <TrackTableHeader />
              <div className="space-y-1">
                {history.map((item, idx) => (
                  <div key={`hist-${item.id}-${idx}`} className="relative group">
                    <TrackRow
                      track={item.track}
                      index={idx}
                      queueContext={history.map((h) => h.track)}
                    />
                    {item.playedAt && (
                      <span className="hidden lg:block absolute right-24 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted pointer-events-none">
                        {formatRelativeTime(item.playedAt)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-text-muted mx-auto border border-border-subtle">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary">No listening history yet</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Songs you stream will automatically appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-text-secondary text-xs">Loading library...</div>}>
      <LibraryContent />
    </Suspense>
  );
}
