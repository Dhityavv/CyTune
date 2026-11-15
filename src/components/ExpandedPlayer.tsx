'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Mic2,
  ListMusic,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import CoverImage from '@/components/CoverImage';
import QueueItem from '@/components/QueueItem';
import { useLiveQuery } from 'dexie-react-hooks';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ExpandedPlayer() {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    queue,
    queueIndex,
    repeatMode,
    isShuffle,
    isExpanded,
    showLyrics,
    lyrics,
    loadingLyrics,
    smartAutoplayEnabled,
    recommendationQueue,
    loadingRecommendations,
    toggleExpanded,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    loadLyricsForCurrent,
    toggleSmartAutoplay,
    fetchSmartRecommendations,
    playRecommendedTrack,
    dismissRecommendation,
    recordFeedback,
    playQueueIndex,
    removeFromQueue,
  } = usePlayerStore();

  const [tabOverride, setTabOverride] = useState<'lyrics' | 'queue' | null>(null);
  const router = useRouter();
  const activeTab = tabOverride ?? (showLyrics ? 'lyrics' : 'queue');
  const setActiveTab = (tab: 'lyrics' | 'queue') => setTabOverride(tab);
  const activeLyricRef = useRef<HTMLDivElement>(null);
  // Close on Escape
  useEffect(() => {
    if (!isExpanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') toggleExpanded(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded, toggleExpanded]);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const isLiked = useLiveQuery(
    async () => {
      if (!currentTrack) return false;
      const found = await db.likedTracks.get(currentTrack.id);
      return !!found;
    },
    [currentTrack?.id],
    false
  );

  const toggleFavorite = async () => {
    if (!currentTrack) return;
    if (isLiked) {
      await db.likedTracks.delete(currentTrack.id);
    } else {
      await db.likedTracks.put({
        ...currentTrack,
        likedAt: Date.now(),
      });
      recordFeedback('liked', currentTrack);
    }
  };

  // Find active lyric index
  let activeLyricIdx = -1;
  if (lyrics?.lines && lyrics.lines.length > 0) {
    for (let i = 0; i < lyrics.lines.length; i++) {
      if (currentTime >= lyrics.lines[i].time) {
        activeLyricIdx = i;
      } else {
        break;
      }
    }
  }

  // Scroll active lyric line into center of the lyrics box only
  // (scrollIntoView would also scroll the whole panel and push the artwork off-screen)
  useEffect(() => {
    const container = lyricsContainerRef.current;
    const el = activeLyricRef.current;
    if (activeTab !== 'lyrics' || !container || !el) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const delta = eRect.top - cRect.top - (cRect.height / 2 - eRect.height / 2);
    container.scrollTo({ top: container.scrollTop + delta, behavior: 'smooth' });
  }, [activeLyricIdx, activeTab]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {isExpanded && currentTrack && (
        <>
          {/* Backdrop */}
          <motion.div
            key="expanded-player-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={toggleExpanded}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        />
        <motion.div
          key="expanded-player-panel"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 32, stiffness: 260 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(92vw,640px)] max-h-[80vh] flex flex-col bg-canvas text-text-primary select-none overflow-hidden rounded-2xl border border-border-subtle shadow-2xl shadow-black/70"
        >
        {/* Soft Ambient Tint */}
        <div
          className="absolute -top-32 left-1/3 w-[600px] h-[500px] rounded-full blur-[160px] opacity-[0.09] pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex-1 text-center">
            <p className="text-[13px] font-semibold text-text-primary truncate">{currentTrack.title}</p>
            <p className="text-[11px] text-text-secondary truncate">{currentTrack.artist}</p>
          </div>

          <button
            onClick={toggleExpanded}
            className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors border border-border-subtle"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Content */}
        <div className="relative z-10 flex-1 min-h-0 flex flex-col overflow-y-auto px-5 py-3 gap-3 max-w-3xl mx-auto w-full">
          {/* Artwork Card — flexes with panel height so lyrics always get room */}
          <div className="relative w-[clamp(120px,26vh,200px)] h-[clamp(120px,26vh,200px)] self-center rounded-2xl overflow-hidden shadow-2xl bg-sidebar border border-border-subtle shrink-0">
            <CoverImage
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              size="xl"
              priority
              className="w-full h-full object-cover"
            />
          </div>

            {/* Title & Artist & Like */}
            <div className="flex items-center justify-between gap-4 mt-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight truncate">
                  {currentTrack.title}
                </h1>
                <p className="text-sm text-text-secondary truncate mt-0.5">
                  {currentTrack.artistId ? (
                    <button
                      onClick={() => { toggleExpanded(); router.push(`/artist?id=${encodeURIComponent(currentTrack.artistId!)}`); }}
                      className="hover:text-accent transition-colors"
                    >
                      {currentTrack.artist}
                    </button>
                  ) : (
                    currentTrack.artist
                  )}
                  {currentTrack.album ? ` • ${currentTrack.album}` : ''}
                </p>
              </div>

              <button
                onClick={toggleFavorite}
                className="p-2.5 rounded-lg hover:bg-surface transition-colors flex-shrink-0"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isLiked ? 'fill-accent text-accent' : 'text-text-muted hover:text-text-primary'
                  }`}
                />
              </button>
            </div>

            {/* Seek Bar */}
            <div className="mt-3">
              <div className="relative h-1.5 bg-surface-hover hover:h-2 rounded-full cursor-pointer group transition-all" onWheel={(e) => { e.preventDefault(); const d = e.deltaY < 0 ? 5 : -5; seekTo(Math.max(0, Math.min(duration || 0, currentTime + d))); }}>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div
                  className="absolute top-0 left-0 h-full bg-accent group-hover:bg-accent-hover rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-accent shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                  style={{ left: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-text-muted mt-1.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-between mt-3 px-3">
              <button
                onClick={toggleShuffle}
                className={`p-2 transition-colors ${
                  isShuffle ? 'text-accent' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={prevTrack}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                title="Previous"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all shadow-[#C9A94D]/25"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                title="Next"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={cycleRepeat}
                className={`p-2 transition-colors ${
                  repeatMode !== 'off' ? 'text-accent' : 'text-text-muted hover:text-text-primary'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3 mt-3 px-4 max-w-xs mx-auto w-full">
              <button onClick={toggleMute} className="text-text-muted hover:text-text-primary transition-colors">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-accent" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <div className="relative flex-1 h-1 bg-surface-hover hover:h-1.5 rounded-full cursor-pointer group transition-all flex items-center" onWheel={(e) => { e.preventDefault(); const d = e.deltaY < 0 ? 0.05 : -0.05; setVolume(Math.max(0, Math.min(1, (isMuted ? 0 : volume) + d))); }}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div
                  className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-text-primary shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                  style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
                />
              </div>
            </div>

          {/* Tab bar (Lyrics / Queue) - placed below controls, above content */}
          <div className="flex items-center justify-center gap-1 bg-surface/60 p-1 rounded-xl border border-border-subtle self-center">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'lyrics'
                  ? 'bg-accent text-[#101114] shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>Lyrics</span>
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'queue'
                  ? 'bg-accent text-[#101114] shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Queue ({queue.length})</span>
            </button>
          </div>

          {/* Lyrics / Queue Panel */}
          <div className="flex-1 min-h-[200px] flex flex-col bg-surface/50 rounded-2xl border border-border-subtle p-4 overflow-hidden">
            {activeTab === 'lyrics' ? (
              <div
                ref={lyricsContainerRef}
                className="flex-1 overflow-y-auto pr-2 space-y-6 pb-2 text-center lg:text-left select-none"
              >
                {loadingLyrics ? (
                  <div className="h-full flex flex-col items-center justify-center text-text-secondary gap-2">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs">Loading lyrics from LRCLIB...</p>
                  </div>
                ) : lyrics?.lines && lyrics.lines.length > 0 ? (
                  lyrics.lines.map((line: { time: number; text: string }, idx: number) => {
                    const isActive = idx === activeLyricIdx;
                    return (
                      <div
                        key={idx}
                        ref={isActive ? activeLyricRef : null}
                        onClick={() => seekTo(line.time)}
                        className={`cursor-pointer transition-all duration-300 ${
                          isActive
                            ? 'text-text-primary text-xl sm:text-2xl font-bold drop-shadow-[0_0_12px_rgba(201,169,77,0.45)]'
                            : 'text-text-muted hover:text-text-secondary text-base sm:text-lg font-medium'
                        }`}
                      >
                        {line.text}
                      </div>
                    );
                  })
                ) : lyrics?.plainLyrics ? (
                  <div className="whitespace-pre-line text-sm text-text-primary leading-relaxed">
                    {lyrics.plainLyrics}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-text-muted gap-3">
                    <Mic2 className="w-10 h-10 opacity-40" />
                    <p className="text-sm font-medium text-text-secondary">No synced lyrics available</p>
                    <button
                      onClick={loadLyricsForCurrent}
                      className="px-3.5 py-1.5 bg-surface hover:bg-surface-hover text-xs font-semibold rounded-lg text-text-primary border border-border-subtle"
                    >
                      Retry LRCLIB
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Queue & Smart Autoplay Recommendations Tab */
              <div className="flex-1 overflow-y-auto pr-2 space-y-5 pb-2">
                {/* Control Header */}
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle sticky top-0 bg-canvas/95 backdrop-blur-md z-20">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-text-muted">
                    Queue ({queue.length})
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleSmartAutoplay}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                        smartAutoplayEnabled
                          ? 'bg-accent/15 text-accent border-accent/30 shadow-sm'
                          : 'bg-surface text-text-muted border-border-subtle'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Smart Autoplay: {smartAutoplayEnabled ? 'ON' : 'OFF'}</span>
                    </button>

                    {smartAutoplayEnabled && (
                      <button
                        onClick={() => fetchSmartRecommendations(currentTrack, true)}
                        className={`p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors ${
                          loadingRecommendations ? 'animate-spin text-accent' : ''
                        }`}
                        title="Refresh smart recommendations"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 1. Now Playing Track */}
                {currentTrack && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      Now Playing
                    </span>
                    <QueueItem
                      track={currentTrack}
                      index={0}
                      isCurrent={true}
                      isPlaying={isPlaying}
                      isBuffering={isBuffering}
                      onSelect={() => togglePlay()}
                    />
                  </div>
                )}

                {/* 1b. Upcoming queue entries (real playback queue, in order) */}
                {queue.length > queueIndex + 1 && (
                  <div className="space-y-1.5 pt-3 border-t border-border-subtle">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                      Up Next · {queue.length - queueIndex - 1}
                    </span>
                    {queue.slice(queueIndex + 1).map((track, i) => {
                      const idx = queueIndex + 1 + i;
                      return (
                        <QueueItem
                          key={`${track.id}-${idx}`}
                          track={track}
                          index={idx}
                          isCurrent={false}
                          isPlaying={false}
                          isBuffering={false}
                          onSelect={() => playQueueIndex(idx)}
                          onRemove={() => removeFromQueue(idx)}
                        />
                      );
                    })}
                  </div>
                )}

                {/* 2. Next Up via Smart Autoplay */}
                {smartAutoplayEnabled && recommendationQueue.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-border-subtle">
                    <div>
                      <h4 className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        Next Up • Smart Autoplay
                      </h4>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Selected automatically to match musical vibe, mood, and listening context
                      </p>
                    </div>

                    {recommendationQueue.map((rec) => (
                      <div
                        key={rec.id}
                        className="group flex items-center justify-between p-2 rounded-xl bg-surface/60 hover:bg-surface-hover border border-border-subtle transition-all"
                      >
                        <div
                          onClick={() => playRecommendedTrack(rec)}
                          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        >
                          <div className="relative w-9 h-9 rounded-md overflow-hidden flex-shrink-0 bg-sidebar">
                            <CoverImage
                              src={rec.thumbnail}
                              alt={rec.title}
                              size="xs"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-canvas/40 opacity-0 group-hover:opacity-100 flex items-center justify-center z-10">
                              <Play className="w-3.5 h-3.5 fill-current text-accent" />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-text-primary truncate group-hover:text-accent">
                              {rec.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-text-secondary truncate max-w-[120px]">
                                {rec.artist}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-accent/15 text-accent">
                                {rec.reason.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await db.likedTracks.put({ ...rec, likedAt: Date.now() });
                              recordFeedback('liked', rec);
                            }}
                            className="p-1 text-text-muted hover:text-accent transition-colors"
                            title="Add to liked"
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissRecommendation(rec);
                            }}
                            className="p-1 text-text-muted hover:text-text-primary transition-colors"
                            title="Dismiss recommendation"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
