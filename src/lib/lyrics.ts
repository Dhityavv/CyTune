import { LyricsLine, SyncedLyrics, LyricsWord } from '@/types/music';
import YAML from 'yaml';

export function parseLyricsFile(yamlText: string): { lines: LyricsLine[]; hasWordSync: boolean } {
  try {
    const doc = YAML.parse(yamlText);
    if (!doc || !Array.isArray(doc.lines)) return { lines: [], hasWordSync: false };

    let wordSyncFound = false;
    const lines: LyricsLine[] = [];

    for (let i = 0; i < doc.lines.length; i++) {
      const l = doc.lines[i];
      const text = (l.text || '').trim();
      if (!text) continue;

      const startSec = (l.start_ms || 0) / 1000;
      const endSec = l.end_ms ? l.end_ms / 1000 : undefined;

      const words: LyricsWord[] = [];
      if (Array.isArray(l.words) && l.words.length > 0) {
        wordSyncFound = true;
        for (let wIdx = 0; wIdx < l.words.length; wIdx++) {
          const w = l.words[wIdx];
          const wText = (w.text || '').trim();
          if (!wText) continue;

          const wStartSec = (w.start_ms || 0) / 1000;
          const nextWord = l.words[wIdx + 1];
          const wEndSec = nextWord?.start_ms ? nextWord.start_ms / 1000 : endSec;

          words.push({
            text: wText,
            time: wStartSec,
            endTime: wEndSec,
          });
        }
      }

      lines.push({
        time: startSec,
        endTime: endSec,
        text,
        words: words.length > 0 ? words : undefined,
      });
    }

    return {
      lines: lines.sort((a, b) => a.time - b.time),
      hasWordSync: wordSyncFound,
    };
  } catch (err) {
    console.warn('Error parsing lyricsfile YAML:', err);
    return { lines: [], hasWordSync: false };
  }
}

export function parseLrc(lrcText: string): LyricsLine[] {
  const rawLines = lrcText.split('\n');
  const tempEntries: { time: number; text: string }[] = [];

  for (const rawLine of rawLines) {
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

      tempEntries.push({
        time: totalSeconds,
        text,
      });
    }
  }

  tempEntries.sort((a, b) => a.time - b.time);

  const result: LyricsLine[] = [];
  for (let i = 0; i < tempEntries.length; i++) {
    const current = tempEntries[i];
    if (!current.text) {
      // Empty line tag marks instrumental break / end of previous line
      if (result.length > 0 && !result[result.length - 1].endTime) {
        result[result.length - 1].endTime = current.time;
      }
      continue;
    }

    const next = tempEntries[i + 1];
    const endTime = next ? next.time : undefined;

    result.push({
      time: current.time,
      endTime,
      text: current.text,
    });
  }

  return result;
}

