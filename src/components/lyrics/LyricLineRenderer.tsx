'use client';

import React, { useMemo } from 'react';
import { LyricsLine } from '@/types/music';
import { parseLyricWords, SongPace, StyledWord } from '@/lib/lyricKeywords';
import { renderLyricAsset } from '@/components/LyricAssets';

export interface LyricLineRendererProps {
  line: LyricsLine;
  index: number;
  isActive: boolean;
  isPast?: boolean;
  currentTime: number;
  nextStartTime?: number;
  songPace?: SongPace;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LyricLineRenderer = React.memo(function LyricLineRenderer({
  line,
  index,
  isActive,
  isPast = false,
  currentTime,
  nextStartTime,
  songPace = 'dynamic',
  className = '',
  size = 'md',
}: LyricLineRendererProps) {
  // Memoize tokenization so it does not recalculate on every animation frame
  const words = useMemo(
    () => parseLyricWords(line.text, songPace, line.words, line.time, line.endTime),
    [line.text, songPace, line.words, line.time, line.endTime]
  );

  const totalActualWords = useMemo(
    () => words.filter((w) => w.clean.length > 0).length,
    [words]
  );

  // Natural human vocal cadence calculation per song pacing
  const cadencePerWord = songPace === 'hype' ? 0.2 : songPace === 'chill' ? 0.32 : 0.24;
  const maxNaturalDuration = Math.max(1.2, totalActualWords * cadencePerWord);
  const gapToNext = nextStartTime && nextStartTime > line.time ? nextStartTime - line.time : 4.0;
  const vocalActiveDuration = Math.min(gapToNext * 0.85, maxNaturalDuration);

  const lineStartTime = line.time;
  const isLineCompleted =
    isPast ||
    (line.endTime
      ? currentTime >= line.endTime
      : currentTime >= lineStartTime + vocalActiveDuration);

  const lineProgress =
    isActive && !isLineCompleted
      ? Math.min(1, Math.max(0, (currentTime - lineStartTime) / vocalActiveDuration))
      : isPast || isLineCompleted
      ? 1
      : 0;

  let actualWordCounter = 0;

  const fontClasses =
    size === 'lg'
      ? 'text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight gap-x-3 gap-y-2.5'
      : size === 'sm'
      ? 'text-base sm:text-lg font-bold leading-snug gap-x-2 gap-y-1'
      : 'text-xl sm:text-2xl font-extrabold leading-snug gap-x-2.5 gap-y-1.5';

  const badgeSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6';

  return (
    <p
      className={`flex flex-wrap items-baseline transition-colors duration-500 ease-out select-none ${fontClasses} ${
        isActive && !isLineCompleted
          ? 'text-white'
          : isPast || isLineCompleted
          ? 'text-white/40'
          : 'text-white/55'
      } ${className}`}
    >
      {words.map((w: StyledWord, wIdx: number) => {
        if (!w.clean) {
          return <span key={wIdx}>{w.raw}</span>;
        }

        const wordThreshold = totalActualWords > 0 ? actualWordCounter / totalActualWords : 0;
        const isWordSung =
          w.time !== undefined
            ? currentTime >= w.time
            : isPast || isLineCompleted
            ? true
            : isActive
            ? lineProgress >= wordThreshold
            : false;
        actualWordCounter++;

        const isParenthetical = w.raw.includes('(') || w.raw.includes(')');
        const hasBadge = Boolean(w.assetType || w.emoji);

        return (
          <span
            key={wIdx}
            className={`relative inline-block transition-colors duration-500 ease-out ${
              isParenthetical ? 'italic' : ''
            } ${hasBadge ? (size === 'sm' ? 'mr-2.5 sm:mr-3' : 'mr-3 sm:mr-4') : ''} ${
              isActive && isWordSung
                ? w.isKeyword
                  ? `${w.colorClass} ${w.extraClass || ''} ${w.effectClass || ''}`
                  : 'lyric-sung-active'
                : isActive && !isWordSung
                ? 'text-white/70 font-black'
                : isPast || isLineCompleted
                ? 'text-white/40'
                : 'text-white/55'
            }`}
          >
            <span>{w.display || w.raw}</span>

            {/* Floating Micro-Badge SVG Asset */}
            {w.assetType && (
              <span
                className={`absolute -top-3.5 -right-5 z-20 pointer-events-none transform transition-all duration-500 ease-out ${
                  isActive && isWordSung ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
              >
                {renderLyricAsset(w.assetType, badgeSize)}
              </span>
            )}

            {/* Floating Emoji Micro-Badge */}
            {!w.assetType && w.emoji && (
              <span
                className={`absolute -top-3 -right-5 z-20 pointer-events-none ${
                  size === 'sm' ? 'text-xs' : 'text-base sm:text-lg'
                } transform transition-all duration-500 ease-out ${
                  isActive && isWordSung ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
              >
                {w.emoji}
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
});
