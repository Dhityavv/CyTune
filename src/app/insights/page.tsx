'use client';

import { useMemo } from 'react';
import { BarChart2, Disc, Play, Clock, Flame, Music, Heart, Headphones, Sparkles, Lock } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import CoverImage from '@/components/CoverImage';

function formatDuration(seconds: number): string {
  if (!seconds) return '0 min';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function ListeningInsightsPage() {
  const user = useAuthStore((s) => s.user);

  const history = useLiveQuery(async () => {
    if (!user) return [];
    return await db.history.where('userId').equals(user.id).reverse().sortBy('playedAt');
  }, [user?.id]);

  const likedTracks = useLiveQuery(async () => {
    if (!user) return [];
    const all = await db.likedTracks.toArray();
    return all.filter((t) => !t.userId || t.userId === user.id);
  }, [user?.id]);

  const playlists = useLiveQuery(async () => {
    if (!user) return [];
    const all = await db.playlists.toArray();
    return all.filter((p) => !p.userId || p.userId === user.id);
  }, [user?.id]);

  const playTrack = usePlayerStore((s) => s.playTrack);

  // Compute top songs from history
  const { topSongs, topArtists, totalListeningSeconds } = useMemo(() => {
    if (!history || history.length === 0) {
      return { topSongs: [], topArtists: [], totalListeningSeconds: 0 };
    }

    const songCountMap = new Map<string, { track: any; count: number }>();
    const artistCountMap = new Map<string, number>();
    let totalSecs = 0;

    for (const h of history) {
      const t = h.track;
      if (!t) continue;
      totalSecs += t.duration || 180;

      // Track count
      const existingSong = songCountMap.get(t.id);
      if (existingSong) {
        existingSong.count += 1;
      } else {
        songCountMap.set(t.id, { track: t, count: 1 });
      }

      // Artist count
      if (t.artist) {
        artistCountMap.set(t.artist, (artistCountMap.get(t.artist) || 0) + 1);
      }
    }

    const sortedSongs = Array.from(songCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const sortedArtists = Array.from(artistCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    return {
      topSongs: sortedSongs,
      topArtists: sortedArtists,
      totalListeningSeconds: totalSecs,
    };
  }, [history]);

  return (
    <div className="space-y-8 pb-24 max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-surface/70 border border-border-subtle p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />

        <div className="space-y-2 z-10 relative">
          <span className="text-[10px] font-bold text-accent uppercase tracking-[0.16em]">
            Analytics & Habits
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Listening Insights
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
            Your personalized listening habits calculated strictly from on-device playback telemetry. No private data leaves your browser.
          </p>
        </div>
      </div>

      {!user && (
        <div className="p-5 sm:p-6 rounded-3xl bg-accent/10 border border-accent/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Mode Tamu: Analitik Akun Belum Tersimpan</h3>
              <p className="text-xs text-text-secondary mt-0.5 max-w-lg">
                Masuk dengan akun Google, GitHub, Discord, atau Email Anda untuk mencatat total waktu mendengarkan musik, artis teratas, dan kebiasaan mendengar Anda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => useAuthModalStore.getState().open('Masuk untuk mulai mencatat riwayat dan analitik musik Anda!')}
            className="px-6 py-2.5 rounded-full bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-md shadow-[#C9A94D]/25 transition-all shrink-0 cursor-pointer"
          >
            Masuk Akun Sekarang
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 rounded-2xl bg-surface/60 border border-border-subtle shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
            <Clock className="w-4 h-4 text-accent" />
            <span>Time Streamed</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary mt-2 font-mono">
            {formatDuration(totalListeningSeconds)}
          </p>
          <span className="text-[10px] text-text-muted">Estimated from history</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface/60 border border-border-subtle shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
            <Headphones className="w-4 h-4 text-accent" />
            <span>Tracks Played</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary mt-2 font-mono">
            {history?.length || 0}
          </p>
          <span className="text-[10px] text-text-muted">Verified play events</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface/60 border border-border-subtle shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
            <Heart className="w-4 h-4 text-accent" />
            <span>Liked Songs</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary mt-2 font-mono">
            {likedTracks?.length || 0}
          </p>
          <span className="text-[10px] text-text-muted">Curated favorites</span>
        </div>

        <div className="p-4 rounded-2xl bg-surface/60 border border-border-subtle shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
            <Disc className="w-4 h-4 text-accent" />
            <span>Playlists</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-text-primary mt-2 font-mono">
            {playlists?.length || 0}
          </p>
          <span className="text-[10px] text-text-muted">Custom collections</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Most Played Songs (Left 2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-surface/50 border border-border-subtle shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent" />
              <span>Top Songs</span>
            </h2>
            <span className="text-[10px] font-mono text-text-muted">Ranked by play frequency</span>
          </div>

          {topSongs.length > 0 ? (
            <div className="space-y-1.5">
              {topSongs.map(({ track, count }, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-surface/60 hover:bg-surface-hover border border-border-subtle cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-accent w-5 text-center">
                      #{idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-sidebar">
                      <CoverImage src={track.thumbnail} alt={track.title} size="sm" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                        {track.title}
                      </p>
                      <p className="text-[11px] text-text-secondary truncate">{track.artist}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-text-muted shrink-0 pl-2">
                    {count} {count === 1 ? 'play' : 'plays'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-text-muted">
              Stream songs to build your personalized top tracks leaderboard.
            </div>
          )}
        </div>

        {/* Top Artists (Right col) */}
        <div className="p-6 rounded-3xl bg-surface/50 border border-border-subtle shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Top Artists</span>
            </h2>
          </div>

          {topArtists.length > 0 ? (
            <div className="space-y-2">
              {topArtists.map(({ name, count }, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-surface/60 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-[11px] font-bold text-text-muted w-4">
                      {idx + 1}.
                    </span>
                    <span className="font-semibold text-text-primary truncate">{name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-accent shrink-0">
                    {count} plays
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-text-muted">
              No artist data recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
