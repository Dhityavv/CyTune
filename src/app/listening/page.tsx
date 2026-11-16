'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
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
  ListPlus,
  Mic2,
  ListMusic,
  MessageSquare,
  Sparkles,
  Share2,
  Activity,
  Check,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useVolumeWheel } from '@/hooks/useVolumeWheel';
import CoverImage from '@/components/CoverImage';
import QueueItem from '@/components/QueueItem';
import SongComments from '@/components/SongComments';
import AudioVisualizer from '@/components/AudioVisualizer';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { usePlaylistDialogStore } from '@/store/usePlaylistDialog';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

type ContextTab = 'up_next' | 'lyrics' | 'comments' | 'related';

export default function ListeningPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContextTab>('up_next');
  const [showVisualizer, setShowVisualizer] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

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
    lyrics,
    loadingLyrics,
    smartAutoplayEnabled,
    recommendationQueue,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    loadLyricsForCurrent,
    playQueueIndex,
    removeFromQueue,
    playRecommendedTrack,
    recordFeedback,
  } = usePlayerStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      isPlaying: s.isPlaying,
      isBuffering: s.isBuffering,
      currentTime: s.currentTime,
      duration: s.duration,
      volume: s.volume,
      isMuted: s.isMuted,
      queue: s.queue,
      queueIndex: s.queueIndex,
      repeatMode: s.repeatMode,
      isShuffle: s.isShuffle,
      lyrics: s.lyrics,
      loadingLyrics: s.loadingLyrics,
      smartAutoplayEnabled: s.smartAutoplayEnabled,
      recommendationQueue: s.recommendationQueue,
      togglePlay: s.togglePlay,
      nextTrack: s.nextTrack,
      prevTrack: s.prevTrack,
      seekTo: s.seekTo,
      setVolume: s.setVolume,
      toggleMute: s.toggleMute,
      toggleShuffle: s.toggleShuffle,
      cycleRepeat: s.cycleRepeat,
      loadLyricsForCurrent: s.loadLyricsForCurrent,
      playQueueIndex: s.playQueueIndex,
      removeFromQueue: s.removeFromQueue,
      playRecommendedTrack: s.playRecommendedTrack,
      recordFeedback: s.recordFeedback,
    }))
  );

  const activeLyricRef = useRef<HTMLDivElement>(null);
  const lyricsBoxRef = useRef<HTMLDivElement>(null);
  const volumeSliderRef = useVolumeWheel<HTMLDivElement>();

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
      await db.likedTracks.put({ ...currentTrack, likedAt: Date.now() });
      recordFeedback('liked', currentTrack);
    }
  };

  const handleShare = () => {
    if (!currentTrack) return;
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Synchronized lyrics active line
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

  useEffect(() => {
    const container = lyricsBoxRef.current;
    const el = activeLyricRef.current;
    if (activeTab !== 'lyrics' || !container || !el) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const delta = eRect.top - cRect.top - (cRect.height / 2 - eRect.height / 2);
    container.scrollTo({ top: container.scrollTop + delta, behavior: 'smooth' });
  }, [activeLyricIdx, activeTab]);

  if (!currentTrack) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border-subtle flex items-center justify-center text-accent mx-auto">
          <ListMusic className="w-7 h-7" />
        </div>
        <h1 className="text-lg font-bold text-text-primary">No Track Selected</h1>
        <p className="text-xs text-text-secondary leading-relaxed">
          Choose a song from Explore, Search, or your Library to start the Hi-Fi listening experience.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-full bg-accent text-[#101114] text-xs font-bold hover:bg-accent-hover transition-colors shadow-md shadow-[#C9A94D]/20"
        >
          Explore Music
        </Link>
      </div>
    );
  }

  const upcomingQueue = queue.slice(queueIndex + 1);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto pb-20 select-none">
      {/* 1. LEFT MAIN CANVAS: Artwork, Metadata, Playback Controls, Visualizer */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 rounded-3xl bg-surface/50 border border-border-subtle shadow-2xl relative overflow-hidden backdrop-blur-sm">
        {/* Soft Ambient Glow */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />

        {/* Top bar on Left Canvas */}
        <div className="flex items-center justify-between z-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowVisualizer(!showVisualizer)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                showVisualizer
                  ? 'bg-accent/15 text-accent border-accent/30'
                  : 'bg-surface text-text-muted border-border-subtle hover:text-text-primary'
              }`}
              title="Toggle Audio Visualizer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Visualizer</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-xl bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle transition-colors"
              title="Share Track"
            >
              {copiedShare ? <Check className="w-4 h-4 text-accent" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center: Large Artwork & Visualizer */}
        <div className="flex flex-col items-center justify-center my-auto py-4 z-10">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-3xl overflow-hidden shadow-2xl bg-sidebar border border-border-subtle group ring-1 ring-white/10">
            <CoverImage
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              size="xl"
              priority
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {isPlaying && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-border-subtle flex items-center gap-1.5">
                <span className="w-1.5 h-3.5 bg-accent rounded-full animate-pulse" />
                <span className="w-1.5 h-2 bg-accent rounded-full animate-pulse delay-75" />
                <span className="w-1.5 h-3 bg-accent rounded-full animate-pulse delay-150" />
                <span className="text-[10px] font-mono text-accent font-bold uppercase tracking-wider">Hi-Fi</span>
              </div>
            )}
          </div>

          {/* Audio Visualizer underneath artwork */}
          {showVisualizer && (
            <div className="w-full max-w-sm mt-4">
              <AudioVisualizer />
            </div>
          )}
        </div>

        {/* Song Info & Controls Bottom Section */}
        <div className="space-y-4 z-10">
          {/* Metadata & Actions */}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary truncate" title={currentTrack.title}>
                {currentTrack.title}
              </h1>
              <p className="text-sm text-text-secondary truncate mt-0.5">
                {currentTrack.artistId ? (
                  <Link href={`/artist?id=${encodeURIComponent(currentTrack.artistId)}`} className="hover:text-accent transition-colors font-medium">
                    {currentTrack.artist}
                  </Link>
                ) : (
                  currentTrack.artist
                )}
                {currentTrack.album ? ` · ${currentTrack.album}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleFavorite}
                className={`p-2.5 rounded-xl border transition-colors ${
                  isLiked
                    ? 'bg-accent/15 border-accent/40 text-accent'
                    : 'bg-surface border-border-subtle text-text-muted hover:text-text-primary'
                }`}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => usePlaylistDialogStore.getState().open(currentTrack)}
                className="p-2.5 rounded-xl bg-surface border border-border-subtle text-text-muted hover:text-text-primary transition-colors"
                title="Add to playlist"
              >
                <ListPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Seek Bar */}
          <div>
            <div
              className="relative h-1.5 bg-surface-hover hover:h-2.5 rounded-full cursor-pointer group transition-all"
              onWheel={(e) => {
                e.preventDefault();
                const d = e.deltaY < 0 ? 5 : -5;
                seekTo(Math.max(0, Math.min(duration || 0, currentTime + d)));
              }}
            >
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

          {/* Playback Controls Row */}
          <div className="flex items-center justify-between px-2">
            <button
              type="button"
              onClick={toggleShuffle}
              className={`p-2 transition-colors ${
                isShuffle ? 'text-accent' : 'text-text-muted hover:text-text-primary'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={prevTrack}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all shadow-[#C9A94D]/30"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-current" />
              ) : (
                <Play className="w-6 h-6 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>

            <button
              type="button"
              onClick={cycleRepeat}
              className={`p-2 transition-colors ${
                repeatMode !== 'off' ? 'text-accent' : 'text-text-muted hover:text-text-primary'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          {/* Volume Row */}
          <div className="flex items-center gap-3 max-w-xs mx-auto w-full pt-1">
            <button type="button" onClick={toggleMute} className="text-text-muted hover:text-text-primary transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-accent" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div ref={volumeSliderRef} className="relative flex-1 h-1 bg-surface-hover hover:h-1.5 rounded-full cursor-pointer group transition-all flex items-center">
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
            </div>
          </div>
        </div>
      </div>

      {/* 2. RIGHT CONTEXT PANEL: 4 TABS (Up Next, Lyrics, Comments, Related) */}
      <div className="w-full lg:w-96 xl:w-[420px] flex flex-col rounded-3xl bg-surface/60 border border-border-subtle p-4 shadow-xl overflow-hidden shrink-0">
        {/* 4-Tab Switcher Navigation Header */}
        <div className="flex items-center justify-between p-1 rounded-2xl bg-surface border border-border-subtle mb-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('up_next')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'up_next'
                ? 'bg-accent text-[#101114] shadow-sm font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Up Next</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('lyrics')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'lyrics'
                ? 'bg-accent text-[#101114] shadow-sm font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Mic2 className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'comments'
                ? 'bg-accent text-[#101114] shadow-sm font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('related')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'related'
                ? 'bg-accent text-[#101114] shadow-sm font-bold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Related</span>
          </button>
        </div>

        {/* Tab 1: UP NEXT */}
        {activeTab === 'up_next' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Now Playing Card */}
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">
                Now Playing
              </span>
              <QueueItem
                track={currentTrack}
                index={queueIndex}
                isCurrent={true}
                isPlaying={isPlaying}
                isBuffering={isBuffering}
                onSelect={togglePlay}
              />
            </div>

            {/* Upcoming Queue */}
            {upcomingQueue.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Upcoming Queue
                  </span>
                  <span className="text-[10px] font-mono text-accent">
                    {upcomingQueue.length} {upcomingQueue.length === 1 ? 'track' : 'tracks'}
                  </span>
                </div>
                {upcomingQueue.map((t, i) => {
                  const idx = queueIndex + 1 + i;
                  return (
                    <QueueItem
                      key={`${t.id}-${idx}`}
                      track={t}
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

            {/* Autoplay Recommendations */}
            {smartAutoplayEnabled && recommendationQueue.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Autoplay Recommendations
                </span>
                {recommendationQueue.slice(0, 10).map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => playRecommendedTrack(rec)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-surface/50 hover:bg-surface-hover border border-border-subtle cursor-pointer transition-all"
                  >
                    <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-sidebar">
                      <CoverImage src={rec.thumbnail} alt={rec.title} size="xs" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-text-primary truncate">{rec.title}</p>
                      <p className="text-[10px] text-text-secondary truncate">{rec.artist}</p>
                    </div>
                    <span className="text-[9px] font-semibold text-accent bg-accent/15 px-1.5 py-0.5 rounded uppercase">
                      {rec.reason.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: LYRICS */}
        {activeTab === 'lyrics' && (
          <div ref={lyricsBoxRef} className="flex-1 overflow-y-auto space-y-6 text-center pr-2 py-4 select-none">
            {loadingLyrics ? (
              <div className="py-20 text-xs text-text-muted">Loading synchronized lyrics...</div>
            ) : lyrics?.lines && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, idx) => {
                const isActive = idx === activeLyricIdx;
                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLyricRef : null}
                    onClick={() => seekTo(line.time)}
                    className={`cursor-pointer transition-all duration-300 ${
                      isActive
                        ? 'text-text-primary text-xl sm:text-2xl font-bold drop-shadow-[0_0_12px_rgba(201,169,77,0.5)] scale-105'
                        : 'text-text-muted hover:text-text-secondary text-sm sm:text-base font-medium'
                    }`}
                  >
                    {line.text}
                  </div>
                );
              })
            ) : lyrics?.plainLyrics ? (
              <div className="whitespace-pre-line text-sm text-text-primary leading-relaxed text-left px-2">
                {lyrics.plainLyrics}
              </div>
            ) : (
              <div className="py-20 space-y-3 text-text-muted">
                <Mic2 className="w-8 h-8 opacity-40 mx-auto" />
                <p className="text-xs">No lyrics found on LRCLIB for this song.</p>
                <button
                  type="button"
                  onClick={loadLyricsForCurrent}
                  className="px-3.5 py-1.5 rounded-xl bg-surface border border-border-subtle text-xs font-semibold text-text-primary hover:bg-surface-hover"
                >
                  Retry Search
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: COMMENTS */}
        {activeTab === 'comments' && (
          <div className="flex-1 overflow-hidden">
            <SongComments songId={currentTrack.id} songTitle={currentTrack.title} />
          </div>
        )}

        {/* Tab 4: RELATED */}
        {activeTab === 'related' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              Musical Affinity & Similar Vibe
            </span>
            {recommendationQueue && recommendationQueue.length > 0 ? (
              recommendationQueue.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => playRecommendedTrack(rec)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-surface/70 hover:bg-surface-hover border border-border-subtle cursor-pointer transition-all group"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-sidebar">
                    <CoverImage src={rec.thumbnail} alt={rec.title} size="sm" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                      {rec.title}
                    </p>
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">{rec.artist}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/15 text-accent">
                        {rec.reason.label}
                      </span>
                      {rec.score && (
                        <span className="text-[9px] font-mono text-text-muted">
                          {Math.round(rec.score)}% match
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-xs text-text-muted">
                Generating related recommendations based on {currentTrack.artist}...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