export async function fetchLyrics(
  title: string,
  artist: string,
  duration?: number
): Promise<SyncedLyrics | null> {
  try {
    const cleanArtist = (artist || '').replace(/ - Topic$/i, '').trim();

    // Clean title from "Official Video", "(feat. ...)", "[Official Music Video]"
    let cleanTitle = (title || '')
      .replace(/[\(\[](?:Official|Music|Video|Audio|Lyric|Visualizer|HD|4K|Lyrics)[^\)\]]*[\)\]]/gi, '')
      .replace(/[\(\[](?:feat|ft)\.[^\)\]]*[\)\]]/gi, '')
      .replace(/["'“”]/g, '')
      .trim();

    // If title starts with "Artist - ", strip artist prefix (common YouTube format)
    if (cleanArtist && cleanTitle.toLowerCase().startsWith(cleanArtist.toLowerCase() + ' - ')) {
      cleanTitle = cleanTitle.slice(cleanArtist.length + 3).trim();
    } else if (cleanTitle.includes(' - ')) {
      const parts = cleanTitle.split(' - ');
      if (parts.length >= 2 && parts[0].trim().toLowerCase() === cleanArtist.toLowerCase()) {
        cleanTitle = parts.slice(1).join(' - ').trim();
      }
    }

    const params = new URLSearchParams({
      track_name: cleanTitle,
      artist_name: cleanArtist,
    });

    if (duration && duration > 0) {
      params.append('duration', Math.round(duration).toString());
    }

    let data: any = null;

    // 1. Exact match attempt via /api/get
    try {
      const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
        headers: {
          'User-Agent': 'CyTune Music Web App/1.0',
        },
        next: { revalidate: 86400 }, // Cache 24 hours
      });

      if (res.ok) {
        const json = await res.json();
        if (json.syncedLyrics || json.lyricsfile) {
          data = json;
        }
      }
    } catch {
      // Fall through to smart search
    }

    // Helper to evaluate and rank candidate results
    const pickBestCandidate = (searchData: any[]): any => {
      if (!Array.isArray(searchData) || searchData.length === 0) return null;

      // Filter candidates with synchronized lyrics
      const withSynced = searchData.filter((c: any) => Boolean(c.syncedLyrics || c.lyricsfile));
      const pool = withSynced.length > 0 ? withSynced : searchData;

      pool.sort((a: any, b: any) => {
        const hasA = Boolean(a.syncedLyrics || a.lyricsfile) ? 1 : 0;
        const hasB = Boolean(b.syncedLyrics || b.lyricsfile) ? 1 : 0;
        if (hasA !== hasB) return hasB - hasA;

        // Proximity to audio duration is paramount for synchronization accuracy
        if (duration && duration > 0) {
          const diffA = Math.abs((a.duration || 0) - duration);
          const diffB = Math.abs((b.duration || 0) - duration);
          return diffA - diffB;
        }
        return 0;
      });

      return pool[0];
    };

    // 2. Fallback search: Title + Artist
    if (!data) {
      const searchRes = await fetch(
        `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`.trim())}`,
        {
          headers: { 'User-Agent': 'CyTune Music Web App/1.0' },
          next: { revalidate: 86400 },
        }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const bestItem = pickBestCandidate(searchData);
        if (bestItem?.id) {
          try {
            const detailRes = await fetch(`https://lrclib.net/api/get/${bestItem.id}`, {
              headers: { 'User-Agent': 'CyTune Music Web App/1.0' },
            });
            if (detailRes.ok) {
              data = await detailRes.json();
            } else {
              data = bestItem;
            }
          } catch {
            data = bestItem;
          }
        } else if (bestItem) {
          data = bestItem;
        }
      }
    }

    // 3. Second Fallback search: Clean Title only (in case artist tag on YouTube is an alias/channel name)
    if (!data || (!data.syncedLyrics && !data.lyricsfile)) {
      try {
        const searchRes = await fetch(
          `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle)}`,
          {
            headers: { 'User-Agent': 'CyTune Music Web App/1.0' },
            next: { revalidate: 86400 },
          }
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const bestItem = pickBestCandidate(searchData);
          if (bestItem?.id) {
            const detailRes = await fetch(`https://lrclib.net/api/get/${bestItem.id}`, {
              headers: { 'User-Agent': 'CyTune Music Web App/1.0' },
            });
            if (detailRes.ok) {
              const fullDetail = await detailRes.json();
              if (fullDetail.syncedLyrics || fullDetail.lyricsfile) {
                data = fullDetail;
              }
            }
          }
        }
      } catch {}
    }

    if (!data) return null;

    let lines: LyricsLine[] = [];
    let hasWordSync = false;

    // 1. Prioritize millisecond-exact word-sync from lyricsfile
    if (data.lyricsfile) {
      const parsed = parseLyricsFile(data.lyricsfile);
      if (parsed.lines.length > 0) {
        lines = parsed.lines;
        hasWordSync = parsed.hasWordSync;
      }
    }

    // 2. Fallback to standard synchronized lyrics
    if (lines.length === 0 && data.syncedLyrics) {
      lines = parseLrc(data.syncedLyrics);
    }

    // 3. Intelligent auto-offset calculation:
    // When YouTube stream has an intro/outro delta compared to studio track duration
    let autoOffset = 0;
    if (duration && duration > 0 && data.duration && data.duration > 0) {
      const delta = duration - data.duration;
      // If YouTube track is 2-10s longer, typically 60% of that delta is intro silence before music kicks in
      if (delta >= 1.5 && delta <= 12) {
        autoOffset = Math.round((delta * 0.55) * 10) / 10;
      } else if (delta <= -1.5 && delta >= -10) {
        autoOffset = Math.round((delta * 0.45) * 10) / 10;
      }
    }

    return {
      id: data.id,
      trackName: data.trackName || cleanTitle,
      artistName: data.artistName || cleanArtist,
      albumName: data.albumName,
      duration: data.duration,
      instrumental: data.instrumental,
      plainLyrics: data.plainLyrics,
      syncedLyrics: data.syncedLyrics,
      hasWordSync,
      autoOffset,
      lines,
    };
  } catch (err) {
    console.error('Error fetching lyrics:', err);
    return null;
  }
}
