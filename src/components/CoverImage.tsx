'use client';

import { useState, useMemo } from 'react';
import { getThumbnailFallbackChain } from '@/types/music';

export interface CoverImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  aspectRatio?: 'square' | 'video' | 'auto';
  priority?: boolean;
}

export function VinylPlaceholder({ size = 'md' }: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' }) {
  const iconSizeClass =
    size === 'xs'
      ? 'w-4 h-4'
      : size === 'sm'
      ? 'w-5 h-5'
      : size === 'md'
      ? 'w-6 h-6'
      : size === 'lg'
      ? 'w-10 h-10'
      : 'w-16 h-16';

  return (
    <div
      className="w-full h-full flex items-center justify-center select-none overflow-hidden relative"
      style={{
        background: 'radial-gradient(circle at 35% 35%, var(--placeholder-grad-1) 0%, var(--placeholder-grad-2) 60%, var(--placeholder-grad-3) 100%)',
      }}
      aria-label="Album cover placeholder"
    >
      {/* Vinyl record grooves */}
      <svg
        className="w-full h-full absolute inset-0 opacity-40 pointer-events-none"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.06)" strokeWidth="0.75" />
        <circle cx="50" cy="50" r="39" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />
        <circle cx="50" cy="50" r="32" stroke="rgba(255,255,255,0.06)" strokeWidth="0.75" />
        <circle cx="50" cy="50" r="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.75" />
        <circle cx="50" cy="50" r="18" stroke="rgba(201,169,77,0.22)" strokeWidth="1" />
        <circle cx="50" cy="50" r="6" fill="#C9A94D" fillOpacity="0.85" />
        <circle cx="50" cy="50" r="2" fill="#0C0D10" />
      </svg>

      {/* Center ambient glow badge */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
        <svg
          className={`${iconSizeClass} text-text-secondary transition-transform`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
          <path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10" />
        </svg>
      </div>
    </div>
  );
}

export default function CoverImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  size = 'md',
  aspectRatio = 'square',
  priority = false,
}: CoverImageProps) {
  const candidates = useMemo(() => getThumbnailFallbackChain(src || undefined), [src]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasError, setHasError] = useState(candidates.length === 0);
  const [isLoading, setIsLoading] = useState(candidates.length > 0);
  const [prevSrc, setPrevSrc] = useState(src);

  // Adjust state during render when src changes (official React pattern)
  if (prevSrc !== src) {
    setPrevSrc(src);
    setCandidateIndex(0);
    setHasError(candidates.length === 0);
    setIsLoading(candidates.length > 0);
  }

  const currentSrc = candidates[candidateIndex];

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : '';

  return (
    <div
      className={`relative overflow-hidden bg-surface w-full h-full ${aspectClass} ${containerClassName}`}
    >
      {/* Loading Skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-surface-hover animate-pulse z-10 pointer-events-none" />
      )}

      {/* SVG Vinyl Placeholder when broken or no source */}
      {hasError || !currentSrc ? (
        <VinylPlaceholder size={size} />
      ) : (
        <img
          src={currentSrc}
          alt={alt || 'Album cover'}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${
            isLoading ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
          } transition-all duration-300`}
        />
      )}
    </div>
  );
}
