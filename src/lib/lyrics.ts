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

    let data: any = null;

    const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`, {
      headers: {
        'User-Agent': 'CyTune Music Web App/1.0',
      },
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (res.ok) {
      data = await res.json();
    } else {
      // Fallback search
      const searchRes = await fetch(
        `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`)}`,
        {
          headers: { 'User-Agent': 'CyTune Music Web App/1.0' },
        }
      );
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (Array.isArray(searchData) && searchData.length > 0) {
          const item = searchData[0];
          if (item.id) {
            // Fetch complete track detail by ID to get lyricsfile
            try {
              const detailRes = await fetch(`https://lrclib.net/api/get/${item.id}`, {
                headers: { 'User-Agent': 'CyTune Music Web App/1.0' },
              });
              if (detailRes.ok) {
                data = await detailRes.json();
              } else {
                data = item;
              }
            } catch {
              data = item;
            }
          } else {
            data = item;
          }
        }
      }
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
      lines,
    };
  } catch (err) {
    console.error('Error fetching lyrics:', err);
    return null;
  }
}
