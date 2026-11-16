import { NextRequest, NextResponse } from 'next/server';
import { getAutoplayCandidates } from '@/lib/youtube';
import { scoreCandidate, UserSignals } from '@/lib/recommender';
import { Track, RecommendedTrack } from '@/types/music';

// Client-supplied signal lists are unauthenticated: cap length and item size.
const MAX_ITEMS = 500;
const MAX_LIMIT = 30;

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === 'string' && v.length > 0 && v.length <= 64)
    .slice(0, MAX_ITEMS);
}

export async function POST(req: NextRequest) {
  try {
    // The body is unauthenticated, so cap it before parsing
    const raw = await req.text();
    if (raw.length > 64_000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const seedTrack = body?.seedTrack as Track;

    if (
      !seedTrack ||
      typeof seedTrack.id !== 'string' ||
      typeof seedTrack.title !== 'string' ||
      !seedTrack.id ||
      !seedTrack.title
    ) {
      return NextResponse.json({ error: 'Valid seedTrack is required' }, { status: 400 });
    }

    const recentIds = new Set(stringList(body.recentIds));
    const cooldownIds = new Set(stringList(body.cooldownIds));
    const skippedTrackIds = new Set(stringList(body.skippedTrackIds));
    const skippedArtists = new Set(stringList(body.skippedArtists).map((a) => a.toLowerCase().trim()));
    const likedArtists = new Set(stringList(body.likedArtists).map((a) => a.toLowerCase().trim()));
    const likedTrackIds = new Set(stringList(body.likedTrackIds));
    const consecutiveArtistCount = Math.min(50, Math.max(0, Number(body.consecutiveArtistCount) || 0));
    const limit = Math.min(MAX_LIMIT, Math.max(1, Math.trunc(Number(body.limit)) || 12));

    const signals: UserSignals = {
      recentTrackIds: recentIds,
      cooldownTrackIds: cooldownIds,
      skippedTrackIds,
      skippedArtists,
      likedArtists,
      likedTrackIds,
      consecutiveArtistCount,
    };

    // 1. Fetch Candidates from YouTube Music UpNext & Artist ecosystem
    const rawCandidates = await getAutoplayCandidates(seedTrack);

    // 2. Score and Filter Candidates
    const evaluated: RecommendedTrack[] = [];
    const seenIds = new Set<string>();

    for (const candidate of rawCandidates) {
      if (!candidate.id || candidate.id === seedTrack.id || seenIds.has(candidate.id)) {
        continue;
      }
      seenIds.add(candidate.id);

      const evaluation = scoreCandidate(candidate, seedTrack, signals);

      evaluated.push({
        ...candidate,
        score: evaluation.score,
        reason: evaluation.reason,
        detectedMood: evaluation.profile.mood,
        detectedGenre: evaluation.profile.genre,
        scoreBreakdown: evaluation.breakdown,
      });
    }

    // 3. Sort by score descending
    evaluated.sort((a, b) => b.score - a.score);

    // 4. Ensure artist diversity: allow at most 2 consecutive tracks from the same artist in the top list
    const finalRecommendations: RecommendedTrack[] = [];
    const artistCounts = new Map<string, number>();

    for (const track of evaluated) {
      const art = track.artist.toLowerCase().trim();
      const count = artistCounts.get(art) || 0;

      // Allow max 2 songs from any single artist in the top recommendations
      if (count < 2) {
        finalRecommendations.push(track);
        artistCounts.set(art, count + 1);
      }

      if (finalRecommendations.length >= limit) break;
    }

    // If still under limit, fill with remaining candidates
    if (finalRecommendations.length < limit) {
      for (const track of evaluated) {
        if (!finalRecommendations.some((t) => t.id === track.id)) {
          finalRecommendations.push(track);
        }
        if (finalRecommendations.length >= limit) break;
      }
    }

    return NextResponse.json({
      seedTrack: {
        id: seedTrack.id,
        title: seedTrack.title,
        artist: seedTrack.artist,
      },
      count: finalRecommendations.length,
      recommendations: finalRecommendations,
    });
  } catch (error: any) {
    console.error('API Recommendations Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
