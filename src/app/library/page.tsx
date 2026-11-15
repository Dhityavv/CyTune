'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, ListMusic, History, Play, Shuffle, Plus, Trash2, Music, Download, Upload } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { usePlayerStore } from '@/store/usePlayerStore';
import TrackRow, { TrackTableHeader } from '@/components/TrackRow';
import { Track } from '@/types/music';

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
  const tabParam = searchParams.get('tab');
  const validTab = (tabParam === 'favorites' || tabParam === 'playlists' || tabParam === 'history') ? tabParam : null;

  const [selectedTab, setSelectedTab] = useState<'favorites' | 'playlists' | 'history'>('favorites');
  const activeTab = validTab || selectedTab;
  const setActiveTab = setSelectedTab;

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [viewingPlaylistId, setViewingPlaylistId] = useState<string | null>(null);

  const playTrack = usePlayerStore((s) => s.playTrack);

  const favorites = useLiveQuery(async () => {
    return await db.likedTracks.orderBy('likedAt').reverse().toArray();
  }, []);

  const history = useLiveQuery(async () => {
    const raw = await db.history.orderBy('playedAt').reverse().toArray();
    const seen = new Set<string>();
    return raw.filter((h) => {
      if (seen.has(h.trackId)) return false;
      seen.add(h.trackId);
      return true;
    }).slice(0, 50);
  }, []);

  const playlists = useLiveQuery(async () => {
    return await db.playlists.orderBy('updatedAt').reverse().toArray();
  }, []);

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
    if (!newPlaylistName.trim()) return;

    await db.playlists.add({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pl_${Date.now()}`,
      name: newPlaylistName.trim(),
      description: 'Custom playlist',
      tracks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setNewPlaylistName('');
    setIsCreatingPlaylist(false);
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
    a.download = `orbittune-playlists-${Date.now()}.csv`;
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
        <div className="flex items-center gap-1.5 bg-surface p-1.5 rounded-2xl border border-border-subtle self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'favorites'
                ? 'bg-text-primary text-canvas shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Liked Songs ({favorites?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'playlists'
                ? 'bg-text-primary text-canvas shadow-md'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Playlists ({playlists?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-text-primary text-canvas shadow-md'
                : 'text-text-secondary hover:text-text-primary'
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

                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-[#A3925C] to-[#C9A94D] flex items-center justify-center text-text-primary shadow-xl shadow-[#6E5A20]/40 flex-shrink-0 z-10">
                  <Heart className="w-12 h-12 fill-white" />
                </div>

                <div className="space-y-3 min-w-0 z-10">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
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
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-text-primary text-canvas hover:opacity-90 font-semibold text-xs shadow-md active:scale-95 transition-all"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>Play All</span>
                    </button>
                    <button
                      onClick={() => handlePlayAll(favorites, true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-hover hover:bg-surface-active text-text-primary border border-border-subtle font-medium text-xs active:scale-95 transition-all"
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
              <Link
                href="/search"
                className="inline-block px-5 py-2.5 rounded-full bg-text-primary text-canvas text-xs font-semibold hover:opacity-90 transition-colors shadow-md"
              >
                Find Songs
              </Link>
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-text-primary text-xs font-semibold transition-all shadow-md shadow-[#D4AF37]/20"
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name..."
                  autoFocus
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-sidebar border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-text-primary text-canvas font-semibold text-xs hover:opacity-90 shadow-sm"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {playlists && playlists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setViewingPlaylistId(pl.id)}
                  className="group relative p-3.5 rounded-2xl bg-surface/60 hover:bg-surface-hover border border-border-subtle hover:border-border-hover transition-all cursor-pointer flex flex-col shadow-md hover:shadow-xl hover:shadow-black/50"
                >
                  <div className="aspect-square rounded-xl bg-sidebar flex items-center justify-center mb-3 shadow-sm group-hover:scale-[1.02] transition-transform">
                    <Music className="w-8 h-8 text-text-muted group-hover:text-accent transition-colors" />
                  </div>

                  <h3 className="font-semibold text-text-primary text-[13px] truncate">{pl.name}</h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">{pl.tracks.length} songs</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(pl.id, pl.name);
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/70 text-text-primary opacity-0 group-hover:opacity-100 hover:bg-red-600/80 transition-all"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-text-muted mx-auto border border-border-subtle">
                <ListMusic className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-primary">No custom playlists</h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto">
                Create a playlist to organize your favorite tracks your own way.
              </p>
              <button
                onClick={() => setIsCreatingPlaylist(true)}
                className="px-5 py-2.5 rounded-full bg-text-primary text-canvas text-xs font-semibold hover:opacity-90 transition-colors shadow-md"
              >
                Create Your First Playlist
              </button>
            </div>
          )}

          {/* Playlist detail view */}
          {viewingPlaylistId && (() => {
            const pl = (playlists || []).find((p) => p.id === viewingPlaylistId);
            if (!pl) return null;
            const handleRemove = async (trackId: string) => {
              await db.playlists.update(pl.id, {
                tracks: pl.tracks.filter((t) => t.id !== trackId),
                updatedAt: Date.now(),
              });
            };
            return (
              <div className="space-y-4 mt-6 p-5 rounded-2xl bg-surface border border-border-subtle">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{pl.name}</h3>
                    <p className="text-xs text-text-secondary">{pl.tracks.length} songs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pl.tracks.length > 0 && (
                      <button
                        onClick={() => handlePlayAll(pl.tracks, false)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-text-primary text-canvas text-xs font-semibold hover:opacity-90 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Play All
                      </button>
                    )}
                    <button
                      onClick={() => setViewingPlaylistId(null)}
                      className="px-3 py-2 rounded-xl bg-surface-hover text-text-primary text-xs font-semibold hover:bg-surface-active transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
                {pl.tracks.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-8">No songs yet. Add via the + button on any track.</p>
                ) : (
                  <div className="bg-surface/40 p-3 rounded-2xl border border-border-subtle">
                    <TrackTableHeader />
                    <div className="space-y-1">
                      {pl.tracks.map((track, idx) => (
                        <div key={track.id + idx} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <TrackRow track={track} index={idx} />
                          </div>
                          <button
                            onClick={() => handleRemove(track.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-red-400 transition-colors"
                            title="Remove from playlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 4. Tab: Listening History */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-base font-bold text-text-primary">Playback History</h2>
            {history && history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-text-secondary hover:text-red-400 hover:bg-surface transition-colors"
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
