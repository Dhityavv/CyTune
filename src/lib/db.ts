import Dexie, { Table } from 'dexie';
import { Track } from '@/types/music';

export interface LikedTrack extends Track {
  likedAt: number;
  userId?: string;
}

export interface PlaylistRecord {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  createdAt: number;
  updatedAt: number;
  tracks: Track[];
  userId?: string;
}

export interface HistoryRecord {
  id?: number;
  trackId: string;
  track: Track;
  playedAt: number;
  userId?: string;
}

export interface UserFeedbackRecord {
  id?: number;
  trackId: string;
  artist: string;
  action: 'complete_play' | 'liked' | 'early_skip' | 'dismissed_recommendation';
  timestamp: number;
  durationPlayed?: number;
}

export interface RecommendationCooldownRecord {
  trackId: string;
  artist: string;
  cooldownUntil: number; // Timestamp until which this track should not be recommended
  timesRecommended: number;
}

export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash?: string;
  salt?: string;
  username: string;
  displayName: string;
  createdAt: number;
  avatarUrl?: string;
  bio?: string;
  coins: number;
  equippedFrame?: string | null;
  equippedBorder?: string | null;
  equippedBackground?: string | null;
  unlockedCosmetics?: string[];
  isPremium?: boolean;
  isClerkUser?: boolean;
  guessSongBest?: number;
  triviaBest?: number;
}

export interface TrackCommentRecord {
  id: string;
  songId: string;
  userId: string;
  userEmail?: string;
  userName: string;
  avatarUrl?: string;
  content: string;
  likes: number;
  createdAt: number;
}

export class CyTuneDB extends Dexie {
  likedTracks!: Table<LikedTrack, string>;
  playlists!: Table<PlaylistRecord, string>;
  history!: Table<HistoryRecord, number>;
  userFeedback!: Table<UserFeedbackRecord, number>;
  recommendationCooldowns!: Table<RecommendationCooldownRecord, string>;
  authUsers!: Table<AuthUserRecord, string>;
  trackComments!: Table<TrackCommentRecord, string>;

  constructor() {
    super('CyTuneDatabase');
    this.version(1).stores({
      likedTracks: 'id, likedAt, title, artist',
      playlists: 'id, name, createdAt, updatedAt',
      history: '++id, trackId, playedAt',
    });

    this.version(2).stores({
      likedTracks: 'id, likedAt, title, artist',
      playlists: 'id, name, createdAt, updatedAt',
      history: '++id, trackId, playedAt',
      userFeedback: '++id, trackId, artist, action, timestamp',
      recommendationCooldowns: 'trackId, artist, cooldownUntil',
    });

    this.version(3).stores({
      likedTracks: 'id, likedAt, title, artist',
      playlists: 'id, name, createdAt, updatedAt',
      history: '++id, trackId, playedAt',
      userFeedback: '++id, trackId, artist, action, timestamp',
      recommendationCooldowns: 'trackId, artist, cooldownUntil',
      authUsers: 'email, id, username',
      trackComments: 'id, songId, userId, createdAt',
    });

    this.version(4).stores({
      likedTracks: 'id, likedAt, title, artist, userId',
      playlists: 'id, name, createdAt, updatedAt, userId',
      history: '++id, trackId, playedAt, userId',
      userFeedback: '++id, trackId, artist, action, timestamp',
      recommendationCooldowns: 'trackId, artist, cooldownUntil',
      authUsers: 'email, id, username',
      trackComments: 'id, songId, userId, createdAt',
    });
  }
}

export const db = new CyTuneDB();

// Global Clean Launch Slate: Guarantee all users start from a clean 0 slate (history, favorites, playlists, comments)
if (typeof window !== 'undefined') {
  const LAUNCH_RESET_KEY = 'cytune_clean_launch_v1';
  if (!localStorage.getItem(LAUNCH_RESET_KEY)) {
    try {
      db.likedTracks.clear().catch(() => {});
      db.playlists.clear().catch(() => {});
      db.history.clear().catch(() => {});
      db.userFeedback.clear().catch(() => {});
      db.recommendationCooldowns.clear().catch(() => {});
      db.trackComments.clear().catch(() => {});
      // Clear legacy keys in localStorage
      localStorage.removeItem('cytune_local_users');
      localStorage.removeItem('cytune_active_user');
      localStorage.removeItem('cytune_mock_history');
      localStorage.removeItem('orbittune_local_users');
      localStorage.removeItem('orbittune_active_user');
      localStorage.removeItem('orbittune_mock_history');
      localStorage.removeItem('orbittune_clean_launch_v2');
      localStorage.setItem(LAUNCH_RESET_KEY, 'true');
    } catch {
      // ignore
    }
  }
}
