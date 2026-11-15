# OrbitTune — Design System (as implemented)

> Source of truth: `src/app/globals.css` (Tailwind CSS v4 `@theme` tokens), `src/app/layout.tsx` (fonts), and the hardcoded styles inside each component.
> **Note:** the repo-root `DESIGN.md` is **outdated** — it describes a cobalt blue accent (`#5B82F6`, surfaces `#090B10`/`#0D1018`/`#141925`) that no longer exists in the code. The real accent is **gold**. This file documents what is actually implemented.

## 1. Color Palette

### 1.1 Dark mode (default, `:root` / `@theme` in `src/app/globals.css` lines 3–43)

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--canvas` / `--color-canvas` | `#0B0A08` | Page background ("Deep Obsidian") |
| `--sidebar` / `--color-sidebar` | `#100F0C` | Desktop sidebar background |
| `--surface` / `--color-surface` | `#1A1814` | Cards, panels |
| `--surface-hover` / `--color-surface-hover` | `#23201A` | Hover state of rows/cards |
| `--surface-active` / `--color-surface-active` | `#2E2A22` | Active/pressed surfaces, queue "Now Playing" row |
| `--surface-elevated` / `--color-surface-elevated` | `#252219` | Elevated panels (expanded player header, dropdowns) |
| `--text-primary` / `--color-text-primary` | `#FFFFFF` | Headings, main text |
| `--text-secondary` / `--color-text-secondary` | `#A1A1AA` | Subtitles, descriptions |
| `--text-muted` / `--color-text-muted` | `#8A8F98` | Metadata, table headers |
| `--accent` / `--color-accent` | `#D4AF37` | Gold brand accent (play buttons, active items, focus) |
| `--accent-hover` / `--color-accent-hover` | `#E8C872` | Lighter gold hover |
| `--accent-subtle` / `--color-accent-subtle` | `rgba(212, 175, 55, 0.12)` | Soft accent fills (badges, liked hearts) |
| `--accent-glow` / `--color-accent-glow` | `rgba(212, 175, 55, 0.35)` | Glow effects |
| `--border-subtle` / `--color-border-subtle` | `rgba(255, 255, 255, 0.07)` | Hairline card borders |
| `--border-hover` / `--color-border-hover` | `rgba(255, 255, 255, 0.14)` | Hover borders |
| `--border-active` / `--color-border-active` | `rgba(212, 175, 55, 0.45)` | Gold active border (`@theme` only; no `:root` twin) |

Both a Tailwind `@theme` block (`--color-*`, usable as `bg-canvas`, `text-accent`, etc.) and plain CSS custom properties (`:root`) are defined in `src/app/globals.css`. Components use the Tailwind token classes (`bg-surface`, `text-text-muted`, `border-border-subtle`, …).

### 1.2 Light mode (`html.light` in `src/app/globals.css` lines 103–128)

Activated by toggling the `light` class on `<html>` (`src/components/ThemeToggle.tsx`).

| Token | Value |
| :--- | :--- |
| `--color-canvas` | `#F4F1EA` (warm paper) |
| `--color-sidebar` | `#EDE9DF` |
| `--color-surface` | `#FFFFFF` |
| `--color-surface-hover` | `#F0ECE2` |
| `--color-surface-active` | `#E6E1D6` |
| `--color-surface-elevated` | `#FAF7F0` |
| `--color-text-primary` | `#1A1814` |
| `--color-text-secondary` | `#5C5648` |
| `--color-text-muted` | `#8A8373` |
| `--color-accent` | `#9A7318` (darker gold for contrast) |
| `--color-accent-hover` | `#D4AF37` |
| `--color-border-subtle` | `rgba(0, 0, 0, 0.08)` |
| `--color-border-hover` | `rgba(0, 0, 0, 0.16)` |

`html.light body` is additionally hardcoded to `background-color: #F4F1EA; color: #1A1814;` and `html.light ::selection` uses the accent with white text.

