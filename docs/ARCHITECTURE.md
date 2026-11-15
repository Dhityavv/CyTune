# OrbitTune — Architecture Documentation

> Generated from source inspection of the codebase at `Website Version/` (the project root of this repository).
> Every claim is grounded in the referenced source files. If something is not in the code, it is explicitly marked.

## 1. Project Overview

OrbitTune is a **client-heavy music streaming web application** that streams audio from the **YouTube Music catalog** using unofficial/private internal APIs (Innertube protocol) instead of a licensed music API. All user data (liked songs, playlists, history, recommendation feedback) lives **locally in the browser** (IndexedDB via Dexie). There is no user account system, no database server, and no authentication.

The app is an editorial, ad-free UI inspired by Spotify/Apple Music, with synced karaoke lyrics (LRCLIB), a "Smart Autoplay" recommendation engine, and a persistent docked player.

- App title: `OrbitTune — High Resolution Music Streaming` (`src/app/layout.tsx`, metadata)
- Displayed version: **v1.0** (`src/components/Sidebar.tsx` footer, `src/app/info/page.tsx`; `package.json` version is still `0.1.0`)

## 2. Technology Stack (verified from `package.json`)

| Layer | Technology | Version |
| :--- | :--- | :--- |
| Framework | Next.js (App Router, Turbopack) | `16.4.6` |
| UI runtime | React + React DOM | `19.3.0` |
| Language | TypeScript (strict) | `^5` |
| Styling | Tailwind CSS v4 (`@tailwindcss/turbopack` plugin) | `4.3.3` |
| State | Zustand | `^5.1.0` |
| Local persistence | Dexie + dexie-react-hooks (IndexedDB) | `^4.4.7` |
| Animation | framer-motion | `^14.14.0` |
| Icons | lucide-react | `^1.73.0` |
| Catalog/streaming | youtubei.js (Innertube client) | `^18.3.0` |
| Stream URL extraction | @distube/ytdl-core (`Ytdl` class) | `^5.2.1` |
| Linting | ESLint 9 + `eslint-config-next` | `^9` |

No other runtime dependencies exist. There are **no environment variables required** (`.env*` is gitignored; nothing in the code reads `process.env`).

## 3. Framework Configuration

`next.config.ts`:
- `cacheComponents: true` — Next.js cache-components mode (all pages are client components anyway).
- `partialPrefetching: true`.
- Turbopack rule passes `*.css` through `@tailwindcss/turbopack`.

`tsconfig.json`: strict mode, `jsx: react-jsx`, path alias `@/* → ./src/*`, target ES2017.

## 4. Directory Structure (actual)

```
Website Version/
├── package.json / package-lock.json
├── next.config.ts / tsconfig.json / eslint.config.mjs
├── DESIGN.md                     # Design spec (OUTDATED — see docs/DESIGN_SYSTEM.md)
├── AGENTS.md                     # Auto-generated Next.js agent rules
├── install-windows.ps1           # UNRELATED leftover: installs an app called "Hex" (not OrbitTune)
├── test-aid.mjs                  # Dev-only scratch script probing Innertube artist fields
├── public/                       # 5 default create-next-app SVGs (unused by the app)
└── src/
    ├── app/
    │   ├── layout.tsx            # Root layout / global shell
    │   ├── globals.css           # Tailwind v4 @theme tokens, dark+light palettes, keyframes
    │   ├── page.tsx              # Home ("Explore & Charts")
    │   ├── search/page.tsx       # Search & genre browse
    │   ├── library/page.tsx      # Liked / Playlists / History tabs + CSV
    │   ├── artist/page.tsx       # Artist profile (?id=)
    │   ├── info/page.tsx         # About / stats / support
    │   ├── favicon.ico
    │   └── api/
    │       ├── search/route.ts       GET  ?q=
    │       ├── explore/route.ts      GET  (cached feed)
    │       ├── lyrics/route.ts       GET  ?title=&artist=&duration=
    │       ├── recommendations/route.ts POST (scoring engine)
    │       ├── artist/route.ts       GET  ?id=
    │       └── stream/[id]/route.ts  GET  audio stream (redirect or proxy)
    ├── components/               # 14 shared components (see §6)
    ├── lib/
    │   ├── youtube.ts            # Innertube/ytdl singletons, search, explore, autoplay candidates
    │   ├── recommender.ts        # Artist clusters, mood/energy inference, scoring
    │   ├── lyrics.ts             # LRCLIB fetch + LRC parser
    │   └── db.ts                 # Dexie schema (OrbitTuneDatabase)
    ├── store/usePlayerStore.ts   # Zustand player + smart-autoplay store
    └── types/music.ts            # Track, lyrics, recommendation types + cover helpers
```

