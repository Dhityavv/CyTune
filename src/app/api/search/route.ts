import { NextRequest, NextResponse } from 'next/server';
import { searchCatalog } from '@/lib/youtube';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || !q.trim()) {
    return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 });
  }

  try {
    const { tracks, artist } = await searchCatalog(q.trim());
    return NextResponse.json({ query: q, tracks, artist });
  } catch (error: any) {
    console.error('API Search Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to search tracks' }, { status: 500 });
  }
}
