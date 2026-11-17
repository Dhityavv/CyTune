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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerRef = useRef<any>(null);
  const isPlayerReadyRef = useRef<boolean>(false);
  const loadedTrackIdRef = useRef<string | null>(null);
  const pendingTrackIdRef = useRef<string | null>(null);
  const usingHtmlAudioRef = useRef<boolean>(false);

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

  // Playback Fallback Handler (if video owner restricts embedding)
  const handlePlaybackFallback = useCallback(async () => {
    const track = usePlayerStore.getState().currentTrack;
    if (!track) return;

    setIsBuffering(true);
    // 1. Try finding preview URL from Apple iTunes
    try {
      const query = `${track.title} ${track.artist}`.trim();
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=1`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const data = await res.json();
        const previewUrl = data.results?.[0]?.previewUrl;
        if (previewUrl && audioRef.current) {
          usingHtmlAudioRef.current = true;
          audioRef.current.src = previewUrl;
          audioRef.current.load();
          audioRef.current.play().catch(() => {});
          setIsBuffering(false);
          setPlaybackError(null);
          return;
        }
      }
    } catch {
      // ignore
    }

    // 2. If no fallback, announce error and auto-skip to keep user listening
    setIsBuffering(false);
    usePlayerStore.setState({ loadingTrackId: null });
    setPlaybackError('This track is restricted by its copyright owner. Moving to next track...');
    setTimeout(() => {
      const store = usePlayerStore.getState();
      if (store.playbackError) {
        store.setPlaybackError(null);
        store.nextTrack();
      }
    }, 2500);
  }, [setIsBuffering, setPlaybackError]);

  // 1. Initialize YouTube Headless IFrame Player
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null;

    const setupPlayerInstance = () => {
      if (!window.YT || !window.YT.Player) return false;
      const targetEl = document.getElementById('orbit-youtube-player-element');
      if (!targetEl || playerRef.current) return true;

      try {
        playerRef.current = new window.YT.Player('orbit-youtube-player-element', {
          height: '64',
          width: '64',
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
                event.target.setVolume(Math.round(store.volume * 100));
                if (store.isMuted) {
                  event.target.mute();
                }
              } catch {}

              // If there was a pending track requested before player initialized
              if (pendingTrackIdRef.current) {
                const targetId = pendingTrackIdRef.current;
                pendingTrackIdRef.current = null;
                loadedTrackIdRef.current = targetId;
                try {
                  event.target.loadVideoById({ videoId: targetId, startSeconds: 0 });
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

                // Capture real duration from player
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
              console.warn('YouTube Player error:', event?.data);
              handlePlaybackFallback();
            },
          },
        });
        return true;
      } catch (err) {
        console.warn('Error creating YT.Player:', err);
        return false;
      }
    };

    // Load YouTube API script
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

      // Check interval to guarantee player instantiation even if script loads fast
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
  }, [handlePlaybackFallback, setIsBuffering, setPlaybackError]);

  // 2. Handle Track Changes & Play/Pause
  useEffect(() => {
    if (currentTrack) {
      if (loadedTrackIdRef.current !== currentTrack.id) {
        loadedTrackIdRef.current = currentTrack.id;
        usingHtmlAudioRef.current = false;
        setPlaybackError(null);
        setIsBuffering(true);

        // Stop fallback audio if it was running
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeAttribute('src');
          audioRef.current.load();
        }

        if (isPlayerReadyRef.current && playerRef.current) {
          try {
            playerRef.current.loadVideoById({
              videoId: currentTrack.id,
              startSeconds: 0,
            });
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
        // Same track: just toggle play / pause
        if (usingHtmlAudioRef.current && audioRef.current) {
          if (isPlaying) audioRef.current.play().catch(() => {});
          else audioRef.current.pause();
        } else if (isPlayerReadyRef.current && playerRef.current) {
          try {
            if (isPlaying) {
              playerRef.current.playVideo();
            } else {
              playerRef.current.pauseVideo();
            }
          } catch {}
        }
      }
    } else {
      // Stopped / Cleared
      loadedTrackIdRef.current = null;
      pendingTrackIdRef.current = null;
      usingHtmlAudioRef.current = false;
      if (isPlayerReadyRef.current && playerRef.current) {
        try {
          playerRef.current.stopVideo();
        } catch {}
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
    }
  }, [currentTrack, isPlaying, setIsBuffering, setPlaybackError]);

  // 3. Handle Volume & Mute
  useEffect(() => {
    if (usingHtmlAudioRef.current && audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }

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

  // 4. Register Global Player Bridge for usePlayerStore & audioSession
  useEffect(() => {
    window.__orbitPlayerSeek = (seconds: number) => {
      if (usingHtmlAudioRef.current && audioRef.current) {
        audioRef.current.currentTime = seconds;
      }
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
      if (usingHtmlAudioRef.current && audioRef.current) {
        return {
          currentTime: audioRef.current.currentTime || 0,
          duration: audioRef.current.duration || 0,
          isPlaying: !audioRef.current.paused,
        };
      }
      if (!isPlayerReadyRef.current || !playerRef.current) return null;
      try {
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        const state = typeof playerRef.current.getPlayerState === 'function' ? playerRef.current.getPlayerState() : -1;
        return {
          currentTime: cur,
          duration: dur,
          isPlaying: state === 1,
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

  // 5. Continuous time ticker to sync with usePlayerStore & OS MediaSession
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (usingHtmlAudioRef.current && audioRef.current) {
        const cur = audioRef.current.currentTime;
        const dur = audioRef.current.duration;
        if (Number.isFinite(cur)) {
          updateTime(cur, dur || 0);
        }
        return;
      }

      if (!isPlayerReadyRef.current || !playerRef.current) return;
      try {
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
    }, 250);

    return () => clearInterval(interval);
  }, [isPlaying, updateTime]);

  // 6. Hook into MediaSession API for OS/Keyboard Media Controls
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
    <>
      {/* Invisible YouTube Headless Player Container (Rendered to prevent browser background throttling) */}
      <div
        id="orbit-youtube-player-container"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '64px',
          height: '64px',
          opacity: 0.001,
          pointerEvents: 'none',
          zIndex: -9999,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <div id="orbit-youtube-player-element" />
      </div>

      {/* Fallback / Local HTMLAudio Element */}
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
        onEnded={() => {
          if (currentTrack && audioRef.current) {
            recordFeedback('complete_play', currentTrack, audioRef.current.duration);
          }
          nextTrack();
        }}
        onError={(e) => {
          const audioErr = audioRef.current?.error;
          if (audioErr && audioErr.code === 1) return; // MEDIA_ERR_ABORTED
          console.warn('Fallback audio playback error on track:', e);
          setIsBuffering(false);
          setPlaybackError('This track could not be streamed. Try another one.');
          usePlayerStore.setState({ loadingTrackId: null });
        }}
      />
    </>
  );
}
