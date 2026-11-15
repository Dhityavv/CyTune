# OrbitTune — Routes & API Contracts

> File-based App Router under `src/app/`. All pages are client components; three read query params via `useSearchParams()` inside `<Suspense>`.

## 1. Pages

### `GET /` — Explore & Charts (Home)
- **File:** `src/app/page.tsx`
- **Purpose:** Trending spotlight, explore sections, recently played, genre tiles.
- **Main components:** Spotlight hero, `TrackCard` rows, `TrackRow` table ("Quick Picks"), `GENRE_CATEGORIES` tiles.
- **Interactions:** play, like, add-to-playlist, navigate to `/artist`, `/search?q=`.
- **Data:** `sessionStorage` paint → `GET /api/explore`; spotlight → `GET /api/search?q=`.

### `GET /search?q=<query>` — Search
- **File:** `src/app/search/page.tsx`
- **Query params:** `q` (search text; empty state shows trending chips + genre tiles).
- **Main components:** search input, Top Result card, Songs `TrackRow` table, "More Related" `TrackCard` grid.
- **Data:** debounced (350 ms) `GET /api/search?q=`.

### `GET /library?tab=<favorites|playlists|history>` — My Library
- **File:** `src/app/library/page.tsx`
- **Query params:** `tab` — `favorites`, `playlists` (default), `history`; anything else falls back to `playlists`.
- **Main components:** tab bar, `TrackRow` table (favorites/history), playlist grid, playlist detail view (in-page state), CSV export/import buttons.
- **Data:** Dexie `likedTracks`, `playlists`, `history` via `useLiveQuery`.

### `GET /artist?id=<channelId>` — Artist profile
- **File:** `src/app/artist/page.tsx`
- **Query params:** `id` (YouTube Music channel ID; no id → shows empty/fallback state with back button).
- **Main components:** artist header, section carousels/grids (`TrackCard`), back navigation.
- **Data:** `GET /api/artist?id=`.

### `GET /info` — About / stats / support
- **File:** `src/app/info/page.tsx`
- **Purpose:** About text, live Dexie stats (liked / playlists / history counts), Ko-fi support links.
- No query params.

There are **no other page routes, no dynamic segment pages, no middleware, and no error/loading boundary files** (no `not-found.tsx`, no `error.tsx`, no `loading.tsx` in `src/app/`).

## 2. API Routes (Node runtime, under `src/app/api/`)

### `GET /api/search?q=<query>` → `search/route.ts`
- **Params:** `q` (required; 400 if missing/blank).
- **Response 200:** `{ query: string, tracks: Track[] }`.
- **Errors:** `{ error: string }` with 500.
- **Backend:** `searchMusic()` (`src/lib/youtube.ts`) — 3-strategy Innertube `music.search` (type `song`, fallbacks for shelves/videos).
- **No caching** (each request hits YouTube).

### `GET /api/explore` → `explore/route.ts`
- **Params:** none.
- **Response 200:** `{ sections: Section[] }` where each `Section = { title: string, tracks: Track[] }` (shape from `getExploreTracks`, `src/lib/youtube.ts`).
- **Caching:** module cache TTL 10 min; serves stale + background refresh; `Cache-Control: public, max-age=60, stale-while-revalidate=600`.
- **Note:** calls `connection()` (dynamic rendering) first.

### `GET /api/lyrics?title=&artist=&duration=` → `lyrics/route.ts`
- **Params:** `title` (required, 400 if missing), `artist` (optional), `duration` (seconds, optional).
- **Response 200:** `SyncedLyrics` JSON (docs/DATA_STRUCTURE.md §1.2).
- **Errors:** 404 `{ error: 'Lyrics not found' }`; 500 on fetch failure.
- **Backend:** LRCLIB `api/get` then `api/search` fallback; LRC parsed by `parseLrc` (`src/lib/lyrics.ts`); server-side 24 h revalidate cache.

### `POST /api/recommendations` → `recommendations/route.ts`
- **Body:**
  ```json
  {
    "seedTrack": { "id": "...", "title": "...", "artist": "...", ... },
    "recentIds": ["id", ...],
    "cooldownIds": ["id", ...],
    "skippedTrackIds": ["id", ...],
    "skippedArtists": ["artist", ...],
    "likedArtists": ["artist", ...],
    "likedTrackIds": ["id", ...],
    "consecutiveArtistCount": 1
  }
  ```
- **Response 200:** `{ recommendations: RecommendedTrack[] }` (each with `score`, `reason`, `scoreBreakdown`; artist-diversity capped at 2 consecutive per artist).
- **Errors:** 400 (missing seedTrack), 500.
- **Backend:** `getAutoplayCandidates()` (Innertube UpNext radio + same-artist search) → `scoreCandidate()` (`src/lib/recommender.ts`).

### `GET /api/artist?id=<channelId>` → `artist/route.ts`
- **Params:** `id` (required; 400 if missing).
- **Response 200:** `{ artist: { title, description, thumbnail, subscribers }, sections: [{ title, type, items }] }` — items are tracks or carousel cards (`kind`, `browseId`) mapped from `yt.music.getArtist`.
- **Backend:** Innertube `getArtist` (`src/app/api/artist/route.ts`).

### `GET /api/stream/<videoId>[?proxy=true]` → `stream/[id]/route.ts`
- **Params:** dynamic segment `id` (YouTube video ID; 400 if missing); query `proxy` (`true` enables proxy mode).
- **Default response:** **HTTP 307 redirect** to the googlevideo.com audio CDN URL; headers `Access-Control-Allow-Origin: *`, `Cache-Control: no-cache`.
- **Proxy response (`?proxy=true`):** 200 stream relay with Range passthrough, `Content-Type: audio/mp4` (used if CDN blocks direct browser requests; the app itself does not use this mode — docs/MUSIC_ENGINE.md §2).
- **Errors:** 400/500 JSON `{ error }`.

## 3. Client-side Navigation Map

```
Sidebar (desktop)          MobileNav (mobile)
 ├─ /                       ├─ /
 ├─ /search                 ├─ /search
 ├─ /library                ├─ /library
 ├─ /library?tab=favorites  └─ /library?tab=favorites
 ├─ /library?tab=history
 ├─ /info (footer link)
 └─ playlist links → /library?tab=playlists

In-page links
 ── genre tiles → /search?q=<query>          (page.tsx, search/page.tsx)
 ── artist name/thumb → /artist?id=<id>      (TrackCard, TrackRow, spotlight)
 ── album/playlist card → /search?q=<name>   (fallback; no album page)
 ── carousel artist → /artist?id=<id>        (artist/page.tsx)
```

Programmatic navigation uses `useRouter().push()` (`src/app/page.tsx`, `TrackCard`, `artist/page.tsx`, `ExpandedPlayer` for artist link).

## 4. Cross-references

- Component tree per page: docs/ARCHITECTURE.md §6
- Data behind each route: docs/DATA_STRUCTURE.md
- Streaming route behavior: docs/MUSIC_ENGINE.md §2
