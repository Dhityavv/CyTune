import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const mode = formData.get('mode') as string; // 'humming' | 'lyrics'
    const query = formData.get('query') as string;
    const audioFile = formData.get('file') as File | null;

    // Mode A: Search by lyrics fragment
    if (mode === 'lyrics') {
      if (!query || !query.trim()) {
        return NextResponse.json({ error: 'Lyric query is required' }, { status: 400 });
      }

      // 1. Try LRCLIB full text search
      try {
        const lrcRes = await fetch(
          `https://lrclib.net/api/search?q=${encodeURIComponent(query.trim())}`,
          { headers: { 'User-Agent': 'CyTune/2.0 (web@cytune.stream)' } }
        );

        if (lrcRes.ok) {
          const lrcData = await lrcRes.json();
          if (Array.isArray(lrcData) && lrcData.length > 0) {
            // Map top matches
            const matches = lrcData.slice(0, 8).map((item: any) => ({
              id: `search_${encodeURIComponent(item.trackName + ' ' + item.artistName)}`,
              title: item.trackName,
              artist: item.artistName,
              album: item.albumName || '',
              duration: Math.round(item.duration || 0),
              snippet: item.plainLyrics
                ? item.plainLyrics.slice(0, 160) + '...'
                : 'Matched from LRCLIB lyrics database',
            }));

            return NextResponse.json({ matches, source: 'lrclib' });
          }
        }
      } catch {
        // continue to YouTube search fallback below
      }

      // 2. Fallback to YouTube Music search via existing internal search
      const ytRes = await fetch(
        `${new URL(request.url).origin}/api/search?q=${encodeURIComponent(query.trim() + ' lyrics')}`
      );
      if (ytRes.ok) {
        const ytData = await ytRes.json();
        const matches = (ytData.tracks || []).slice(0, 8).map((t: any) => ({
          ...t,
          snippet: `YouTube Music search match for "${query.trim()}"`,
        }));
        return NextResponse.json({ matches, source: 'youtube' });
      }

      return NextResponse.json({ matches: [], source: 'none' });
    }

    // Mode B: Audio humming / singing recognition
    if (mode === 'humming' || mode === 'audio') {
      if (!audioFile) {
        return NextResponse.json({ error: 'Audio recording file is required' }, { status: 400 });
      }

      const auddToken = process.env.AUDD_API_TOKEN;

      // If AudD token is configured, forward to AudD Enterprise / Hum API
      if (auddToken && !auddToken.includes('your-audd-api-token')) {
        const auddForm = new FormData();
        auddForm.append('file', audioFile);
        auddForm.append('api_token', auddToken);
        auddForm.append('return', 'timecode,lyrics,apple_music,spotify');

        const auddRes = await fetch('https://api.audd.io/recognizeWithOffset/', {
          method: 'POST',
          body: auddForm,
        });

        if (auddRes.ok) {
          const data = await auddRes.json();
          if (data.status === 'success' && data.result) {
            const res = data.result;
            return NextResponse.json({
              status: 'recognized',
              result: {
                title: res.title,
                artist: res.artist,
                album: res.album,
                release_date: res.release_date,
              },
            });
          }
        }
      }

      // If no token or no match, report clearly
      return NextResponse.json({
        status: 'awaiting_credentials',
        message:
          'AudD API token not configured or song could not be recognized. Please configure AUDD_API_TOKEN in .env.local for remote acoustic fingerprinting, or use Mode A (Search by Lyrics) below.',
      });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Recognition failed' }, { status: 500 });
  }
}
