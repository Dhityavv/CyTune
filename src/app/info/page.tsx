'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Heart, ListMusic, History, Coffee, Gift } from 'lucide-react';

export default function InfoPage() {
  const favorites = useLiveQuery(() => db.likedTracks.count(), [], 0);
  const playlists = useLiveQuery(() => db.playlists.count(), [], 0);
  const historyCount = useLiveQuery(() => db.history.count(), [], 0);

  return (
    <div className="space-y-8 pb-24 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">Info</h1>
        <p className="text-[13px] text-text-secondary mt-0.5">
          About OrbitTune, your listening stats, and support.
        </p>
      </div>

      {/* About */}
      <section className="rounded-2xl bg-surface border border-border-subtle p-5 space-y-2">
        <h2 className="text-base font-bold text-text-primary">About OrbitTune</h2>
        <p className="text-[13px] text-text-secondary leading-relaxed">
          OrbitTune is a modern, ad-free music streaming web app powered by YouTube Music catalog.
          It features synced karaoke lyrics, smart autoplay, local library (IndexedDB), and CSV
          playlist import/export. Built with Next.js 16, Tailwind CSS v4, and Zustand.
        </p>
        <p className="text-[11px] text-text-muted font-mono">Version 1.0</p>
        <a
          href="https://dhitya-space.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[12px] text-accent hover:text-accent-hover transition-colors font-semibold"
        >
          Visit my website →
        </a>
      </section>

      {/* Stats */}
      <section className="rounded-2xl bg-surface border border-border-subtle p-5 space-y-3">
        <h2 className="text-base font-bold text-text-primary">Your Listening Stats</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-sidebar border border-border-subtle p-3 text-center">
            <Heart className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{favorites}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Liked</p>
          </div>
          <div className="rounded-xl bg-sidebar border border-border-subtle p-3 text-center">
            <ListMusic className="w-4 h-4 text-accent mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{playlists}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Playlists</p>
          </div>
          <div className="rounded-xl bg-sidebar border border-border-subtle p-3 text-center">
            <History className="w-4 h-4 text-accent-hover mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{historyCount}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Plays</p>
          </div>
        </div>
      </section>

      {/* Support / Traktir */}
      <section className="rounded-2xl bg-surface border border-border-subtle p-5 space-y-3">
        <h2 className="text-base font-bold text-text-primary">Support the Project</h2>
        <p className="text-[13px] text-text-secondary">
          If you enjoy OrbitTune, consider buying me a coffee to keep it running.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://saweria.co/dhityavv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-black text-xs font-semibold transition-all shadow-md shadow-accent/20"
          >
            <Coffee className="w-4 h-4" />
            <span>Traktir via Saweria</span>
          </a>
          <a
            href="https://ko-fi.com/dhityavv"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-text-primary text-xs font-semibold border border-border-hover transition-all"
          >
            <Gift className="w-4 h-4" />
            <span>Ko-fi</span>
          </a>
        </div>
      </section>


    </div>
  );
}
