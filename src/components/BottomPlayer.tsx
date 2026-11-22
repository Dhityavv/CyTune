'use client';

import { useState, useRef, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import { usePathname } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { initMagneticEffect } from '@/lib/motion';
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
  ListPlus,
  Disc,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useVolumeWheel } from '@/hooks/useVolumeWheel';
import CoverImage from '@/components/CoverImage';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { usePlaylistDialogStore } from '@/store/usePlaylistDialog';
import { audioSession } from '@/lib/audioSession';
import UniversalProgressBar from '@/components/UniversalProgressBar';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';

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
    playbackError,
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
  } = usePlayerStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      isPlaying: s.isPlaying,
      currentTime: s.currentTime,
      duration: s.duration,
      volume: s.volume,
      isMuted: s.isMuted,
      isShuffle: s.isShuffle,
      repeatMode: s.repeatMode,
      showLyrics: s.showLyrics,
      smartAutoplayEnabled: s.smartAutoplayEnabled,
      playbackError: s.playbackError,
      toggleSmartAutoplay: s.toggleSmartAutoplay,
      togglePlay: s.togglePlay,
      nextTrack: s.nextTrack,
      prevTrack: s.prevTrack,
      seekTo: s.seekTo,
      setVolume: s.setVolume,
      toggleMute: s.toggleMute,
      toggleShuffle: s.toggleShuffle,
      cycleRepeat: s.cycleRepeat,
      toggleExpanded: s.toggleExpanded,
      toggleLyrics: s.toggleLyrics,
      isQueueDrawerOpen: s.isQueueDrawerOpen,
      toggleQueueDrawer: s.toggleQueueDrawer,
      recordFeedback: s.recordFeedback,
    }))
  );

  const playBtnRef = useRef<HTMLButtonElement>(null);
  const [activeSession, setActiveSession] = useState(audioSession.getActiveSession());
  const [isGamePlaying, setIsGamePlaying] = useState(false);

  useEffect(() => {
    const unsub = audioSession.subscribeProgress((info) => {
      setActiveSession(info.session);
      setIsGamePlaying(info.isPlaying);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (playBtnRef.current) {
      return initMagneticEffect(playBtnRef.current, 0.25);
    }
  }, []);

  const volumeSliderRef = useVolumeWheel<HTMLDivElement>();

  const user = useAuthStore((s) => s.user);

  const isLiked = useLiveQuery(
    async () => {
      if (!currentTrack) return false;
      const found = await db.likedTracks.get(currentTrack.id);
      if (!found) return false;
      if (!user) {
        return !found.userId || found.userId === 'guest';
      }
      return !found.userId || found.userId === user.id || found.userId === 'guest';
    },
    [currentTrack?.id, user?.id],
    false
  );

  const pathname = usePathname();
  if (pathname === '/listening') {
    return null;
  }

  const toggleFavorite = async () => {
    if (!currentTrack) return;
    const currentUser = useAuthStore.getState().user;
    const activeUserId = currentUser?.id || 'guest';
    if (isLiked) {
      await db.likedTracks.delete(currentTrack.id);
    } else {
      await db.likedTracks.put({
        ...currentTrack,
        likedAt: Date.now(),
        userId: activeUserId,
      });
      recordFeedback('liked', currentTrack);
    }
  };

  if (!currentTrack && activeSession !== 'GAME_PREVIEW') {
    return null;
  }

  const isGameMode = activeSession === 'GAME_PREVIEW';

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[76px] bg-sidebar/95 backdrop-blur-xl border-t border-border-subtle px-3 flex items-center gap-3 select-none shadow-2xl">
        <AppLink
          href="/listening"
          aria-label="Open listening page"
          className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface border border-border-subtle"
        >
          {currentTrack ? (
            <CoverImage src={currentTrack.thumbnail} alt={currentTrack.title} size="md" className="w-full h-full object-cover" />
          ) : (
            <Disc className="w-5 h-5 text-accent m-auto mt-3" />
          )}
        </AppLink>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-text-primary truncate">
            {isGameMode ? 'Guess the Song' : currentTrack?.title}
          </p>
          <p className="text-xs text-text-secondary truncate mt-0.5">
            {isGameMode ? 'Game audio preview' : currentTrack?.artist}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isGameMode) audioSession.toggleGamePreview();
            else togglePlay();
          }}
          aria-label={isGameMode ? (isGamePlaying ? 'Pause preview' : 'Play preview') : isPlaying ? 'Pause' : 'Play'}
          className="w-11 h-11 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          {(isGameMode ? isGamePlaying : isPlaying) ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current translate-x-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={nextTrack}
          disabled={isGameMode}
          aria-label="Next track"
          className="w-11 h-11 rounded-full flex items-center justify-center text-text-primary hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-4 h-4 fill-current" />
        </button>
      </div>

      <div className="hidden md:flex fixed bottom-0 left-0 right-0 z-40 bg-sidebar/95 backdrop-blur-xl border-t border-border-subtle px-4 md:px-6 h-[76px] items-center justify-between gap-4 select-none shadow-2xl">
      {/* 1. Track Info (Left - 28%) */}
      <div className="flex items-center gap-3 min-w-0 w-1/4 max-w-[28%]">
        {isGameMode ? (
          <>
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-black/90 border border-border-subtle flex items-center justify-center shadow-sm">
              <Disc className={`w-6 h-6 text-accent ${isGamePlaying ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-accent font-mono block">Game Audio</span>
              <p className="text-[13px] font-semibold text-text-primary truncate leading-tight">Guess the Song</p>
              <p className="text-[11px] text-text-secondary truncate mt-0.5">15s Audible Preview</p>
            </div>
          </>
        ) : currentTrack ? (
          <>
            <AppLink
              href="/listening"
              className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface border border-border-subtle shadow-sm cursor-pointer group block"
              aria-label="Open Listening Page"
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
            </AppLink>

            <div className="min-w-0 flex-1">
              <AppLink
                href="/listening"
                className="block w-full text-left text-[13px] font-semibold text-text-primary truncate cursor-pointer hover:text-accent transition-colors leading-tight"
                aria-label={currentTrack.title}
              >
                {currentTrack.title}
              </AppLink>
              {playbackError ? (
                <p
                  role="status"
                  className="text-[11px] text-red-400 truncate mt-0.5"
                >
                  {playbackError}
                </p>
              ) : (
                <p
                  className="text-[11px] text-text-secondary truncate mt-0.5"
                >
                  {currentTrack.artist}
                </p>
              )}
            </div>

            <button
              onClick={toggleFavorite}
              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                isLiked
                  ? 'text-accent fill-accent'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label={isLiked ? 'Remove from liked' : 'Add to liked'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (currentTrack) usePlaylistDialogStore.getState().open(currentTrack);
              }}
              className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
              aria-label="Add to playlist"
            >
              <ListPlus className="w-4 h-4" />
            </button>
          </>
        ) : null}
      </div>

      {/* 2. Playback Controls & Seekbar (Center - 44%) */}
      <div className="flex flex-col items-center justify-center flex-1 max-w-xl px-2">
        {/* Buttons Row */}
        <div className="flex items-center gap-4 sm:gap-5 mb-1.5">
          <button
            onClick={toggleShuffle}
            disabled={isGameMode}
            className={`p-1 transition-colors ${
              isGameMode
                ? 'opacity-30 cursor-not-allowed text-text-muted'
                : isShuffle
                ? 'text-accent'
                : 'text-text-muted hover:text-text-primary'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={prevTrack}
            disabled={isGameMode}
            className={`p-1 transition-colors ${
              isGameMode ? 'opacity-30 cursor-not-allowed text-text-muted' : 'text-text-secondary hover:text-text-primary'
            }`}
            aria-label="Previous track"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            ref={playBtnRef}
            onClick={() => {
              if (isGameMode) {
                audioSession.toggleGamePreview();
              } else {
                togglePlay();
              }
            }}
            className="w-10 h-10 rounded-full bg-accent text-[#101114] flex items-center justify-center shadow-lg hover:scale-105 active:scale-90 transition-transform shadow-[#C9A94D]/30"
            aria-label={isGameMode ? (isGamePlaying ? 'Pause Preview' : 'Play Preview') : (isPlaying ? 'Pause' : 'Play')}
          >
            {(isGameMode ? isGamePlaying : isPlaying) ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            disabled={isGameMode}
            className={`p-1 transition-colors ${
              isGameMode ? 'opacity-30 cursor-not-allowed text-text-muted' : 'text-text-secondary hover:text-text-primary'
            }`}
            aria-label="Next track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={cycleRepeat}
            disabled={isGameMode}
            className={`p-1 transition-colors ${
              isGameMode
                ? 'opacity-30 cursor-not-allowed text-text-muted'
                : repeatMode !== 'off'
                ? 'text-accent'
                : 'text-text-muted hover:text-text-primary'
            }`}
            aria-label={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Progress Seekbar Row (60FPS Universal Smooth Bar) */}
        <div className="w-full">
          <UniversalProgressBar
            seekable={!isGameMode}
            showTimestamps={true}
            overrideDuration={isGameMode ? 15 : undefined}
            heightClass="h-1 group-hover:h-1.5"
            className="w-full"
          />
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
          aria-label={smartAutoplayEnabled ? 'Smart Autoplay Active' : 'Smart Autoplay Disabled'}
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
          aria-label="Toggle Lyrics"
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
          aria-label="Toggle Queue Drawer"
        >
          <ListMusic className="w-4 h-4" />
        </button>

        {/* Fullscreen Expand */}
        <AppLink
          href="/listening"
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          aria-label="Open Dedicated Listening Page"
        >
          <Maximize2 className="w-4 h-4" />
        </AppLink>

        {/* Filled Volume Slider (Hidden on mobile) */}
        <div className="hidden lg:flex items-center gap-2 pl-1 border-l border-border-subtle">
          <button
            onClick={toggleMute}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-accent" />
            ) : volume < 0.5 ? (
              <Volume1 className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div ref={volumeSliderRef} className="relative w-18 h-1 bg-surface-hover hover:h-1.5 rounded-full cursor-pointer group transition-all flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              aria-label="Volume"
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
    </>
  );
}