**Known light-mode gaps (verified):** many components hardcode dark-only values that are NOT tokenized, so they survive in light mode: e.g. `#16161D`/`#1E1E27`/`#0B0B0E` vinyl placeholder gradient (`src/components/CoverImage.tsx`, `VinylPlaceholder`), `#71717A` bars (`src/components/BottomPlayer.tsx` progress track), `#929CAF` seek-handle (`src/components/ExpandedPlayer.tsx`), gray genre-tile text (`src/app/search/page.tsx`, `src/app/page.tsx` `GENRE_CATEGORIES`/`GENRE_TILES`), and `text-white` in several cards. See docs/PROJECT_STATUS.md.

## 2. Typography

- **Sans:** Geist, loaded via `next/font` as `Geist` with variable `--font-geist-sans`, subset `latin` (`src/app/layout.tsx` lines 16–19).
- **Mono:** Geist Mono, `Geist_Mono`, variable `--font-geist-mono` (loaded but **not used anywhere** in the current UI).
- Body font stack (`src/app/globals.css` body rule): `var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- Global `letter-spacing: -0.01em` on body; antialiasing enabled (`-webkit-font-smoothing: antialiased`).

### Font sizes / weights actually used (from components)

| Use | Class | Example source |
| :--- | :--- | :--- |
| Page title | `text-2xl sm:text-3xl font-bold tracking-tight` | `src/app/info/page.tsx`, `src/app/library/page.tsx` |
| Section title | `text-lg font-bold`, `text-base font-bold` | `src/app/page.tsx`, `src/app/info/page.tsx` |
| Card title | `text-sm font-semibold` (truncate) | `src/components/TrackCard.tsx`, `TrackRow.tsx` |
| Metadata / body | `text-[13px] text-text-secondary` | `src/app/info/page.tsx`, `src/app/page.tsx` |
| Table header | `text-[11px] font-semibold uppercase tracking-wider text-text-muted` | `src/components/TrackRow.tsx` `TrackTableHeader` |
| Time stamps | `text-[11px] font-mono` (e.g. `tabular-nums` in seek bars) | `src/components/BottomPlayer.tsx`, `ExpandedPlayer.tsx` |
| Spotlight headline | `text-4xl sm:text-5xl font-bold` | `src/app/page.tsx` hero |

There is no shared type-scale definition file; sizes are Tailwind utilities inline.

## 3. Spacing

No custom spacing tokens. Standard Tailwind spacing scale (`p-5`, `gap-3`, `px-3`, `space-y-8`, …). Recurring patterns:

- Page padding: `px-4 sm:px-8 py-6` inside `main` (`src/app/layout.tsx`), plus `pb-24`/`pb-40` to clear the docked player.
- Card padding: `p-4`/`p-5`.
- Section vertical rhythm: `space-y-8` / `space-y-10`.
- Layout gap between sidebar and content: `flex` shell, sidebar fixed-width (custom `w-[260px]`-range; see `src/components/Sidebar.tsx`).

## 4. Border Radius

| Radius | Class | Used for |
| :--- | :--- | :--- |
| Full circle | `rounded-full` | Floating buttons (ThemeToggle, NotificationBell), play pills, cat mascot |
| Extra large | `rounded-2xl` | Cards (`TrackCard`, info sections, NotificationBell popover, artist header) |
| Large | `rounded-xl` | Rows (`QueueItem`, search result cards), inputs |
| Medium | `rounded-lg` | Small menus, context popovers |
| Small | `rounded-md` | Minor chips/buttons |
| Default-ish | `rounded` | Some small thumbs |

## 5. Shadows

- `shadow-lg` — floating icon buttons (ThemeToggle, NotificationBell, ThemeToggle).
- `shadow-2xl` — ExpandedPlayer modal and QueueDrawer panel, notification popover.
- Accent glow is done via the `glowPulse` keyframe (box-shadow in gold), not via Tailwind shadow tokens.
- No custom `--shadow-*` theme tokens.

## 6. Background Treatments

- **Ambient gradient blobs** (`src/components/AmbientBackground.tsx`): fixed full-screen layer with two `blur-[200px]` radial blobs — top-left blob colored by `ambientColor` (extracted from the current track's cover; defaults `#D4AF37`), bottom-right blob in `#23201A`. Opacity 0.06→0.14 (accent) and 0.04→0.10 (surface) depending on `isPlaying`, transitioning 1000 ms.
- **Vinyl placeholder** (`src/components/CoverImage.tsx`): `radial-gradient(circle at 35% 35%, #1E1E27 0%, #16161D 60%, #0B0B0E 100%)` + SVG vinyl grooves.
- **Seek-bar overlays**: hidden native `<input type="range">` under styled tracks (`#71717A` progress track, accent fill) — `src/components/BottomPlayer.tsx`, `ExpandedPlayer.tsx`.
- Genre tiles use remote Unsplash photos with a colored top border (`border-t-[#6366F1]`, `border-t-[#F59E0B]`, Tailwind palette colors — see docs/ASSETS.md §3).
- `::selection` = accent background with white text.

