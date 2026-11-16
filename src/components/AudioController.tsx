'use client';

import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getHighResCover } from '@/types/music';

export default function AudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    nextTrack,
    prevTrack,
    updateTime,
    togglePlay,
    seekTo,
    recordFeedback,
    setIsBuffering,
    setPlaybackError,
  } = usePlayerStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      isPlaying: s.isPlaying,
      volume: s.volume,
      isMuted: s.isMuted,
      nextTrack: s.nextTrack,
      prevTrack: s.prevTrack,
      updateTime: s.updateTime,
      togglePlay: s.togglePlay,
      seekTo: s.seekTo,
      recordFeedback: s.recordFeedback,
      setIsBuffering: s.setIsBuffering,
      setPlaybackError: s.setPlaybackError,
    }))
  );

  // Handle Play / Pause & Track Change cleanly using loadedTrackIdRef
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack) {
      if (loadedTrackIdRef.current !== currentTrack.id) {
        loadedTrackIdRef.current = currentTrack.id;
        setPlaybackError(null);
        const streamUrl = `/api/stream/${currentTrack.id}`;
        audio.src = streamUrl;
        audio.load();
      }

      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            if (err.name !== 'AbortError') {
              console.warn('Audio play prevented or error:', err);
            }
          });
        }
      } else {
        audio.pause();
      }
    } else {
      loadedTrackIdRef.current = null;
      audio.pause();
      // Assigning '' resolves to the page URL and fires a bogus media error.
      audio.removeAttribute('src');
      audio.load();
    }
  }, [currentTrack?.id, isPlaying]);

  // Handle Volume & Mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Hook into MediaSession API for OS/Keyboard Media Controls
  useEffect(() => {
    if (!currentTrack || typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album || 'OrbitTune',
      artwork: currentTrack.thumbnail
        ? [
            {
              src: getHighResCover(currentTrack.thumbnail) || currentTrack.thumbnail,
              sizes: '512x512',
              type: 'image/jpeg',
            },
          ]
        : [],
    });

    navigator.mediaSession.setActionHandler('play', () => togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        seekTo(details.seekTime);
      }
    });
  }, [currentTrack, togglePlay, prevTrack, nextTrack, seekTo]);

  return (
    <audio
      id="orbit-audio-player"
      ref={audioRef}
      preload="auto"
      onLoadStart={() => setIsBuffering(true)}
      onWaiting={() => setIsBuffering(true)}
      onCanPlay={() => {
        setIsBuffering(false);
        setPlaybackError(null);
        usePlayerStore.setState({ loadingTrackId: null });
      }}
      onPlaying={() => {
        setIsBuffering(false);
        setPlaybackError(null);
        usePlayerStore.setState({ loadingTrackId: null });
      }}
      onTimeUpdate={() => {
        const el = audioRef.current;
        if (!el) return;
        updateTime(el.currentTime, el.duration);

        // Keep the OS media-session scrubber in sync with real playback.
        if ('mediaSession' in navigator && Number.isFinite(el.duration) && el.duration > 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: el.duration,
              playbackRate: el.playbackRate || 1,
              position: Math.min(el.currentTime, el.duration),
            });
          } catch {
            // Older browsers reject partial states; nothing to recover.
          }
        }
      }}
      onEnded={() => {
        // Record completed play as positive reinforcement for recommendation engine
        if (currentTrack && audioRef.current) {
          recordFeedback('complete_play', currentTrack, audioRef.current.duration);
        }
        nextTrack();
      }}
      onError={(e) => {
        const audioErr = audioRef.current?.error;
        // Ignore aborted loads from normal track switching
        if (audioErr && audioErr.code === 1) { // 1 = MEDIA_ERR_ABORTED
          return;
        }
        console.warn('Audio playback error on track:', e);
        setIsBuffering(false);
        setPlaybackError('This track could not be streamed. Try another one.');
        usePlayerStore.setState({ loadingTrackId: null });
      }}
    />
  );
}
