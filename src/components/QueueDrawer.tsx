'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ListMusic,
  Trash2,
  Sparkles,
  RefreshCw,
  Play,
  Heart,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import QueueItem from '@/components/QueueItem';
import CoverImage from '@/components/CoverImage';
import { db } from '@/lib/db';

export default function QueueDrawer() {
  const isQueueDrawerOpen = usePlayerStore((s) => s.isQueueDrawerOpen);
  const closeQueueDrawer = usePlayerStore((s) => s.closeQueueDrawer);
  const queue = usePlayerStore((s) => s.queue);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isBuffering = usePlayerStore((s) => s.isBuffering);
  const clearQueue = usePlayerStore((s) => s.clearQueue);
  const smartAutoplayEnabled = usePlayerStore((s) => s.smartAutoplayEnabled);
  const toggleSmartAutoplay = usePlayerStore((s) => s.toggleSmartAutoplay);
  const recommendationQueue = usePlayerStore((s) => s.recommendationQueue);
  const loadingRecommendations = usePlayerStore((s) => s.loadingRecommendations);
  const fetchSmartRecommendations = usePlayerStore((s) => s.fetchSmartRecommendations);
  const playRecommendedTrack = usePlayerStore((s) => s.playRecommendedTrack);
  const dismissRecommendation = usePlayerStore((s) => s.dismissRecommendation);
  const recordFeedback = usePlayerStore((s) => s.recordFeedback);

  return (
    <AnimatePresence>
      {isQueueDrawerOpen && (
        <>
          {/* Backdrop on mobile/tablet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeQueueDrawer}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:bg-black/40"
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 z-50 bg-sidebar border-l border-border-subtle shadow-2xl flex flex-col select-none overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-sidebar/90 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-accent">
                  <ListMusic className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-text-primary tracking-tight">Queue</h2>
                  <p className="text-[11px] text-text-secondary">{queue.length} tracks</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Clear queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={closeQueueDrawer}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors"
                  title="Close queue drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 ">
              {/* Autoplay Toggle Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border-subtle">
                <button
                  onClick={toggleSmartAutoplay}
                  className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                    smartAutoplayEnabled ? 'text-accent' : 'text-text-muted'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Smart Autoplay {smartAutoplayEnabled ? 'On' : 'Off'}</span>
                </button>

                {smartAutoplayEnabled && currentTrack && (
                  <button
                    onClick={() => fetchSmartRecommendations(currentTrack, true)}
                    className={`p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors ${
                      loadingRecommendations ? 'animate-spin text-accent' : ''
                    }`}
                    title="Refresh recommendations"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 1. Now Playing Track */}
              {currentTrack ? (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block px-1">
                    Now Playing
                  </span>
                  <QueueItem
                    track={currentTrack}
                    index={0}
                    isCurrent={true}
                    isPlaying={isPlaying}
                    isBuffering={isBuffering}
                    onSelect={() => usePlayerStore.getState().togglePlay()}
                  />
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-surface border border-border-subtle flex items-center justify-center mx-auto text-text-muted">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-text-primary">Queue is empty</p>
                  <p className="text-[11px] text-text-secondary max-w-[200px] mx-auto">
                    Play a song from Explore or Search to start Smart Autoplay.
                  </p>
                </div>
              )}

              {/* 2. Next Up via Smart Autoplay */}
              {recommendationQueue.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border-subtle">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                      Next Up • Smart Autoplay
                    </span>
                    <span className="text-[10px] text-accent font-mono font-medium">
                      {recommendationQueue.length} recommendations
                    </span>
                  </div>

                  {recommendationQueue.map((rec) => (
                    <div
                      key={rec.id}
                      className="group flex items-center justify-between p-2 rounded-xl bg-surface/60 hover:bg-surface-hover border border-white/[0.05] transition-all"
                    >
                      <div
                        onClick={() => playRecommendedTrack(rec)}
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      >
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-sidebar">
                          <CoverImage
                            src={rec.thumbnail}
                            alt={rec.title}
                            size="xs"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                            <Play className="w-3.5 h-3.5 fill-white text-text-primary" />
                          </div>
                        </div>

                        <div className="min-w-0 pr-2">
                          <p className="text-[13px] font-medium text-text-primary truncate group-hover:text-accent">
                            {rec.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-text-secondary truncate max-w-[110px]">
                              {rec.artist}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-accent/15 text-accent">
                              {rec.reason.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await db.likedTracks.put({ ...rec, likedAt: Date.now() });
                            recordFeedback('liked', rec);
                          }}
                          className="p-1 text-text-muted hover:text-rose-400 transition-colors"
                          title="Add to liked"
                        >
                          <Heart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissRecommendation(rec);
                          }}
                          className="p-1 text-text-muted hover:text-text-primary transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
