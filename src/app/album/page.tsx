'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLink from '@/components/AppLink';
import { ArrowLeft, Play, Shuffle, Disc3, Music, Loader2 } from 'lucide-react';
import { Track } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import TrackRow, { TrackTableHeader } from '@/components/TrackRow';
import CoverImage from '@/components/CoverImage';

interface AlbumInfo {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  year?: string;
}

function AlbumContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const titleQuery = searchParams.get('title') || searchParams.get('q');

  const [album, setAlbum] = useState<AlbumInfo | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const playTrack = usePlayerStore((s) => s.playTrack);

  useEffect(() => {
    async function loadAlbum() {
      setLoading(true);
      try {
        const query = id ? `id=${encodeURIComponent(id)}` : `q=${encodeURIComponent(titleQuery || '')}`;
        const res = await fetch(`/api/album?${query}`);
        if (res.ok) {
          const data = await res.json();
          setAlbum(data.album);
          setTracks(data.tracks || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadAlbum();
  }, [id, titleQuery]);

  const playAll = (shuffle = false) => {
    if (!tracks.length) return;
    if (shuffle) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-text-muted gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <p className="text-xs">Loading album tracklist...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center text-text-muted mx-auto">
          <Disc3 className="w-6 h-6" />
        </div>
        <h1 className="text-base font-bold text-text-primary">Album not found</h1>
        <AppLink
          href="/"
          className="inline-block px-5 py-2.5 rounded-full bg-accent text-[#101114] text-xs font-bold hover:bg-accent-hover transition-colors"
        >
          Explore Music
        </AppLink>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto select-none">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* Album Header Banner */}
      <div className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 rounded-3xl bg-surface/70 border border-border-subtle shadow-xl backdrop-blur-md relative overflow-hidden">
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />

        <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden bg-sidebar shadow-2xl flex-shrink-0 border border-border-subtle ring-1 ring-white/10 z-10">
          {album.thumbnail ? (
            <CoverImage src={album.thumbnail} alt={album.title} size="xl" priority className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <Disc3 className="w-12 h-12" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2.5 z-10">
          <span className="text-[10px] font-bold text-accent uppercase tracking-[0.16em]">
            Album
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary truncate">
            {album.title}
          </h1>
          <p className="text-sm text-text-secondary">
            By <span className="text-text-primary font-semibold">{album.artist}</span>
            {album.year ? ` · ${album.year}` : ''} · {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
          </p>

          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => playAll(false)}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-md shadow-[#C9A94D]/25 transition-all active:scale-95 disabled:opacity-40"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Album</span>
            </button>
            <button
              type="button"
              onClick={() => playAll(true)}
              disabled={tracks.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle text-xs font-semibold transition-all active:scale-95 disabled:opacity-40"
            >
              <Shuffle className="w-3.5 h-3.5 text-accent" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="bg-surface/40 p-3 rounded-2xl border border-border-subtle shadow-sm">
        <TrackTableHeader />
        <div className="space-y-1">
          {tracks.map((track, idx) => (
            <TrackRow key={`${track.id}-${idx}`} track={track} index={idx} queueContext={tracks} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AlbumPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-text-muted">Loading album...</div>}>
      <AlbumContent />
    </Suspense>
  );
}
