'use client';

import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  Heart,
  ListMusic,
  History,
  Coffee,
  Gift,
  ArrowLeft,
  Disc,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Code2,
} from 'lucide-react';

export default function InfoPage() {
  const router = useRouter();
  const favorites = useLiveQuery(() => db.likedTracks.count(), [], 0);
  const playlists = useLiveQuery(() => db.playlists.count(), [], 0);
  const historyCount = useLiveQuery(() => db.history.count(), [], 0);

  return (
    <div className="space-y-8 pb-28 max-w-3xl mx-auto select-none">
      {/* Top Navigation & Brand Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors py-1.5 px-3 rounded-xl hover:bg-surface border border-transparent hover:border-border-subtle"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-[11px] font-mono text-accent uppercase font-bold tracking-wider">
          System Info
        </span>
      </div>

      {/* Main Title Section */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-[#101114] shadow-xl shadow-[#C9A94D]/25 ring-1 ring-white/10 shrink-0">
          <Disc className="w-7 h-7 animate-[spin_10s_linear_infinite]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            OrbitTune — Hi-Fi Stream
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            An editorial, high-resolution music listening and discovery web experience.
          </p>
        </div>
      </div>

      {/* About OrbitTune */}
      <section className="rounded-3xl bg-surface/70 border border-border-subtle p-6 space-y-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>About OrbitTune</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-mono font-bold">
            v3.0.0 Stable
          </span>
        </div>
        <p className="text-xs sm:text-[13px] text-text-secondary leading-relaxed">
          OrbitTune is an ad-free, high-fidelity music streaming application designed around deep
          immersion and fluid typography. It features real-time synchronized karaoke lyrics, 60fps
          hardware-accelerated audio progress timelines, seamless multi-room listening, local offline
          caching with Dexie.js (IndexedDB), and interactive music minigames.
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <a
            href="https://dhitya-space.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover font-semibold transition-colors"
          >
            <span>Visit Developer Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* User Stats Card */}
      <section className="rounded-3xl bg-surface/70 border border-border-subtle p-6 space-y-4 backdrop-blur-md shadow-lg">
        <h2 className="text-base font-bold text-text-primary">Your Local Library Statistics</h2>
        <div className="grid grid-cols-3 gap-3.5">
          <div className="rounded-2xl bg-sidebar/80 border border-border-subtle p-4 text-center space-y-1">
            <Heart className="w-4 h-4 text-accent mx-auto fill-accent/20" />
            <p className="text-xl font-bold text-text-primary">{favorites}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Liked Songs</p>
          </div>
          <div className="rounded-2xl bg-sidebar/80 border border-border-subtle p-4 text-center space-y-1">
            <ListMusic className="w-4 h-4 text-accent mx-auto" />
            <p className="text-xl font-bold text-text-primary">{playlists}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Playlists</p>
          </div>
          <div className="rounded-2xl bg-sidebar/80 border border-border-subtle p-4 text-center space-y-1">
            <History className="w-4 h-4 text-accent mx-auto" />
            <p className="text-xl font-bold text-text-primary">{historyCount}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Plays Logged</p>
          </div>
        </div>
      </section>

      {/* Support / Traktir Section */}
      <section className="rounded-3xl bg-surface/70 border border-border-subtle p-6 space-y-4 backdrop-blur-md shadow-lg">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <Coffee className="w-4 h-4 text-accent" />
          <span>Support OrbitTune</span>
        </h2>
        <p className="text-xs sm:text-[13px] text-text-secondary leading-relaxed">
          OrbitTune is maintained as an open, free music streaming project. If you enjoy the sound
          quality and experience, consider supporting ongoing server hosting and domain costs:
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href="https://saweria.co/dhityavv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-[#101114] text-xs font-bold transition-all shadow-lg shadow-[#C9A94D]/25 active:scale-95"
          >
            <Coffee className="w-4 h-4" />
            <span>Traktir via Saweria</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>
          <a
            href="https://ko-fi.com/dhityavv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-text-primary text-xs font-semibold border border-border-subtle hover:border-accent/40 transition-all active:scale-95"
          >
            <Gift className="w-4 h-4 text-accent" />
            <span>Support on Ko-fi</span>
            <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
          </a>
        </div>
      </section>

      {/* Verified Credits & Integrations */}
      <section className="rounded-3xl bg-surface/70 border border-border-subtle p-6 space-y-4 backdrop-blur-md shadow-lg">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Credits & Providers</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-sidebar/70 border border-border-subtle space-y-1">
            <span className="text-[10px] uppercase font-bold text-accent font-mono">Music Stream Catalog</span>
            <p className="font-semibold text-text-primary">YouTube Music Innertube</p>
            <p className="text-[11px] text-text-muted">High-resolution catalog search and audio stream delivery.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-sidebar/70 border border-border-subtle space-y-1">
            <span className="text-[10px] uppercase font-bold text-accent font-mono">Synced Lyrics</span>
            <p className="font-semibold text-text-primary">LRCLIB Open API</p>
            <p className="text-[11px] text-text-muted">Real-time synchronized line-by-line karaoke lyrics engine.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-sidebar/70 border border-border-subtle space-y-1">
            <span className="text-[10px] uppercase font-bold text-accent font-mono">Minigame Audio</span>
            <p className="font-semibold text-text-primary">Apple Music 30s Previews</p>
            <p className="text-[11px] text-text-muted">Authorized 30-second studio audio previews for Guess the Song.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-sidebar/70 border border-border-subtle space-y-1">
            <span className="text-[10px] uppercase font-bold text-accent font-mono">Client Persistence</span>
            <p className="font-semibold text-text-primary">Dexie.js (IndexedDB)</p>
            <p className="text-[11px] text-text-muted">Offline playlists, liked tracks, listening history, and cosmetics.</p>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <div className="text-center text-[11px] text-text-muted space-y-1 pt-2">
        <p className="flex items-center justify-center gap-1.5 font-mono">
          <Code2 className="w-3.5 h-3.5 text-accent" />
          <span>Built with Next.js 16 (Turbopack), Tailwind CSS v4, GSAP & Zustand</span>
        </p>
        <p>© 2026 OrbitTune. All music rights belong to their respective artists and copyright owners.</p>
      </div>
    </div>
  );
}
