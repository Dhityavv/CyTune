'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getHighResCover } from '@/types/music';
import { audioSession } from '@/lib/audioSession';

export default function AudioController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);
  const isRecoveringRef = useRef<boolean>(false);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    repeatMode,
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
      repeatMode: s.repeatMode,
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

  // Play / Pause & Track Change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack) {
      if (loadedTrackIdRef.current !== currentTrack.id) {
        loadedTrackIdRef.current = currentTrack.id;
        isRecoveringRef.current = false;
        setPlaybackError(null);
        setIsBuffering(true);

        const streamUrl = `/api/stream/${currentTrack.id}?title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist || '')}`;
        audio.src = streamUrl;
        audio.load();

        if (isPlaying) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              if (err.name !== 'AbortError') {
                console.warn('Audio play error/prevented:', err);
              }
            });
          }
        }
      } else {
        if (isPlaying) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              if (err.name !== 'AbortError') {
                console.warn('Audio play error/prevented:', err);
              }
            });
          }
        } else {
          audio.pause();
        }
      }
    } else {
      loadedTrackIdRef.current = null;
      isRecoveringRef.current = false;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }, [currentTrack, isPlaying, setIsBuffering, setPlaybackError]);

  // Volume & Mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // MediaSession API for OS and physical media keys
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

  // Client-side auto recovery on stream failure
  const handlePlaybackError = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const audioErr = audio.error;
    if (audioErr && audioErr.code === 1) return; // MEDIA_ERR_ABORTED

    if (!isRecoveringRef.current) {
      isRecoveringRef.current = true;
      console.warn('Primary stream failed for', currentTrack.title, '— attempting client-side fallback...');
      setIsBuffering(true);

      try {
        const query = `${currentTrack.title} ${currentTrack.artist}`.trim();
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`);
        if (res.ok) {
          const data = await res.json();
          const fallbackUrl = data.results?.[0]?.previewUrl;
          if (fallbackUrl && audioRef.current) {
            console.log('Direct client recovery stream acquired:', fallbackUrl);
            audioRef.current.src = fallbackUrl;
            audioRef.current.load();
            if (usePlayerStore.getState().isPlaying) {
              audioRef.current.play().catch(() => {});
            }
            setIsBuffering(false);
            setPlaybackError(null);
            return;
          }
        }
      } catch (err) {
        console.warn('Direct client recovery attempt failed:', err);
      }
    }

    setIsBuffering(false);
    setPlaybackError('Track could not be streamed. Moving to next track in 2s...');
    usePlayerStore.setState({ loadingTrackId: null });

    setTimeout(() => {
      const store = usePlayerStore.getState();
      if (store.playbackError) {
        store.setPlaybackError(null);
        store.nextTrack();
      }
    }, 2500);
  }, [currentTrack, setIsBuffering, setPlaybackError]);

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
        audioSession.setNormalSessionActive();
      }}
      onPlaying={() => {
        setIsBuffering(false);
        setPlaybackError(null);
        usePlayerStore.setState({ loadingTrackId: null });
        audioSession.setNormalSessionActive();
      }}
      onTimeUpdate={() => {
        const el = audioRef.current;
        if (!el) return;
        updateTime(el.currentTime, el.duration);

        if ('mediaSession' in navigator && Number.isFinite(el.duration) && el.duration > 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: el.duration,
              playbackRate: el.playbackRate || 1,
              position: Math.min(el.currentTime, el.duration),
            });
          } catch {}
        }
      }}
      onEnded={() => {
        if (currentTrack && audioRef.current) {
          recordFeedback('complete_play', currentTrack, audioRef.current.duration);
        }
        if (repeatMode === 'one' && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        } else {
          nextTrack();
        }
      }}
      onError={handlePlaybackError}
    />
  );
}
