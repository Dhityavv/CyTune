import Dexie, { Table } from 'dexie';
import { Track } from '@/types/music';

export interface LikedTrack extends Track {
  likedAt: number;
}

export interface PlaylistRecord {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  createdAt: number;
  updatedAt: number;
  tracks: Track[];
}

export interface HistoryRecord {
  id?: number;
  trackId: string;
  track: Track;
  playedAt: number;
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

export class OrbitTuneDB extends Dexie {
  likedTracks!: Table<LikedTrack, string>;
  playlists!: Table<PlaylistRecord, string>;
  history!: Table<HistoryRecord, number>;
  userFeedback!: Table<UserFeedbackRecord, number>;
  recommendationCooldowns!: Table<RecommendationCooldownRecord, string>;

  constructor() {
    super('OrbitTuneDatabase');
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
  }
}

export const db = new OrbitTuneDB();
