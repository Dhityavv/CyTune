'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioSession, AudioProgressInfo } from '@/lib/audioSession';
import { usePlayerStore } from '@/store/usePlayerStore';

interface UniversalProgressBarProps {
  trackId?: string;
  seekable?: boolean;
  showTimestamps?: boolean;
  heightClass?: string;
  className?: string;
  onSeekCommit?: (seconds: number) => void;
  // If custom duration is provided (e.g., 15s in Guess the Song), override
  overrideDuration?: number;
  overrideTime?: number;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0 || !Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function UniversalProgressBar({
  trackId,
  seekable = true,
  showTimestamps = false,
  heightClass = 'h-1.5 group-hover:h-2.5',
  className = '',
  onSeekCommit,
  overrideDuration,
  overrideTime,
}: UniversalProgressBarProps) {
  const [progressInfo, setProgressInfo] = useState<AudioProgressInfo>(() =>
    audioSession.getProgressSnapshot()
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgressPercent, setDragProgressPercent] = useState(0);
  const [dragTime, setDragTime] = useState(0);

  // Optimistic lock prevents snapping back or flashing to 100% while waiting for audio engine seek
  const [optimisticPercent, setOptimisticPercent] = useState<number | null>(null);
  const optimisticTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Hover state for interactive timestamp preview
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPercent, setHoverPercent] = useState(0);

  const barRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to centralized audio session 60FPS RAF progress
  useEffect(() => {
    const unsubscribe = audioSession.subscribeProgress((info) => {
      setProgressInfo(info);
    });
    return unsubscribe;
  }, []);

  // Cleanup optimistic timeout on unmount
  useEffect(() => {
    return () => {
      if (optimisticTimeoutRef.current) clearTimeout(optimisticTimeoutRef.current);
    };
  }, []);

  const isOverrideReset = overrideTime === 0;

  // Reset optimistic state & progress snapshot whenever track changes or resets to 0
  useEffect(() => {
    setOptimisticPercent(null);
    setIsDragging(false);
    setDragProgressPercent(0);
    setDragTime(0);
    setProgressInfo((prev) => ({
      ...prev,
      currentTime: 0,
      duration: 0,
      progressPercent: 0,
      isBuffering: true,
    }));
  }, [trackId, overrideDuration, isOverrideReset]);

  const rawDuration = overrideDuration !== undefined ? overrideDuration : progressInfo.duration;
  const effectiveDuration = Number.isFinite(rawDuration) && rawDuration > 0 ? rawDuration : 0;

  const rawCurrentTime = overrideTime !== undefined ? overrideTime : progressInfo.currentTime;
  const effectiveCurrentTime = Number.isFinite(rawCurrentTime) && rawCurrentTime >= 0 ? rawCurrentTime : 0;

  // Compute safe, clamped percentage (NEVER NaN, NEVER Infinity, NEVER > 100)
  const computeActivePercent = (): number => {
    if (isDragging) {
      return Math.min(100, Math.max(0, dragProgressPercent));
    }
    if (optimisticPercent !== null) {
      return Math.min(100, Math.max(0, optimisticPercent));
    }
    if (effectiveDuration > 0) {
      const pct = (effectiveCurrentTime / effectiveDuration) * 100;
      return Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 0;
    }
    return 0;
  };

  const safePercent = computeActivePercent();

