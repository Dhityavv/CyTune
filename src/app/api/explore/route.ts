import { connection, NextResponse } from 'next/server';
import { getExploreTracks } from '@/lib/youtube';

type Sections = Awaited<ReturnType<typeof getExploreTracks>>;

const TTL = 10 * 60 * 1000;
const HEADERS = { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=600' };

let cached: { sections: Sections; at: number } | null = null;
let pending: Promise<Sections> | null = null;

function refresh(): Promise<Sections> {
  if (!pending) {
    pending = getExploreTracks()
      .then((sections) => {
        if (sections.length > 0) cached = { sections, at: Date.now() };
        return sections;
      })
      .finally(() => {
        pending = null;
      });
  }
  return pending;
}

export async function GET() {
  await connection();

  if (cached && Date.now() - cached.at < TTL) {
    return NextResponse.json({ sections: cached.sections }, { headers: HEADERS });
  }

  // Serve stale results instantly and refresh in the background.
  if (cached) {
    refresh().catch(() => {});
    return NextResponse.json({ sections: cached.sections, stale: true }, { headers: HEADERS });
  }

  try {
    const sections = await refresh();
    return NextResponse.json({ sections }, { headers: HEADERS });
  } catch (error: any) {
    console.error('API Explore Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch explore feed' }, { status: 500 });
  }
}
