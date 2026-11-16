'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioSession, AudioProgressInfo } from '@/lib/audioSession';
import { usePlayerStore } from '@/store/usePlayerStore';

interface UniversalProgressBarProps {
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
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function UniversalProgressBar({
  seekable = true,
  showTimestamps = false,
  heightClass = 'h-1 group-hover:h-1.5',
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

  const barRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);

  // Subscribe to centralized audio session 60FPS RAF progress
  useEffect(() => {
    const unsubscribe = audioSession.subscribeProgress((info) => {
      setProgressInfo(info);
      if (!isDragging && fillRef.current) {
        const pct = Math.min(100, Math.max(0, info.progressPercent));
        fillRef.current.style.transform = `scaleX(${pct / 100})`;
      }
    });
    return unsubscribe;
  }, [isDragging]);

  const effectiveDuration = overrideDuration !== undefined ? overrideDuration : progressInfo.duration;
  const effectiveCurrentTime = isDragging
    ? dragTime
    : overrideTime !== undefined
    ? overrideTime
    : progressInfo.currentTime;

  const currentPercent = isDragging
    ? dragProgressPercent
    : effectiveDuration > 0
    ? (effectiveCurrentTime / effectiveDuration) * 100
    : 0;

  // Handle Drag / Click seeking
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!seekable || effectiveDuration <= 0) return;
    const bar = barRef.current;
    if (!bar) return;

    bar.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const rect = bar.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = rect.width > 0 ? clickX / rect.width : 0;
    const seekSec = ratio * effectiveDuration;

    setDragProgressPercent(ratio * 100);
    setDragTime(seekSec);

    if (fillRef.current) {
      fillRef.current.style.transform = `scaleX(${ratio})`;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !seekable || effectiveDuration <= 0) return;
    const bar = barRef.current;
    if (!bar) return;

    const rect = bar.getBoundingClientRect();
    const moveX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = rect.width > 0 ? moveX / rect.width : 0;
    const seekSec = ratio * effectiveDuration;

    setDragProgressPercent(ratio * 100);
    setDragTime(seekSec);

    if (fillRef.current) {
      fillRef.current.style.transform = `scaleX(${ratio})`;
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

    // Commit seek to player
    if (seekable && effectiveDuration > 0) {
      if (onSeekCommit) {
        onSeekCommit(dragTime);
      } else {
        usePlayerStore.getState().seekTo(dragTime);
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
      if (onSeekCommit) {
        onSeekCommit(target);
      } else {
        usePlayerStore.getState().seekTo(target);
      }
    }
  };

  return (
    <div className={`w-full flex items-center gap-2.5 select-none ${className}`}>
      {showTimestamps && (
        <span className="w-9 text-right font-mono text-[11px] text-text-muted shrink-0">
          {formatTime(effectiveCurrentTime)}
        </span>
      )}

      {/* Track bar container */}
      <div
        ref={barRef}
        role={seekable ? 'slider' : 'progressbar'}
        aria-label="Audio timeline"
        aria-valuemin={0}
        aria-valuemax={effectiveDuration || 100}
        aria-valuenow={Math.round(effectiveCurrentTime)}
        tabIndex={seekable ? 0 : -1}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className={`group relative flex-1 bg-surface-hover/80 rounded-full transition-all duration-150 ${
          seekable ? 'cursor-pointer' : 'cursor-default'
        } ${heightClass} focus:outline-none focus-visible:ring-1 focus-visible:ring-accent`}
      >
        {/* Fill line with GPU Transform Scaling (60fps smooth) */}
        <div
          ref={fillRef}
          className="absolute top-0 left-0 w-full h-full bg-accent rounded-full will-change-transform"
          style={{
            transformOrigin: 'left',
            transform: `scaleX(${Math.min(1, Math.max(0, currentPercent / 100))})`,
          }}
        />

        {/* Buffering pulse overlay */}
        {progressInfo.isBuffering && (
          <div className="absolute inset-0 bg-accent/30 rounded-full animate-pulse" />
        )}

        {/* Scrubber thumb - visible on hover & drag when seekable */}
        {seekable && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent shadow-md shadow-black/80 transition-opacity pointer-events-none ${
              isDragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{
              left: `${Math.min(100, Math.max(0, currentPercent))}%`,
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

