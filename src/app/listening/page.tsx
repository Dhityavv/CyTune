'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListPlus,
  ChevronUp,
  ChevronDown,
  ListMusic,
  Share2,
  Check,
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  Lock,
} from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import CoverImage from '@/components/CoverImage';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, TrackCommentRecord } from '@/lib/db';
import { usePlaylistDialogStore } from '@/store/usePlaylistDialog';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';
import AuthModal from '@/components/AuthModal';
import UniversalProgressBar from '@/components/UniversalProgressBar';
import AudioVisualizer from '@/components/AudioVisualizer';
import { extractDominantColor, ColorRGB, getFallbackColor } from '@/lib/colorExtractor';
import { LyricLineRenderer } from '@/components/lyrics/LyricLineRenderer';

function formatElapsed(seconds: number): string {
  if (isNaN(seconds) || seconds < 0 || !Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatRemaining(currentTime: number, duration: number): string {
  if (isNaN(duration) || duration <= 0 || !Number.isFinite(duration)) return '-0:00';
  const rem = Math.max(0, duration - currentTime);
  const mins = Math.floor(rem / 60);
  const secs = Math.floor(rem % 60);
  return `-${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatCommentTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Precision calibrated vocal lead (+0.45s). Compensates for browser audio buffering & YouTube Iframe clock lag so lyrics highlight right on vocal onset.
const VOCAL_ANTICIPATION_LEAD = 0.45;

export default function ListeningPage() {
  const router = useRouter();

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    isShuffle,
    lyrics,
    queue,
    queueIndex,
    recommendationQueue,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    recordFeedback,
    playQueueIndex,
    removeFromQueue,
    playRecommendedTrack,
  } = usePlayerStore(
    useShallow((s) => ({
      currentTrack: s.currentTrack,
      isPlaying: s.isPlaying,
      currentTime: s.currentTime,
      duration: s.duration,
      repeatMode: s.repeatMode,
      isShuffle: s.isShuffle,
      lyrics: s.lyrics,
      queue: s.queue,
      queueIndex: s.queueIndex,
      recommendationQueue: s.recommendationQueue,
      togglePlay: s.togglePlay,
      nextTrack: s.nextTrack,
      prevTrack: s.prevTrack,
      seekTo: s.seekTo,
      toggleShuffle: s.toggleShuffle,
      cycleRepeat: s.cycleRepeat,
      recordFeedback: s.recordFeedback,
      playQueueIndex: s.playQueueIndex,
      removeFromQueue: s.removeFromQueue,
      playRecommendedTrack: s.playRecommendedTrack,
    }))
  );

  const { user } = useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Dominant Ambient Color State
  const [ambientColor, setAmbientColorState] = useState<ColorRGB>(() =>
    getFallbackColor(currentTrack?.title || 'CyTune')
  );

  // High-Performance Hardware-Accelerated Mouse Follower (Ref-based, ZERO React state re-renders)
  const mouseOrbRef = useRef<HTMLDivElement>(null);
  const targetPosRef = useRef<{ x: number; y: number }>({ x: 500, y: 300 });
  const currentPosRef = useRef<{ x: number; y: number }>({ x: 500, y: 300 });

  // Clock for Dynamic Status Bar
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('9:41');
  const [currentDateStr, setCurrentDateStr] = useState<string>('Sun Nov 15');

  // Micro-interaction animation states
  const [isHeartPopping, setIsHeartPopping] = useState(false);
  const [isHeartUnloving, setIsHeartUnloving] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Interactive Comments State (starts from 0, completely real & persistent in Dexie)
  const [commentInput, setCommentInput] = useState('');
  const comments = useLiveQuery(
    async () => {
      if (!currentTrack) return [];
      return await db.trackComments.where('songId').equals(currentTrack.id).reverse().sortBy('createdAt');
    },
    [currentTrack?.id],
    []
  );

  // Lyrics scroll refs and jitter-lock ref
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserNavigatingRef = useRef(false);
  const navigateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup navigation lock on unmount
  useEffect(() => {
    return () => {
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
    };
  }, []);

  // Favorite status from Dexie (accessible to guests and logged-in users)
  const isLiked = useLiveQuery(
    async () => {
      if (!currentTrack) return false;
      const found = await db.likedTracks.get(currentTrack.id);
      if (!found) return false;
      if (!user) {
        return !found.userId || found.userId === 'guest';
      }
      return !found.userId || found.userId === user.id || found.userId === 'guest';
    },
    [currentTrack?.id, user?.id],
    false
  );

  // Dynamic Heart (Like/Unlike) micro-interaction with particle burst & deflate
  const toggleFavorite = async () => {
    if (!currentTrack) return;
    const activeUserId = user?.id || 'guest';
    if (isLiked) {
      setIsHeartUnloving(true);
      setTimeout(() => setIsHeartUnloving(false), 400);
      await db.likedTracks.delete(currentTrack.id);
    } else {
      setIsHeartPopping(true);
      setTimeout(() => setIsHeartPopping(false), 650);
      await db.likedTracks.put({ ...currentTrack, likedAt: Date.now(), userId: activeUserId });
      recordFeedback('liked', currentTrack);
    }
  };

  // Share link micro-interaction
  const handleShare = () => {
    if (!currentTrack) return;
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  // Post a real comment (Requires Authentication)
  const handlePostComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (!currentTrack) return;

    const trimmed = commentInput.trim();
    if (!trimmed) return;

    const newComment: TrackCommentRecord = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      songId: currentTrack.id,
      userId: user.id,
      userEmail: user.email,
      userName: user.display_name || user.username || 'Listener',
      avatarUrl: user.avatar_url || '',
      content: trimmed,
      likes: 0,
      createdAt: Date.now(),
    };

    try {
      await db.trackComments.put(newComment);
      // Also post to API in background if online
      fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId: currentTrack.id,
          content: trimmed,
          user,
        }),
      }).catch(() => {});
      setCommentInput('');
    } catch (err) {
      console.warn('Failed to save comment:', err);
    }
  };

  // Delete own comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await db.trackComments.delete(commentId);
      if (currentTrack) {
        fetch(`/api/comments?id=${encodeURIComponent(commentId)}&songId=${encodeURIComponent(currentTrack.id)}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Failed to delete comment:', err);
    }
  };

  // Toggle like on comment
  const handleToggleCommentLike = async (comment: TrackCommentRecord) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      await db.trackComments.update(comment.id, {
        likes: (comment.likes || 0) + 1,
      });
    } catch {}
  };

  // Clock Update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}`);

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      setCurrentDateStr(`${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Extract Dominant Color from Artwork
  useEffect(() => {
    if (!currentTrack) return;
    let cancelled = false;

    extractDominantColor(currentTrack.thumbnail, currentTrack.title).then((col) => {
      if (!cancelled) {
        setAmbientColorState(col);
        usePlayerStore.getState().setAmbientColor(col.hex);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentTrack]);

  // Ultra-Fast Hardware-Accelerated 60-120FPS Mouse Follower Loop (Zero React State Thrash)
  useEffect(() => {
    let animId: number;
    const lerp = () => {
      const dx = targetPosRef.current.x - currentPosRef.current.x;
      const dy = targetPosRef.current.y - currentPosRef.current.y;
      
      currentPosRef.current.x += dx * 0.28;
      currentPosRef.current.y += dy * 0.28;

      if (mouseOrbRef.current) {
        mouseOrbRef.current.style.transform = `translate3d(${currentPosRef.current.x - 225}px, ${currentPosRef.current.y - 225}px, 0)`;
      }

      animId = requestAnimationFrame(lerp);
    };
    animId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    targetPosRef.current.x = e.clientX - rect.left;
    targetPosRef.current.y = e.clientY - rect.top;
  }, []);

  // Synchronized vocal time with calibrated lead compensation (+0.45s)
  const syncedTime = currentTime + VOCAL_ANTICIPATION_LEAD;

  // Compute Active Lyric Line Index with millisecond-tight anticipation
  const activeLyricIdx = useMemo(() => {
    if (!lyrics?.lines || lyrics.lines.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < lyrics.lines.length; i++) {
      if (syncedTime >= lyrics.lines[i].time) {
        idx = i;
      } else {
        break;
      }
    }
    return idx;
  }, [syncedTime, lyrics?.lines]);

  // Butter-Smooth Auto-Scroll to Active Lyric (bypassed during manual navigation)
  useEffect(() => {
    if (activeLyricIdx < 0 || isUserNavigatingRef.current) return;
    const container = lyricsContainerRef.current;
    const targetEl = lineRefs.current[activeLyricIdx];
    if (!container || !targetEl) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();
    const currentScroll = container.scrollTop;

    // Center active lyric at 36% height of container for ideal eye-level reading
    const relativeTop = targetRect.top - containerRect.top;
    const targetScrollTop = currentScroll + relativeTop - containerRect.height * 0.36;

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: 'smooth',
    });
  }, [activeLyricIdx]);

  // Seamless, butter-smooth navigation to any lyric line (jitter-free)
  const navigateToLyricLine = useCallback(
    (targetIdx: number) => {
      if (!lyrics?.lines || targetIdx < 0 || targetIdx >= lyrics.lines.length) return;
      const targetLine = lyrics.lines[targetIdx];
      if (!targetLine) return;

      // Lock auto-scroll during manual jump so they don't fight each other
      isUserNavigatingRef.current = true;
      if (navigateTimeoutRef.current) clearTimeout(navigateTimeoutRef.current);
      navigateTimeoutRef.current = setTimeout(() => {
        isUserNavigatingRef.current = false;
      }, 650);

      // 1. Optimistic immediate time update
      usePlayerStore.setState({ currentTime: targetLine.time });

      // 2. Hardware-accelerated smooth scroll immediately to target line
      const container = lyricsContainerRef.current;
      const targetEl = lineRefs.current[targetIdx];
      if (container && targetEl) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = targetEl.getBoundingClientRect();
        const currentScroll = container.scrollTop;
        const relativeTop = targetRect.top - containerRect.top;
        const targetScrollTop = currentScroll + relativeTop - containerRect.height * 0.36;

        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
      }

      seekTo(targetLine.time);
    },
    [lyrics?.lines, seekTo]
  );

  // Jump to next or previous lyric line
  const jumpLyricLine = (direction: 'up' | 'down') => {
    if (!lyrics?.lines || lyrics.lines.length === 0) return;
    const currentBase = activeLyricIdx === -1 ? 0 : activeLyricIdx;
    const targetIdx =
      direction === 'up'
        ? Math.max(0, currentBase - 1)
        : Math.min(lyrics.lines.length - 1, currentBase + 1);
    navigateToLyricLine(targetIdx);
  };

  // Upcoming queue items
  const upcomingQueue = useMemo(() => {
    if (!queue || queue.length === 0) return [];
    return queue.slice(queueIndex + 1);
  }, [queue, queueIndex]);

  if (!currentTrack) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0B0E] flex items-center justify-center p-6 text-center">
        <div className="space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-accent mx-auto">
            <ListMusic className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-white">No Track Selected</h1>
          <p className="text-xs text-white/50 leading-relaxed">
            Select any track from your library or search to experience the visual karaoke experience.
          </p>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-block px-6 py-2.5 rounded-full bg-accent text-[#101114] text-xs font-bold hover:bg-accent-hover transition-colors shadow-lg shadow-[#C9A94D]/20"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Active line vocal timing calculations
  const activeLineObj = activeLyricIdx >= 0 && lyrics?.lines ? lyrics.lines[activeLyricIdx] : null;
  const nextLineObj = activeLyricIdx >= 0 && lyrics?.lines ? lyrics.lines[activeLyricIdx + 1] : null;
  const lineStartTime = activeLineObj ? activeLineObj.time : 0;
  const gapToNext = nextLineObj ? Math.max(1, nextLineObj.time - lineStartTime) : 4;

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`fixed inset-0 z-50 bg-[#0A0B0E] p-4 sm:p-6 lg:p-7 select-none overflow-hidden flex flex-col transition-colors duration-1000 ${
        isPlaying ? '' : 'music-paused'
      }`}
    >
      {/* ========================================================= */}
      {/* --- A. CLEAN LUMINOUS AMBIENT LIGHTING (NO DARK MUD) ---  */}
      {/* ========================================================= */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none z-0"
        style={{ transform: 'translateZ(0)', contain: 'paint' }}
      >
        {/* 1. Luminous blurred duplicate of album cover */}
        {currentTrack.thumbnail && (
          <img
            src={currentTrack.thumbnail}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-150 blur-[85px] opacity-60 brightness-110 saturate-[2.4] transition-all duration-1000 will-change-transform"
          />
        )}

        {/* 2. Top-left primary ambient glow orb */}
        <div
          className="absolute -top-24 -left-24 w-[750px] h-[750px] rounded-full blur-[90px] opacity-55 transition-all duration-1000 will-change-transform"
          style={{
            background: `radial-gradient(circle, ${ambientColor.hex} 0%, transparent 70%)`,
          }}
        />

        {/* 3. Bottom-right counter-ambient glow orb */}
        <div
          className="absolute -bottom-24 -right-24 w-[700px] h-[700px] rounded-full blur-[95px] opacity-45 transition-all duration-1000 will-change-transform"
          style={{
            background: `radial-gradient(circle, ${ambientColor.rgba(0.9)} 0%, transparent 70%)`,
          }}
        />

        {/* 4. Interactive Mouse Follower Light Orb (GPU Accelerated, 0ms input latency) */}
        <div
          ref={mouseOrbRef}
          className="absolute top-0 left-0 w-[450px] h-[450px] rounded-full blur-[80px] opacity-50 pointer-events-none will-change-transform"
          style={{
            transform: 'translate3d(275px, 75px, 0)',
            background: `radial-gradient(circle, ${ambientColor.hex} 0%, ${ambientColor.rgba(0.4)} 50%, transparent 75%)`,
          }}
        />

        {/* 5. Subtle Stardust Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* ========================================================= */}
      {/* --- B. TOP STATUS BAR (Time & Back Button) ---            */}
      {/* ========================================================= */}
      <header className="relative z-20 flex items-center justify-between pb-3 sm:pb-4 shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-white/70 pl-2">
          <span className="text-white/95 font-mono tracking-wider font-bold">{currentTimeStr}</span>
          <span className="text-white/30">·</span>
          <span>{currentDateStr}</span>
        </div>

        <div className="flex items-center gap-3 pr-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-xl border border-white/15 text-white text-xs font-semibold shadow-lg transition-all"
            title="Back to previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* --- C. MAIN STAGE (Left Column + Right Lyrics Column) ---   */}
      {/* ========================================================= */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 flex-1 min-h-0 overflow-hidden items-stretch">
        {/* ========================================================= */}
        {/* LEFT COLUMN: SCROLLABLE INDEPENDENTLY (Cards, Queue, Comments) */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[360px] xl:w-[390px] shrink-0 flex flex-col gap-4 h-full min-h-0 overflow-y-auto custom-scrollbar pr-1.5 pb-8">
          {/* 1. Artwork Card (Clean 1:1 Aspect Ratio matching other cards' width) */}
          <div className="relative aspect-square w-full shrink-0 rounded-3xl overflow-hidden border border-white/12 bg-white/[0.03] backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-white/10 group transition-transform duration-500 hover:scale-[1.01]">
            {/* Background Ambient Glow */}
            {currentTrack.thumbnail && (
              <img
                src={currentTrack.thumbnail}
                alt=""
                className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-35 brightness-75 transition-transform duration-700 group-hover:scale-120"
              />
            )}
            
            {/* Center Stage: Crisp 1:1 Cover Image */}
            <div className="relative z-10 w-full h-full p-2.5 flex items-center justify-center">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)] ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-[1.02]">
                <CoverImage
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  size="xl"
                  priority
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Top-Left Badge: "♪ Now playing" */}
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-md z-20">
              <span className="text-[11px] font-semibold text-white/90 tracking-wide flex items-center gap-1">
                <span className="text-accent text-xs">♪</span> Now playing
              </span>
            </div>

            {/* Bottom Gradient with Title, Artist & Elapsed Counter */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end justify-between z-20">
              <div className="min-w-0 pr-3">
                <p className="text-[11px] font-mono uppercase tracking-wider text-accent font-bold">
                  {currentTrack.artist}
                </p>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate drop-shadow-md">
                  {currentTrack.title}
                </h3>
              </div>
              <div className="shrink-0 font-mono text-[11px] text-white/80 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
                {formatElapsed(currentTime)}
              </div>
            </div>
          </div>

          {/* 2. Song Control Deck Card (Pure Frosted Glass with Micro-Interactions & Audio Visualizer) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-white/10 space-y-3 shrink-0">
            {/* Title, Artist, and Micro-Interaction Action Buttons */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2
                  className="text-base sm:text-lg font-black text-white truncate tracking-tight"
                  title={currentTrack.title}
                >
                  {currentTrack.title}
                </h2>
                <p className="text-xs text-white/60 truncate mt-0.5">
                  {currentTrack.artistId ? (
                    <Link
                      href={`/artist?id=${encodeURIComponent(currentTrack.artistId)}`}
                      className="hover:text-accent transition-colors"
                    >
                      {currentTrack.artist}
                    </Link>
                  ) : (
                    currentTrack.artist
                  )}
                </p>
              </div>

              {/* Action buttons row with Micro-Interactions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* 1. Favorite Button with Heart Burst Pop & Deflate Particles */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    className={`relative p-2.5 rounded-xl border transition-all duration-300 active:scale-90 ${
                      isLiked
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.4)]'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                    } ${isHeartPopping ? 'scale-125' : ''} ${isHeartUnloving ? 'scale-75' : ''}`}
                    title={isLiked ? 'Unlike song' : 'Like this song'}
                  >
                    <Heart
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isLiked ? 'fill-current scale-110' : ''
                      } ${isHeartPopping ? 'animate-bounce' : ''}`}
                    />
                  </button>

                  {/* Floating Heart Burst Particles on Like */}
                  {isHeartPopping && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <span className="absolute -top-3 -right-2 text-rose-400 text-xs animate-ping">❤️</span>
                      <span className="absolute -top-3 -left-2 text-pink-300 text-xs animate-ping delay-75">✨</span>
                      <span className="absolute -bottom-2 right-0 text-rose-400 text-[10px] animate-ping delay-100">❤️</span>
                    </div>
                  )}
                </div>

                {/* 2. Add to Playlist Button (Opens full Playlist selection dialog) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => usePlaylistDialogStore.getState().open(currentTrack)}
                    className="p-2.5 rounded-xl border bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90"
                    title="Add to playlist"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>
                </div>

                {/* 3. Share Button with Copied Feedback */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleShare}
                    className={`p-2.5 rounded-xl border transition-all duration-300 active:scale-90 ${
                      copiedShare
                        ? 'bg-accent/25 border-accent/50 text-accent shadow-[0_0_16px_rgba(201,169,77,0.4)] scale-105'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                    title="Share song link"
                  >
                    {copiedShare ? (
                      <Check className="w-4 h-4 text-accent stroke-[3]" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Copied Tooltip Pill */}
                  {copiedShare && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-black/90 border border-accent/40 text-[10px] font-bold text-accent shadow-xl pointer-events-none animate-fade-in">
                      Copied!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Real-time Dynamic Audio Visualizer Waves */}
            <div className="py-0.5">
              <AudioVisualizer className="h-7 w-full opacity-80" barCount={36} />
            </div>

            {/* Revamped Scrubber Timeline Bar (Keyed by Track ID to guarantee clean 0-start on song change) */}
            <div className="space-y-1.5 pt-0.5">
              <UniversalProgressBar
                key={currentTrack.id}
                trackId={currentTrack.id}
                overrideTime={currentTime}
                overrideDuration={duration}
                seekable={true}
                showTimestamps={false}
                heightClass="h-1.5 group-hover:h-2.5"
                className="w-full"
              />
              <div className="flex items-center justify-between text-[11px] font-mono text-white/40 px-0.5">
                <span>{formatElapsed(currentTime)}</span>
                <span>{formatRemaining(currentTime, duration)}</span>
              </div>
            </div>

            {/* Playback Controls Row */}
            <div className="flex items-center justify-between pt-0.5 px-1">
              <button
                type="button"
                onClick={toggleShuffle}
                className={`p-2 rounded-xl transition-colors ${
                  isShuffle ? 'text-accent' : 'text-white/40 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={prevTrack}
                className="p-2 rounded-xl text-white/70 hover:text-white transition-transform active:scale-95"
                title="Previous track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Big Glowing Play/Pause */}
              <button
                type="button"
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                style={{
                  boxShadow: `0 0 25px ${ambientColor.rgba(0.6)}`,
                }}
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={nextTrack}
                className="p-2 rounded-xl text-white/70 hover:text-white transition-transform active:scale-95"
                title="Next track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                type="button"
                onClick={cycleRepeat}
                className={`p-2 rounded-xl transition-colors ${
                  repeatMode !== 'off' ? 'text-accent' : 'text-white/40 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3. Up Next / Queue Card (Clean Frosted Glass with Guaranteed Unique Keys) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-white/10 space-y-3 shrink-0">
            {/* Queue Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">Queue · Up Next</h3>
              </div>
              <span className="text-[11px] font-mono text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                {upcomingQueue.length > 0 ? `${upcomingQueue.length} songs` : 'Autoplay'}
              </span>
            </div>

            {/* Upcoming Track List */}
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
              {upcomingQueue.length > 0 ? (
                upcomingQueue.map((track, idx) => {
                  const absoluteQueueIdx = queueIndex + 1 + idx;
                  return (
                    <div
                      key={`queue-item-${track.id}-${absoluteQueueIdx}-${idx}`}
                      onClick={() => playQueueIndex(absoluteQueueIdx)}
                      className="group flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-sm">
                          <CoverImage
                            src={track.thumbnail}
                            alt={track.title}
                            size="sm"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="w-3 h-3 text-white fill-current" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate group-hover:text-accent transition-colors">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-white/50 truncate">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-white/40">
                          {formatElapsed(track.duration || 0)}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(absoluteQueueIdx);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : recommendationQueue.length > 0 ? (
                recommendationQueue.slice(0, 3).map((recTrack, rIdx) => (
                  <div
                    key={`rec-item-${recTrack.id}-${rIdx}`}
                    onClick={() => playRecommendedTrack(recTrack)}
                    className="group flex items-center justify-between p-2 rounded-2xl bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/10">
                        <CoverImage
                          src={recTrack.thumbnail}
                          alt={recTrack.title}
                          size="sm"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-3 h-3 text-white fill-current" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-accent transition-colors">
                          {recTrack.title}
                        </p>
                        <p className="text-[11px] text-white/50 truncate flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-accent" />
                          {recTrack.artist}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                      Next
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-white/40">Queue is empty</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Continuous smart autoplay is active</p>
                </div>
              )}
            </div>
          </div>

          {/* 4. Real Community Comments Card (Clean 0-start, Login Required, Deletable by Author) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.04] backdrop-blur-2xl border border-white/12 shadow-[0_8px_30px_rgba(0,0,0,0.15)] ring-1 ring-white/10 space-y-3.5 shrink-0">
            {/* Comments Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">Comments</h3>
              </div>
              <span className="text-[11px] font-mono text-white/40 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10">
                {comments ? comments.length : 0}
              </span>
            </div>

            {/* Interactive Comment Input Box */}
            {user ? (
              <form onSubmit={handlePostComment} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accent to-amber-200 text-black text-[10px] font-black flex items-center justify-center shrink-0 shadow-sm">
                  {(user.display_name || user.username || 'U')[0].toUpperCase()}
                </div>
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Share your thoughts on this track..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-accent/60 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="p-1.5 rounded-full bg-accent text-black disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95 transition-all shadow-md shadow-accent/20"
                  title="Post comment"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-all text-center"
              >
                <Lock className="w-3.5 h-3.5 text-accent" />
                <span>Sign in to comment</span>
              </button>
            )}

            {/* Comments List */}
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-0.5">
              {comments && comments.length > 0 ? (
                comments.map((comment) => {
                  const isAuthor = Boolean(
                    user &&
                      (comment.userId === user.id ||
                        (comment.userEmail && user.email && comment.userEmail.toLowerCase() === user.email.toLowerCase()))
                  );

                  return (
                    <div
                      key={comment.id}
                      className="group p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5 text-xs hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-accent/70 to-amber-300 text-black text-[9px] font-bold flex items-center justify-center shadow-xs">
                            {comment.userName[0]?.toUpperCase() || 'U'}
                          </div>
                          <span className="font-bold text-white/90">{comment.userName}</span>
                          <span className="text-[10px] font-mono text-white/40">
                            · {formatCommentTime(comment.createdAt)}
                          </span>
                        </div>

                        {/* Actions: Delete (Author only) & Like */}
                        <div className="flex items-center gap-2">
                          {isAuthor && (
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                              title="Delete your comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleCommentLike(comment)}
                            className="flex items-center gap-1 text-[11px] font-mono text-white/40 hover:text-rose-400 transition-colors"
                          >
                            <Heart className={`w-3 h-3 ${comment.likes > 0 ? 'fill-current text-rose-400' : ''}`} />
                            <span>{comment.likes || 0}</span>
                          </button>
                        </div>
                      </div>
                      <p className="text-white/80 leading-relaxed pl-7">{comment.content}</p>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center space-y-1">
                  <p className="text-xs text-white/40">No comments yet on this track.</p>
                  <p className="text-[10px] text-white/25">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: INDEPENDENT SYNCHRONIZED FLOATING LYRICS    */}
        {/* ========================================================= */}
        <div className="flex-1 min-w-0 flex flex-col h-full min-h-0 relative overflow-hidden">
          {/* Header row: "Lyrics" title, LIVE badge, and Jump Buttons */}
          <div className="flex items-center justify-between pb-4 px-6 sm:px-10 lg:px-14 xl:px-16 border-b border-white/5 z-20 shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Lyrics</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                LIVE
              </span>
            </div>

            {/* Vertical Jump Controls (⌃ Up, ⌄ Down buttons with smooth navigation) */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => jumpLyricLine('up')}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-90"
                title="Previous lyric line"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => jumpLyricLine('down')}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all shadow-md active:scale-90"
                title="Next lyric line"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Synchronized Lyrics Scroll Container: Generous internal padding prevents ANY glow or text clipping */}
          <div
            ref={lyricsContainerRef}
            className="relative flex-1 min-h-0 overflow-y-auto py-12 px-6 sm:px-10 lg:px-14 xl:px-16 space-y-8 sm:space-y-10 custom-scrollbar z-10"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
            }}
          >
            {lyrics?.lines && lyrics.lines.length > 0 ? (
              lyrics.lines.map((line, idx) => {
                const isActive = idx === activeLyricIdx;
                const isPast = idx < activeLyricIdx;
                const nextLine = lyrics.lines[idx + 1];

                return (
                  <div
                    key={`${line.time}-${idx}`}
                    ref={(el) => {
                      lineRefs.current[idx] = el;
                    }}
                    onClick={() => navigateToLyricLine(idx)}
                    className={`transition-opacity duration-500 ease-out cursor-pointer select-none rounded-3xl p-3 sm:p-5 ${
                      isActive
                        ? 'opacity-100'
                        : isPast
                        ? 'opacity-40 hover:opacity-70'
                        : 'opacity-55 hover:opacity-85'
                    }`}
                  >
                    <LyricLineRenderer
                      line={line}
                      index={idx}
                      isActive={isActive}
                      isPast={isPast}
                      currentTime={syncedTime}
                      size="lg"
                    />
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center space-y-3">
                <p className="text-sm font-medium text-white/40">Synchronized lyrics unavailable for this track.</p>
                <p className="text-xs text-white/20">Enjoy the Hi-Fi audio stream and dynamic ambient light.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal for Commenting / Account Authentication */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode="login"
      />
    </div>
  );
}