## 5. Application Architecture

The app is a **single-page-like client application inside a Next.js App Router shell**:

- Every page is a `'use client'` component. Server rendering only produces the static shell; all data is fetched at runtime by the client (or by Next.js API routes that proxy third-party services).
- A **global headless `<audio>` element** lives in the root layout (not inside any page), so playback survives route changes.
- Route navigation never unmounts the player stack.

```mermaid
flowchart TB
    subgraph Browser
        subgraph "Root layout (src/app/layout.tsx)"
            AB[AmbientBackground] 
            AC[AudioController<br/>headless <audio>]
            SB[Sidebar desktop]
            MAIN[main scrollable canvas<br/>+ page children]
            QD[QueueDrawer]
            MN[MobileNav mobile]
            BP[BottomPlayer]
            EP[ExpandedPlayer modal]
            CM[CatMascot]
            TT[ThemeToggle]
            NB[NotificationBell]
        end
        STORE[(Zustand store<br/>usePlayerStore)]
        IDB[(IndexedDB<br/>OrbitTuneDatabase - Dexie)]
        SS[(sessionStorage<br/>orbittune:home:v2)]
        LS[(localStorage<br/>orbittune-theme)]
    end

    subgraph "Next.js API routes (Node runtime)"
        EXP[/api\/explore/]
        SE[/api\/search?q/]
        LY[/api\/lyrics/]
        REC[/api\/recommendations/]
        ART[/api\/artist?id/]
        ST[/api\/stream\/id/]
    end

    subgraph "Third-party"
        YM[YouTube Music<br/>Innertube protocol]
        YT[@distube/ytdl-core<br/>stream URL + audio CDN]
        LRC[lrclib.net API]
    end

    STORE <--> AC
    STORE --> BP & EP & QD & AB & MN
    IDB <--> STORE
    IDB --> SB & BP & EP
    MAIN -->|fetch| SE & EXP & ART
    STORE -->|fetch| LY & REC
    AC -->|src=/api/stream/id| ST
    ST --> YT
    SE & EXP & REC & ART --> YM
    LY --> LRC
    SS --> MAIN
    LS --> TT
```

### 5.1 State layers (three distinct stores of truth)

1. **Zustand (`src/store/usePlayerStore.ts`)** — playback state, queue, lyrics, expanded/drawer UI flags, smart-autoplay state. Single store, accessed via `usePlayerStore()` selectors or `usePlayerStore.getState()`.
2. **IndexedDB (`src/lib/db.ts`)** — durable library data: liked tracks, playlists, history, recommendation feedback, cooldowns. React components read it reactively through `useLiveQuery` (dexie-react-hooks).
3. **Web Storage** —
   - `sessionStorage['orbittune:home:v2']` (key `HOME_CACHE_KEY` in `src/app/page.tsx`): home feed + spotlight snapshot, TTL 15 min.
   - `localStorage['orbittune-theme']` (`src/components/ThemeToggle.tsx`): `'dark' | 'light'`.

There is **no server-side session, no cookie, and no user identity** in the current implementation.

### 5.2 Caching layers (performance)

| Cache | Location | TTL | Source |
| :--- | :--- | :--- | :--- |
| Innertube session | module singleton `innertubeInstance` + `UniversalCache(false)` in `src/lib/youtube.ts` (`getInnertube`) | process lifetime | — |
| Ytdl instance | module singleton `ytdlInstance` (`getYtdl`) | process lifetime | — |
| Explore feed | module variables `cached`/`pending` in `src/app/api/explore/route.ts` | 10 min + stale-while-revalidate serve | `TTL`, `refresh()` |
| Explore HTTP | `Cache-Control: public, max-age=60, stale-while-revalidate=600` | browser/CDN | `HEADERS` |
| Home page snapshot | `sessionStorage['orbittune:home:v2']` | 15 min (`HOME_CACHE_TTL`) | `src/app/page.tsx` |
| Lyrics | Next fetch cache `next: { revalidate: 86400 }` on lrclib calls | 24 h | `src/lib/lyrics.ts` |

## 6. Component Hierarchy

