import { Track, RecommendedTrack, RecommendationReason } from '@/types/music';

// ==========================================
// 1. ARTIST NETWORK & CLUSTERS
// ==========================================

export interface ArtistCluster {
  genre: string;
  defaultMood: string;
  defaultEnergy: number; // 1 (calm) to 5 (energetic)
  artists: string[];
}

export const ARTIST_CLUSTERS: ArtistCluster[] = [
  {
    genre: 'R&B / Late Night',
    defaultMood: 'Late Night R&B',
    defaultEnergy: 2,
    artists: [
      'drake',
      'the weeknd',
      'partynextdoor',
      '6lack',
      'bryson tiller',
      'brent faiyaz',
      'frank ocean',
      'sza',
      'giveon',
      'daniel caesar',
      'jhené aiko',
      'summer walker',
      'tory lanez',
      'chase atlantic',
      'dvsn',
      'roy woods',
    ],
  },
  {
    genre: 'Indie Pop / Bedroom R&B',
    defaultMood: 'Melancholic Chill',
    defaultEnergy: 2,
    artists: [
      'joji',
      'keshi',
      'niki',
      'rich brian',
      'dhruv',
      'jeremy zucker',
      'wave to earth',
      'dpr ian',
      'dpr live',
      'conan gray',
      'laufey',
      'bruno major',
      'alec benjamin',
      'rex orange county',
    ],
  },
  {
    genre: 'Pop / Emotional Melodic',
    defaultMood: 'Nostalgic Pop',
    defaultEnergy: 3,
    artists: [
      'taylor swift',
      'olivia rodrigo',
      'gracie abrams',
      'sabrina carpenter',
      'billie eilish',
      'phoebe bridgers',
      'lana del rey',
      'lorde',
      'clairo',
      'beabadoobee',
      'girl in red',
      'chappell roan',
      'tate mcrae',
    ],
  },
  {
    genre: 'Indie Rock / Atmospheric Alt',
    defaultMood: 'Atmospheric / Dreamy',
    defaultEnergy: 3,
    artists: [
      'coldplay',
      'radiohead',
      'onerepublic',
      'imagine dragons',
      'the script',
      'snow patrol',
      'the 1975',
      'cigarettes after sex',
      'arctic monkeys',
      'hozier',
      'vance joy',
      'bastille',
      'kodaline',
      'the neighbourhood',
    ],
  },
  {
    genre: 'Indonesian Pop & Indie',
    defaultMood: 'Warm Acoustic / Melancholic',
    defaultEnergy: 3,
    artists: [
      'sheila on 7',
      'dewa 19',
      'noah',
      'peterpan',
      'pamungkas',
      'hindia',
      'nadin amizah',
      'tulus',
      '.feast',
      'fourtwnty',
      'payung teduh',
      'sal priadi',
      'bernadya',
      'kunto aji',
      'fiersa besari',
      'yura yunita',
      'ardhito pramono',
    ],
  },
  {
    genre: 'Hip Hop / Melodic Trap',
    defaultMood: 'Energetic / Moody Trap',
    defaultEnergy: 4,
    artists: [
      'kendrick lamar',
      'j. cole',
      'travis scott',
      '21 savage',
      'metro boomin',
      'future',
      'gunna',
      'lil baby',
      'a$ap rocky',
      'don toliver',
      'post malone',
      'juice wrld',
      'xxxtentacion',
    ],
  },
  {
    genre: 'Chillhop / Lo-Fi Beats',
    defaultMood: 'Chill / Lo-Fi',
    defaultEnergy: 1,
    artists: [
      'l.dre',
      'kupla',
      'idealism',
      'kudasaibeats',
      'potsu',
      'saib',
      'tomppabeats',
      'elijah who',
      'biosphere',
      'jinsang',
      'chilledcow',
      'lofi girl',
      'wun two',
    ],
  },
  {
    genre: 'Electronic / Synthwave',
    defaultMood: 'Atmospheric Synthwave',
    defaultEnergy: 4,
    artists: [
      'daft punk',
      'kavinsky',
      'the midnight',
      'rüfüs du sol',
      'rufus du sol',
      'odesza',
      'disclosure',
      'flume',
      'fred again..',
      'fred again',
      'm83',
      'timecop1983',
    ],
  },
];

