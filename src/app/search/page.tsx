'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, X, Play, Loader2, Disc, Sparkles, ChevronRight } from 'lucide-react';
import { Track } from '@/types/music';
import CoverImage from '@/components/CoverImage';
import { usePlayerStore } from '@/store/usePlayerStore';
import TrackRow, { TrackTableHeader } from '@/components/TrackRow';
import TrackCard from '@/components/TrackCard';

interface SearchArtist {
  id: string;
  name: string;
  subtitle?: string;
  subscribers?: string;
  thumbnail?: string;
}

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
  { name: 'Pop', border: 'border-t-[#C9A94D]', query: 'Top Pop Music' , img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=70' },
  { name: 'Hip-Hop & Rap', border: 'border-t-[#7775A8]', query: 'Top Hip Hop Rap' , img: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&q=70' },
  { name: 'R&B / Soul', border: 'border-t-[#315B55]', query: 'Best R&B Soul Hits' , img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=70' },
  { name: 'Indie & Alt', border: 'border-t-[#4E8A82]', query: 'Indie Alternative' , img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=70' },
  { name: 'Chill & Lo-Fi', border: 'border-t-[#A3925C]', query: 'Lofi Chillhop' , img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=70' },
  { name: 'Rock Classics', border: 'border-t-[#89919C]', query: 'Rock Classic Hits' , img: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=70' },
  { name: 'Electronic / EDM', border: 'border-t-[#6E6A9E]', query: 'Electronic Dance Music' , img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=70' },
  { name: 'K-Pop', border: 'border-t-[#B08B3E]', query: 'Top K-Pop Songs' , img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=70' },
  { name: 'Indonesian Hits', border: 'border-t-[#C9A94D]', query: 'Hits Indonesia 2026' , img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=70' },
  { name: 'Acoustic & Folk', border: 'border-t-[#89919C]', query: 'Acoustic Guitar Folk' , img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=70' },
  { name: 'Sleep & Ambient', border: 'border-t-[#315B55]', query: 'Ambient Deep Sleep' , img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70' },
  { name: 'Jazz & Lounge', border: 'border-t-[#A3925C]', query: 'Smooth Jazz Lounge' , img: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&q=70' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artist, setArtist] = useState<SearchArtist | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));
  const playTrack = usePlayerStore((s) => s.playTrack);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setTracks([]);
      setArtist(null);
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
        setArtist(data.artist || null);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search when initialQuery changes
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
      setArtist(null);
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
      {/* Search Input Bar (Smooth rounded focus ring without rectangular box) */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl">
        <label htmlFor="orbit-search" className="block text-[10px] font-bold text-text-muted uppercase tracking-[0.16em] mb-2">
          Search the catalog
        </label>
        <div
          className={`relative flex items-center bg-surface border rounded-2xl transition-all shadow-lg overflow-hidden ${
            loading
              ? 'border-accent/40 ring-2 ring-accent/20'
              : 'border-border-subtle hover:border-border-hover'
          } focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30`}
        >
          {loading ? (
            <Loader2 className="absolute left-4 w-[18px] h-[18px] text-accent animate-spin pointer-events-none" />
          ) : (
            <SearchIcon className="absolute left-4 w-[18px] h-[18px] text-text-muted pointer-events-none" />
          )}
          <input
            id="orbit-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Songs, artists, or albums…"
            autoFocus
            autoComplete="off"
            className="w-full pl-11 pr-11 py-4 bg-transparent text-text-primary placeholder-text-muted text-[15px] outline-none focus:outline-none border-none ring-0 focus:ring-0 rounded-2xl"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setTracks([]);
                setArtist(null);
                setHasSearched(false);
              }}
              aria-label="Clear search"
              className="absolute right-3 p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors outline-none focus:outline-none"
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
                  className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle hover:border-accent/40 text-xs font-medium text-text-secondary hover:text-text-primary transition-all shadow-sm active:scale-95 outline-none focus:outline-none"
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
                  className={`p-4 rounded-2xl relative overflow-hidden bg-gradient-to-b from-surface-hover to-surface border border-border-subtle ${cat.border} border-t-2 hover:border-accent/50 transition-all text-left flex flex-col justify-between h-32 group hover:-translate-y-0.5 shadow-md hover:shadow-xl outline-none focus:outline-none`}
                >
                  <img
                    src={cat.img}
                    alt=""
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/45 to-transparent" />
                  <span className="relative text-[13px] font-semibold text-text-primary leading-tight group-hover:text-accent transition-colors">
                    {cat.name}
                  </span>
                  <span className="relative text-[10px] text-text-secondary font-mono uppercase tracking-wider flex items-center gap-1">
                    Explore
                    <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
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
        <div className="space-y-8 animate-fade-up">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Results for <span className="text-accent">&quot;{query}&quot;</span>
            </h2>
            <span className="text-xs text-text-muted font-mono">{tracks.length} tracks</span>
          </div>

          {/* DEDICATED ARTIST GUI CARD (When artist is found) */}
          {artist && (
            <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-surface via-surface/90 to-surface-hover/60 border border-border-subtle hover:border-accent/50 transition-all shadow-xl group overflow-hidden">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  {/* Circular Artist Avatar with Gold Glow */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shrink-0 ring-2 ring-accent/30 group-hover:ring-accent/80 transition-all shadow-2xl bg-sidebar">
                    {artist.thumbnail ? (
                      <img
                        src={artist.thumbnail}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-elevated text-accent font-bold text-2xl">
                        {artist.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
                  </div>

                  {/* Artist Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/25 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Artist
                      </span>
                      {artist.subscribers && (
                        <span className="text-[11px] text-text-muted font-mono">{artist.subscribers}</span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight truncate group-hover:text-accent transition-colors">
                      {artist.name}
                    </h3>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                      {artist.subtitle || 'Verified Music Artist'}
                    </p>
                  </div>
                </div>

                {/* Direct Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                  {topResult && (
                    <button
                      type="button"
                      onClick={() => playTrack(topResult)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-[#101114] text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#C9A94D]/25 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play Top Song
                    </button>
                  )}
                  <Link
                    href={`/artist?id=${encodeURIComponent(artist.id)}`}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle hover:border-accent/50 text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-all group/btn"
                  >
                    <span>View Artist</span>
                    <ChevronRight className="w-3.5 h-3.5 text-accent group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {tracks.length === 0 && !artist ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-surface border border-border-subtle flex items-center justify-center">
                <Disc className="w-6 h-6 text-text-muted" />
              </div>
              <p className="text-sm font-semibold text-text-primary">No matching songs found</p>
              <p className="text-xs text-text-secondary">
                Try different keywords or check the artist spelling.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Result + Songs 2-Column Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Top Result Card (5 Cols) */}
                {topResult && (
                  <div className="lg:col-span-5 space-y-2">
                    <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                      Top Result
                    </span>
                    <div
                      onClick={() => playTrack(topResult)}
                      className="group relative p-5 rounded-2xl bg-surface/70 hover:bg-surface-hover border border-border-subtle hover:border-border-hover transition-all cursor-pointer flex flex-col justify-between h-64 select-none shadow-xl hover:shadow-black/50"
                    >
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-lg bg-sidebar ring-1 ring-border-subtle">
                        <CoverImage
                          src={topResult.thumbnail}
                          alt={topResult.title}
                          size="md"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="min-w-0 pr-14">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent inline-block mb-1.5">
                          Song
                        </span>
                        <h3 className="text-lg font-bold text-text-primary truncate group-hover:text-accent transition-colors">
                          {topResult.title}
                        </h3>
                        <p className="text-xs text-text-secondary truncate mt-0.5">
                          {topResult.artist}
                          {topResult.duration > 0 && (
                            <span className="text-text-muted font-mono">
                              {' · '}{Math.floor(topResult.duration / 60)}:{String(topResult.duration % 60).padStart(2, '0')}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Play Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(topResult);
                        }}
                        aria-label={`Play ${topResult.title}`}
                        className="absolute bottom-5 right-5 w-12 h-12 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-xl shadow-[#C9A94D]/25 hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                      >
                        <Play className="w-5 h-5 fill-current translate-x-0.5" />
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
