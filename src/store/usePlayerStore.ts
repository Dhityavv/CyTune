import { create } from 'zustand';
import { Track, SyncedLyrics, RepeatMode, RecommendedTrack } from '@/types/music';
import { db } from '@/lib/db';

interface PlayerStore {
  // State
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  playbackError: string | null;
  loadingTrackId: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  queueIndex: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  isExpanded: boolean;
  showLyrics: boolean;
  lyrics: SyncedLyrics | null;
  loadingLyrics: boolean;
  ambientColor: string;
  isQueueDrawerOpen: boolean;

  // Smart Autoplay State
  smartAutoplayEnabled: boolean;
  recommendationQueue: RecommendedTrack[];
  loadingRecommendations: boolean;
  lastSeedTrackId: string | null;
  consecutiveArtistStreak: number;

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  playQueueIndex: (index: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (seconds: number) => void;
  updateTime: (current: number, duration: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleExpanded: () => void;
  toggleLyrics: () => void;
  toggleQueueDrawer: () => void;
  closeQueueDrawer: () => void;
  setIsBuffering: (buffering: boolean) => void;
  setPlaybackError: (message: string | null) => void;
  setLoadingTrackId: (id: string | null) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setAmbientColor: (color: string) => void;
  loadLyricsForCurrent: () => Promise<void>;

  // Smart Autoplay Actions
  toggleSmartAutoplay: () => void;
  fetchSmartRecommendations: (seed?: Track, forceRefresh?: boolean) => Promise<void>;
  removeRecommendation: (trackId: string) => void;
  dismissRecommendation: (track: Track) => Promise<void>;
  playRecommendedTrack: (track: RecommendedTrack) => void;
  recordFeedback: (
    action: 'complete_play' | 'liked' | 'early_skip' | 'dismissed_recommendation',
    track: Track,
    durationPlayed?: number
  ) => Promise<void>;
}

function ensureQueueEntryId(track: Track): Track {
  if (track.queueEntryId) return track;
  return {
    ...track,
    queueEntryId: `${track.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  isBuffering: false,
  playbackError: null,
  loadingTrackId: null,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  queue: [],
  queueIndex: 0,
  repeatMode: 'all',
  isShuffle: false,
  isExpanded: false,
  showLyrics: false,
  lyrics: null,
  loadingLyrics: false,
  ambientColor: '#10B981',
  isQueueDrawerOpen: false,

  // Smart Autoplay defaults
  smartAutoplayEnabled: true,
  recommendationQueue: [],
  loadingRecommendations: false,
  lastSeedTrackId: null,
  consecutiveArtistStreak: 0,

  setIsBuffering: (buffering: boolean) => set({ isBuffering: buffering }),
  setPlaybackError: (message: string | null) => set({ playbackError: message }),
  setLoadingTrackId: (id: string | null) => set({ loadingTrackId: id }),
  toggleQueueDrawer: () => set((state) => ({ isQueueDrawerOpen: !state.isQueueDrawerOpen })),
  closeQueueDrawer: () => set({ isQueueDrawerOpen: false }),

  playQueueIndex: async (index: number) => {
    const { queue, queueIndex, currentTrack } = get();
    if (index < 0 || index >= queue.length) return;
    const targetTrack = queue[index];

    // If clicking currently active track, cleanly toggle play/pause without restarting or wiping lyrics
    if (index === queueIndex && currentTrack?.id === targetTrack.id) {
      get().togglePlay();
      return;
    }

    let streak = get().consecutiveArtistStreak;
    if (
      currentTrack &&
      currentTrack.artist.toLowerCase().trim() === targetTrack.artist.toLowerCase().trim()
    ) {
      streak += 1;
    } else {
      streak = 1;
    }

    set({
      currentTrack: targetTrack,
      queueIndex: index,
      isPlaying: true,
      isBuffering: true,
      loadingTrackId: targetTrack.id,
      currentTime: 0,
      duration: targetTrack.duration || 0,
      lyrics: null,
      consecutiveArtistStreak: streak,
    });

    try {
      // Hindari duplikat: hapus entri lama untuk track yang sama, lalu tambah baru (pindah ke depan)
      await db.history.where('trackId').equals(targetTrack.id).delete();
      await db.history.add({
        trackId: targetTrack.id,
        track: targetTrack,
        playedAt: Date.now(),
      });
    } catch {
      // Ignored
    }

    get().loadLyricsForCurrent();
    if (get().smartAutoplayEnabled) {
      get().fetchSmartRecommendations(targetTrack);
    }
  },

  playTrack: async (track: Track, newQueue?: Track[]) => {
    const trackWithKey = ensureQueueEntryId(track);
    const prevTrack = get().currentTrack;
    let streak = get().consecutiveArtistStreak;

    if (prevTrack && prevTrack.artist.toLowerCase().trim() === track.artist.toLowerCase().trim()) {
      streak += 1;
    } else {
      streak = 1;
    }

    // Direct-to-Smart-Autoplay (Spotify style):
    // Only use newQueue if explicitly provided (e.g. Play All in library).
    // Otherwise, single track is played directly and queue holds [trackWithKey] with upcoming songs driven by Smart Autoplay.
    const currentQueue = newQueue && newQueue.length > 0 ? newQueue.map(ensureQueueEntryId) : [trackWithKey];
    const idx = newQueue && newQueue.length > 0
      ? currentQueue.findIndex((t) => t.id === track.id)
      : 0;

    set({
      currentTrack: trackWithKey,
      queue: currentQueue,
      queueIndex: idx === -1 ? 0 : idx,
      isPlaying: true,
      isBuffering: true,
      loadingTrackId: track.id,
      currentTime: 0,
      duration: track.duration || 0,
      lyrics: null,
      consecutiveArtistStreak: streak,
    });

    try {
      await db.history.where('trackId').equals(track.id).delete();
      await db.history.add({
        trackId: track.id,
        track,
        playedAt: Date.now(),
      });
    } catch {
      // Ignored
    }

    get().loadLyricsForCurrent();
    get().fetchSmartRecommendations(track, true);
  },

  togglePlay: () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) return;
    set({ isPlaying: !isPlaying });
  },

  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),

  nextTrack: () => {
    const {
      queue,
      queueIndex,
      isShuffle,
      repeatMode,
      currentTime,
      duration,
      currentTrack,
      recommendationQueue,
    } = get();

    // Check for early skip signal (skipped within 25 seconds on a song longer than 45s)
    if (currentTrack && currentTime < 25 && duration > 45) {
      get().recordFeedback('early_skip', currentTrack, currentTime);
    }

    if (repeatMode === 'one') {
      get().seekTo(0);
      set({ isPlaying: true });
      return;
    }

    let nextIdx = queueIndex + 1;

    if (isShuffle && queue.length > 1) {
      nextIdx = Math.floor(Math.random() * queue.length);
      const nextSong = queue[nextIdx];
      if (nextSong) get().playTrack(nextSong, queue);
      return;
    }

    // If queue still has upcoming songs, play next
    if (nextIdx < queue.length) {
      const nextSong = queue[nextIdx];
      if (nextSong) {
        get().playTrack(nextSong, queue);
      }
      return;
    }

    // Direct-to-Smart-Autoplay: seamlessly transition to top recommendation when enabled
    if (get().smartAutoplayEnabled && recommendationQueue.length > 0) {
      const nextRec = recommendationQueue[0];
      get().playRecommendedTrack(nextRec);
    } else if (repeatMode === 'all' && queue.length > 0) {
      const firstSong = queue[0];
      if (firstSong) {
        get().playTrack(firstSong, queue);
      }
    } else {
      set({ isPlaying: false });
    }
  },

  prevTrack: () => {
    const { queue, queueIndex, currentTime } = get();
    if (queue.length === 0) return;

    // If played more than 3 seconds, replay current song
    if (currentTime > 3) {
      get().seekTo(0);
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    const prevSong = queue[prevIdx];
    if (prevSong) {
      get().playTrack(prevSong, queue);
    }
  },

  seekTo: (seconds: number) => {
    set({ currentTime: seconds });
    if (typeof window !== 'undefined' && window.__orbitPlayerSeek) {
      window.__orbitPlayerSeek(seconds);
    }
  },

  updateTime: (current: number, duration: number) => {
    set({
      currentTime: current,
      duration: duration || get().duration,
    });
  },

  setVolume: (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    set({ volume: clamped, isMuted: clamped === 0 });
    if (typeof window !== 'undefined' && window.__orbitPlayerSetVolume) {
      window.__orbitPlayerSetVolume(clamped);
    }
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const nextMuted = !isMuted;
    set({ isMuted: nextMuted });
    if (typeof window !== 'undefined' && window.__orbitPlayerSetMuted) {
      window.__orbitPlayerSetMuted(nextMuted, volume);
    }
  },

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  cycleRepeat: () => {
    set((state) => {
      if (state.repeatMode === 'off') return { repeatMode: 'all' };
      if (state.repeatMode === 'all') return { repeatMode: 'one' };
      return { repeatMode: 'off' };
    });
  },

  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  toggleLyrics: () => set((state) => ({ showLyrics: !state.showLyrics })),

  addToQueue: (track: Track) => {
    const trackWithKey = ensureQueueEntryId(track);
    set((state) => ({ queue: [...state.queue, trackWithKey] }));
  },

  removeFromQueue: (index: number) => {
    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(index, 1);
      let newIndex = state.queueIndex;
      if (index < state.queueIndex) {
        newIndex = state.queueIndex - 1;
      } else if (index === state.queueIndex) {
        // Removing the playing entry keeps it playing; point the index at the
        // entry before it so "next" resumes with the track that slid in.
        newIndex = Math.min(index - 1, newQueue.length - 1);
      }
      return { queue: newQueue, queueIndex: newIndex };
    });
  },

  clearQueue: () => set({ queue: [], queueIndex: -1 }),

  setAmbientColor: (color: string) => set({ ambientColor: color }),

  loadLyricsForCurrent: async () => {
    const track = get().currentTrack;
    if (!track) return;

    set({ loadingLyrics: true });
    try {
      const res = await fetch(
        `/api/lyrics?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}&duration=${track.duration}`
      );
      if (res.ok) {
        const data: SyncedLyrics = await res.json();
        set({ lyrics: data, loadingLyrics: false });
      } else {
        set({ lyrics: null, loadingLyrics: false });
      }
    } catch {
      set({ lyrics: null, loadingLyrics: false });
    }
  },

  // ==========================================
  // SMART AUTOPLAY & RECOMMENDATION ENGINE
  // ==========================================

  toggleSmartAutoplay: () => {
    const nextVal = !get().smartAutoplayEnabled;
    set({
      smartAutoplayEnabled: nextVal,
      ...(nextVal ? {} : { recommendationQueue: [] }),
    });

    if (nextVal && get().currentTrack) {
      get().fetchSmartRecommendations(get().currentTrack!);
    }
  },

  fetchSmartRecommendations: async (seed?: Track, forceRefresh: boolean = false) => {
    const seedTrack = seed || get().currentTrack;
    if (!seedTrack) return;

    // Avoid redundant calls for the same seed unless forced
    if (!forceRefresh && get().lastSeedTrackId === seedTrack.id && get().recommendationQueue.length > 2) {
      return;
    }

    set({ loadingRecommendations: true, lastSeedTrackId: seedTrack.id });

    try {
      // Gather local signals from IndexedDB
      const now = Date.now();
      const recentHistory = await db.history.orderBy('playedAt').reverse().limit(25).toArray();
      const recentIds = recentHistory.map((h) => h.trackId);

      // Active cooldowns
      const activeCooldowns = await db.recommendationCooldowns
        .where('cooldownUntil')
        .above(now)
        .toArray();
      const cooldownIds = activeCooldowns.map((c) => c.trackId);

      // Early skips & negative feedback
      const skipFeedbacks = await db.userFeedback
        .where('action')
        .equals('early_skip')
        .toArray();
      const skippedTrackIds = skipFeedbacks.map((s) => s.trackId);
      const skippedArtists = skipFeedbacks.map((s) => s.artist);

      // Liked songs & positive signals
      const likedTracks = await db.likedTracks.toArray();
      const likedTrackIds = likedTracks.map((l) => l.id);
      const likedArtists = likedTracks.map((l) => l.artist);

      // Currently queued IDs
      const currentQueueIds = get().queue.map((t) => t.id);
      const allToAvoid = Array.from(new Set([...recentIds, ...currentQueueIds]));

      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedTrack,
          recentIds: allToAvoid,
          cooldownIds,
          skippedTrackIds,
          skippedArtists,
          likedArtists,
          likedTrackIds,
          consecutiveArtistCount: get().consecutiveArtistStreak,
          limit: 12,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const recs: RecommendedTrack[] = data.recommendations || [];
        set({ recommendationQueue: recs, loadingRecommendations: false });
      } else {
        set({ loadingRecommendations: false });
      }
    } catch (err) {
      console.error('Error fetching smart recommendations:', err);
      set({ loadingRecommendations: false });
    }
  },

  removeRecommendation: (trackId: string) => {
    set((state) => ({
      recommendationQueue: state.recommendationQueue.filter((t) => t.id !== trackId),
    }));
  },

  dismissRecommendation: async (track: Track) => {
    // Record rejection feedback so the recommender down-weights it
    await get().recordFeedback('dismissed_recommendation', track);
    // Cooldown keeps the dismissed track out of the next candidate batch
    try {
      await db.recommendationCooldowns.put({
        trackId: track.id,
        artist: track.artist,
        cooldownUntil: Date.now() + 2.5 * 60 * 60 * 1000,
        timesRecommended: 1,
      });
    } catch {
      // Ignored
    }
    get().removeRecommendation(track.id);
  },

  playRecommendedTrack: async (recTrack: RecommendedTrack) => {
    const trackWithKey = ensureQueueEntryId(recTrack);
    const updatedRecs = get().recommendationQueue.filter((t) => t.id !== recTrack.id);

    // Set cooldown in IndexedDB for 2.5 hours so this track is not repeated soon
    try {
      db.recommendationCooldowns.put({
        trackId: recTrack.id,
        artist: recTrack.artist,
        cooldownUntil: Date.now() + 2.5 * 60 * 60 * 1000,
        timesRecommended: 1,
      });
    } catch {
      // Ignored
    }

    let streak = get().consecutiveArtistStreak;
    const prevTrack = get().currentTrack;
    if (
      prevTrack &&
      prevTrack.artist.toLowerCase().trim() === recTrack.artist.toLowerCase().trim()
    ) {
      streak += 1;
    } else {
      streak = 1;
    }

    set({
      currentTrack: trackWithKey,
      queue: [trackWithKey],
      queueIndex: 0,
      recommendationQueue: updatedRecs,
      isPlaying: true,
      isBuffering: true,
      loadingTrackId: recTrack.id,
      currentTime: 0,
      duration: recTrack.duration || 0,
      lyrics: null,
      consecutiveArtistStreak: streak,
    });

    try {
      await db.history.where('trackId').equals(recTrack.id).delete();
      await db.history.add({
        trackId: recTrack.id,
        track: recTrack,
        playedAt: Date.now(),
      });
    } catch {
      // Ignored
    }

    get().loadLyricsForCurrent();
    if (updatedRecs.length < 4) {
      get().fetchSmartRecommendations(recTrack, true);
    }
  },

  recordFeedback: async (action, track, durationPlayed) => {
    try {
      await db.userFeedback.add({
        trackId: track.id,
        artist: track.artist,
        action,
        timestamp: Date.now(),
        durationPlayed,
      });
    } catch {
      // Ignored
    }
  },
}));