  // Handle Drag / Click seeking
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!seekable || effectiveDuration <= 0) return;
    const bar = barRef.current;
    if (!bar) return;

    if (optimisticTimeoutRef.current) {
      clearTimeout(optimisticTimeoutRef.current);
      optimisticTimeoutRef.current = null;
    }

    bar.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const rect = bar.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = rect.width > 0 ? clickX / rect.width : 0;
    const clampedRatio = Math.min(1, Math.max(0, ratio));
    const seekSec = clampedRatio * effectiveDuration;

    setDragProgressPercent(clampedRatio * 100);
    setDragTime(seekSec);
    setOptimisticPercent(clampedRatio * 100);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const moveX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = rect.width > 0 ? moveX / rect.width : 0;
    const clampedRatio = Math.min(1, Math.max(0, ratio));

    setHoverPercent(clampedRatio * 100);

    if (isDragging && seekable && effectiveDuration > 0) {
      const seekSec = clampedRatio * effectiveDuration;
      setDragProgressPercent(clampedRatio * 100);
      setDragTime(seekSec);
      setOptimisticPercent(clampedRatio * 100);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (barRef.current) {
      try {
        barRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    const targetSec = dragTime;
    const targetPct = dragProgressPercent;

    // Lock optimistic percent for 450ms so player doesn't flicker while buffering to new time
    setOptimisticPercent(targetPct);
    if (optimisticTimeoutRef.current) clearTimeout(optimisticTimeoutRef.current);
    optimisticTimeoutRef.current = setTimeout(() => {
      setOptimisticPercent(null);
    }, 450);

    // Commit seek to audio engine
    if (seekable && effectiveDuration > 0) {
      if (onSeekCommit) {
        onSeekCommit(targetSec);
      } else {
        usePlayerStore.getState().seekTo(targetSec);
      }
    }
  };

  // Keyboard accessibility (ArrowLeft / ArrowRight)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!seekable || effectiveDuration <= 0) return;
    let target = effectiveCurrentTime;
    if (e.key === 'ArrowRight') {
      target = Math.min(effectiveDuration, effectiveCurrentTime + 5);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      target = Math.max(0, effectiveCurrentTime - 5);
      e.preventDefault();
    }

    if (target !== effectiveCurrentTime) {
      const pct = (target / effectiveDuration) * 100;
      setOptimisticPercent(pct);
      if (optimisticTimeoutRef.current) clearTimeout(optimisticTimeoutRef.current);
      optimisticTimeoutRef.current = setTimeout(() => {
        setOptimisticPercent(null);
      }, 450);

      if (onSeekCommit) {
        onSeekCommit(target);
      } else {
        usePlayerStore.getState().seekTo(target);
      }
    }
  };

  const hoverTimeSec = (hoverPercent / 100) * effectiveDuration;

  return (
    <div className={`w-full flex items-center gap-2.5 select-none ${className}`}>
      {showTimestamps && (
        <span className="w-9 text-right font-mono text-[11px] text-text-muted shrink-0">
          {formatTime(isDragging ? dragTime : effectiveCurrentTime)}
        </span>
      )}

      {/* Track bar container */}
      <div
        ref={barRef}
        role={seekable ? 'slider' : 'progressbar'}
        aria-label="Audio timeline"
        aria-valuemin={0}
        aria-valuemax={effectiveDuration || 100}
        aria-valuenow={Math.round(isDragging ? dragTime : effectiveCurrentTime)}
        tabIndex={seekable ? 0 : -1}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
        onKeyDown={handleKeyDown}
        className={`group relative flex-1 bg-white/10 hover:bg-white/15 rounded-full transition-all duration-200 ${
          seekable ? 'cursor-pointer py-1 -my-1' : 'cursor-default'
        } focus:outline-none focus-visible:ring-1 focus-visible:ring-accent`}
      >
        {/* Actual Progress Bar Track */}
        <div className={`relative w-full rounded-full overflow-hidden ${heightClass} transition-all duration-200 bg-white/10`}>
          {/* Fill line with direct percentage width: immune to CSS scaleX NaN / 100% full glitch */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent/90 via-accent to-white rounded-full transition-[width] duration-75 ease-out shadow-[0_0_12px_rgba(201,169,77,0.7)]"
            style={{
              width: `${safePercent}%`,
            }}
          >
            {/* Glowing lead edge */}
            <div className="absolute top-0 right-0 h-full w-2.5 bg-white rounded-full blur-[1px] opacity-80" />
          </div>

          {/* Buffering pulse overlay */}
          {progressInfo.isBuffering && (
            <div className="absolute inset-0 bg-accent/30 rounded-full animate-pulse" />
          )}
        </div>

        {/* Hover timestamp tooltip */}
        {seekable && isHovering && effectiveDuration > 0 && (
          <div
            className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded-md bg-black/90 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white pointer-events-none shadow-lg z-30 transition-opacity"
            style={{
              left: `${Math.min(95, Math.max(5, hoverPercent))}%`,
            }}
          >
            {formatTime(hoverTimeSec)}
          </div>
        )}

        {/* Scrubber thumb - visible on hover & drag when seekable */}
        {seekable && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] ring-2 ring-accent pointer-events-none transition-transform duration-150 ${
              isDragging ? 'scale-125 opacity-100' : 'scale-0 group-hover:scale-100 opacity-90'
            }`}
            style={{
              left: `${safePercent}%`,
            }}
          />
        )}
      </div>

      {showTimestamps && (
        <span className="w-9 text-left font-mono text-[11px] text-text-muted shrink-0">
          {formatTime(effectiveDuration)}
        </span>
      )}
    </div>
  );
}

export { UniversalProgressBar };
