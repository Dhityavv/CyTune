import { NextRequest, NextResponse } from 'next/server';
import { getInnertube } from '@/lib/youtube';
import { Track } from '@/types/music';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id || !id.trim()) {
    return NextResponse.json({ error: 'Query parameter id is required' }, { status: 400 });
  }

  try {
    const yt = await getInnertube();
    const artist = await (yt.music as any).getArtist(id.trim());

    const header = artist.header || {};
    const title = header.title?.text || header.title || 'Artist';
    const description = header.description?.text || '';
    const subs = header.subscribers?.text || header.subscriber_count?.text || '';
    const thumbs = header.thumbnail?.contents || header.thumbnail || [];
    const thumbnail = Array.isArray(thumbs) && thumbs.length
      ? thumbs[thumbs.length - 1]?.url || thumbs[0]?.url
      : (typeof thumbs === 'string' ? thumbs : '');

    const sections: any[] = [];
    for (const s of artist.sections || []) {
      const titleText = s.title?.text || s.title || '';
      const items = s.contents || s.items || [];
      if (!items.length) continue;

      // Top songs (MusicResponsiveListItem)
      if (items[0]?.type === 'MusicResponsiveListItem') {
        const tracks: Track[] = items.map((item: any) => {
          const rawThumb =
            item.thumbnail?.contents?.[0]?.url ||
            item.thumbnails?.[0]?.url ||
            `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
          const durationSec = item.duration?.seconds || 0;
          const durationFormatted =
            item.duration?.text ||
            (durationSec > 0
              ? `${Math.floor(durationSec / 60)}:${(durationSec % 60).toString().padStart(2, '0')}`
              : '3:30');
          return {
            id: item.id,
            title: typeof item.title === 'string' ? item.title : item.title?.text || 'Track',
            artist: item.artists?.[0]?.name || item.author?.name || title,
            artistId: id,
            album: item.album?.name,
            thumbnail: rawThumb,
            duration: durationSec,
            durationFormatted,
          };
        }).filter((t: Track) => t.id);
        sections.push({ title: titleText || 'Top songs', type: 'songs', items: tracks });
        continue;
      }

      // Carousel shelves (albums / playlists / related / videos)
      const carouselItems = items.map((item: any) => {
        const thumbs2 = item.thumbnail?.contents || item.thumbnail || [];
        const thumb = Array.isArray(thumbs2) && thumbs2.length
          ? thumbs2[thumbs2.length - 1]?.url || thumbs2[0]?.url
          : (typeof thumbs2 === 'string' ? thumbs2 : '');
        const browseId = item.endpoint?.payload?.browseId || item.id;
        const pageType = item.endpoint?.payload?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType;
        let kind = 'item';
        if (pageType === 'MUSIC_PAGE_TYPE_ALBUM') kind = 'album';
        else if (pageType === 'MUSIC_PAGE_TYPE_ARTIST') kind = 'artist';
        else if (pageType === 'MUSIC_PAGE_TYPE_PLAYLIST') kind = 'playlist';
        return {
          id: browseId || item.id,
          title: typeof item.title === 'string' ? item.title : item.title?.text || 'Item',
          subtitle: item.subtitle?.text || item.subtitle || '',
          thumbnail: thumb,
          kind,
          browseId,
        };
      });
      const lower = (titleText || '').toLowerCase();
      let type = 'carousel';
      if (lower.includes('album')) type = 'albums';
      else if (lower.includes('single') || lower.includes('ep')) type = 'albums';
      else if (lower.includes('artist')) type = 'related';
      else if (lower.includes('playlist')) type = 'playlists';
      sections.push({ title: titleText, type, items: carouselItems });
    }

    return NextResponse.json({ id, header: { title, description, thumbnail, subscribers: subs }, sections });
  } catch (error: any) {
    console.error('API Artist Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch artist' }, { status: 500 });
  }
}
