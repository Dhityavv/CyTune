import { Innertube, UniversalCache } from 'youtubei.js';
import { Ytdl } from '@distube/ytdl-core';
import { Track, getHighResCover } from '@/types/music';

let innertubeInstance: Innertube | null = null;
let ytdlInstance: Ytdl | null = null;

export async function getInnertube(): Promise<Innertube> {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
    });
  }
  return innertubeInstance;
}

export function getYtdl(): Ytdl {
  if (!ytdlInstance) {
    ytdlInstance = new Ytdl();
  }
  return ytdlInstance;
}

export async function searchMusic(query: string): Promise<Track[]> {
  try {
    const yt = await getInnertube();
    const tracks: Track[] = [];

    // 1. Try search with type: 'song' first to get real playable songs
    try {
      const songResults = await yt.music.search(query, { type: 'song' });
      const shelf = songResults.contents?.[0];
      const shelfItems = (shelf as any)?.contents || [];
      for (const item of shelfItems) {
        if (!item.id) continue;
        const title = typeof item.title === 'string' ? item.title : item.title?.text;
        if (!title) continue;

        const durationSec = item.duration?.seconds || 0;
        const durationFormatted =
          item.duration?.text ||
          (durationSec > 0
            ? `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`
            : '3:30');

        const rawThumb =
          item.thumbnails?.[0]?.url ||
          item.thumbnail?.contents?.[0]?.url ||
          `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
        const thumb = getHighResCover(rawThumb);
        const artistName =
          item.artists?.[0]?.name || item.author?.name || 'Unknown Artist';

        tracks.push({
          id: item.id,
          title,
          artist: artistName,
          artistId: (item.artists?.[0] as any)?.channel_id || (item.artists?.[0] as any)?.id,
          album: item.album?.name,
          thumbnail: thumb,
          duration: durationSec,
          durationFormatted,
        });
      }
    } catch (err) {
      console.warn('yt.music.search with type song warning:', err);
    }

    if (tracks.length > 0) {
      return tracks;
    }

    // 2. Fallback to general music search if song-specific returned empty
    const result = await yt.music.search(query);
    const songsList = result.songs?.contents || [];
    for (const item of songsList) {
      if (!item.id || !item.title) continue;
      const durationSec = item.duration?.seconds || 0;
      const durationFormatted =
        item.duration?.text ||
        (durationSec > 0
          ? `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`
          : '3:30');

      const rawThumb =
        item.thumbnails?.[0]?.url ||
        (item as any).thumbnail?.contents?.[0]?.url ||
        `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
      const thumb = getHighResCover(rawThumb);
      const artistName = item.artists?.[0]?.name || item.author?.name || 'Unknown Artist';

      tracks.push({
        id: item.id,
        title: typeof item.title === 'string' ? item.title : (item.title as any)?.text || 'Track',
        artist: artistName,
        artistId: (item.artists?.[0] as any)?.channel_id || (item.artists?.[0] as any)?.id,
        album: item.album?.name,
        thumbnail: thumb,
        duration: durationSec,
        durationFormatted,
      });
    }

    if (tracks.length === 0 && result.contents) {
      for (const section of result.contents) {
        if (!section.contents) continue;
        for (const item of section.contents as any[]) {
          if (item.id && !item.id.startsWith('VL') && !item.id.startsWith('UC')) {
            const rawThumb =
              item.thumbnails?.[0]?.url ||
              item.thumbnail?.contents?.[0]?.url ||
              `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
            tracks.push({
              id: item.id,
              title: typeof item.title === 'string' ? item.title : item.title?.text || 'Track',
              artist: item.artists?.[0]?.name || item.author?.name || 'Artist',
              thumbnail: getHighResCover(rawThumb),
              duration: item.duration?.seconds || 180,
              durationFormatted: item.duration?.text || '3:00',
            });
          }
        }
      }
    }

    return tracks;
  } catch (error) {
    console.error('Search error in Innertube:', error);
    return [];
  }
}

export async function getStreamUrl(videoId: string): Promise<{ url: string; mimeType: string; bitrate?: number }> {
  try {
    const ytdl = getYtdl();
    const info = await ytdl.getInfo(videoId);
    const audioFormats = info.formats
      .filter((f) => f.hasAudio && !f.hasVideo && f.url)
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

    if (audioFormats.length === 0) {
      throw new Error(`No audio formats found for ${videoId}`);
    }

    const topFormat = audioFormats[0];
    return {
      url: topFormat.url!,
      mimeType: topFormat.mimeType || 'audio/mp4',
      bitrate: topFormat.bitrate,
    };
  } catch (error) {
    console.error(`Stream extraction error for ${videoId}:`, error);
    throw error;
  }
}

export async function getExploreTracks(): Promise<{ title: string; tracks: Track[] }[]> {
  try {
    const yt = await getInnertube();
    // Default queries for trending and quick picks
    const categories = [
      { key: 'Trending Hits Indonesia', query: 'Top Hits Indonesia 2026' },
      { key: 'Global Top Chart', query: 'Top Global Pop Music' },
      { key: 'Chill & Lo-Fi Lounge', query: 'Lofi Chillhop beats' },
      { key: 'Indie & Alternative Vibes', query: 'Indie Folk Pop' },
    ];

    const sections = await Promise.all(
      categories.map(async (cat) => {
        const tracks = await searchMusic(cat.query);
        const trackList = tracks.slice(0, 10);
        return {
          title: cat.key,
          tracks: trackList,
          items: trackList,
        };
      })
    );

    return sections;
  } catch (error) {
    console.error('Explore tracks error:', error);
    return [];
  }
}

export async function getAutoplayCandidates(seedTrack: Track): Promise<Track[]> {
  try {
    const yt = await getInnertube();
    const candidatesMap = new Map<string, Track>();

    // 1. YouTube Music's UpNext Radio Graph
    try {
      const upNext = await yt.music.getUpNext(seedTrack.id);
      if (upNext && upNext.contents) {
        for (const item of upNext.contents as any[]) {
          const trackId = item.id || item.video_id;
          const trackTitle = typeof item.title === 'string' ? item.title : item.title?.text;
          if (!trackId || !trackTitle || trackId === seedTrack.id) continue;

          const artistName =
            item.artists?.[0]?.name ||
            item.author?.name ||
            item.short_byline_text?.text ||
            'Unknown Artist';

          const durationSec = item.duration?.seconds || 200;
          const durationFormatted =
            item.duration?.text ||
            `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`;

          const thumb = getHighResCover(
            item.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${trackId}/hqdefault.jpg`
          );

          candidatesMap.set(trackId, {
            id: trackId,
            title: trackTitle,
            artist: artistName,
            album: item.album?.name,
            thumbnail: thumb,
            duration: durationSec,
            durationFormatted,
          });
        }
      }
    } catch (e) {
      console.warn('getUpNext failed, falling back to search:', e);
    }

    // 2. Add top compatible songs from the same artist
    try {
      const sameArtistResults = await searchMusic(seedTrack.artist);
      for (const track of sameArtistResults) {
        if (track.id !== seedTrack.id && !candidatesMap.has(track.id)) {
          candidatesMap.set(track.id, track);
        }
      }
    } catch (e) {
      // Ignored
    }

    return Array.from(candidatesMap.values());
  } catch (error) {
    console.error('getAutoplayCandidates error:', error);
    return [];
  }
}