## 7. Buttons & Controls (actual variants)

There is **no Button component**; styles are inline per use-site. Recurring variants:

| Variant | Typical classes | Where |
| :--- | :--- | :--- |
| Primary pill (play) | `bg-accent hover:bg-accent-hover text-black rounded-full` + scale transitions | `TrackCard`, `ExpandedPlayer`, `src/app/library/page.tsx` |
| Icon ghost button | `text-text-secondary hover:text-text-primary` + `hover:scale-110 active:scale-95 transition-transform` | player transport, TrackRow actions |
| Floating circle button | `w-10 h-10 rounded-full bg-surface border border-border-hover shadow-lg` | ThemeToggle, NotificationBell |
| Active state accent | `text-accent` / `bg-accent-subtle` | liked heart, active nav item, repeat-on |
| Like toggle | heart filled `text-accent fill-accent` when liked | `TrackRow`, `BottomPlayer`, `ExpandedPlayer` |

## 8. Cards

- Standard card: `rounded-2xl bg-surface border border-border-subtle p-5` (info page sections, notification popover).
- Track card (`TrackCard.tsx`): square cover, `rounded-2xl`, hover reveals a play button (`opacity-0 group-hover:opacity-100`), title/artist below, top-right quick actions (like / add-to-playlist menu).
- Row card (`TrackRow.tsx`): grid `grid-cols-[36px_minmax(0,1fr)_80px]` (mobile) / `[36px_minmax(0,1fr)_minmax(120px,220px)_100px]` (md+), hover shows actions; current track row highlighted with accent text.
- Queue row (`QueueItem.tsx`): current item `bg-surface-hover border-accent/…`, others hover-only.

## 9. Navigation Styles

- **Sidebar** (`src/components/Sidebar.tsx`, desktop only, hidden below `md`): full-height `bg-sidebar`, nav items `Compass` (Explore & Charts `/`), `Search`, `Library`; active item accent-tinted; "LIKED SONGS" shortcut (`/library?tab=favorites`), "HISTORY" (`/library?tab=history`); playlist section with inline create form (`+` → text input); footer with cat mascot + "v1.0" + link to `/info`.
- **MobileNav** (`src/components/MobileNav.tsx`, `md:hidden`): fixed bottom bar with 4 items — Explore, Search, Library, Liked (`/library?tab=favorites`); active logic considers `?tab=` param. Not affected by the player bar (player sits above it).
- Active-route detection via `usePathname()`.

## 10. Icon System

- **lucide-react** `^1.73.0` only — one consistent stroke-icon set across all components (`Play`, `Heart`, `Shuffle`, `Repeat`, `Repeat1`, `ListMusic`, `Mic2`, `Sparkles`, `Compass`, `Library`, `Disc`, `Plus`, `X`, `ChevronDown`, `Bell`, `Sun`, `Moon`, …).
- Standard sizes: `w-4 h-4` (small buttons), `w-5 h-5`, `w-6 h-6` (mascot-adjacent).
- No custom SVG icon set except the inline vinyl-groove SVG in `CoverImage.tsx` and the cat mascot SVG in `CatMascot.tsx`.

