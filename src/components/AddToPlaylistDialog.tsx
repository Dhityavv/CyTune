'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ListMusic, Plus, Search, X } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Track } from '@/types/music';
import CoverImage from '@/components/CoverImage';
import { usePlaylistDialogStore } from '@/store/usePlaylistDialog';

export default function AddToPlaylistDialog() {
  const track = usePlaylistDialogStore((s) => s.track);
  const close = usePlaylistDialogStore((s) => s.close);

  if (!track) return null;
  // Keyed by song id so each song opens with clean, freshly initialised state.
  return <DialogBody key={track.id} track={track} close={close} />;
}

function DialogBody({ track, close }: { track: Track; close: () => void }) {
  const playlists = useLiveQuery(() => db.playlists.orderBy('name').toArray(), [], []);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const filtered = useMemo(() => {
    const list = playlists ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;
  }, [playlists, query]);

  const selected = (playlists ?? []).find((p) => p.id === selectedId) ?? null;
  const currentTracks = selected && Array.isArray(selected.tracks) ? selected.tracks : [];
  const alreadyIn = currentTracks.some((t) => t.id === track.id);

  const handleAdd = async () => {
    if (!selected || alreadyIn) return;
    try {
      await db.playlists.update(selected.id, {
        tracks: [...currentTracks, track],
        updatedAt: Date.now(),
      });
      setStatus(`Added to “${selected.name}”.`);
      window.setTimeout(close, 900);
    } catch {
      setError('Could not update playlist. Please try again.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      setError('Enter a playlist name.');
      return;
    }
    if ((playlists ?? []).some((p) => p.name.trim().toLowerCase() === name.toLowerCase())) {
      setError('A playlist with that name already exists.');
      return;
    }
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pl_${Date.now()}`;
    try {
      await db.playlists.add({
        id,
        name,
        description: '',
        tracks: [track],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      setError('');
      setStatus(`Created “${name}” with this song.`);
      window.setTimeout(close, 1000);
    } catch {
      setError('Could not create playlist.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-playlist-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90vh] sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-sidebar border-t sm:border border-border-subtle shadow-2xl overflow-hidden"
      >
        <div className="sm:hidden w-12 h-1 bg-border-subtle rounded-full mx-auto my-2 shrink-0" />
        <div className="flex items-center justify-between px-5 pt-3 sm:pt-4 pb-3 border-b border-border-subtle">
          <h2
            id="add-to-playlist-title"
            className="text-sm font-bold text-text-primary tracking-tight"
          >
            Add to Playlist
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close add to playlist dialog"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Song being added */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border-subtle">
          <div className="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
            <CoverImage
              src={track.thumbnail}
              alt={track.title}
              size="sm"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate">{track.title}</p>
            <p className="text-[11px] text-text-secondary truncate">{track.artist}</p>
          </div>
        </div>

        <div className="px-5 py-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search playlists..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-[120px]">
          {filtered.length > 0 ? (
            filtered.map((pl) => {
              const isSelected = pl.id === selectedId;
              const contains = pl.tracks.some((t) => t.id === track.id);
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setSelectedId(isSelected ? null : pl.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                    isSelected ? 'bg-surface border border-accent/40' : 'hover:bg-surface/70 border border-transparent'
                  }`}
                >
                  <ListMusic className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12px] text-text-primary truncate">{pl.name}</span>
                    <span className="block text-[10px] text-text-muted">
                      {pl.tracks.length} songs
                      {contains ? ' · already added' : ''}
                    </span>
                  </span>
                  {contains ? (
                    <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  ) : isSelected ? (
                    <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  ) : null}
                </button>
              );
            })
          ) : (
            <p className="px-3 py-6 text-center text-[11px] text-text-muted">
              {query ? 'No playlist matches that search.' : 'No playlists yet. Create one below.'}
            </p>
          )}
        </div>

        <div className="border-t border-border-subtle px-5 py-3 space-y-2.5">
          {isCreating ? (
            <form onSubmit={handleCreate} className="space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setError('');
                }}
                placeholder="New playlist name..."
                autoFocus
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-accent text-[#101114] text-[11px] font-bold hover:bg-accent-hover transition-colors"
                >
                  Create playlist
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewName('');
                    setError('');
                  }}
                  className="px-3 py-1.5 rounded-lg text-text-secondary text-[11px] hover:text-text-primary hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create new playlist
            </button>
          )}

          {error && (
            <p role="alert" className="text-[11px] text-red-400">
              {error}
            </p>
          )}
          {status && (
            <p role="status" className="text-[11px] text-accent">
              {status}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={close}
              className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!selected || alreadyIn}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-[#101114] text-xs font-bold transition-colors"
            >
              {alreadyIn ? 'Already in playlist' : 'Add to playlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
