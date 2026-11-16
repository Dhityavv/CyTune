import { NextRequest, NextResponse } from 'next/server';
import { getStreamUrl } from '@/lib/youtube';

// YouTube video ids are 11 chars; allow a little slack for future formats
// while still rejecting paths, spaces and other junk.
const VIDEO_ID = /^[A-Za-z0-9_-]{8,24}$/;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || !VIDEO_ID.test(id)) {
    return NextResponse.json({ error: 'Invalid video id' }, { status: 400 });
  }

  try {
    const streamInfo = await getStreamUrl(id);
    const { searchParams } = new URL(req.url);
    const useProxy = searchParams.get('proxy') === 'true';

    if (!useProxy) {
      // 307 Temporary Redirect allows browser to stream directly
      return NextResponse.redirect(streamInfo.url, {
        status: 307,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
    }

    // Proxy mode with range handling
    const rangeHeader = req.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    const audioRes = await fetch(streamInfo.url, {
      headers: fetchHeaders,
      signal: AbortSignal.timeout(15000),
    });
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', streamInfo.mimeType);
    responseHeaders.set('Accept-Ranges', 'bytes');
    if (audioRes.headers.get('content-range')) {
      responseHeaders.set('Content-Range', audioRes.headers.get('content-range')!);
    }
    if (audioRes.headers.get('content-length')) {
      responseHeaders.set('Content-Length', audioRes.headers.get('content-length')!);
    }

    return new NextResponse(audioRes.body as any, {
      status: audioRes.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error('API Stream Error:', error);
    return NextResponse.json({ error: 'Failed to resolve stream URL' }, { status: 500 });
  }
}
