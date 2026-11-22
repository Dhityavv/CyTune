'use client';

import { Suspense, useMemo, useState } from 'react';
import AppLink from '@/components/AppLink';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  ListMusic,
  Pencil,
  Play,
  Search,
  Shuffle,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, PlaylistRecord } from '@/lib/db';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import TrackRow, { TrackTableHeader } from '@/components/TrackRow';
import CoverImage from '@/components/CoverImage';

function formatTotal(seconds: number): string {
  if (!seconds || seconds < 0) return '0 min';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} hr ${mins % 60} min`;
}

// Kept outside the component so the write timestamp is not read during render.
async function patchPlaylist(id: string, changes: Partial<PlaylistRecord>) {
  await db.playlists.update(id, { ...changes, updatedAt: Date.now() });
}

function PlaylistContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') ?? '';

  const playlist = useLiveQuery(
    async () => (id ? (await db.playlists.get(id)) ?? null : null),
    [id],
    undefined
  );
  const playTrack = usePlayerStore((s) => s.playTrack);

  const [query, setQuery] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [actionError, setActionError] = useState('');

  const filtered = useMemo(() => {
    if (!playlist) return [];
    const q = query.trim().toLowerCase();
    if (!q) return playlist.tracks;
    return playlist.tracks.filter(
      (t) => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    );
  }, [playlist, query]);

  if (playlist === undefined) {
    return <p className="p-8 text-text-secondary text-xs">Loading playlist...</p>;
  }

  if (playlist === null) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center text-text-muted mx-auto">
          <ListMusic className="w-6 h-6" />
        </div>
        <h1 className="text-base font-bold text-text-primary">Playlist not found</h1>
        <p className="text-xs text-text-secondary">
          It may have been deleted, or the link is wrong.
        </p>
        <AppLink
          href="/library?tab=playlists"
          className="inline-block px-5 py-2.5 rounded-full bg-accent text-[#101114] text-xs font-bold hover:bg-accent-hover transition-colors"
        >
          Back to Library
        </AppLink>
      </div>
    );
  }

  const totalDuration = playlist.tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const coverSrc = playlist.coverUrl || playlist.tracks[0]?.thumbnail;

  const playAll = (tracks: Track[], shuffle: boolean) => {
    if (!tracks.length) return;
    if (shuffle) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  const saveName = async () => {
    const name = nameDraft.trim();
    if (!name) {
      setActionError('Playlist name cannot be empty.');
      return;
    }
    await patchPlaylist(playlist.id, { name });
    setActionError('');
    setIsRenaming(false);
  };

  const saveDescription = async () => {
    await patchPlaylist(playlist.id, { description: descriptionDraft.trim() });
    setIsEditingDescription(false);
  };

  const moveTrack = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= playlist.tracks.length) return;
    const next = [...playlist.tracks];
    [next[index], next[target]] = [next[target], next[index]];
    await patchPlaylist(playlist.id, { tracks: next });
  };

  const removeTrack = async (trackId: string) => {
    await patchPlaylist(playlist.id, {
      tracks: playlist.tracks.filter((t) => t.id !== trackId),
    });
  };

  const deletePlaylist = async () => {
    if (!confirm(`Delete playlist "${playlist.name}"? This does not delete the songs themselves.`)) {
      return;
    }
    await db.playlists.delete(playlist.id);
    router.push('/library?tab=playlists');
  };

  const changeCover = async (file: File) => {
    if (file.size > 2_000_000) {
      setActionError('Cover image must be under 2 MB.');
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    await patchPlaylist(playlist.id, { coverUrl: dataUrl });
    setActionError('');
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      <button
        type="button"
        onClick={() => router.push('/library?tab=playlists')}
        className="flex items-center gap-1.5 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Library
      </button>

      {/* Playlist header */}
      <div className="flex flex-col sm:flex-row gap-6 p-5 sm:p-7 rounded-2xl bg-surface/60 border border-border-subtle shadow-xl">
        <label className="group relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-sidebar flex items-center justify-center flex-shrink-0 ring-1 ring-border-subtle cursor-pointer">
          {coverSrc ? (
            <CoverImage
              src={coverSrc}
              alt={playlist.name}
              size="xl"
              className="w-full h-full object-cover"
            />
          ) : (
            <ListMusic className="w-10 h-10 text-text-muted" />
          )}
          <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-text-primary">
            <ImagePlus className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Change cover</span>
          </span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) changeCover(f);
              e.target.value = '';
            }}
          />
        </label>

        <div className="flex-1 min-w-0 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Playlist</p>

          {isRenaming ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                autoFocus
                aria-label="Playlist name"
                className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-sidebar border border-border-subtle text-text-primary text-lg font-bold focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={saveName}
                aria-label="Save playlist name"
                className="p-2 rounded-lg bg-accent text-[#101114] hover:bg-accent-hover transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRenaming(false);
                  setActionError('');
                }}
                aria-label="Cancel rename"
                className="p-2 rounded-lg bg-surface text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary truncate">
                {playlist.name}
              </h1>
              <button
                type="button"
                onClick={() => {
                  setNameDraft(playlist.name);
                  setIsRenaming(true);
                }}
                aria-label="Rename playlist"
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors flex-shrink-0"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                rows={2}
                aria-label="Playlist description"
                placeholder="Add a description..."
                className="w-full px-3 py-2 rounded-xl bg-sidebar border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveDescription}
                  className="px-3 py-1.5 rounded-lg bg-accent text-[#101114] text-[11px] font-bold hover:bg-accent-hover transition-colors"
                >
                  Save description
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingDescription(false)}
                  className="px-3 py-1.5 rounded-lg text-text-secondary text-[11px] hover:text-text-primary hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDescriptionDraft(playlist.description ?? '');
                setIsEditingDescription(true);
              }}
              className="block text-left text-xs text-text-secondary hover:text-text-primary transition-colors max-w-xl"
            >
              {playlist.description || 'Add a description'}
            </button>
          )}

          <p className="text-[11px] text-text-muted">
            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'song' : 'songs'}
            {totalDuration > 0 ? ` · ${formatTotal(totalDuration)}` : ''}
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => playAll(playlist.tracks, false)}
              disabled={playlist.tracks.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-[#101114] text-xs font-bold hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play
            </button>
            <button
              type="button"
              onClick={() => playAll(playlist.tracks, true)}
              disabled={playlist.tracks.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Shuffle className="w-3.5 h-3.5 text-accent" />
              Shuffle
            </button>
            <AppLink
              href="/search"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle text-xs font-semibold transition-all"
            >
              <Search className="w-3.5 h-3.5 text-accent" />
              Find songs to add
            </AppLink>
            <button
              type="button"
              onClick={deletePlaylist}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-text-secondary hover:text-red-400 hover:bg-surface border border-border-subtle text-xs font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>

          {actionError && (
            <p role="alert" className="text-[11px] text-red-400">
              {actionError}
            </p>
          )}
        </div>
      </div>

      {/* Track list */}
      {playlist.tracks.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-text-muted mx-auto">
            <ListMusic className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-text-primary">This playlist is empty</h2>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Use the “Add to playlist” button on any song, or browse search to find something.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in this playlist..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="py-10 text-center text-xs text-text-muted">
              No songs match “{query.trim()}”.
            </p>
          ) : (
            <div className="bg-surface/40 p-3 rounded-2xl border border-border-subtle shadow-sm">
              <TrackTableHeader />
              <div className="space-y-1">
                {filtered.map((track, idx) => {
                  const realIndex = playlist.tracks.findIndex((t) => t.id === track.id);
                  return (
                    <div key={`${track.id}-${idx}`} className="flex items-center gap-1">
                      <div className="flex flex-col flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveTrack(realIndex, -1)}
                          disabled={realIndex <= 0}
                          aria-label={`Move ${track.title} up`}
                          className="p-0.5 rounded text-text-muted hover:text-text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveTrack(realIndex, 1)}
                          disabled={realIndex >= playlist.tracks.length - 1}
                          aria-label={`Move ${track.title} down`}
                          className="p-0.5 rounded text-text-muted hover:text-text-primary disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <TrackRow track={track} index={realIndex} queueContext={filtered} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTrack(track.id)}
                        aria-label={`Remove ${track.title} from playlist`}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-surface transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PlaylistPage() {
  return (
    <Suspense fallback={<p className="p-8 text-text-secondary text-xs">Loading playlist...</p>}>
      <PlaylistContent />
    </Suspense>
  );
}
