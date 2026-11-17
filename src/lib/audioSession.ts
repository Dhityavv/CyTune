'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { GuessTrack } from '@/lib/guessTracks';

export type AudioSessionType = 'NORMAL' | 'GAME_PREVIEW' | 'IDLE';

export interface AudioProgressInfo {
  currentTime: number;
  duration: number;
  progressPercent: number;
  isPlaying: boolean;
  isBuffering: boolean;
  sessionType: AudioSessionType;
  session: AudioSessionType;
}

export interface GamePreviewState {
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  error: string | null;
}

type ProgressListener = (info: AudioProgressInfo) => void;

class CentralizedAudioSession {
  private activeSession: AudioSessionType = 'IDLE';
  private sessionToken: number = 0;

  // Dedicated HTMLAudioElement for Game Previews
  private gameAudio: HTMLAudioElement | null = null;
  private currentGameTrack: GuessTrack | null = null;
  private gameDuration: number = 15; // 15-second standard preview cap
  private isGameBuffering: boolean = false;
  private isGamePlaying: boolean = false;

  // Stashed state from normal player before game took over
  private stashedNormalWasPlaying: boolean = false;

  // RAF Smooth Progress Animation
  private progressListeners = new Set<ProgressListener>();
  private rafId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Clean up on page unload / navigation
      window.addEventListener('beforeunload', () => {
        this.destroyAll();
      });
    }
  }

  public getActiveSession(): AudioSessionType {
    return this.activeSession;
  }

  public getCurrentGameTrack(): GuessTrack | null {
    return this.currentGameTrack;
  }

  public isGamePreviewPlaying(): boolean {
    return this.isGamePlaying;
  }

  public isGamePreviewBuffering(): boolean {
    return this.isGameBuffering;
  }

  // --- Normal Player Session Registration ---
  public setNormalSessionActive() {
    if (this.activeSession === 'GAME_PREVIEW') {
      this.stopGamePreview(false);
    }
    this.activeSession = 'NORMAL';
    this.ensureRafLoop();
  }

  public setNormalSessionPaused() {
    if (this.activeSession === 'NORMAL') {
      this.broadcastProgress();
    }
  }

  // --- Game Preview Session Control ---
  public startGamePreview(
    trackOrUrl: GuessTrack | string,
    onStateChangeOrCanPlay?: ((state: GamePreviewState) => void) | (() => void),
    onEnded?: () => void,
    onError?: (err: any) => void
  ) {
    // 1. Immediately invalidate previous audio requests & race conditions
    this.sessionToken++;
    const currentToken = this.sessionToken;

    const previewUrl = typeof trackOrUrl === 'string' ? trackOrUrl : trackOrUrl.previewUrl;
    const trackObj: GuessTrack | null = typeof trackOrUrl === 'string' ? null : trackOrUrl;

    // 2. Pause global player if active and stash state
    const playerStore = usePlayerStore.getState();
    if (this.activeSession !== 'GAME_PREVIEW') {
      this.stashedNormalWasPlaying = playerStore.isPlaying;
      if (playerStore.isPlaying) {
        playerStore.pause();
      }
    }

    // 3. Stop and destroy previous game audio element completely
    this.killGameAudioElement();

    this.activeSession = 'GAME_PREVIEW';
    this.currentGameTrack = trackObj;
    this.isGameBuffering = true;
    this.isGamePlaying = false;
    this.gameDuration = 15;

    const emitState = (error: string | null = null) => {
      if (typeof onStateChangeOrCanPlay === 'function' && onStateChangeOrCanPlay.length === 1) {
        (onStateChangeOrCanPlay as (state: GamePreviewState) => void)({
          isPlaying: this.isGamePlaying,
          isLoading: this.isGameBuffering,
          currentTime: this.gameAudio ? Math.min(15, this.gameAudio.currentTime) : 0,
          duration: 15,
          error,
        });
      }
    };

    emitState();

    // 4. Create fresh dedicated HTMLAudioElement with strict session token check
    try {
      const audio = new Audio(previewUrl);
      this.gameAudio = audio;
      audio.preload = 'auto';
      audio.volume = 0.85;

      audio.oncanplay = () => {
        if (this.sessionToken !== currentToken) {
          audio.pause();
          return;
        }
        this.isGameBuffering = false;
        if (typeof onStateChangeOrCanPlay === 'function' && onStateChangeOrCanPlay.length === 0) {
          (onStateChangeOrCanPlay as () => void)();
        }
        emitState();
        this.broadcastProgress();

        // Start playback
        audio.play().then(() => {
          if (this.sessionToken !== currentToken) {
            audio.pause();
            return;
          }
          this.isGamePlaying = true;
          this.ensureRafLoop();
          emitState();
          this.broadcastProgress();
        }).catch((err) => {
          if (this.sessionToken === currentToken) {
            console.warn('Autoplay restricted or interrupted:', err);
            this.isGamePlaying = false;
            emitState();
            this.broadcastProgress();
          }
        });
      };

      audio.onwaiting = () => {
        if (this.sessionToken === currentToken) {
          this.isGameBuffering = true;
          emitState();
          this.broadcastProgress();
        }
      };

      audio.onplaying = () => {
        if (this.sessionToken === currentToken) {
          this.isGameBuffering = false;
          this.isGamePlaying = true;
          this.ensureRafLoop();
          emitState();
          this.broadcastProgress();
        }
      };

      audio.onpause = () => {
        if (this.sessionToken === currentToken) {
          this.isGamePlaying = false;
          emitState();
          this.broadcastProgress();
        }
      };

      audio.ontimeupdate = () => {
        if (this.sessionToken !== currentToken) return;
        emitState();
        // Cap strictly at 15s
        if (audio.currentTime >= 15) {
          audio.pause();
          this.isGamePlaying = false;
          emitState();
          this.broadcastProgress();
          if (onEnded) onEnded();
        }
      };

      audio.onended = () => {
        if (this.sessionToken === currentToken) {
          this.isGamePlaying = false;
          emitState();
          this.broadcastProgress();
          if (onEnded) onEnded();
        }
      };

      audio.onerror = (e) => {
        if (this.sessionToken === currentToken) {
          this.isGameBuffering = false;
          this.isGamePlaying = false;
          const msg = 'Audio stream preview unreachable. Click retry or skip.';
          emitState(msg);
          this.broadcastProgress();
          if (onError) onError(e);
        }
      };
    } catch (err: any) {
      this.isGameBuffering = false;
      this.isGamePlaying = false;
      emitState(err?.message || 'Could not initialize audio player.');
      if (onError) onError(err);
    }

    this.broadcastProgress();
  }

  public toggleMute(): boolean {
    if (!this.gameAudio) return false;
    this.gameAudio.muted = !this.gameAudio.muted;
    return this.gameAudio.muted;
  }

  public toggleGamePreview() {
    if (!this.gameAudio) return;
    if (this.isGamePlaying) {
      this.gameAudio.pause();
      this.isGamePlaying = false;
    } else {
      if (this.gameAudio.currentTime >= 15) {
        this.gameAudio.currentTime = 0;
      }
      this.gameAudio.play().then(() => {
        this.isGamePlaying = true;
        this.ensureRafLoop();
      }).catch(() => {});
    }
    this.broadcastProgress();
  }

  public replayGamePreview() {
    if (!this.gameAudio) return;
    this.gameAudio.currentTime = 0;
    this.gameAudio.play().then(() => {
      this.isGamePlaying = true;
      this.ensureRafLoop();
    }).catch(() => {});
    this.broadcastProgress();
  }

  public stopGamePreview(restoreNormal = false) {
    this.sessionToken++;
    this.killGameAudioElement();
    this.currentGameTrack = null;
    this.isGamePlaying = false;
    this.isGameBuffering = false;
    this.activeSession = 'IDLE';

    this.stopRafLoop();
    this.broadcastProgress();

    // Optionally restore normal player if user wants
    if (restoreNormal && this.stashedNormalWasPlaying) {
      this.activeSession = 'NORMAL';
      const playerStore = usePlayerStore.getState();
      if (playerStore.currentTrack) {
        playerStore.resume();
      }
    }
  }

  private killGameAudioElement() {
    if (this.gameAudio) {
      try {
        this.gameAudio.pause();
        this.gameAudio.oncanplay = null;
        this.gameAudio.onwaiting = null;
        this.gameAudio.onplaying = null;
        this.gameAudio.onpause = null;
        this.gameAudio.ontimeupdate = null;
        this.gameAudio.onended = null;
        this.gameAudio.onerror = null;
        this.gameAudio.removeAttribute('src');
        this.gameAudio.load();
      } catch {
        // ignore cleanup error
      }
      this.gameAudio = null;
    }
  }

  public destroyAll() {
    this.sessionToken++;
    this.killGameAudioElement();
    this.stopRafLoop();
    this.activeSession = 'IDLE';
  }

  // --- RAF 60FPS Smooth Progress Loop ---
  public subscribeProgress(listener: ProgressListener): () => void {
    this.progressListeners.add(listener);
    // Send immediate initial state
    listener(this.getProgressSnapshot());
    this.ensureRafLoop();

    return () => {
      this.progressListeners.delete(listener);
      if (this.progressListeners.size === 0) {
        this.stopRafLoop();
      }
    };
  }

  public getProgressSnapshot(): AudioProgressInfo {
    if (this.activeSession === 'GAME_PREVIEW') {
      const cur = this.gameAudio ? Math.min(15, this.gameAudio.currentTime) : 0;
      const dur = 15;
      return {
        currentTime: cur,
        duration: dur,
        progressPercent: dur > 0 ? (cur / dur) * 100 : 0,
        isPlaying: this.isGamePlaying,
        isBuffering: this.isGameBuffering,
        sessionType: 'GAME_PREVIEW',
        session: 'GAME_PREVIEW',
      };
    }

    // Normal session
    let ytTime: { currentTime: number; duration: number; isPlaying: boolean } | null = null;
    if (typeof window !== 'undefined' && (window as any).__orbitPlayerGetTime) {
      ytTime = (window as any).__orbitPlayerGetTime();
    }

    const normalStore = usePlayerStore.getState();
    const cur = ytTime && ytTime.duration > 0 ? ytTime.currentTime : normalStore.currentTime;
    const dur = ytTime && ytTime.duration > 0 ? ytTime.duration : (normalStore.duration || 0);
    const isPlaying = ytTime ? ytTime.isPlaying : normalStore.isPlaying;

    return {
      currentTime: cur,
      duration: dur,
      progressPercent: dur > 0 ? (cur / dur) * 100 : 0,
      isPlaying,
      isBuffering: normalStore.isBuffering,
      sessionType: this.activeSession,
      session: this.activeSession,
    };
  }

  private broadcastProgress() {
    const snap = this.getProgressSnapshot();
    for (const listener of this.progressListeners) {
      listener(snap);
    }
  }

  private ensureRafLoop() {
    if (this.rafId !== null) return;

    const tick = () => {
      const snap = this.getProgressSnapshot();

      // Check current authoritative audio element time directly from DOM or player bridge
      if (this.activeSession === 'NORMAL') {
        let found = false;
        if (typeof window !== 'undefined' && (window as any).__orbitPlayerGetTime) {
          const ytTime = (window as any).__orbitPlayerGetTime();
          if (ytTime && ytTime.duration > 0) {
            snap.currentTime = ytTime.currentTime;
            snap.duration = ytTime.duration;
            snap.progressPercent = (ytTime.currentTime / ytTime.duration) * 100;
            snap.isPlaying = ytTime.isPlaying;
            found = true;
          }
        }

        if (!found) {
          const audioEl = document.getElementById('orbit-audio-player') as HTMLAudioElement | null;
          if (audioEl && Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
            snap.currentTime = audioEl.currentTime;
            snap.duration = audioEl.duration;
            snap.progressPercent = (audioEl.currentTime / audioEl.duration) * 100;
            snap.isPlaying = !audioEl.paused;
          }
        }
      } else if (this.activeSession === 'GAME_PREVIEW' && this.gameAudio) {
        const cur = Math.min(15, this.gameAudio.currentTime);
        snap.currentTime = cur;
        snap.duration = 15;
        snap.progressPercent = (cur / 15) * 100;
        snap.isPlaying = !this.gameAudio.paused;
      }

      for (const listener of this.progressListeners) {
        listener(snap);
      }

      // Keep loop running while audio is playing
      if (snap.isPlaying) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private stopRafLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

// Global Singleton Instance
export const audioSession = new CentralizedAudioSession();