```
RootLayout (src/app/layout.tsx)
├── AmbientBackground        // fixed gradient blobs; reacts to isPlaying + ambientColor
├── AudioController          // <audio id="orbit-audio-player"> + MediaSession wiring
├── div shell (flex row, h-screen)
│   ├── Sidebar              // desktop nav (hidden < md), playlist quick-create, footer link → /info
│   └── main#main-content    // page children (page.tsx / search / library / artist / info)
├── QueueDrawer              // slide-over right drawer (Zustand isQueueDrawerOpen)
├── MobileNav                // mobile bottom nav (md:hidden), 4 items
├── BottomPlayer             // docked 76px player, hidden until a track is loaded
├── ExpandedPlayer           // centered modal player with Lyrics/Queue tabs
├── CatMascot                // draggable decorative cat + WebAudio "meow"
├── ThemeToggle              // floating dark/light toggle (top-right)
└── NotificationBell         // floating static updates popover (top-right)

Shared leaf components used by pages:
├── TrackCard                // square artwork card, hover play, quick like/playlist
├── TrackRow + TrackTableHeader  // table-style row (index, title, album, actions)
├── CoverImage + VinylPlaceholder  // thumbnail w/ fallback chain + vinyl SVG placeholder
└── QueueItem                // queue/recommendation row (memoized)
```

Notable unused-but-present props: `queueContext` on `TrackCard` and `TrackRow` is accepted but never used by callers; `onRemove` on `QueueItem` is never passed (see docs/PROJECT_STATUS.md).

## 7. Routing Architecture

Next.js App Router, file-based. All pages are client components; `/search`, `/library`, `/artist` read query params via `useSearchParams()` wrapped in `<Suspense>`.

| Route | File | Reads |
| :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | — |
| `/search` | `src/app/search/page.tsx` | `?q=` |
| `/library` | `src/app/library/page.tsx` | `?tab=favorites|playlists|history` |
| `/artist` | `src/app/artist/page.tsx` | `?id=` |
| `/info` | `src/app/info/page.tsx` | — |

API routes are documented in docs/ROUTES.md.

## 8. Data Flow (request lifecycles)

### 8.1 Home feed
`page.tsx` → paint from sessionStorage cache (instant) → `GET /api/explore` → server checks module cache (10 min TTL) / serves stale + background refresh → `getExploreTracks()` in `src/lib/youtube.ts` runs 4 fixed Innertube searches in parallel → response sections are rendered as horizontal scroll rows (index 1 renders as a "Quick Picks" track table) → written back to sessionStorage.

### 8.2 Trending spotlight
`page.tsx` computes a 5-minute window index (`trendingWindow()`), picks a source from `TRENDING_SOURCES` (6 chart queries: Global Top 50, new Indonesian releases, Indonesian Top 50, viral hits worldwide, Indonesian favourites, UK Top 40), calls `GET /api/search?q=<query>`, filters junk titles (karaoke/remix/compilation/…) and durations outside 120–420 s, picks `list[win % list.length]`, renders it with a crossfade/light-sweep animation, and caches the snapshot. A 20 s interval + `visibilitychange` listener refetch only when the window rolls over.

### 8.3 Search
`search/page.tsx` → debounced (350 ms) `GET /api/search?q=` → `searchMusic()` in `src/lib/youtube.ts` (Innertube `music.search` type `song`, with fallbacks) → results split into Top Result card / Songs rows / More Related grid.

### 8.4 Playback & streaming
User clicks a track → `playTrack()` (Zustand) → state update → `AudioController` effect sets `<audio>.src = /api/stream/{id}` → API route resolves the top-bitrate audio-only format via `getStreamUrl()` (`@distube/ytdl-core`) → **307 redirect** to the audio CDN (or proxied stream with Range support when `?proxy=true`) → audio element plays; `timeupdate` events stream back into the store.

### 8.5 Smart autoplay
On every track change, the store fetches local signals from IndexedDB (recent history, cooldowns, skips, likes) → `POST /api/recommendations` → `getAutoplayCandidates()` (Innertube UpNext radio + same-artist search) → `scoreCandidate()` in `src/lib/recommender.ts` (weighted 0–100 score) → artist-diversity cap (max 2 per artist) → returned list becomes `recommendationQueue`; when the normal queue ends, the top recommendation is auto-played and gets a 2.5 h cooldown in IndexedDB.

## 9. External Dependencies (network)

