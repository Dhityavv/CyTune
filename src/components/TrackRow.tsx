'use client';

import { Play, Pause, Heart, Plus, ListPlus } from 'lucide-react';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import CoverImage from '@/components/CoverImage';
import { usePlaylistDialogStore } from '@/store/usePlaylistDialog';

interface TrackRowProps {
  track: Track;
  index: number;
  queueContext?: Track[];
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TrackTableHeader({ showAlbum = true }: { showAlbum?: boolean }) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)_80px] md:grid-cols-[36px_minmax(0,1fr)_minmax(120px,220px)_132px] items-center px-3 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle mb-1 select-none">
      <span className="text-center">#</span>
      <span className="pl-3">Title</span>
      {showAlbum && <span className="hidden md:block">Album</span>}
      <span className="text-right pr-2">Actions</span>
    </div>
  );
}

export default function TrackRow({ track, index, queueContext }: TrackRowProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const isCurrent = currentTrack?.id === track.id;
  const isLiked = useLiveQuery(async () => !!(await db.likedTracks.get(track.id)), [track.id], false);

  const toggleFavorite = async () => {
    if (isLiked) {
      await db.likedTracks.delete(track.id);
    } else {
      await db.likedTracks.put({ ...track, likedAt: Date.now() });
      usePlayerStore.getState().recordFeedback('liked', track);
    }
  };

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
    }
  };

  return (
    <div
      className={`group grid grid-cols-[36px_minmax(0,1fr)_80px] md:grid-cols-[36px_minmax(0,1fr)_minmax(120px,220px)_132px] items-center px-3 py-2 rounded-xl transition-all select-none border ${
        isCurrent
          ? 'bg-surface border-accent/40 text-text-primary shadow-sm'
          : 'bg-transparent border-transparent hover:bg-surface-hover/80 hover:border-border-subtle text-text-secondary'
      }`}
    >
      <button
        type="button"
        onClick={handlePlay}
        aria-label={`${isCurrent && isPlaying ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
        aria-pressed={isCurrent && isPlaying}
        className="w-9 h-10 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface focus-visible:text-accent"
      >
        <span className="group-hover:hidden group-focus-within:hidden font-mono text-xs">
          {isCurrent && isPlaying ? (
            <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
              <span className="w-0.5 h-3 bg-accent rounded-full animate-pulse" />
              <span className="w-0.5 h-1.5 bg-accent rounded-full animate-pulse delay-75" />
              <span className="w-0.5 h-2.5 bg-accent rounded-full animate-pulse delay-150" />
            </span>
          ) : (
            index + 1
          )}
        </span>
        <span className="hidden group-hover:flex group-focus-within:flex items-center justify-center" aria-hidden="true">
          {isCurrent && isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
          )}
        </span>
      </button>

      <button
        type="button"
        onClick={handlePlay}
        className="flex items-center gap-3 min-w-0 pr-3 text-left rounded-lg"
        aria-label={`Play ${track.title} by ${track.artist}`}
      >
        <span className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-sidebar shadow-sm">
          <CoverImage src={track.thumbnail} alt={track.title} size="sm" className="w-full h-full object-cover" />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block text-[13px] font-medium truncate ${
              isCurrent ? 'text-accent font-semibold' : 'text-text-primary group-hover:text-text-primary'
            }`}
          >
            {track.title}
          </span>
          <span className="block text-[11px] text-text-secondary truncate mt-0.5">{track.artist}</span>
        </span>
      </button>

      <div className="hidden md:block min-w-0 pr-3">
        <p className="text-[12px] text-text-muted truncate group-hover:text-text-secondary transition-colors">
          {track.album || '-'}
        </p>
      </div>

      <div className="flex items-center justify-end gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => addToQueue(track)}
          aria-label={`Add ${track.title} to queue`}
          className="w-9 h-9 rounded-lg opacity-80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 hover:bg-surface text-text-muted hover:text-text-primary transition-all flex items-center justify-center"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => usePlaylistDialogStore.getState().open(track)}
          aria-label={`Add ${track.title} to playlist`}
          className="w-9 h-9 rounded-lg opacity-80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 hover:bg-surface text-text-muted hover:text-text-primary transition-all flex items-center justify-center"
        >
          <ListPlus className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={toggleFavorite}
          aria-label={isLiked ? `Remove ${track.title} from favorites` : `Add ${track.title} to favorites`}
          aria-pressed={Boolean(isLiked)}
          className={`w-9 h-9 rounded-lg transition-all flex items-center justify-center ${
            isLiked
              ? 'text-accent fill-accent opacity-100'
              : 'opacity-80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 text-text-muted hover:text-text-primary'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        <span className="hidden md:block text-[11px] font-mono text-text-muted w-10 text-right pr-1">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}
