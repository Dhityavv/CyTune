# OrbitTune — Feature Inventory (verified)

> Every feature below was located in the source. Status column: ✅ implemented, 🟡 partially implemented, ⚪ static/mock.
> Playback internals are documented separately in docs/MUSIC_ENGINE.md.

## 1. Home — "Explore & Charts" (`/`)

**File:** `src/app/page.tsx` · **Status:** ✅

| Feature | Detail | Interaction |
| :--- | :--- | :--- |
| Trending Spotlight hero | Rotating single-track hero. Source rotates every 5 min via `trendingWindow()` = `Math.floor(Date.now() / (5*60*1000))` over `TRENDING_SOURCES` (6 chart queries: Global Top 50, new Indonesian releases, Indonesian Top 50, viral hits worldwide, Indonesian favourites, UK Top 40 — lines 30–37). Fetches `/api/search?q=<query>`, filters junk titles with regex `/top hits\|best of\|compilation\|playlist\|mix \d\|karaoke\|instrumental\|\bcover\b\|remix\|reverb\|8d\|nightcore\|sped up\|slowed\|lyrics/i` and durations outside 120–420 s, then picks `list[win % list.length]`. Animated crossfade + light sweep; honors `useReducedMotion()`. | Play button + title/artist link to `/artist?id=` |
| Explore sections | Horizontal scroll rows from `/api/explore` (4 fixed category queries in `getExploreTracks`, `src/lib/youtube.ts`). Section index 1 renders as a "Quick Picks" track table (`TrackRow`), others as `TrackCard` rows. | Click card/row → play; hover quick actions |
| Recently Played | Section shown only if IndexedDB `history` has entries; last 10 unique tracks (`history` table, deduped by `trackId`). | Play / like / add-to-playlist |
| Genre categories | 6 hardcoded tiles `GENRE_CATEGORIES` (lines 21–28) with Unsplash images and top-border colors; clicking navigates to `/search?q=<genre query>`. | Navigate |
| Home cache | Snapshot cached in `sessionStorage['orbittune:home:v2']` (TTL 15 min, `HOME_CACHE_KEY`/`HOME_CACHE_TTL` lines 47–48); reload paints instantly then revalidates against `/api/explore`. | — |

## 2. Search (`/search`)

**File:** `src/app/search/page.tsx` · **Status:** ✅

| Feature | Detail |
| :--- | :--- |
| Live search | Debounced 350 ms input; reads `?q=` (shareable URLs); calls `/api/search?q=`. Wrapped in `<Suspense>` for `useSearchParams`. |
| Result grouping | Top Result hero card, Songs table (`TrackRow` + `TrackTableHeader`), "More Related" grid (`TrackCard`). |
| Trending searches | 9 hardcoded chips (`TRENDING_SEARCHES`): Taylor Swift, The Weeknd, Drake, Joji, Bernadya, NIKI, Coldplay, Billie Eilish, wave to earth. |
| Genre tiles | 12 hardcoded tiles `GENRE_TILES` (Unsplash images, colored top borders, mapped to search queries). |
| Album/playlist click | Clicking an album/playlist item falls back to `/search?q=<name>` — there is no dedicated album/playlist page (verified). |

## 3. Library (`/library`)

**File:** `src/app/library/page.tsx` · **Status:** ✅ (with quirks — see notes)

Tabs via `?tab=favorites|playlists|history` (default **playlists**; invalid values fall back):

