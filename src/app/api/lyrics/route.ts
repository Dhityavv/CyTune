import { NextRequest, NextResponse } from 'next/server';
import { fetchLyrics } from '@/lib/lyrics';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title');
  const artist = searchParams.get('artist') || '';
  const duration = searchParams.get('duration') ? parseFloat(searchParams.get('duration')!) : undefined;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  try {
    const lyrics = await fetchLyrics(title, artist, duration);
    if (!lyrics) {
      return NextResponse.json({ error: 'Lyrics not found' }, { status: 404 });
    }
    return NextResponse.json(lyrics);
  } catch (error: any) {
    console.error('API Lyrics Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch lyrics' }, { status: 500 });
  }
}
