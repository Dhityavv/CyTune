'use client';

import { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Mic2,
  ListMusic,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import CoverImage from '@/components/CoverImage';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function BottomPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    showLyrics,
    smartAutoplayEnabled,
    toggleSmartAutoplay,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    toggleExpanded,
    toggleLyrics,
    isQueueDrawerOpen,
    toggleQueueDrawer,
    recordFeedback,
  } = usePlayerStore();

  const [isSeeking, setIsSeeking] = useState(false);
  const [tempSeek, setTempSeek] = useState(0);

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

  if (!currentTrack) {
    return null;
  }

  const effectiveProgress = isSeeking ? tempSeek : currentTime;
  const progressPercent = duration > 0 ? (effectiveProgress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-sidebar/95 backdrop-blur-xl border-t border-border-subtle px-4 md:px-6 h-[76px] flex items-center justify-between gap-4 select-none shadow-2xl">
      {/* 1. Track Info (Left - 28%) */}
      <div className="flex items-center gap-3 min-w-0 w-1/4 max-w-[28%]">
        <div
          onClick={toggleExpanded}
          className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface border border-border-subtle shadow-sm cursor-pointer group"
        >
          <CoverImage
            src={currentTrack.thumbnail}
            alt={currentTrack.title}
            size="md"
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-canvas/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
            <Maximize2 className="w-3.5 h-3.5 text-text-primary" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p
            onClick={toggleExpanded}
            className="text-[13px] font-semibold text-text-primary truncate cursor-pointer hover:text-accent transition-colors leading-tight"
            title={currentTrack.title}
          >
            {currentTrack.title}
          </p>
          <p
            className="text-[11px] text-text-secondary truncate mt-0.5"
            title={currentTrack.artist}
          >
            {currentTrack.artist}
          </p>
        </div>

        <button
          onClick={toggleFavorite}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
            isLiked
              ? 'text-accent fill-accent'
              : 'text-text-muted hover:text-text-primary'
          }`}
          title={isLiked ? 'Remove from liked' : 'Add to liked'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* 2. Playback Controls & Seekbar (Center - 44%) */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-xl px-2">
        {/* Buttons Row */}
        <div className="flex items-center gap-4 sm:gap-5 mb-1.5">
          <button
            onClick={toggleShuffle}
            className={`p-1 transition-colors ${
              isShuffle ? 'text-accent' : 'text-text-muted hover:text-text-primary'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
            title="Previous track"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all shadow-[#C9A94D]/20"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
            title="Next track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-1 transition-colors ${
              repeatMode !== 'off' ? 'text-accent' : 'text-text-muted hover:text-text-primary'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Progress Seekbar Row */}
        <div className="w-full flex items-center gap-2.5 text-[11px] font-mono text-text-muted">
          <span className="w-9 text-right">{formatTime(effectiveProgress)}</span>

          <div className="relative flex-1 h-1 bg-surface-hover hover:h-1.5 rounded-full cursor-pointer group transition-all" onWheel={(e) => { e.preventDefault(); const d = e.deltaY < 0 ? 5 : -5; seekTo(Math.max(0, Math.min(duration || 0, effectiveProgress + d))); }}>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={effectiveProgress}
              onChange={(e) => {
                setIsSeeking(true);
                setTempSeek(parseFloat(e.target.value));
              }}
              onMouseUp={() => {
                setIsSeeking(false);
                seekTo(tempSeek);
              }}
              onTouchEnd={() => {
                setIsSeeking(false);
                seekTo(tempSeek);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div
              className="absolute top-0 left-0 h-full bg-accent group-hover:bg-accent-hover rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Scrubber Thumb Indicator on Hover / Seek */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent shadow-lg shadow-black/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          <span className="w-9 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Utility Controls: Autoplay, Lyrics, Queue, Expand, Volume (Right - 28%) */}
      <div className="flex items-center justify-end gap-2 sm:gap-2.5 w-1/4 max-w-[28%]">
        {/* Smart Autoplay Pill */}
        <button
          onClick={toggleSmartAutoplay}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
            smartAutoplayEnabled
              ? 'bg-accent/15 text-accent border-accent/30 shadow-sm'
              : 'bg-transparent text-text-muted border-transparent hover:text-text-secondary'
          }`}
          title={smartAutoplayEnabled ? 'Smart Autoplay Active' : 'Smart Autoplay Disabled'}
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden xl:inline">Autoplay</span>
        </button>

        {/* Lyrics Button */}
        <button
          onClick={toggleLyrics}
          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
            showLyrics
              ? 'bg-surface text-accent border border-accent/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
          }`}
          title="Toggle Lyrics"
        >
          <Mic2 className="w-4 h-4" />
        </button>

        {/* Desktop Queue Drawer Toggle */}
        <button
          onClick={toggleQueueDrawer}
          className={`p-2 rounded-lg text-xs font-medium transition-colors ${
            isQueueDrawerOpen
              ? 'bg-surface text-accent border border-accent/30'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
          }`}
          title="Toggle Queue Drawer"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Fullscreen Expand */}
        <button
          onClick={toggleExpanded}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          title="Open Fullscreen Player"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Filled Volume Slider (Hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-2 pl-1 border-l border-border-subtle">
          <button
            onClick={toggleMute}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-accent" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div className="relative w-18 h-1 bg-surface-hover hover:h-1.5 rounded-full cursor-pointer group transition-all flex items-center" onWheel={(e) => { e.preventDefault(); const d = e.deltaY < 0 ? 0.05 : -0.05; setVolume(Math.max(0, Math.min(1, (isMuted ? 0 : volume) + d))); }}>
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
      </div>
    </div>
  );
}