| Tab | Feature | Detail |
| :--- | :--- | :--- |
| Favorites (Liked Songs) | ✅ | All `likedTracks` from IndexedDB as `TrackRow` table; Play-all and Shuffle buttons; per-row like toggle removes. |
| Playlists | ✅ | Grid of `PlaylistRecord` cards (name, track count, cover = first track's thumbnail); create via inline form; delete; open playlist detail view (in-page state) with Play-all / Shuffle / remove track / rename? — **rename not implemented**; empty playlists supported. |
| History | ✅ | All `history` records, newest first, with relative time ("Just now", "5m ago", `formatRelativeTime` line 13); Play-all / Shuffle; clear-all button. |
| CSV Export | ✅ | Button (Download icon) exports ALL playlists: header `playlist,trackId,title,artist,album,duration,thumbnail`, quoted fields (`handleExportCsv` line 97); file `orbittune-playlists-<timestamp>.csv`; empty playlists exported as a row with blank track fields. |
| CSV Import | ✅ | Hidden file input (`.csv,text/csv`); simple quoted-field parser (`handleImportCsv` line 126); groups rows by `playlist` name and ADDS new playlists (`description: 'Imported from CSV'`) — does not merge or deduplicate against existing names; missing trackId gets `imp_<ts>_<i>` placeholder id (such tracks may not stream). Uses `alert()` for feedback. |

**Quirks:** sidebar playlist links always navigate to `/library?tab=playlists` (not to a specific playlist); playlist detail is client state only (no URL param), so it is lost on reload.

## 4. Music Player (global, all routes)

**Files:** `src/store/usePlayerStore.ts`, `src/components/BottomPlayer.tsx`, `ExpandedPlayer.tsx`, `AudioController.tsx`, `QueueDrawer.tsx`, `QueueItem.tsx` · **Status:** ✅ · Details in docs/MUSIC_ENGINE.md.

- Play/pause, next/prev (prev restarts track if >3 s elapsed), seek bar (custom overlay, mouse + wheel ±5 s), volume slider (persisted? — **no**, volume resets on reload), mute (3-state icon Volume2/Volume1/VolumeX), shuffle toggle, repeat off/all/one cycle, like toggle, lyrics toggle, queue drawer open, expand/collapse player, buffering indicator, loading state per track (`loadingTrackId`), MediaSession OS integration.

## 5. Smart Autoplay (recommendations)

**Files:** `src/store/usePlayerStore.ts`, `src/lib/recommender.ts`, `src/app/api/recommendations/route.ts` · **Status:** ✅

- Toggle "Sparkles" in BottomPlayer/ExpandedPlayer/QueueDrawer (`smartAutoplayEnabled`, default on).
- On queue exhaustion, top recommendation auto-plays; recommended tracks get a **2.5 h cooldown** in `recommendationCooldowns`; artist-diversity cap 2 consecutive per artist (`consecutiveArtistStreak`); user feedback recorded (`complete_play`, `early_skip` <25 s on >45 s tracks, `liked`, `dismissed_recommendation`) and feeds the scoring weights (35/20/15/15/10/5) in `scoreCandidate()`.
- QueueDrawer lists recommendations under "Up Next" with a refresh button and per-item dismiss (X) — the X marks `dismissed_recommendation`.

## 6. Lyrics

**Files:** `src/lib/lyrics.ts`, `src/app/api/lyrics/route.ts`, `ExpandedPlayer.tsx` · **Status:** ✅

- LRCLIB synced lyrics with karaoke-style active-line highlighting in the expanded player's Lyrics tab; auto-scroll; `Mic2` toggle; instrumental flag supported; 24 h server revalidate cache; plain-text fallback rendered without timestamps.

## 7. Queue Drawer

**File:** `src/components/QueueDrawer.tsx` · **Status:** 🟡

- Slide-over from the right (`isQueueDrawerOpen` in Zustand). Shows **Now Playing** card and a recommendation list with clear-queue action and smart-autoplay toggle.
- **Limitation (verified):** it does NOT render upcoming `queue` items — the real queue array is read but not displayed as a track list; only Now Playing + recommendations appear. Clearing the queue is possible; removing individual queue items is not (the `onRemove` prop of `QueueItem` is never wired).

## 8. Artist Page (`/artist?id=`)

**File:** `src/app/artist/page.tsx`, `src/app/api/artist/route.ts` · **Status:** ✅

- Header (name, description, subscriber count, large thumbnail), Play button (plays first section's tracks), and content sections ("Songs", "Albums", "Singles", "Fans also like") mapped from `yt.music.getArtist`. Section labels fall back to item-kind detection (`sectionLabel` line 33). Album/artist carousel items navigate to `/artist?id=` or `/search?q=` (no album page).

## 9. Info Page (`/info`)

**File:** `src/app/info/page.tsx` · **Status:** ✅

- About text, live listening stats (liked count, playlist count, history count via Dexie `useLiveQuery`), support section with Ko-fi link (Coffee icon) and a "gift" item (Gift icon). Version shown as v1.0.

## 10. Theme Settings

**File:** `src/components/ThemeToggle.tsx` · **Status:** 🟡

- Floating Sun/Moon toggle, fixed top-right; persists to `localStorage['orbittune-theme']`; toggles `light` class on `<html>`. Applies only after hydration (no pre-hydration script) → possible flash of dark theme for light-mode users. Light mode has hardcoded-color gaps (docs/DESIGN_SYSTEM.md §1.2).

## 11. Notifications

**File:** `src/components/NotificationBell.tsx` · **Status:** ⚪ static

- Bell button + popover with 3 hardcoded `UPDATES` entries (v1.0 released, CSV import/export, smart autoplay). No persistence, no unread state, no API.

## 12. Cat Mascot

**File:** `src/components/CatMascot.tsx` · **Status:** ✅ (decorative)

- Draggable floating cat (framer-motion drag), emits a synthesized "meow" via WebAudio oscillator (`playMeow`, no audio file), cycles speech-bubble phrases (`MEOWS` array), auto-float animation.

## 13. MediaSession (OS-level controls)

**File:** `src/components/AudioController.tsx` · **Status:** ✅

- Metadata (title, artist, album, artwork) + handlers: play, pause, nexttrack, previoustrack, seekto.

## 14. Features NOT present (verified absent)

Do not assume these exist:

- User accounts / login / server sync — none.
- Volume persistence across reloads — none.
- Playback state persistence across reloads (resume track) — none; reload stops playback.
- Rename/edit playlist, playlist cover customization, collaborative playlists — none.
- Dedicated album/playlist/browse pages — none (they route to `/search?q=`).
- Real notification system — none (static mock).
- Downloading audio for offline use — none.
- Equalizer / audio effects — none.
- Keyboard shortcuts (space = play, arrows) — none.
- Localization (i18n) — none; UI strings are hardcoded English.
- Tests of any kind — none.

## Cross-references

- Player internals & playback lifecycle: docs/MUSIC_ENGINE.md
- Data behind features: docs/DATA_STRUCTURE.md
- Routes each feature lives on: docs/ROUTES.md
- Known issues per feature: docs/PROJECT_STATUS.md
