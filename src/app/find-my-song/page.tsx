'use client';

import { useState } from 'react';
import {
  Sparkles,
  Search,
  Play,
  Music,
  HelpCircle,
  Loader2,
  Mic,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import CoverImage from '@/components/CoverImage';

interface MatchItem {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  thumbnail?: string;
  snippet?: string;
}

const POPULAR_EXAMPLES = [
  'terimalah lagu ini dari orang biasa',
  'sudah terlalu lama sendiri',
  'cause baby you’re a firework',
  'karna kamu cantik kan kuberi',
  'i wanna be yours',
  'takkan pernah ada yang lain',
];

export default function FindMySongPage() {
  const [lyricQuery, setLyricQuery] = useState('');
  const [isSearchingLyrics, setIsSearchingLyrics] = useState(false);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState('');

  const playTrack = usePlayerStore((s) => s.playTrack);

  const searchWithText = async (text: string) => {
    if (!text.trim()) return;

    setIsSearchingLyrics(true);
    setHasSearched(true);
    setMatches([]);
    setSearchError('');

    try {
      const formData = new FormData();
      formData.append('mode', 'lyrics');
      formData.append('query', text.trim());

      const res = await fetch('/api/recognize', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`Recognition failed with status ${res.status}`);
      const data = await res.json();
      setMatches(Array.isArray(data.matches) ? data.matches : []);
    } catch (error) {
      console.error('Lyric search failed:', error);
      setSearchError('Pencarian lirik sedang tidak tersedia. Periksa koneksi lalu coba lagi.');
    } finally {
      setIsSearchingLyrics(false);
    }
  };

  const handleLyricSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    searchWithText(lyricQuery);
  };

  const playMatch = async (match: MatchItem) => {
    if (!match.id.startsWith('search_')) {
      playTrack({
        id: match.id,
        title: match.title,
        artist: match.artist,
        album: match.album,
        duration: match.duration || 180,
        thumbnail: match.thumbnail || '',
      });
      return;
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(match.title + ' ' + match.artist)}`);
      if (!res.ok) throw new Error(`Track lookup failed with status ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.tracks) && data.tracks.length > 0) {
        playTrack(data.tracks[0]);
      } else {
        setSearchError('Lagu ditemukan, tetapi audionya belum tersedia.');
      }
    } catch (error) {
      console.error('Track lookup failed:', error);
      setSearchError('Audio lagu tidak dapat dimuat. Silakan coba lagi.');
    }
  };

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto select-none">
      {/* Header Spotlight */}
      <div className="relative rounded-3xl overflow-hidden bg-surface/70 border border-border-subtle p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />

        <div className="space-y-2 z-10 relative">
          <span className="text-[10px] font-bold text-accent uppercase tracking-[0.16em] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Find Song by Lyrics
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Find My Song
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl">
            Lupa judul atau penyanyi? Ketik beberapa kata lirik lagu yang kamu ingat di bawah ini. Sistem langsung mencari dan mencocokkan lagunya secara instan.
          </p>
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="space-y-4">
        <form onSubmit={handleLyricSearch} className="space-y-3">
          <div className="relative flex items-center bg-surface border border-border-subtle focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30 rounded-2xl transition-all shadow-lg overflow-hidden">
            <Search className="w-5 h-5 text-text-muted absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={lyricQuery}
              onChange={(e) => setLyricQuery(e.target.value)}
              placeholder="Ketik potongan lirik (misal: 'terimalah lagu ini dari orang biasa')..."
              autoFocus
              className="w-full pl-12 pr-28 py-4 bg-transparent text-text-primary placeholder:text-text-muted text-sm sm:text-base outline-none border-none ring-0 focus:ring-0"
            />
            <button
              type="submit"
              disabled={isSearchingLyrics || !lyricQuery.trim()}
              className="absolute right-2.5 px-5 py-2.5 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              {isSearchingLyrics ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Cari Lagu</span>
            </button>
          </div>
        </form>

        {/* Quick Example Chips */}
        {!hasSearched && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
              Contoh Lirik yang Sering Dicari:
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_EXAMPLES.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setLyricQuery(item);
                    searchWithText(item);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle hover:border-accent/40 text-xs text-text-secondary hover:text-text-primary transition-all text-left"
                >
                  &ldquo;{item}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {searchError && !isSearchingLyrics && (
          <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-red-300">{searchError}</p>
            <button
              type="button"
              onClick={() => searchWithText(lyricQuery)}
              className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-xs font-semibold text-text-primary"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Results List */}
        {isSearchingLyrics ? (
          <div className="py-20 flex flex-col items-center justify-center text-text-muted gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <p className="text-xs">Mencocokkan dengan jutaan database lirik dunia & YouTube...</p>
          </div>
        ) : searchError ? null : matches.length > 0 ? (
          <div className="space-y-3 pt-4">
            <h2 className="text-sm font-bold text-text-primary">
              Lagu yang Ditemukan ({matches.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {matches.map((item, idx) => (
                <button
                  type="button"
                  key={`${item.id}-${idx}`}
                  onClick={() => playMatch(item)}
                  className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl bg-surface/70 hover:bg-surface-hover border border-border-subtle hover:border-accent/40 cursor-pointer transition-all shadow-md group text-left"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-sidebar border border-border-subtle">
                    {item.thumbnail ? (
                      <CoverImage src={item.thumbnail} alt={item.title} size="sm" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted bg-surface">
                        <Music className="w-5 h-5" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-5 h-5 text-accent fill-current translate-x-0.5" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-bold text-text-primary truncate group-hover:text-accent transition-colors">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-secondary truncate">{item.artist}</p>
                    {item.snippet && (
                      <p className="text-[11px] text-text-muted line-clamp-2 italic leading-relaxed pt-0.5">
                        &ldquo;{item.snippet}&rdquo;
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : hasSearched ? (
          <div className="py-20 text-center space-y-3 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-text-muted mx-auto">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-text-primary">Tidak Ada Lagu yang Cocok</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Coba gunakan potongan kata lirik yang lain atau periksa ejaan katanya.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
