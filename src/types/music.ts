export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  albumId?: string;
  thumbnail: string;
  duration: number; // in seconds
  durationFormatted?: string;
  streamUrl?: string;
  queueEntryId?: string;
}

export interface LyricsWord {
  text: string;
  time: number; // in seconds
  endTime?: number; // in seconds
}

export interface LyricsLine {
  time: number; // in seconds
  endTime?: number; // in seconds
  text: string;
  words?: LyricsWord[];
}

export interface SyncedLyrics {
  id?: number;
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;
  plainLyrics?: string;
  syncedLyrics?: string;
  hasWordSync?: boolean;
  autoOffset?: number;
  lines: LyricsLine[];
}

export type RepeatMode = 'off' | 'all' | 'one';

export type RecommendationReasonType =
  | 'same_artist'
  | 'similar_artist'
  | 'similar_mood'
  | 'similar_genre'
  | 'listening_history'
  | 'discovery';

export interface RecommendationReason {
  type: RecommendationReasonType;
  label: string;
  detail?: string;
  color: string; // Tailwind color class or hex
}

export interface RecommendedTrack extends Track {
  score: number; // 0 - 100
  reason: RecommendationReason;
  detectedMood?: string;
  detectedGenre?: string;
  scoreBreakdown?: {
    moodSimilarity: number;
    genreCompatibility: number;
    artistSimilarity: number;
    energyCompatibility: number;
    historyAffinity: number;
    diversityBoost: number;
  };
}

export function getHighResCover(url?: string): string {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  if (url.includes('googleusercontent.com') || url.includes('ggpht.com')) {
    if (/=w\d+-h\d+/.test(url)) {
      return url.replace(/=w\d+-h\d+[^?#]*/, '=w800-h800-l90-rj');
    }
    if (/=s\d+/.test(url)) {
      return url.replace(/=s\d+[^?#]*/, '=s800-c');
    }
    return `${url}=w800-h800-l90-rj`;
  }
  if (url.includes('i.ytimg.com')) {
    return url.replace(/(?:hqdefault|mqdefault|default)\.jpg/, 'maxresdefault.jpg');
  }
  return url;
}

export function getThumbnailFallbackChain(url?: string): string[] {
  if (!url || typeof url !== 'string' || !url.trim()) return [];
  const chain: string[] = [];

  if (url.includes('i.ytimg.com')) {
    const videoIdMatch = url.match(/\/vi(?:_webp)?\/([a-zA-Z0-9_-]+)\//);
    if (videoIdMatch && videoIdMatch[1]) {
      const vid = videoIdMatch[1];
      chain.push(`https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`);
      chain.push(`https://i.ytimg.com/vi/${vid}/sddefault.jpg`);
      chain.push(`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`);
      chain.push(`https://i.ytimg.com/vi/${vid}/mqdefault.jpg`);
      return chain;
    }
  }

  if (url.includes('googleusercontent.com') || url.includes('ggpht.com')) {
    const highRes = getHighResCover(url);
    if (highRes) chain.push(highRes);
    const midRes = /=w\d+-h\d+/.test(url)
      ? url.replace(/=w\d+-h\d+[^?#]*/, '=w544-h544-l90-rj')
      : /=s\d+/.test(url)
      ? url.replace(/=s\d+[^?#]*/, '=s544-c')
      : `${url}=w544-h544-l90-rj`;
    if (midRes && midRes !== highRes) chain.push(midRes);
    if (url && url !== highRes && url !== midRes) chain.push(url);
    return Array.from(new Set(chain));
  }

  const highRes = getHighResCover(url);
  if (highRes) chain.push(highRes);
  if (url && url !== highRes) chain.push(url);

  return Array.from(new Set(chain));
}

