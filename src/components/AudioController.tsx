'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getHighResCover } from '@/types/music';
import { audioSession } from '@/lib/audioSession';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
    __orbitPlayerSeek?: (seconds: number) => void;
    __orbitPlayerSetVolume?: (vol: number) => void;
    __orbitPlayerSetMuted?: (muted: boolean, vol?: number) => void;
    __orbitPlayerGetTime?: () => { currentTime: number; duration: number; isPlaying: boolean } | null;
  }
}

export default function AudioController() {
  const playerRef = useRef<any>(null);
  const isPlayerReadyRef = useRef<boolean>(false);
  const loadedTrackIdRef = useRef<string | null>(null);
  const pendingTrackIdRef = useRef<string | null>(null);

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

  // 1. Initialize YouTube Player Instance
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;

    const setupPlayerInstance = () => {
      if (!window.YT || !window.YT.Player) return false;
      const targetEl = document.getElementById('orbit-youtube-player-element');
      if (!targetEl || playerRef.current) return true;

      try {
        playerRef.current = new window.YT.Player('orbit-youtube-player-element', {
          height: '200',
          width: '200',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
          events: {
            onReady: (event: any) => {
              isPlayerReadyRef.current = true;
              const store = usePlayerStore.getState();
              try {
                event.target.unMute();
                event.target.setVolume(Math.round(store.volume * 100));
                if (store.isMuted) {
                  event.target.mute();
                }
              } catch {}

              // If there was a pending track requested while initializing
              if (pendingTrackIdRef.current) {
                const targetId = pendingTrackIdRef.current;
                pendingTrackIdRef.current = null;
                loadedTrackIdRef.current = targetId;
                try {
                  event.target.loadVideoById({ videoId: targetId, startSeconds: 0 });
                  event.target.unMute();
                  event.target.setVolume(Math.round(store.volume * 100));
                  if (usePlayerStore.getState().isPlaying) {
                    event.target.playVideo();
                  }
                } catch (e) {
                  console.warn('Failed to load pending track into YT player:', e);
                }
              }
            },
            onStateChange: (event: any) => {
              const state = event.data;
              // -1: UNSTARTED, 0: ENDED, 1: PLAYING, 2: PAUSED, 3: BUFFERING, 5: CUED
              if (state === 1) { // PLAYING
                setIsBuffering(false);
                setPlaybackError(null);
                usePlayerStore.setState({ loadingTrackId: null, isPlaying: true });
                audioSession.setNormalSessionActive();

                try {
                  const dur = event.target.getDuration();
                  if (dur && dur > 0) {
                    usePlayerStore.setState({ duration: dur });
                  }
                } catch {}
              } else if (state === 3) { // BUFFERING
                setIsBuffering(true);
              } else if (state === 2) { // PAUSED
                setIsBuffering(false);
              } else if (state === 0) { // ENDED
                setIsBuffering(false);
                const curTrack = usePlayerStore.getState().currentTrack;
                if (curTrack && playerRef.current) {
                  try {
                    const dur = playerRef.current.getDuration() || 0;
                    usePlayerStore.getState().recordFeedback('complete_play', curTrack, dur);
                  } catch {}
                }

                const repMode = usePlayerStore.getState().repeatMode;
                if (repMode === 'one') {
                  try {
                    playerRef.current.seekTo(0, true);
                    playerRef.current.playVideo();
                  } catch {}
                } else {
                  usePlayerStore.getState().nextTrack();
                }
              }
            },
            onError: (event: any) => {
              console.warn('YouTube Player error code:', event?.data);
              setIsBuffering(false);
              usePlayerStore.setState({ loadingTrackId: null });
              setPlaybackError('Track playback unavailable on YouTube. Skipping to next song...');
              setTimeout(() => {
                const store = usePlayerStore.getState();
                if (store.playbackError) {
                  store.setPlaybackError(null);
                  store.nextTrack();
                }
              }, 2000);
            },
          },
        });
        return true;
      } catch (err) {
        console.warn('Error creating YT.Player:', err);
        return false;
      }
    };

    if (typeof window !== 'undefined') {
      if (!window.YT) {
        const existingScript = document.getElementById('orbit-yt-iframe-api');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'orbit-yt-iframe-api';
          script.src = 'https://www.youtube.com/iframe_api';
          script.async = true;
          document.head.appendChild(script);
        }

        const prevReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (typeof prevReady === 'function') prevReady();
          setupPlayerInstance();
        };
      } else {
        setupPlayerInstance();
      }

      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          if (setupPlayerInstance() && checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [setIsBuffering, setPlaybackError]);

  // 2. Handle Track Changes & Play/Pause State
  useEffect(() => {
    if (currentTrack) {
      if (loadedTrackIdRef.current !== currentTrack.id) {
        loadedTrackIdRef.current = currentTrack.id;
        setPlaybackError(null);
        setIsBuffering(true);
        updateTime(0, currentTrack.duration || 0);

        if (isPlayerReadyRef.current && playerRef.current) {
          try {
            playerRef.current.loadVideoById({
              videoId: currentTrack.id,
              startSeconds: 0,
            });
            playerRef.current.unMute();
            playerRef.current.setVolume(Math.round(volume * 100));
            if (isPlaying) {
              playerRef.current.playVideo();
            } else {
              playerRef.current.pauseVideo();
            }
          } catch (e) {
            console.warn('Failed to load track into YT player:', e);
          }
        } else {
          pendingTrackIdRef.current = currentTrack.id;
        }
      } else {
        if (isPlayerReadyRef.current && playerRef.current) {
          try {
            if (isPlaying) {
              playerRef.current.unMute();
              playerRef.current.setVolume(Math.round(volume * 100));
              playerRef.current.playVideo();
            } else {
              playerRef.current.pauseVideo();
            }
          } catch {}
        }
      }
    } else {
      loadedTrackIdRef.current = null;
      pendingTrackIdRef.current = null;
      if (isPlayerReadyRef.current && playerRef.current) {
        try {
          playerRef.current.stopVideo();
        } catch {}
      }
    }
  }, [currentTrack, isPlaying, volume, setIsBuffering, setPlaybackError]);

  // 3. Handle Volume & Mute Updates
  useEffect(() => {
    if (isPlayerReadyRef.current && playerRef.current) {
      try {
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(Math.round(volume * 100));
        }
      } catch {}
    }
  }, [volume, isMuted]);

  // 4. Register Global Player Bridge
  useEffect(() => {
    window.__orbitPlayerSeek = (seconds: number) => {
      if (isPlayerReadyRef.current && playerRef.current) {
        try {
          playerRef.current.seekTo(seconds, true);
        } catch {}
      }
    };

    window.__orbitPlayerSetVolume = (vol: number) => {
      if (isPlayerReadyRef.current && playerRef.current) {
        try {
          playerRef.current.setVolume(Math.round(vol * 100));
        } catch {}
      }
    };

    window.__orbitPlayerSetMuted = (muted: boolean, vol: number = 0.8) => {
      if (isPlayerReadyRef.current && playerRef.current) {
        try {
          if (muted) {
            playerRef.current.mute();
          } else {
            playerRef.current.unMute();
            playerRef.current.setVolume(Math.round(vol * 100));
          }
        } catch {}
      }
    };

    window.__orbitPlayerGetTime = () => {
      if (!isPlayerReadyRef.current || !playerRef.current) return null;
      try {
        const state = typeof playerRef.current.getPlayerState === 'function' ? playerRef.current.getPlayerState() : -1;
        if (state !== 1) {
          const store = usePlayerStore.getState();
          return {
            currentTime: store.currentTime,
            duration: store.duration || 0,
            isPlaying: false,
          };
        }
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        return {
          currentTime: cur,
          duration: dur,
          isPlaying: true,
        };
      } catch {
        return null;
      }
    };

    return () => {
      delete window.__orbitPlayerSeek;
      delete window.__orbitPlayerSetVolume;
      delete window.__orbitPlayerSetMuted;
      delete window.__orbitPlayerGetTime;
    };
  }, []);

  // 5. Continuous time ticker for usePlayerStore & OS MediaSession
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (!isPlayerReadyRef.current || !playerRef.current) return;
      try {
        const state = typeof playerRef.current.getPlayerState === 'function' ? playerRef.current.getPlayerState() : -1;
        if (state !== 1) return;
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        if (dur > 0) {
          updateTime(cur, dur);

          if ('mediaSession' in navigator && Number.isFinite(dur) && dur > 0) {
            try {
              navigator.mediaSession.setPositionState({
                duration: dur,
                playbackRate: 1,
                position: Math.min(cur, dur),
              });
            } catch {}
          }
        }
      } catch {}
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying, updateTime]);

  // 6. Global Spacebar Play/Pause Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside any form field, input, or contenteditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        usePlayerStore.getState().togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 6. Hook into MediaSession API for OS controls
  useEffect(() => {
    if (!currentTrack || typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album || 'CyTune',
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
    <div
      id="orbit-youtube-player-container"
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '200px',
        height: '200px',
        pointerEvents: 'none',
        clipPath: 'circle(0px at 0 0)',
        zIndex: -1,
      }}
      aria-hidden="true"
    >
      <div id="orbit-youtube-player-element" />
    </div>
  );
}
