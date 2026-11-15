'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X, Play, Loader2, Disc } from 'lucide-react';
import { Track } from '@/types/music';
import CoverImage from '@/components/CoverImage';
import { usePlayerStore } from '@/store/usePlayerStore';
import TrackRow, { TrackTableHeader } from '@/components/TrackRow';
import TrackCard from '@/components/TrackCard';

const TRENDING_SEARCHES = [
  'Taylor Swift',
  'The Weeknd',
  'Drake',
  'Joji',
  'Bernadya',
  'NIKI',
  'Coldplay',
  'Billie Eilish',
  'wave to earth',
];

const GENRE_TILES = [
  { name: 'Pop', border: 'border-t-rose-500', query: 'Top Pop Music' , img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=70' },
  { name: 'Hip-Hop & Rap', border: 'border-t-amber-500', query: 'Top Hip Hop Rap' , img: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&q=70' },
  { name: 'R&B / Soul', border: 'border-t-indigo-500', query: 'Best R&B Soul Hits' , img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=70' },
  { name: 'Indie & Alt', border: 'border-t-emerald-500', query: 'Indie Alternative' , img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=70' },
  { name: 'Chill & Lo-Fi', border: 'border-t-teal-500', query: 'Lofi Chillhop' , img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=70' },
  { name: 'Rock Classics', border: 'border-t-red-500', query: 'Rock Classic Hits' , img: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=70' },
  { name: 'Electronic / EDM', border: 'border-t-cyan-500', query: 'Electronic Dance Music' , img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=70' },
  { name: 'K-Pop', border: 'border-t-fuchsia-500', query: 'Top K-Pop Songs' , img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=70' },
  { name: 'Indonesian Hits', border: 'border-t-orange-500', query: 'Hits Indonesia 2026' , img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=70' },
  { name: 'Acoustic & Folk', border: 'border-t-stone-400', query: 'Acoustic Guitar Folk' , img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=70' },
  { name: 'Sleep & Ambient', border: 'border-t-blue-500', query: 'Ambient Deep Sleep' , img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70' },
  { name: 'Jazz & Lounge', border: 'border-t-yellow-500', query: 'Smooth Jazz Lounge' , img: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&q=70' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));
  const playTrack = usePlayerStore((s) => s.playTrack);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setTracks([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setTracks(data.tracks || []);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search when initialQuery changes or typed
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  // Debounced typing search
  useEffect(() => {
    if (!query.trim()) {
      setTracks([]);
      setHasSearched(false);
      return;
    }

    const handler = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [query, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query);
    }
  };

  const topResult = tracks[0];
  const nextResults = tracks.slice(1, 5);
  const remainingResults = tracks.slice(5);

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative max-w-xl">
        <div className="relative flex items-center bg-[#16161D] border border-border-subtle focus-within:border-[#10B981]/60 focus-within:ring-1 focus-within:ring-[#10B981]/30 rounded-2xl transition-all shadow-md">
          <SearchIcon className="absolute left-4 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, or albums..."
            autoFocus
            className="w-full pl-11 pr-10 py-3.5 bg-transparent text-text-primary placeholder-[#71717A] text-[14px] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setTracks([]);
                setHasSearched(false);
              }}
              className="absolute right-3 p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Initial Music Discovery View (When not searching) */}
      {!hasSearched && !loading && (
        <div className="space-y-8">
          {/* Trending Search Chips */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
              Trending Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setQuery(tag);
                    performSearch(tag);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#16161D] hover:bg-[#1E1E27] border border-border-subtle text-xs font-medium text-text-secondary hover:text-text-primary transition-all shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Browse All Genres & Moods */}
          <div className="space-y-3.5">
            <h2 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Browse All Categories
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {GENRE_TILES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => {
                    setQuery(cat.query);
                    performSearch(cat.query);
                  }}
                  className={`p-4 rounded-2xl relative overflow-hidden bg-gradient-to-b from-surface-hover to-surface border border-border-subtle ${cat.border} border-t-2 hover:border-[#10B981]/40 transition-all text-left flex flex-col justify-between h-28 group hover:scale-[1.02] shadow-md hover:shadow-xl hover:shadow-black/40`}
                >
                  <img
                    src={cat.img}
                    alt=""
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/40 to-transparent" />
                  <span className="relative text-[13px] font-semibold text-text-primary leading-tight group-hover:text-accent transition-colors drop-shadow">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-text-secondary font-mono uppercase tracking-wider">
                    Explore &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-text-secondary gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
          <p className="text-xs font-medium">Searching catalog...</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && hasSearched && (
        <div className="space-y-8">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Search Results for &quot;{query}&quot;
            </h2>
            <span className="text-xs text-text-muted font-mono">{tracks.length} tracks found</span>
          </div>

          {tracks.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <Disc className="w-10 h-10 text-text-muted mx-auto opacity-50" />
              <p className="text-sm font-medium text-text-primary">No matching songs found</p>
              <p className="text-xs text-text-secondary">
                Try searching with different keywords or check artist spelling.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Result + Songs 2-Column Section (Spotify style) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Top Result Card (5 Cols) */}
                {topResult && (
                  <div className="lg:col-span-5 space-y-2">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                      Top Result
                    </span>
                    <div
                      onClick={() => playTrack(topResult)}
                      className="group relative p-5 rounded-2xl bg-surface/70 hover:bg-surface-hover border border-border-subtle hover:border-border-hover transition-all cursor-pointer flex flex-col justify-between h-56 select-none shadow-xl hover:shadow-black/50"
                    >
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-lg bg-sidebar">
                        <CoverImage
                          src={topResult.thumbnail}
                          alt={topResult.title}
                          size="md"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="min-w-0 pr-12">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent inline-block mb-1">
                          Song
                        </span>
                        <h3 className="text-lg font-bold text-text-primary truncate group-hover:text-accent transition-colors">
                          {topResult.title}
                        </h3>
                        <p className="text-xs text-text-secondary truncate mt-0.5">{topResult.artist}</p>
                      </div>

                      {/* Play Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(topResult);
                        }}
                        className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-text-primary text-canvas flex items-center justify-center shadow-xl shadow-black/80 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                      >
                        <Play className="w-5 h-5 fill-black translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Next Matching Songs (7 Cols) */}
                <div className="lg:col-span-7 space-y-2">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                    Songs
                  </span>
                  <div className="bg-surface/40 p-2.5 rounded-2xl border border-border-subtle shadow-sm">
                    <TrackTableHeader />
                    <div className="space-y-1">
                      {nextResults.map((track, idx) => (
                        <TrackRow
                          key={track.id}
                          track={track}
                          index={idx + 1}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Remaining Tracks Grid */}
              {remainingResults.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border-subtle">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                    More Related Tracks
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {remainingResults.map((track) => (
                      <TrackCard key={track.id} track={track} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-text-secondary text-xs">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
