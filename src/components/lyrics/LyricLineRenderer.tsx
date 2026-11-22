'use client';

import React, { useMemo } from 'react';
import { LyricsLine } from '@/types/music';

export interface LyricLineRendererProps {
  line: LyricsLine;
  index: number;
  isActive: boolean;
  isPast?: boolean;
  currentTime: number;
  nextStartTime?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Premium Apple Music & Spotify-grade Lyric Line Renderer.
 * - 100% clean typography: Zero distracting pop-ups, zero emojis, zero "cenat-cenut" shaking.
 * - Radiant active vocal luminescence with smooth hardware-accelerated transitions.
 * - Accurate word highlighting when true word-level timestamps exist;
 *   uniform active illumination for standard line-synced LRC.
 */
export const LyricLineRenderer = React.memo(function LyricLineRenderer({
  line,
  isActive,
  isPast = false,
  currentTime,
  className = '',
  size = 'md',
}: LyricLineRendererProps) {
  const hasWordTimestamps = Boolean(line.words && line.words.length > 0);

  const fontClasses =
    size === 'lg'
      ? 'text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight gap-x-2.5 sm:gap-x-3 gap-y-2'
      : size === 'sm'
      ? 'text-sm sm:text-base font-bold leading-snug gap-x-1.5 gap-y-1'
      : 'text-lg sm:text-xl font-bold leading-snug gap-x-2 gap-y-1.5';

  // 1. If line has real millisecond word timestamps
  if (hasWordTimestamps && line.words) {
    return (
      <p
        className={`flex flex-wrap items-baseline transition-all duration-300 ease-out select-none ${fontClasses} ${
          isActive
            ? 'text-white'
            : isPast
            ? 'text-white/25 font-medium'
            : 'text-white/40 font-semibold'
        } ${className}`}
      >
        {line.words.map((w, wIdx) => {
          const isWordSung = isActive ? currentTime >= w.time : isPast;

          return (
            <span
              key={wIdx}
              className={`inline-block transition-all duration-200 ease-out ${
                isActive && isWordSung
                  ? 'text-white font-black drop-shadow-[0_2px_12px_rgba(255,255,255,0.55)] scale-[1.02]'
                  : isActive && !isWordSung
                  ? 'text-white/55 font-bold'
                  : isPast
                  ? 'text-white/25'
                  : 'text-white/40'
              }`}
            >
              {w.text}
            </span>
          );
        })}
      </p>
    );
  }

  // 2. Standard Line-Synced LRC (95% of tracks):
  // When active, the ENTIRE line glows gracefully in crisp white without premature dimming.
  return (
    <p
      className={`transition-all duration-300 ease-out select-none ${fontClasses} ${
        isActive
          ? 'text-white font-extrabold sm:font-black drop-shadow-[0_2px_16px_rgba(255,255,255,0.45)]'
          : isPast
          ? 'text-white/25 font-medium'
          : 'text-white/40 font-semibold'
      } ${className}`}
    >
      {line.text}
    </p>
  );
});
