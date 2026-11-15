# OrbitTune — Data Structures & Storage

> Sources: `src/types/music.ts` (runtime types), `src/lib/db.ts` (Dexie schema), `src/app/page.tsx` (sessionStorage cache), `src/components/ThemeToggle.tsx` (localStorage).
> There are **no environment variables and no secrets** in this project — nothing reads `process.env`. All user data is browser-local.

## 1. Core Runtime Types (`src/types/music.ts`)

### 1.1 Track (the universal song object)

```ts
interface Track {
  id: string;              // YouTube video ID
  title: string;
  artist: string;
  artistId?: string;       // YouTube Music channel ID (links to /artist?id=)
  album?: string;
  albumId?: string;
  thumbnail: string;       // ytimg / googleusercontent URL
  duration: number;        // seconds
  durationFormatted?: string;
  streamUrl?: string;      // optional resolved URL (mostly unused; playback goes via /api/stream)
  queueEntryId?: string;
}
```

Example (typical Innertube result):

```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Song Title",
  "artist": "Artist Name",
  "artistId": "UCuAXFkgsw1L7xaCfnd5xJOg",
  "album": "Album Name",
  "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
  "duration": 212,
  "durationFormatted": "3:32"
}
```

- **No dedicated Artist or Album schema exists.** Artists are represented by `artist`/`artistId` fields on `Track`; albums by `album`/`albumId`. The artist page has its own transient response shape (`src/app/artist/page.tsx`: `ArtistHeader`, `Section`, `SectionItem` — client-only interfaces).
- Cover resolution helpers: `getHighResCover(url)` upgrades googleusercontent URLs to `=w800-h800-l90-rj` and ytimg URLs to `maxresdefault.jpg`; `getThumbnailFallbackChain(url)` returns an ordered list of fallbacks used by `CoverImage` (`src/components/CoverImage.tsx`).

### 1.2 Lyrics

```ts
interface LyricsLine { time: number; text: string; } // time in seconds, from LRC timestamps
interface SyncedLyrics {
  id?: number;
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
  instrumental?: boolean;   // LRCLIB instrumental flag → UI shows "Instrumental"
  plainLyrics?: string;     // fallback text (no timestamps)
  syncedLyrics?: string;    // raw LRC
  lines: LyricsLine[];      // parsed & time-sorted (parseLrc, src/lib/lyrics.ts)
}
```

Lyrics are **not stored locally**; fetched fresh per track via `/api/lyrics` (server-side 24 h Next fetch cache).

### 1.3 Recommendations

```ts
type RepeatMode = 'off' | 'all' | 'one';
type RecommendationReasonType = 'same_artist' | 'similar_artist' | 'similar_mood'
  | 'similar_genre' | 'listening_history' | 'discovery';

interface RecommendationReason {
  type: RecommendationReasonType;
  label: string;          // human-readable badge text
  detail?: string;
  color: string;          // Tailwind color class or hex
}

interface RecommendedTrack extends Track {
  score: number;          // 0–100 (scoreCandidate, src/lib/recommender.ts)
  reason: RecommendationReason;
  detectedMood?: string;
  detectedGenre?: string;
  scoreBreakdown?: {
    moodSimilarity: number;      // weight 35
    genreCompatibility: number;  // weight 20
    artistSimilarity: number;    // weight 15
    energyCompatibility: number; // weight 15
    historyAffinity: number;     // weight 10
    diversityBoost: number;      // weight 5
  };
}
```

Mood/genre inference comes from `ARTIST_CLUSTERS` in `src/lib/recommender.ts` (16+ hardcoded artist→genre/mood/energy cluster lists).

## 2. IndexedDB — `OrbitTuneDatabase` (Dexie, version 2)

**File:** `src/lib/db.ts`. Class `OrbitTuneDB extends Dexie`, exported singleton `db`.

