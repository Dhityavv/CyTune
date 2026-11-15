'use client';

import { useState } from 'react';
import { Play, Pause, Heart, Plus, ListMusic } from 'lucide-react';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import CoverImage from '@/components/CoverImage';
import { useRouter } from 'next/navigation';

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
  const [showMenu, setShowMenu] = useState(false);
  const isLiked = useLiveQuery(async () => !!(await db.likedTracks.get(track.id)), [track.id], false);
  const playlists = useLiveQuery(() => db.playlists.toArray(), [], []);
  const router = useRouter();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      await db.likedTracks.delete(track.id);
    } else {
      await db.likedTracks.put({ ...track, likedAt: Date.now() });
    }
  };

  const addToPlaylist = async (plId: string) => {
    const pl = await db.playlists.get(plId);
    if (!pl) return;
    if (pl.tracks.some((t) => t.id === track.id)) {
      setShowMenu(false);
      return;
    }
    await db.playlists.update(plId, {
      tracks: [...pl.tracks, track],
      updatedAt: Date.now(),
    });
    setShowMenu(false);
  };

  return (
    <div
      onClick={handlePlay}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

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
            className="w-10 h-10 rounded-full bg-text-primary text-canvas flex items-center justify-center shadow-xl shadow-black/80 hover:scale-105 active:scale-95 transition-transform"
            title={isCurrent && isPlaying ? 'Pause' : 'Play'}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Quick Actions: Like & Add to Playlist */}
        <div
          className={`absolute top-2 right-2 flex flex-col gap-1.5 z-20 transition-all duration-200 ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            onClick={toggleLike}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-text-primary hover:bg-black/80 transition-colors"
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-accent text-accent' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-text-primary hover:bg-black/80 transition-colors"
            title="Add to playlist"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {showMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-10 right-2 z-30 w-44 rounded-xl bg-surface border border-border-hover shadow-xl py-1.5 max-h-48 overflow-y-auto"
          >
            {playlists && playlists.length > 0 ? (
              playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => addToPlaylist(pl.id)}
                  className="w-full text-left px-3 py-1.5 text-[12px] text-text-primary hover:bg-surface-hover truncate flex items-center gap-2"
                >
                  <ListMusic className="w-3 h-3 text-text-muted" />
                  {pl.name}
                </button>
              ))
            ) : (
              <p className="px-3 py-1.5 text-[11px] text-text-muted">No playlists. Create one in Library.</p>
            )}
          </div>
        )}

        {/* Active Playing Equalizer Badge */}
        {isCurrent && isPlaying && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md flex items-center gap-1 border border-white/10 z-10">
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
