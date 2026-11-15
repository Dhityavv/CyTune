import { NextRequest, NextResponse } from 'next/server';
import { getAutoplayCandidates } from '@/lib/youtube';
import { scoreCandidate, UserSignals } from '@/lib/recommender';
import { Track, RecommendedTrack } from '@/types/music';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const seedTrack: Track = body.seedTrack;

    if (!seedTrack || !seedTrack.id || !seedTrack.title) {
      return NextResponse.json({ error: 'Valid seedTrack is required' }, { status: 400 });
    }

    const recentIds = new Set<string>(body.recentIds || []);
    const cooldownIds = new Set<string>(body.cooldownIds || []);
    const skippedTrackIds = new Set<string>(body.skippedTrackIds || []);
    const skippedArtists = new Set<string>((body.skippedArtists || []).map((a: string) => a.toLowerCase().trim()));
    const likedArtists = new Set<string>((body.likedArtists || []).map((a: string) => a.toLowerCase().trim()));
    const likedTrackIds = new Set<string>(body.likedTrackIds || []);
    const consecutiveArtistCount = Number(body.consecutiveArtistCount || 0);
    const limit = Number(body.limit || 12);

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
      { error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