| Table | Primary key | Indexes | Record shape |
| :--- | :--- | :--- | :--- |
| `likedTracks` | `id` (track id) | — | `LikedTrack extends Track { likedAt: number }` |
| `playlists` | `id` (UUID / `pl_<ts>_<n>`) | — | `PlaylistRecord { id, name, description?, coverUrl?, createdAt, updatedAt, tracks: Track[] }` |
| `history` | `id` (auto) | — | `HistoryRecord { id?, trackId, track: Track, playedAt: number }` |
| `userFeedback` | `id` (auto) | — | `UserFeedbackRecord { id?, trackId, artist, action: 'complete_play'\|'liked'\|'early_skip'\|'dismissed_recommendation', timestamp, durationPlayed? }` |
| `recommendationCooldowns` | `trackId` | — | `RecommendationCooldownRecord { trackId, artist, cooldownUntil: number, timesRecommended: number }` |

Notes (verified from code):

- Playlist tracks are stored **embedded** inside the `PlaylistRecord` (`tracks: Track[]`), not as a relational join table.
- History is append-per-play (one record each time a track starts).
- The store queries `history.orderBy('playedAt').reverse().limit(25)` and `userFeedback.where('action').equals('early_skip')` — feedback reads rely on Dexie default scanning for the action filter (no index declared on `action`).
- Schema version is **2**; no migration/upgrade code is present (`src/lib/db.ts` contains none beyond the version declaration).

### 2.1 Example records

```jsonc
// likedTracks
{ "id": "dQw4w9WgXcQ", "title": "Song", "artist": "Artist", "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "duration": 212, "likedAt": 1763000000000 }

// playlists
{ "id": "3f2c…", "name": "Night Drive", "description": "", "createdAt": 1763000000000, "updatedAt": 1763000100000, "tracks": [ { …Track } ] }

// userFeedback
{ "trackId": "dQw4w9WgXcQ", "artist": "Artist", "action": "early_skip", "timestamp": 1763000000000, "durationPlayed": 18 }

// recommendationCooldowns
{ "trackId": "dQw4w9WgXcQ", "artist": "Artist", "cooldownUntil": 1763009000000, "timesRecommended": 1 }
```

## 3. Web Storage Keys

| Key | Storage | Value | Writer | TTL / lifecycle |
| :--- | :--- | :--- | :--- | :--- |
| `orbittune:home:v2` | `sessionStorage` | JSON `{ sections, spotlight: { track, label }, at }` (shape per `src/app/page.tsx` cache write, lines 67–83) | Home page effect | 15 min (`HOME_CACHE_TTL`); cleared when the tab closes |
| `orbittune-theme` | `localStorage` | `'dark' \| 'light'` | `ThemeToggle` | permanent |

## 4. Server-side Caches (not user data, but structural)

| Cache | Location | Content | TTL |
| :--- | :--- | :--- | :--- |
| Innertube session | module singleton, `src/lib/youtube.ts` | `Innertube` instance + `UniversalCache(false)` | process lifetime |
| Ytdl instance | module singleton, `src/lib/youtube.ts` | `Ytdl` client | process lifetime |
| Explore feed | module vars `cached`/`pending`, `src/app/api/explore/route.ts` | `{ sections, at }` | 10 min + stale-while-revalidate |
| Explore HTTP | `Cache-Control: public, max-age=60, stale-while-revalidate=600` | response headers | browser/CDN |
| Lyrics | Next fetch cache on lrclib.net calls, `src/lib/lyrics.ts` | `SyncedLyrics` JSON | 24 h (`revalidate: 86400`) |
| Recommendation cooldown | Dexie (above) | — | 2.5 h per track |

## 5. Data Relationships

```
Track (transient, from Innertube)
 ├─→ likedTracks (Track + likedAt)          [persisted]
 ├─→ history (Track wrapper + playedAt)     [persisted]
 ├─→ playlists.tracks[] (embedded)          [persisted]
 ├─→ userFeedback (trackId, artist)         [persisted]
 └─→ recommendationCooldowns (trackId)      [persisted, 2.5h]

SyncedLyrics (transient)  ── keyed by title/artist match, never stored
RecommendedTrack (transient) ── Track + score/reason, held in Zustand only
```

- No foreign-key enforcement (Dexie plain tables); `history.trackId` references the track's YouTube ID by convention.
- Deleting a playlist/like does not cascade to history or feedback.

## 6. Cross-references

- How the store consumes these structures: docs/MUSIC_ENGINE.md, docs/ARCHITECTURE.md §5.1
- API request/response shapes: docs/ROUTES.md
- Recommendation scoring internals: docs/ARCHITECTURE.md §8.5