// Helper to normalize strings for comparison
function norm(str: string): string {
  return (str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim();
}

/**
 * Finds the cluster and related artists for a given artist name.
 */
export function findArtistCluster(artistName: string): ArtistCluster | undefined {
  const cleanName = norm(artistName);
  return ARTIST_CLUSTERS.find((cluster) =>
    cluster.artists.some((a) => cleanName.includes(a) || a.includes(cleanName))
  );
}

/**
 * Computes artist similarity (0 to 1.0)
 */
export function calculateArtistSimilarity(artistA: string, artistB: string): number {
  const a = norm(artistA);
  const b = norm(artistB);

  // Exact or subset match (same artist or collaboration)
  if (a === b || a.includes(b) || b.includes(a)) {
    return 1.0;
  }

  // Check cluster relationship
  const clusterA = findArtistCluster(artistA);
  const clusterB = findArtistCluster(artistB);

  if (clusterA && clusterB && clusterA.genre === clusterB.genre) {
    return 0.85; // Strong kinship in same sonic ecosystem
  }

  return 0.15; // Distant or unknown connection
}

// ==========================================
// 2. MOOD & ENERGY INFERENCE
// ==========================================

export interface TrackAcousticProfile {
  genre: string;
  mood: string;
  energy: number; // 1 to 5
}

export function inferTrackProfile(track: Track): TrackAcousticProfile {
  const cluster = findArtistCluster(track.artist);
  const titleLower = (track.title || '').toLowerCase();

  // Baseline from cluster or defaults
  const genre = cluster?.genre || 'Modern Pop / Contemporary';
  let mood = cluster?.defaultMood || 'Chill & Melodic';
  let energy = cluster?.defaultEnergy || 3;

  // Title / descriptor overrides (not matching title for similarity, but extracting sonic modifiers)
  if (titleLower.includes('acoustic') || titleLower.includes('unplugged') || titleLower.includes('piano')) {
    energy = Math.max(1, energy - 1);
    mood = 'Acoustic & Intimate';
  } else if (titleLower.includes('slowed') || titleLower.includes('reverb') || titleLower.includes('chill')) {
    energy = Math.max(1, energy - 1);
    mood = 'Dreamy & Lo-Fi';
  } else if (titleLower.includes('remix') || titleLower.includes('club') || titleLower.includes('extended dance')) {
    energy = Math.min(5, energy + 1);
    mood = 'High Energy';
  } else if (titleLower.includes('live') || titleLower.includes('session')) {
    mood = `${mood} (Live Session)`;
  }

  return { genre, mood, energy };
}

/**
 * Mood similarity score (0 to 1.0)
 */
export function calculateMoodSimilarity(moodA: string, moodB: string): number {
  if (moodA === moodB) return 1.0;
  const mA = norm(moodA);
  const mB = norm(moodB);

  if (mA.includes(mB) || mB.includes(mA)) return 0.85;

  // Compatible mood groups
  const moodyLateNight = ['late night', 'melancholic', 'dark rb', 'dreamy'];
  const chillAcoustic = ['chill', 'acoustic', 'lofi', 'warm'];
  const upbeatGroup = ['energetic', 'high energy', 'dance', 'trap'];

  const matchGroup = (group: string[]) =>
    group.some((w) => mA.includes(w)) && group.some((w) => mB.includes(w));

  if (matchGroup(moodyLateNight) || matchGroup(chillAcoustic) || matchGroup(upbeatGroup)) {
    return 0.75;
  }

  return 0.25;
}

// ==========================================
// 3. WEIGHTED SCORING & CANDIDATE EVALUATION
// ==========================================

export interface UserSignals {
  recentTrackIds: Set<string>; // Avoid playing what just played
  cooldownTrackIds: Set<string>; // 2-3 hour cooldown
  skippedTrackIds: Set<string>; // Songs skipped early (< 25s)
  skippedArtists: Set<string>; // Artists repeatedly skipped
  likedArtists: Set<string>; // User favorite artists
  likedTrackIds: Set<string>; // User favorite songs
  consecutiveArtistCount: number; // How many songs by current artist played in a row
}

export function scoreCandidate(
  candidate: Track,
  seedTrack: Track,
  signals: UserSignals
): {
  score: number;
  reason: RecommendationReason;
  breakdown: RecommendedTrack['scoreBreakdown'];
  profile: TrackAcousticProfile;
} {
  const seedProfile = inferTrackProfile(seedTrack);
  const candidateProfile = inferTrackProfile(candidate);

  // 1. Mood Similarity (35% weight)
  const moodScore = calculateMoodSimilarity(seedProfile.mood, candidateProfile.mood);

  // 2. Genre / Subgenre Compatibility (20% weight)
  const genreScore =
    seedProfile.genre === candidateProfile.genre
      ? 1.0
      : findArtistCluster(candidate.artist)?.genre === seedProfile.genre
      ? 0.8
      : 0.3;

  // 3. Artist Similarity (15% weight)
  const isSameArtist = norm(candidate.artist) === norm(seedTrack.artist);
  let artistScore = calculateArtistSimilarity(seedTrack.artist, candidate.artist);

  // Apply artist throttling if already played multiple songs from this artist
  if (isSameArtist && signals.consecutiveArtistCount >= 2) {
    artistScore = 0.4; // Diversify after 2 songs
  }

  // 4. Energy & Tempo Compatibility (15% weight)
  const energyDiff = Math.abs(seedProfile.energy - candidateProfile.energy);
  const energyScore = energyDiff === 0 ? 1.0 : energyDiff === 1 ? 0.8 : energyDiff === 2 ? 0.5 : 0.2;

  // 5. User Preferences & Listening History (10% weight)
  let historyAffinity = 0.5; // neutral baseline
  const candidateArtistNorm = norm(candidate.artist);

  if (signals.likedTrackIds.has(candidate.id)) {
    historyAffinity = 1.0;
  } else if (signals.likedArtists.has(candidateArtistNorm)) {
    historyAffinity = 0.9;
  }

  if (signals.skippedTrackIds.has(candidate.id)) {
    historyAffinity = Math.max(0, historyAffinity - 0.5);
  }
  if (signals.skippedArtists.has(candidateArtistNorm)) {
    historyAffinity = Math.max(0, historyAffinity - 0.4);
  }

  // 6. Discovery Diversity Boost (5% weight)
  const isFreshArtist = !isSameArtist && !signals.recentTrackIds.has(candidate.id);
  const diversityBoost = isFreshArtist && artistScore >= 0.7 ? 1.0 : 0.4;

  // Compute Base Weighted Score (0 - 100)
  let totalScore =
    moodScore * 35 +
    genreScore * 20 +
    artistScore * 15 +
    energyScore * 15 +
    historyAffinity * 10 +
    diversityBoost * 5;

  // Hard penalties:
  // Immediate duplicate / recent cooldown
  if (signals.recentTrackIds.has(candidate.id) || signals.cooldownTrackIds.has(candidate.id)) {
    totalScore *= 0.15; // heavily de-prioritize
  }

  // Assign informative Recommendation Reason
  let reason: RecommendationReason;

  if (isSameArtist && moodScore >= 0.7) {
    reason = {
      type: 'same_artist',
      label: 'Same Artist',
      detail: `More from ${candidate.artist}`,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
  } else if (artistScore >= 0.8) {
    reason = {
      type: 'similar_artist',
      label: 'Related Sound',
      detail: `Similar to ${seedTrack.artist}`,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
  } else if (moodScore >= 0.8) {
    reason = {
      type: 'similar_mood',
      label: 'Matching Mood',
      detail: candidateProfile.mood,
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    };
  } else if (historyAffinity >= 0.8) {
    reason = {
      type: 'listening_history',
      label: 'From Your Taste',
      detail: 'Based on tracks you liked',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    };
  } else if (genreScore >= 0.8) {
    reason = {
      type: 'similar_genre',
      label: 'Genre Match',
      detail: candidateProfile.genre,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };
  } else {
    reason = {
      type: 'discovery',
      label: 'Smart Discovery',
      detail: 'Curated for this vibe',
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    };
  }

  return {
    score: Math.round(totalScore),
    reason,
    breakdown: {
      moodSimilarity: Math.round(moodScore * 100),
      genreCompatibility: Math.round(genreScore * 100),
      artistSimilarity: Math.round(artistScore * 100),
      energyCompatibility: Math.round(energyScore * 100),
      historyAffinity: Math.round(historyAffinity * 100),
      diversityBoost: Math.round(diversityBoost * 100),
    },
    profile: candidateProfile,
  };
}
