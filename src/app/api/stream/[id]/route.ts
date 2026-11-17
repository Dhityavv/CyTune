import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'node:stream';
import { getAudioDownloadStream, getFallbackAudioUrl, getInnertube } from '@/lib/youtube';

const VIDEO_ID = /^[A-Za-z0-9_-]{8,24}$/;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || !VIDEO_ID.test(id)) {
    return NextResponse.json({ error: 'Invalid video id' }, { status: 400 });
  }

  const rangeHeader = req.headers.get('range');
  let range: { start?: number; end?: number } | undefined;
  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : undefined;
      range = { start, end };
    }
  }

  // 1. Primary Streaming: Server-piped YouTube audio stream via @distube/ytdl-core
  try {
    const media = await getAudioDownloadStream(id, range);
    const webStream = Readable.toWeb(media as any) as ReadableStream<Uint8Array>;

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'audio/mp4');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    if (range && range.start !== undefined) {
      const start = range.start;
      const endStr = range.end !== undefined ? range.end.toString() : '';
      responseHeaders.set('Content-Range', `bytes ${start}-${endStr}/*`);
      return new NextResponse(webStream, {
        status: 206,
        headers: responseHeaders,
      });
    }

    return new NextResponse(webStream, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (primaryErr: any) {
    console.warn(`Primary YouTube stream failed for ${id}:`, primaryErr?.message || primaryErr);

    // 2. Fallback Streaming: Try resolving track title and redirecting to high-availability CDN
    try {
      let query = '';
      const searchParams = req.nextUrl.searchParams;
      const paramTitle = searchParams.get('title');
      const paramArtist = searchParams.get('artist');
      if (paramTitle) {
        query = `${paramTitle} ${paramArtist || ''}`.trim();
      }

      if (!query) {
        try {
          const yt = await getInnertube();
          const basic = await yt.getBasicInfo(id);
          const title = basic.basic_info.title;
          const author = basic.basic_info.author;
          if (title) query = `${title} ${author || ''}`.trim();
        } catch {
          // ignore
        }
      }

      if (query) {
        const fallbackUrl = await getFallbackAudioUrl(query);
        if (fallbackUrl) {
          // Redirect browser to stream directly from high-speed Apple CDN (supports 206 range & seeking natively)
          return NextResponse.redirect(fallbackUrl, 307);
        }
      }
    } catch (fallbackErr) {
      console.warn('Fallback stream failed:', fallbackErr);
    }

    return NextResponse.json(
      { error: 'This track could not be streamed from available audio providers.' },
      { status: 500 }
    );
  }
}