## 11. Responsive Breakpoints

Only Tailwind defaults are used (`sm` 640px, `md` 768px, `lg` 1024px; no custom screens). Behavior:

- `< md`: Sidebar hidden, MobileNav shown; `TrackTableHeader` collapses album column; page padding `px-4`.
- `≥ md`: Sidebar visible, MobileNav hidden, expanded track table.
- `sm` used for text scaling (`text-2xl sm:text-3xl`) and popover offsets (`right-4 sm:right-16`).
- No dedicated tablet layout.

## 12. Animation Conventions

- **Library:** framer-motion (`motion`, `AnimatePresence`) for: expanded player slide/scale-in, queue drawer slide-over, spotlight crossfade, artist page entrance, cat mascot drag & float.
- **CSS keyframes** (`src/app/globals.css` lines 88–101):
  - `floatY` — translateY 0 → -6px; used by `.animate-float` (4s ease-in-out infinite) on hero artwork/mascot.
  - `glowPulse` — gold box-shadow pulse (rgba(212,175,55,0) → 0.25); `.animate-glow` (3s).
- **Transition utility patterns:** `transition-all`, `transition-transform`, `duration-1000` (ambient blobs), scale micro-interactions `hover:scale-110 active:scale-95`.
- **Reduced motion:** global override `@media (prefers-reduced-motion: reduce)` in `src/app/globals.css` lines 79–86 collapses all animation/transition durations to 0.01ms. Additionally `useReducedMotion()` from framer-motion is used in `src/app/page.tsx` spotlight.

## 13. Shared UI Components (visual reference)

| Component | Visual role | Source |
| :--- | :--- | :--- |
| `CoverImage` + `VinylPlaceholder` | universal artwork with fallback chain and vinyl SVG | `src/components/CoverImage.tsx` |
| `TrackCard` | square artwork card with hover play + quick actions | `src/components/TrackCard.tsx` |
| `TrackRow` / `TrackTableHeader` | table-style list row | `src/components/TrackRow.tsx` |
| `QueueItem` | compact queue/recommendation row | `src/components/QueueItem.tsx` |
| `BottomPlayer` | fixed 76px docked player bar | `src/components/BottomPlayer.tsx` |
| `ExpandedPlayer` | full-screen modal player (cover left, Lyrics/Queue tabs right) | `src/components/ExpandedPlayer.tsx` |
| `QueueDrawer` | right slide-over drawer (Now Playing + recommendations) | `src/components/QueueDrawer.tsx` |
| `Sidebar` / `MobileNav` | navigation (§9) | respective files |
| `AmbientBackground` | reactive gradient backdrop (§6) | `src/components/AmbientBackground.tsx` |
| `CatMascot` | draggable gold-accent cat, emits WebAudio "meow", speech bubbles | `src/components/CatMascot.tsx` |
| `ThemeToggle` / `NotificationBell` | floating top-right utilities | respective files |

## 14. Theme Switching Mechanics

1. `ThemeToggle.tsx` reads/writes `localStorage['orbittune-theme']` (`'dark' | 'light'`).
2. It toggles classes `dark`/`light` on `document.documentElement`.
3. Only the `light` class has CSS effect (dark is the default). `html.light` overrides the `--color-*` tokens.
4. No `next-themes`, no `color-scheme` meta, no flash-of-wrong-theme prevention (theme applies after hydration — see docs/PROJECT_STATUS.md).

## Cross-references

- Where these tokens are consumed: docs/ARCHITECTURE.md §6
- Known light-mode/theme issues: docs/PROJECT_STATUS.md
- Remote image assets referenced by the UI: docs/ASSETS.md
