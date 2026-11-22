'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Play, Radio } from 'lucide-react';
import { Track } from '@/types/music';
import CoverImage from '@/components/CoverImage';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import TrackCard from '@/components/TrackCard';
import TrackRow, { TrackTableHeader } from '@/components/TrackRow';
import { useRouter } from 'next/navigation';

interface Section {
  title: string;
  tracks?: Track[];
  items?: Track[];
}

const GENRE_CATEGORIES = [
  { name: 'Late Night R&B', query: 'late night rb songs', border: 'border-t-[#7775A8]', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=70' },
  { name: 'Indie & Bedroom Pop', query: 'indie bedroom pop hits', border: 'border-t-[#C9A94D]', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=70' },
  { name: 'Lofi Chill Lounge', query: 'lofi hip hop chill beats', border: 'border-t-[#315B55]', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=70' },
  { name: 'Hits Indonesia', query: 'top hits indonesia 2026', border: 'border-t-[#4E8A82]', img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=70' },
  { name: 'Atmospheric Synthwave', query: 'retro synthwave chill', border: 'border-t-[#6E6A9E]', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=70' },
  { name: 'Acoustic Soul', query: 'acoustic folk songs', border: 'border-t-[#A3925C]', img: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=70' },
];

const MOOD_CATEGORIES = [
  { mood: 'Focus', query: 'deep focus ambient electronic study', icon: '🧠', desc: 'Flow state acoustics & minimal beats' },
  { mood: 'Chill', query: 'chill lo-fi beats aesthetic study lounge', icon: '☕', desc: 'Laid-back vibes & warm textures' },
  { mood: 'Night Drive', query: 'night drive synthwave late night r&b', icon: '🌃', desc: 'Cinematic basslines & neon atmosphere' },
  { mood: 'Energetic', query: 'high energy workout electronic dance', icon: '⚡', desc: 'Uplifting rhythms & driving percussion' },
  { mood: 'Relax', query: 'peaceful relaxing acoustic piano strings', icon: '🌿', desc: 'Gentle melodies for calm decompression' },
  { mood: 'Rainy Day', query: 'rainy day acoustic indie bedroom pop', icon: '🌧️', desc: 'Cozy indie ballads & soft vocals' },
];

const TRENDING_SOURCES = [
  { query: 'spotify top 50 global', label: 'Global Top 50' },
  { query: 'lagu indonesia terbaru 2026', label: 'new Indonesian releases' },
  { query: 'spotify top 50 indonesia', label: 'Indonesian Top 50' },
  { query: 'spotify viral 50 global', label: 'viral hits worldwide' },
  { query: 'lagu indonesia populer', label: 'Indonesian favourites' },
  { query: 'uk top 40 singles this week', label: 'UK Top 40' },
];

const SPOTLIGHT_ROTATION_MS = 5 * 60 * 1000;

// A new chart song every 5 minutes; the source rotates with it.
function trendingWindow() {
  return Math.floor(Date.now() / SPOTLIGHT_ROTATION_MS);
}

// Refresh-proof cache: a reload paints the last feed instantly, then revalidates.
const HOME_CACHE_KEY = 'cytune:home:v2';
const HOME_CACHE_TTL = 15 * 60 * 1000;

interface SpotlightSnapshot {
  win: number;
  track: Track;
  queue: Track[];
}

interface HomeCache {
  at: number;
  sections: Section[];
  spotlight: SpotlightSnapshot | null;
}

let homeCache: HomeCache | null = null;

function readHomeCache(): HomeCache | null {
  if (homeCache) return homeCache;
  try {
    const raw = window.sessionStorage.getItem(HOME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HomeCache;
    if (!parsed || !Array.isArray(parsed.sections)) return null;
    if (Date.now() - parsed.at > HOME_CACHE_TTL) return null;
    homeCache = parsed;
    return parsed;
  } catch {
    return null;
  }
}

function writeHomeCache(patch: Partial<Omit<HomeCache, 'at'>>) {
  const base: HomeCache = homeCache ?? { at: 0, sections: [], spotlight: null };
  homeCache = { ...base, ...patch, at: Date.now() };
  try {
    window.sessionStorage.setItem(HOME_CACHE_KEY, JSON.stringify(homeCache));
  } catch {
    // storage blocked or full - cache is best-effort
  }
}

const emptySubscribe = () => () => {};
function getGreetingSnapshot() {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}
function getServerGreeting() {
  return 'Welcome';
}

export default function Home() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const greeting = useSyncExternalStore(emptySubscribe, getGreetingSnapshot, getServerGreeting);
  const reduceMotion = useReducedMotion();

  const playTrack = usePlayerStore((s) => s.playTrack);
  const router = useRouter();

  const recentHistory = useLiveQuery(async () => {
    const raw = await db.history.orderBy('playedAt').reverse().toArray();
    const seen = new Set<string>();
    const historyItems = raw.filter((h) => {
      if (seen.has(h.trackId)) return false;
      seen.add(h.trackId);
      return true;
    }).slice(0, 10);
    return historyItems.map((h) => h.track);
  }, []);

  // Trending spotlight: rotates across movies, reality shows and bands every 5 minutes
  const [spotlightTrack, setSpotlightTrack] = useState<Track | null>(null);
  const [spotlightQueue, setSpotlightQueue] = useState<Track[]>([]);
  const [spotlightLabel, setSpotlightLabel] = useState(TRENDING_SOURCES[0].label);

  useEffect(() => {
    let cancelled = false;
    const startWin = trendingWindow();
    let loadedWin = -1;

    // 1. Paint whatever we already had from the previous visit, instantly.
    const cached = readHomeCache();
    if (cached) {
      if (cached.sections.length > 0) {
        setSections(cached.sections);
        setLoading(false);
      }
      if (cached.spotlight) {
        const { win, track, queue } = cached.spotlight;
        setSpotlightTrack(track);
        setSpotlightQueue(queue);
        setSpotlightLabel(TRENDING_SOURCES[win % TRENDING_SOURCES.length].label);
        if (win === startWin) loadedWin = startWin;
      }
    }

    async function loadSections() {
      try {
        const res = await fetch('/api/explore');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const next: Section[] = Array.isArray(data.sections) ? data.sections : [];
        if (next.length > 0) {
          setSections(next);
          writeHomeCache({ sections: next });
        }
      } catch (err) {
        console.error('Failed to load explore data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function loadSpotlight(win: number) {
      const source = TRENDING_SOURCES[win % TRENDING_SOURCES.length];
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(source.query)}`);
        if (!res.ok) return;
        const data = await res.json();
        const tracks: Track[] = Array.isArray(data.tracks) ? data.tracks : [];
        if (cancelled || tracks.length === 0) return;
        // Charts picks should be real songs, not karaoke, remixes or compilation uploads.
        const junk =
          /top hits|best of|compilation|playlist|mix \d|karaoke|instrumental|\bcover\b|remix|reverb|8d|nightcore|sped up|slowed|lyrics/i;
        const pool = tracks.filter((t) => !junk.test(t.title) && t.duration >= 120 && t.duration <= 420);
        const list = (pool.length > 0 ? pool : tracks).slice(0, 10);
        // Walk the chart instead of always showing its first track.
        const pick = list[win % list.length];
        loadedWin = win;
        setSpotlightTrack((prev) => (prev?.id === pick.id ? prev : pick));
        setSpotlightQueue(list);
        setSpotlightLabel(source.label);
        writeHomeCache({ spotlight: { win, track: pick, queue: list } });
      } catch {
        // keep whatever is already on screen
      }
    }

    loadSections();
    if (loadedWin !== startWin) loadSpotlight(startWin);

    // Check often, but only refetch when the 5-minute window actually rolls over.
    const sync = () => {
      const win = trendingWindow();
      if (win !== loadedWin) loadSpotlight(win);
    };
    const timer = window.setInterval(sync, 20 * 1000);
    // Background tabs throttle timers; catch up as soon as the page is visible again.
    document.addEventListener('visibilitychange', sync);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto">
      {/* 1. Header & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            {greeting}
          </h1>
          <p className="text-[13px] text-text-secondary mt-0.5">
            Discover curated releases, trending hits, and intelligent listening radio.
          </p>
        </div>

        {/* (filter pills removed - non-functional; re-add when filtering is implemented) */}
      </div>

      {/* 2. Trending Now (Featured Release) */}
      {spotlightTrack && (
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl overflow-hidden bg-surface/70 border border-border-subtle p-5 sm:p-6 shadow-2xl backdrop-blur-sm group"
        >
          {/* Subtle Ambient Radial from Track Art */}
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
            }}
          />

          {/* Light sweep replays whenever the spotlight switches track */}
          {!reduceMotion && (
            <motion.div
              key={`sweep-${spotlightTrack.id}`}
              initial={{ x: '-120%', opacity: 0 }}
              animate={{ x: '320%', opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
            />
          )}

          <div className="relative flex flex-col md:flex-row items-center gap-5 sm:gap-7">
            {/* High-Res Featured Artwork — layered editorial stack, crossfades on track change */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex-shrink-0">
              <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl bg-surface border border-border-subtle rotate-3 pointer-events-none" />
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-sidebar border border-border-subtle animate-float">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={spotlightTrack.id}
                    className="absolute inset-0"
                    initial={reduceMotion ? false : { opacity: 0, scale: 1.08, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <CoverImage
                      src={spotlightTrack.thumbnail}
                      alt={spotlightTrack.title}
                      size="lg"
                      priority
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Chart pick chip */}
              <div className="absolute -top-2 -left-2 z-10 px-2.5 py-1 rounded-full bg-accent text-[#101114] text-[9px] font-bold uppercase tracking-[0.12em] shadow-lg shadow-[#C9A94D]/30">
                Chart Pick
              </div>
            </div>

            {/* Spotlight Metadata & Actions */}
            <div className="flex flex-col justify-center flex-1 min-w-0 text-center md:text-left space-y-3 w-full">
              <motion.div
                key={`meta-${spotlightTrack.id}`}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-2.5"
              >
                <span className="inline-flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold text-accent uppercase tracking-[0.16em]">
                  <span className="relative flex w-1.5 h-1.5">
                    {!reduceMotion && (
                      <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-60" />
                    )}
                    <span className="relative w-1.5 h-1.5 rounded-full bg-accent" />
                  </span>
                  Trending now · {spotlightLabel}
                </span>

                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight line-clamp-2">
                  {spotlightTrack.title}
                </h2>

                <p className="text-[13px] text-text-secondary flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-0.5">
                  <span className="text-text-primary font-semibold">{spotlightTrack.artist}</span>
                  {spotlightTrack.album && (
                    <>
                      <span className="text-text-muted">·</span>
                      <span className="truncate max-w-[220px]">{spotlightTrack.album}</span>
                    </>
                  )}
                  {spotlightTrack.duration > 0 && (
                    <>
                      <span className="text-text-muted">·</span>
                      <span className="font-mono text-text-muted text-[11px]">
                        {Math.floor(spotlightTrack.duration / 60)}:{String(spotlightTrack.duration % 60).padStart(2, '0')}
                      </span>
                    </>
                  )}
                </p>
              </motion.div>

              <div className="pt-1 flex items-center justify-center md:justify-start gap-3">
                <button
                  onClick={() => playTrack(spotlightTrack)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs transition-all shadow-lg shadow-[#C9A94D]/25 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Now</span>
                </button>

                <button
                  onClick={() => {
                    if (spotlightQueue.length > 0) {
                      const shuffled = [...spotlightQueue].sort(() => Math.random() - 0.5);
                      playTrack(shuffled[0]);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle hover:border-border-hover font-medium text-xs transition-all active:scale-95"
                >
                  <Radio className="w-3.5 h-3.5 text-accent" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* 3. Recently Played (If exists) */}
      {recentHistory && recentHistory.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-3.5"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
              Recently Played
            </h3>
            <Link
              href="/library?tab=history"
              className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="relative">
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory ">
              {recentHistory.map((track, idx) => (
                <div key={`rec-${track.id}-${idx}`} className="w-[170px] sm:w-[190px] shrink-0 snap-start">
                  <TrackCard track={track} />
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-canvas to-transparent" />
          </div>
        </motion.section>
      )}

      {/* 3b. Interactive Mood Selector */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-3.5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
            Curated Mood Selector
          </h3>
          <span className="text-xs text-accent font-semibold uppercase tracking-wider">
            Atmosphere
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
          {MOOD_CATEGORIES.map((m) => (
            <button
              key={m.mood}
              type="button"
              onClick={() => router.push(`/search?q=${encodeURIComponent(m.query)}`)}
              className="w-[160px] sm:w-[180px] shrink-0 snap-start p-4 rounded-2xl bg-surface/70 hover:bg-surface-hover border border-border-subtle hover:border-accent/40 shadow-md hover:shadow-xl transition-all duration-200 text-left group flex flex-col justify-between h-32 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{m.icon}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent opacity-80 group-hover:opacity-100">
                  Mood
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                  {m.mood}
                </p>
                <p className="text-[10px] text-text-secondary line-clamp-1 mt-0.5">
                  {m.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </motion.section>

      {/* 4. Browse by Vibe & Mood (Visual Variation) */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-3.5"
      >
        <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight">
          Browse by Vibe &amp; Mood
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {GENRE_CATEGORIES.map((genre) => (
              <button
                key={genre.name}
                onClick={() => router.push(`/search?q=${encodeURIComponent(genre.query)}`)}
                className={`relative overflow-hidden p-4 rounded-2xl border border-border-subtle ${genre.border} border-t-2 hover:border-accent/50 transition-all duration-200 flex flex-col justify-between h-32 group shadow-md hover:shadow-xl text-left w-full hover:-translate-y-0.5`}
            >
              <img
                src={genre.img}
                alt=""
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas/95 via-canvas/45 to-transparent" />
              <span className="relative text-[13px] font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
                {genre.name}
              </span>
              <span className="relative text-[10px] text-text-secondary uppercase font-mono tracking-wider flex items-center gap-1">
                Explore
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
              </span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* 5. Editorial Explore Sections (Cards & Rows) */}
      {loading ? (
        <div className="space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-44 bg-surface rounded-lg animate-pulse" />
              <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="w-[180px] shrink-0 aspect-square bg-surface/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        sections.map((section, sIdx) => {
          const trackList = section.tracks || section.items || [];
          if (trackList.length === 0) return null;

          // Alternate layout: Section 1 is a track row list with header (Quick Picks), others are grid cards!
          if (sIdx === 1) {
            return (
              <section key={sIdx} className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight flex items-baseline gap-2.5">
                    <span className="text-[11px] font-mono text-accent/80">{String(sIdx + 1).padStart(2, '0')}</span>
                    {section.title}
                  </h3>
                  <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                    Quick Picks
                  </span>
                </div>

                <div className="bg-surface/40 p-3 rounded-2xl border border-border-subtle shadow-sm">
                  <TrackTableHeader />
                  <div className="space-y-1">
                    {trackList.slice(0, 8).map((track, idx) => (
                      <TrackRow
                        key={track.id}
                        track={track}
                        index={idx}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          // Horizontal single-row scrollable section (4-5 visible, scroll to all)
          return (
            <motion.section
              key={sIdx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.45, delay: sIdx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight flex items-baseline gap-2.5">
                  <span className="text-[11px] font-mono text-accent/80">{String(sIdx + 1).padStart(2, '0')}</span>
                  {section.title}
                </h3>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">
                  {trackList.length} tracks
                </span>
              </div>

              <div className="relative">
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory ">
                  {trackList.map((track) => (
                    <div key={track.id} className="w-[170px] sm:w-[190px] md:w-[200px] shrink-0 snap-start">
                      <TrackCard track={track} />
                    </div>
                  ))}
                </div>
                <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-canvas to-transparent" />
              </div>
            </motion.section>
          );
        })
      )}
    </div>
  );
}
