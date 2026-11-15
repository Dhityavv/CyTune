import { LyricsLine, SyncedLyrics } from '@/types/music';

export function parseLrc(lrcText: string): LyricsLine[] {
  const lines = lrcText.split('\n');
  const result: LyricsLine[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Match [mm:ss.xx] or [mm:ss]
    const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();

      if (text) {
        result.push({
          time: totalSeconds,
          text,
        });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

export async function fetchLyrics(
  title: string,
  artist: string,
  duration?: number
): Promise<SyncedLyrics | null> {
  try {
    // Clean title from "Official Video", "(feat. ...)", "[Official Music Video]"
    const cleanTitle = title
      .replace(/[\(\[](?:Official|Music|Video|Audio|Lyric|Visualizer|HD|4K|Lyrics)[^\)\]]*[\)\]]/gi, '')
      .replace(/[\(\[]feat\.[^\)\]]*[\)\]]/gi, '')
      .trim();

    const cleanArtist = artist.replace(/ - Topic$/i, '').trim();

    const params = new URLSearchParams({
      track_name: cleanTitle,
      artist_name: cleanArtist,
    });

    if (duration && duration > 0) {
      params.append('duration', Math.round(duration).toString());
    }

    const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
      headers: {
        'User-Agent': 'OrbitTune Music Web App/1.0',
      },
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (!res.ok) {
      // Fallback search
      const searchRes = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`, {
        headers: { 'User-Agent': 'OrbitTune Music Web App/1.0' },
      });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (Array.isArray(searchData) && searchData.length > 0) {
          const item = searchData[0];
          return {
            trackName: item.trackName,
            artistName: item.artistName,
            plainLyrics: item.plainLyrics,
            syncedLyrics: item.syncedLyrics,
            lines: item.syncedLyrics ? parseLrc(item.syncedLyrics) : [],
          };
        }
      }
      return null;
    }

    const data = await res.json();
    return {
      id: data.id,
      trackName: data.trackName,
      artistName: data.artistName,
      albumName: data.albumName,
      duration: data.duration,
      instrumental: data.instrumental,
      plainLyrics: data.plainLyrics,
      syncedLyrics: data.syncedLyrics,
      lines: data.syncedLyrics ? parseLrc(data.syncedLyrics) : [],
    };
  } catch (err) {
    console.error('Error fetching lyrics:', err);
    return null;
  }
}
