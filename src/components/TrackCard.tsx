'use client';

import { Play, Pause, Heart, Plus } from 'lucide-react';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import CoverImage from '@/components/CoverImage';
import { useRouter } from 'next/navigation';
import { clickable } from '@/lib/a11y';
import { usePlaylistDialogStore } from '@/store/usePlaylistDialog';

interface TrackCardProps {
  track: Track;
  queueContext?: Track[];
}

export default function TrackCard({ track }: TrackCardProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isCurrent = currentTrack?.id === track.id;
  const isLiked = useLiveQuery(async () => !!(await db.likedTracks.get(track.id)), [track.id], false);
  const router = useRouter();

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
      onClick={play}
      {...clickable(play)}
      className={`group relative p-2.5 rounded-2xl bg-surface/80 hover:bg-surface-hover border border-border-subtle hover:border-border-hover hover:shadow-xl hover:shadow-black/50 transition-all duration-200 cursor-pointer flex flex-col select-none ${
        isCurrent ? 'bg-surface-hover border-accent/50 shadow-lg shadow-black/40' : ''
      }`}
    >
      {/* Artwork with floating play button */}
      <div className="relative aspect-square w-full rounded-xl overflow-visible bg-sidebar shadow-sm">
        <CoverImage
          src={track.thumbnail}
          alt={track.title}
          size="lg"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        {/* Ambient Dark Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Quick Play Button */}
        <div
          className={`absolute bottom-2.5 right-2.5 transition-all duration-200 z-10 ${
            isCurrent
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
        >
          <button
            onClick={handlePlay}
            className="w-10 h-10 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-xl shadow-[#C9A94D]/25 hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all"
            title={isCurrent && isPlaying ? 'Pause' : 'Play'}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Quick Actions: Like & Add to Playlist */}
        <div
          className={`absolute top-2 right-2 flex flex-col gap-1.5 z-20 transition-all duration-200 ${
            isCurrent ? 'opacity-100' : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
          }`}
        >
          <button
            onClick={toggleLike}
            className="w-9 h-9 rounded-full bg-canvas/70 backdrop-blur-md border border-border-subtle flex items-center justify-center text-text-primary hover:bg-canvas/90 hover:border-border-hover transition-colors"
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-accent text-accent' : ''}`} />
          </button>
          <button
            onClick={openAddToPlaylist}
            className="w-9 h-9 rounded-full bg-canvas/70 backdrop-blur-md border border-border-subtle flex items-center justify-center text-text-primary hover:bg-canvas/90 hover:border-border-hover transition-colors"
            title="Add to playlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Playing Equalizer Badge */}
        {isCurrent && isPlaying && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-canvas/80 backdrop-blur-md flex items-center gap-1 border border-border-subtle z-10">
            <span className="w-1 h-2.5 bg-accent rounded-full animate-pulse" />
            <span className="w-1 h-3 bg-accent rounded-full animate-pulse delay-75" />
            <span className="w-1 h-1.5 bg-accent rounded-full animate-pulse delay-150" />
          </div>
        )}
      </div>

      {/* Track Meta */}
      <div className="mt-2.5 min-w-0 px-0.5">
        <h4
          className={`text-[13px] font-medium truncate leading-tight ${
            isCurrent ? 'text-accent font-semibold' : 'text-text-primary group-hover:text-text-primary'
          }`}
          title={track.title}
        >
          {track.title}
        </h4>
        <p className="text-[11px] text-text-secondary truncate mt-0.5" title={track.artist}>
          {track.artistId ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const st = usePlayerStore.getState();
                if (st.isExpanded) st.toggleExpanded();
                router.push(`/artist?id=${encodeURIComponent(track.artistId!)}`);
              }}
              className="hover:text-accent transition-colors text-left"
            >
              {track.artist}
            </button>
          ) : (
            track.artist
          )}
        </p>
      </div>
    </div>
  );
}
