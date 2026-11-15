# OrbitTune — Project Status

> Distinguishes **verified issues** (found in source/behavior) from **recommendations** (suggestions). Version snapshot: UI says "v1.0" (`Sidebar`, `info/page.tsx`), `package.json` says `0.1.0`. Everything below reflects the code as inspected; no dev server was running during documentation.

## 1. Completed Features (working as implemented)

- Home feed with 5-minute rotating trending spotlight and cached explore sections.
- Search with debounce, Top Result/Songs/Related grouping.
- Library: liked songs, playlists (create/delete/detail), history, CSV import/export.
- Artist pages from Innertube.
- Full player: play/pause/next/prev/seek/volume/mute/shuffle/repeat, MediaSession.
- Synced LRCLIB lyrics with karaoke highlighting.
- Smart autoplay recommendations with feedback learning and 2.5 h cooldowns.
- Dark/light theme toggle (persisted).
- Info page with live stats.

## 2. Verified Issues / Partial Implementations

| # | Issue | Evidence |
| :--- | :--- | :--- |
| 1 | **Queue drawer doesn't show the queue.** `QueueDrawer` reads `queue`/`currentTrack` but renders only a Now Playing card + recommendation list; upcoming queue items are not displayed and can't be removed individually. | `src/components/QueueDrawer.tsx` |
| 2 | **Unused props:** `queueContext` accepted by `TrackCard`/`TrackRow` but never passed/used by any caller; `onRemove` of `QueueItem` is never wired (queue rows can't be removed via that path). | `src/components/TrackCard.tsx`, `TrackRow.tsx`, `QueueItem.tsx` |
| 3 | **No album/playlist pages.** Clicking album or playlist cards anywhere falls back to `/search?q=<name>`. | `src/app/artist/page.tsx`, `TrackCard.tsx` navigation |
| 4 | **Sidebar playlist links don't open the playlist.** All playlist entries link to `/library?tab=playlists`; the target playlist isn't selected. | `src/components/Sidebar.tsx` |
| 5 | **Hardcoded colors break light mode.** Vinyl placeholder (`#16161D`/`#1E1E27`/`#0B0B0E`), seek-bar track `#71717A`, handle `#929CAF`, gray genre-tile text, `text-white` elements — these don't respond to `html.light` token overrides. | `src/components/CoverImage.tsx`, `BottomPlayer.tsx`, `ExpandedPlayer.tsx`, `page.tsx`, `search/page.tsx` |
| 6 | **Theme applies after hydration.** No pre-hydration script reads `localStorage['orbittune-theme']`; light-theme users see a dark flash on load. | `src/components/ThemeToggle.tsx` |
| 7 | **`DESIGN.md` is outdated.** It specifies a cobalt blue accent (`#5B82F6`) and dark-blue surfaces (`#090B10`…) that no longer exist; actual accent is gold (`#D4AF37`). | `DESIGN.md` vs `src/app/globals.css` |
| 8 | **Version mismatch:** UI shows v1.0, `package.json` is 0.1.0. | `package.json`, `Sidebar.tsx` |
| 9 | **No playback or volume persistence.** Reload stops music, resets volume/mute, and hides the player. | `src/store/usePlayerStore.ts` (no storage keys) |
| 10 | **No error UI for stream failures.** Audio `error` event silently stops playback; no toast/retry. | `src/components/AudioController.tsx` |
| 11 | **Notification bell is a static mock** (3 hardcoded items, no unread state/persistence). | `src/components/NotificationBell.tsx` |
| 12 | **No playlist rename/edit; no playlist cover customization.** | `src/app/library/page.tsx` |
| 13 | **CSV import can produce unplayable tracks** — rows without `trackId` get `imp_<ts>_<i>` placeholder IDs that won't resolve on `/api/stream`; import always adds new playlists (no merge/dedup). Feedback via `alert()`. | `src/app/library/page.tsx` `handleImportCsv` |
| 14 | **`install-windows.ps1` is unrelated** — it installs an app called "Hex" (Anomaly release service), not OrbitTune. Leftover file. | repo root |
| 15 | **`test-aid.mjs` is a dev scratch script** (probes Innertube artist fields; exits the process). | repo root |
| 16 | **Reused Unsplash images** for different genre tiles (see docs/ASSETS.md §3) — purely cosmetic redundancy. | `page.tsx`, `search/page.tsx` |
| 17 | **No tests of any kind**, no CI config. | repo (no test files/frameworks) |
| 18 | **All app code is uncommitted.** Git repo has a single "Initial commit from Create Next App"; the whole implementation is untracked/modified working-tree state — a real risk of loss. | `git status` at documentation time |

## 3. Technical Limitations (structural, by design of current stack)

- **Unofficial APIs:** playback depends on YouTube Music's internal Innertube protocol and ytdl stream extraction — no SLA, subject to breakage when YouTube changes. No licensed API or keys (also means no paid features possible as-is).
- **No accounts/sync:** all library data is device-local (IndexedDB). Clearing browser data loses everything.
- **No offline support:** no service worker, no PWA manifest, no audio caching.
- **Audio quality:** limited to the best audio-only format ytdl resolves (no Hi-Res guarantee despite the "High Resolution" title).
- **No `next/image`:** plain `<img>` everywhere — no optimization, no lazy-loading config, remote Unsplash URLs unoptimized beyond `w=400&q=70`.

## 4. Performance Concerns

- The full track `Track` objects (including thumbnails) are embedded in every playlist record and history entry — IndexedDB size grows quickly with heavy use.
- `userFeedback` grows unboundedly; reads filter by scanning (no index on `action`).
- Explore feed fetch performs 4 parallel Innertube searches per refresh (server module cache mitigates).
- Ambient blobs use two large `blur-[200px]` layers — GPU cost on low-end devices (mitigated by reduced-motion global override for animations only, not blur).

## 5. Build / Workflow Issues

- **Verified footgun:** running `next build` while `next dev` is serving corrupts `.next` and breaks dev-server hydration until restart. Run them separately.
- Turbopack + Tailwind v4 via `@tailwindcss/turbopack` (no PostCSS config); Next 16 `cacheComponents`/`partialPrefetching` enabled, though all pages are client components so server-caching benefits are minimal.

## 6. Responsive / UX Limitations

- Only two layouts: mobile (<768px) and desktop (≥768px); no tablet refinement.
- Mobile: player + MobileNav stack at the bottom; the expanded player is the only full-screen playback view.
- Genre tile text contrast is fixed gray, failing in light mode (see §2 #5).
- No keyboard shortcuts; focus-visible styling exists (gold outline) but interactive overlays (custom seek bars) rely on hidden inputs.

## 7. Recommendations (not implemented — for the redesign agent)

1. Persist volume + playback state (even sessionStorage) for continuity.
2. Show and manage the real queue in QueueDrawer; wire `onRemove`.
3. Add album/playlist pages instead of `/search?q=` fallbacks.
4. Tokenize the remaining hardcoded colors so light mode is fully consistent; add a pre-hydration theme script.
5. Replace static notifications with a real (even local) notification store.
6. Update or delete the stale `DESIGN.md`; remove or repurpose `install-windows.ps1` and `test-aid.mjs`; consider adding tests and CI.
7. Commit the current work (everything is untracked — highest immediate risk).
8. Consider `next/image` + a defined image domain list, and indexes on `userFeedback.action` if history/feedback grows.

## 8. Areas Requiring Further Investigation

- Exact Innertube response mapping edge cases (`searchMusic` fallback chains, artist section typing) — behaviors verified only against code comments and the scratch `test-aid.mjs`.
- Light-mode visual audit per component (requires running the app; not done here).
- Real-world failure modes of `getStreamUrl` (IP-blocked googlevideo URLs, expiry timing) — runtime behavior, not statically decidable.
- LRCLIB match quality for non-English/Indonesian titles (fetch logic verified; match quality is runtime-dependent).

## Cross-references

- Architecture & caching: docs/ARCHITECTURE.md
- Design tokens & light-mode gaps: docs/DESIGN_SYSTEM.md
- Feature inventory & "not present" list: docs/FEATURES.md
- Playback internals: docs/MUSIC_ENGINE.md
- Storage: docs/DATA_STRUCTURE.md
- Assets: docs/ASSETS.md