| Service | Used for | Where |
| :--- | :--- | :--- |
| YouTube Music (Innertube internal API) | search, explore sections, UpNext radio, artist pages | `src/lib/youtube.ts`, `src/app/api/artist/route.ts` |
| googlevideo.com audio CDN | actual audio bytes (via `/api/stream/[id]`) | `src/lib/youtube.ts` `getStreamUrl` |
| `lrclib.net` | synced/plain lyrics | `src/lib/lyrics.ts` |
| `images.unsplash.com` | decorative genre tile images (hardcoded URLs) | `src/app/page.tsx` (`GENRE_CATEGORIES`), `src/app/search/page.tsx` (`GENRE_TILES`) |
| `i.ytimg.com` / `googleusercontent.com` | cover art | thumbnail URLs returned by Innertube |

No API keys are used anywhere. The Innertube client is created with `generate_session_locally: true` (anonymous session), see `src/lib/youtube.ts`.

## 10. Storage Mechanisms

- **IndexedDB database name**: `OrbitTuneDatabase` (`src/lib/db.ts`), Dexie schema version 2. Tables: `likedTracks`, `playlists`, `history`, `userFeedback`, `recommendationCooldowns`. Full schema in docs/DATA_STRUCTURE.md.
- **sessionStorage / localStorage keys**: `orbittune:home:v2`, `orbittune-theme`.
- **MediaSession API**: metadata + play/pause/next/prev/seekto handlers (`src/components/AudioController.tsx`).

## 11. API Integrations

Summarized here; full request/response shapes in docs/ROUTES.md and docs/DATA_STRUCTURE.md.

- `/api/search` — thin wrapper over `searchMusic` (`src/lib/youtube.ts`), 3-strategy Innertube search.
- `/api/explore` — module-cached feed from 4 hardcoded category queries (`getExploreTracks`).
- `/api/stream/[id]` — resolves best audio-only format and either 307-redirects or proxies with Range headers (`src/app/api/stream/[id]/route.ts`).
- `/api/lyrics` — LRCLIB `api/get` with title/artist cleanup, fallback to `api/search`; parses LRC timestamps (`src/lib/lyrics.ts`).
- `/api/recommendations` — POST with user signals; scoring in `src/lib/recommender.ts`.
- `/api/artist` — `yt.music.getArtist(id)`; maps `MusicResponsiveListItem` sections to tracks and carousels (`src/app/api/artist/route.ts`).

## 12. Build & Deployment

- Scripts (`package.json`): `dev` (`next dev`), `build` (`next build`), `start` (`next start`), `lint` (`eslint`).
- Turbopack is enabled by Next 16 dev/build; Tailwind runs through the Turbopack loader (no PostCSS config file present).
- No custom server, no middleware, no `next/image` usage (plain `<img>` tags everywhere, including remote Unsplash/thumbnail URLs — no image domains configured because `next/image` is not used).
- Deployment target: standard Node host or Vercel (README retains the default create-next-app Vercel section). Audio streaming routes need a Node runtime; there is no `edge` export anywhere.
- **Operational footgun (observed)**: running `next build` while `next dev` is serving from the same directory corrupts `.next` and breaks dev-server hydration until it is restarted. Not a code bug; a workflow constraint.

## 13. Communication Between Main Components (summary)

- **Page → Store**: pages call `playTrack`, `togglePlay`, etc. from `usePlayerStore`.
- **Store → AudioController**: `AudioController` subscribes to `currentTrack`, `isPlaying`, `volume`, `isMuted`; store actions also reach into the DOM audio element directly by `document.getElementById('orbit-audio-player')` for `seekTo`/`setVolume` (see `src/store/usePlayerStore.ts`).
- **AudioController → Store**: DOM events (`timeupdate`, `ended`, `canplay`, `waiting`, `error`) push state back via `updateTime`, `nextTrack`, `recordFeedback`, `setIsBuffering`.
- **Anything → IndexedDB**: direct `db.*` calls plus `useLiveQuery` for reactive reads.
- **Seek/volume DOM coupling**: `seekTo` writes `currentTime` to both store and element; `BottomPlayer`/`ExpandedPlayer` seek bars are custom overlays over hidden `<input type="range">`, with `onWheel` nudges (±5 s seek, ±0.05 volume).

## Cross-references

- Visual system details: docs/DESIGN_SYSTEM.md
- Feature inventory: docs/FEATURES.md
- Playback internals: docs/MUSIC_ENGINE.md
- Schemas & storage keys: docs/DATA_STRUCTURE.md
- Routes & API contracts: docs/ROUTES.md
- Static assets: docs/ASSETS.md
- Known issues & recommendations: docs/PROJECT_STATUS.md
