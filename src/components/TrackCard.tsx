'use client';

import { useRef, useEffect } from 'react';
import { Play, Pause, Heart, Plus } from 'lucide-react';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import CoverImage from '@/components/CoverImage';
import { useRouter } from 'next/navigation';
import { usePlaylistDialogStore } from '@/store/usePlaylistDialog';
import { initTiltEffect } from '@/lib/motion';

interface TrackCardProps {
  track: Track;
  queueContext?: Track[];
}

export default function TrackCard({ track, queueContext }: TrackCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isCurrent = currentTrack?.id === track.id;
  const isLiked = useLiveQuery(async () => !!(await db.likedTracks.get(track.id)), [track.id], false);
  const router = useRouter();

  useEffect(() => {
    if (!cardRef.current) return;
    return initTiltEffect(cardRef.current, 6);
  }, []);

  const play = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track, queueContext);
    }
  };

  const toggleLike = async () => {
    if (isLiked) {
      await db.likedTracks.delete(track.id);
    } else {
      await db.likedTracks.put({ ...track, likedAt: Date.now() });
    }
  };

  const openAddToPlaylist = () => {
    usePlaylistDialogStore.getState().open(track);
  };

  return (
    <article
      ref={cardRef}
      className={`group relative p-2.5 rounded-2xl bg-surface/80 hover:bg-surface-hover border border-border-subtle hover:border-accent/40 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 flex flex-col select-none will-change-transform ${
        isCurrent ? 'bg-surface-hover border-accent/60 shadow-lg shadow-black/40 ring-1 ring-accent/30' : ''
      }`}
    >
      <button
        type="button"
        onClick={play}
        aria-label={`${isCurrent && isPlaying ? 'Pause' : 'Play'} ${track.title} by ${track.artist}`}
        aria-pressed={isCurrent && isPlaying}
        className="w-full text-left rounded-xl cursor-pointer"
      >
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-sidebar shadow-sm">
          <CoverImage
            src={track.thumbnail}
            alt={track.title}
            size="lg"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <span
            aria-hidden="true"
            className={`absolute bottom-2.5 right-2.5 w-11 h-11 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-xl shadow-[#C9A94D]/30 transition-all duration-300 z-10 ${
              isCurrent
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-2 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:scale-100'
            }`}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </span>
        </div>

        <div className="pt-2 px-0.5">
          <h4 className="font-semibold text-xs text-text-primary truncate group-hover:text-accent transition-colors">
            {track.title}
          </h4>
        </div>
      </button>

      <div className="px-0.5 min-h-6 flex items-center">
        {track.artistId ? (
          <button
            type="button"
            onClick={() => router.push(`/artist?id=${encodeURIComponent(track.artistId!)}`)}
            className="max-w-full text-[11px] text-text-secondary truncate hover:text-accent hover:underline text-left"
          >
            {track.artist}
          </button>
        ) : (
          <p className="text-[11px] text-text-secondary truncate">{track.artist}</p>
        )}
      </div>

      <div
        className={`absolute top-4 right-4 flex flex-col gap-2 z-20 transition-opacity duration-200 ${
          isCurrent ? 'opacity-100' : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={toggleLike}
          aria-label={isLiked ? `Unlike ${track.title}` : `Like ${track.title}`}
          aria-pressed={Boolean(isLiked)}
          className="w-10 h-10 rounded-full bg-canvas/80 backdrop-blur-md border border-border-subtle flex items-center justify-center text-text-primary hover:bg-canvas hover:border-accent/50 transition-all active:scale-90"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-accent text-accent' : ''}`} />
        </button>
        <button
          type="button"
          onClick={openAddToPlaylist}
          aria-label={`Add ${track.title} to playlist`}
          className="w-10 h-10 rounded-full bg-canvas/80 backdrop-blur-md border border-border-subtle flex items-center justify-center text-text-primary hover:bg-canvas hover:border-accent/50 transition-all active:scale-90"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}
