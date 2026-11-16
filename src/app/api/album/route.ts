import { NextResponse } from 'next/server';
import { getInnertube, searchMusic } from '@/lib/youtube';
import { getHighResCover, Track } from '@/types/music';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const query = searchParams.get('q');

  if (!id && !query) {
    return NextResponse.json({ error: 'Album ID or title query is required' }, { status: 400 });
  }

  try {
    const yt = await getInnertube();

    if (id) {
      try {
        const albumData = await yt.music.getAlbum(id);
        if (albumData) {
          const header = albumData.header;
          const title = header?.title?.toString() || 'Album';
          const artist = (albumData as any)?.artist?.name || 'Artist';
          const rawThumb = (albumData as any)?.thumbnails?.[0]?.url || (header as any)?.thumbnail?.contents?.[0]?.url || '';
          const thumbnail = rawThumb ? getHighResCover(rawThumb) : '';

          const tracks: Track[] = [];
          const contents = (albumData as any)?.contents || [];
          for (const item of contents) {
            if (!item.id && !item.video_id) continue;
            const tId = item.id || item.video_id;
            const tTitle = item.title?.toString() || 'Track';
            const durationSec = item.duration?.seconds || 0;
            const tThumb = item.thumbnails?.[0]?.url || thumbnail;

            tracks.push({
              id: tId,
              title: tTitle,
              artist: artist,
              album: title,
              albumId: id,
              thumbnail: getHighResCover(tThumb),
              duration: durationSec,
              durationFormatted: durationSec > 0
                ? `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`
                : undefined,
            });
          }

          return NextResponse.json({
            album: {
              id,
              title,
              artist,
              thumbnail,
              year: (albumData as any)?.year?.toString() || '',
            },
            tracks,
          });
        }
      } catch {
        // fallback to query search below
      }
    }

    // Search query fallback
    const q = query || id || '';
    const tracks = await searchMusic(`${q} album`);
    return NextResponse.json({
      album: {
        id: id || 'search_album',
        title: query || 'Album Collection',
        artist: tracks[0]?.artist || 'Various Artists',
        thumbnail: tracks[0]?.thumbnail || '',
      },
      tracks,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch album' }, { status: 500 });
  }
}
