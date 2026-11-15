'use client';

import { Play, Pause, Heart, Plus } from 'lucide-react';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import CoverImage from '@/components/CoverImage';

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
    <div className="grid grid-cols-[36px_minmax(0,1fr)_80px] md:grid-cols-[36px_minmax(0,1fr)_minmax(120px,220px)_100px] items-center px-3 py-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider border-b border-border-subtle mb-1 select-none">
      <span className="text-center">#</span>
      <span className="pl-3">Title</span>
      {showAlbum && <span className="hidden md:block">Album</span>}
      <span className="text-right pr-2">Duration</span>
    </div>
  );
}

export default function TrackRow({ track, index }: TrackRowProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const isCurrent = currentTrack?.id === track.id;

  const isLiked = useLiveQuery(
    async () => {
      const found = await db.likedTracks.get(track.id);
      return !!found;
    },
    [track.id],
    false
  );

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      await db.likedTracks.delete(track.id);
    } else {
      await db.likedTracks.put({
        ...track,
        likedAt: Date.now(),
      });
      usePlayerStore.getState().recordFeedback('liked', track);
    }
  };

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group grid grid-cols-[36px_minmax(0,1fr)_80px] md:grid-cols-[36px_minmax(0,1fr)_minmax(120px,220px)_100px] items-center px-3 py-2 rounded-xl transition-all cursor-pointer select-none border ${
        isCurrent
          ? 'bg-surface border-accent/40 text-text-primary shadow-sm'
          : 'bg-transparent border-transparent hover:bg-surface-hover/80 hover:border-white/[0.04] text-text-secondary'
      }`}
    >
      {/* 1. Index / Equalizer / Play/Pause Hover Button */}
      <div className="w-9 flex items-center justify-center flex-shrink-0">
        <div className="flex items-center justify-center text-xs font-mono text-text-muted group-hover:hidden">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-3 bg-accent rounded-full animate-pulse" />
              <span className="w-0.5 h-1.5 bg-accent rounded-full animate-pulse delay-75" />
              <span className="w-0.5 h-2.5 bg-accent rounded-full animate-pulse delay-150" />
            </div>
          ) : (
            index + 1
          )}
        </div>
        <div className="hidden group-hover:flex items-center justify-center text-text-primary">
          {isCurrent && isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
          )}
        </div>
      </div>

      {/* 2. Thumbnail, Title & Artist */}
      <div className="flex items-center gap-3 min-w-0 pr-3">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-sidebar shadow-sm">
          <CoverImage
            src={track.thumbnail}
            alt={track.title}
            size="sm"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-[13px] font-medium truncate ${
              isCurrent ? 'text-accent font-semibold' : 'text-text-primary group-hover:text-text-primary'
            }`}
          >
            {track.title}
          </p>
          <p className="text-[11px] text-text-secondary truncate mt-0.5">{track.artist}</p>
        </div>
      </div>

      {/* 3. Album */}
      <div className="hidden md:block min-w-0 pr-3">
        <p className="text-[12px] text-text-muted truncate group-hover:text-text-secondary transition-colors">
          {track.album || '-'}
        </p>
      </div>

      {/* 4. Actions & Duration */}
      <div className="flex items-center justify-end gap-1.5 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(track);
          }}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-text-muted hover:text-text-primary transition-all"
          title="Add to queue"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleFavorite}
          className={`p-1.5 rounded-lg transition-colors ${
            isLiked
              ? 'text-rose-500 fill-rose-500 opacity-100'
              : 'opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary'
          }`}
          title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        <span className="text-[11px] font-mono text-text-muted w-10 text-right pr-1">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}
