'use client';

import { useRef, useEffect } from 'react';
import { Play, Pause, Heart, Plus } from 'lucide-react';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import CoverImage from '@/components/CoverImage';
import { useRouter } from 'next/navigation';
import { clickable } from '@/lib/a11y';
import { usePlaylistDialogStore } from '@/store/usePlaylistDialog';
import { initTiltEffect } from '@/lib/motion';

interface TrackCardProps {
  track: Track;
  queueContext?: Track[];
}

export default function TrackCard({ track }: TrackCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isCurrent = currentTrack?.id === track.id;
  const isLiked = useLiveQuery(async () => !!(await db.likedTracks.get(track.id)), [track.id], false);
  const router = useRouter();

  // GSAP 3D perspective tilt effect on hover
  useEffect(() => {
    if (cardRef.current) {
      const cleanup = initTiltEffect(cardRef.current, 6);
      return cleanup;
    }
  }, []);

  const play = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    play();
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      await db.likedTracks.delete(track.id);
    } else {
      await db.likedTracks.put({ ...track, likedAt: Date.now() });
    }
  };

  const openAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    usePlaylistDialogStore.getState().open(track);
  };

  return (
    <div
      ref={cardRef}
      onClick={play}
      {...clickable(play)}
      className={`group relative p-2.5 rounded-2xl bg-surface/80 hover:bg-surface-hover border border-border-subtle hover:border-accent/40 hover:shadow-2xl hover:shadow-black/60 transition-all duration-300 cursor-pointer flex flex-col select-none will-change-transform ${
        isCurrent ? 'bg-surface-hover border-accent/60 shadow-lg shadow-black/40 ring-1 ring-accent/30' : ''
      }`}
    >
      {/* Artwork with floating play button */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-sidebar shadow-sm">
        <CoverImage
          src={track.thumbnail}
          alt={track.title}
          size="lg"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Quick Play Button */}
        <div
          className={`absolute bottom-2.5 right-2.5 transition-all duration-300 z-10 ${
            isCurrent
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100'
          }`}
        >
          <button
            onClick={handlePlay}
            className="w-11 h-11 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-xl shadow-[#C9A94D]/30 hover:bg-accent-hover hover:scale-110 active:scale-95 transition-all"
            aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Quick Actions: Like, Add to Playlist & More Options */}
        <div
          className={`absolute top-2 right-2 flex flex-col gap-1.5 z-20 transition-all duration-300 ${
            isCurrent ? 'opacity-100' : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          <button
            onClick={toggleLike}
            className="w-8 h-8 rounded-full bg-canvas/80 backdrop-blur-md border border-border-subtle flex items-center justify-center text-text-primary hover:bg-canvas hover:border-accent/50 transition-all active:scale-90"
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-accent text-accent' : ''}`} />
          </button>
          <button
            onClick={openAddToPlaylist}
            className="w-8 h-8 rounded-full bg-canvas/80 backdrop-blur-md border border-border-subtle flex items-center justify-center text-text-primary hover:bg-canvas hover:border-accent/50 transition-all active:scale-90"
            aria-label="Add to playlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Meta Text */}
      <div className="pt-2 px-0.5 space-y-0.5">
        <h4 className="font-semibold text-xs text-text-primary truncate group-hover:text-accent transition-colors">
          {track.title}
        </h4>
        <p
          onClick={(e) => {
            if (track.artistId) {
              e.stopPropagation();
              router.push(`/artist?id=${encodeURIComponent(track.artistId)}`);
            }
          }}
          className={`text-[11px] text-text-secondary truncate ${
            track.artistId ? 'hover:text-accent hover:underline cursor-pointer' : ''
          }`}
        >
          {track.artist}
        </p>
      </div>
    </div>
  );
}
