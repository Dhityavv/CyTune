'use client';

import React from 'react';
import { Play, Trash2, Loader2 } from 'lucide-react';
import { Track } from '@/types/music';
import CoverImage from '@/components/CoverImage';
import { clickable } from '@/lib/a11y';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export interface QueueItemProps {
  track: Track;
  index?: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

export const QueueItem = React.memo(function QueueItem({
  track,
  isCurrent,
  isPlaying,
  isBuffering,
  onSelect,
  onRemove,
}: QueueItemProps) {
  return (
    <div
      onClick={onSelect}
      {...clickable(onSelect)}
      className={`group flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer select-none border ${
        isCurrent
          ? 'bg-surface-hover border-accent/40 shadow-md shadow-black/40 text-text-primary'
          : 'bg-transparent border-transparent hover:bg-surface hover:border-border-subtle text-text-secondary'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Thumbnail with hover play/pause or active equalizer */}
        <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-sidebar shadow-sm">
          <CoverImage
            src={track.thumbnail}
            alt={track.title}
            size="xs"
            className="w-full h-full object-cover"
          />

          {/* Overlay state: Playing equalizer, Buffering spinner, or Hover play/pause */}
          {isCurrent ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              {isBuffering ? (
                <Loader2 className="w-3.5 h-3.5 text-accent animate-spin" />
              ) : isPlaying ? (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-3 bg-accent rounded-full animate-pulse" />
                  <span className="w-0.5 h-1.5 bg-accent rounded-full animate-pulse delay-75" />
                  <span className="w-0.5 h-2.5 bg-accent rounded-full animate-pulse delay-150" />
                </div>
              ) : (
                <Play className="w-3 h-3 text-accent fill-current translate-x-0.5" />
              )}
            </div>
          ) : (
            <div className="absolute inset-0 bg-canvas/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20">
              <Play className="w-3 h-3 text-accent fill-current translate-x-0.5" />
            </div>
          )}
        </div>

        {/* Title & Artist */}
        <div className="min-w-0 flex-1 pr-2">
          <p
            className={`text-[13px] font-medium truncate ${
              isCurrent ? 'text-accent font-semibold' : 'text-text-primary group-hover:text-text-primary'
            }`}
          >
            {track.title}
          </p>
          <p className="text-[11px] text-text-secondary truncate mt-0.5">{track.artist}</p>
        </div>
      </div>

      {/* Right meta & actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {isCurrent && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">
            {isBuffering ? 'Buffering' : isPlaying ? 'Playing' : 'Paused'}
          </span>
        )}

        <span className="text-[11px] font-mono text-text-muted">
          {formatTime(track.duration)}
        </span>

        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="opacity-80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 min-w-9 min-h-9 rounded-md hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-all flex items-center justify-center"
            aria-label={`Remove ${track.title} from queue`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});

export default QueueItem;
