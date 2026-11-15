# OrbitTune — Asset Inventory

> Paths are relative to the project root `Website Version/`. **No asset files were copied, embedded, or modified** for this documentation; this is a reference inventory only.

## 1. Directory Structure

```
Website Version/
├── public/                       # 5 default create-next-app SVGs — all UNUSED by the app
│   ├── file.svg     (391 B)
│   ├── globe.svg    (1,035 B)
│   ├── next.svg     (1,375 B)
│   ├── vercel.svg   (128 B)
│   └── window.svg   (385 B)
└── src/
    └── app/
        └── favicon.ico (15,086 B)   # site favicon, referenced automatically by Next.js
```

- **Fonts:** Geist and Geist Mono are loaded from Google Fonts via `next/font` (`src/app/layout.tsx`) — no local font files exist in the repo.
- **Audio files:** none. All audio is streamed from YouTube's CDN through `/api/stream/[id]` (docs/MUSIC_ENGINE.md). The cat mascot's "meow" is synthesized at runtime with WebAudio (`src/components/CatMascot.tsx`, `playMeow`) — no audio asset.
- **Icons:** no icon image files; all UI icons come from the lucide-react package, plus two inline SVGs in code (vinyl grooves in `src/components/CoverImage.tsx`, cat body in `src/components/CatMascot.tsx`).

## 2. Favicon

| Asset | Path | Type | Size |
| :--- | :--- | :--- | :--- |
| Favicon | `src/app/favicon.ico` | ICO | ~15 KB (15,086 B) |

Served by Next.js App Router convention; no other favicon variants (apple-touch-icon, manifest icons) exist.

## 3. Remote Images — Genre Tiles (hardcoded Unsplash URLs)

All are loaded with plain `<img>` tags (no `next/image`), `?w=400&q=70` params. Sources: `src/app/page.tsx` `GENRE_CATEGORIES` (lines 21–28) and `src/app/search/page.tsx` `GENRE_TILES` (lines 24–36). Colors noted are the tiles' `border-t-*` classes.

### Home page — `GENRE_CATEGORIES` (6 tiles)

| Name | Border color | Unsplash URL |
| :--- | :--- | :--- |
| Late Night R&B | `#6366F1` (indigo) | `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=70` |
| Indie & Bedroom Pop | `#F59E0B` (amber) | `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=70` |
| Lofi Chill Lounge | `#10B981` (emerald) | `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=70` |
| Hits Indonesia | `#EC4899` (pink) | `https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=70` |
| Atmospheric Synthwave | `#8B5CF6` (violet) | `https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=70` |
| Acoustic Soul | `#06B6D4` (cyan) | `https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=70` |

### Search page — `GENRE_TILES` (12 tiles)

| Name | Border class | Unsplash URL |
| :--- | :--- | :--- |
| Pop | `border-t-rose-500` | `https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=70` |
| Hip-Hop & Rap | `border-t-amber-500` | `https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&q=70` |
| R&B / Soul | `border-t-indigo-500` | `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=70` |
| Indie & Alt | `border-t-emerald-500` | `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=70` |
| Chill & Lo-Fi | `border-t-teal-500` | `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=70` |
| Rock Classics | `border-t-red-500` | `https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=70` |
| Electronic / EDM | `border-t-cyan-500` | `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=70` |
| K-Pop | `border-t-fuchsia-500` | `https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=70` |
| Indonesian Hits | `border-t-orange-500` | `https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=70` |
| Acoustic & Folk | `border-t-stone-400` | `https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=70` |
| Sleep & Ambient | `border-t-blue-500` | `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70` |
| Jazz & Lounge | `border-t-yellow-500` | `https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400&q=70` |

Note: several Unsplash photo IDs are **reused across tiles/pages** (e.g. `photo-1493225457124` appears as both "Lofi Chill Lounge" on Home and "Pop" on Search; `photo-1514525253161` is "Late Night R&B" and "R&B / Soul"). Images are purely decorative; different categories can show identical photos.

## 4. Runtime-fetched Images (not repo assets)

| Type | Source | Where used |
| :--- | :--- | :--- |
| Track/album covers | `i.ytimg.com/vi/<id>/…jpg` and `googleusercontent.com` thumbnails returned by Innertube | every cover via `CoverImage` + fallback chain (`getThumbnailFallbackChain`, `src/types/music.ts`) |
| Artist header images | googleusercontent thumbnails from `/api/artist` | `src/app/artist/page.tsx` |
| Ambient backdrop | not an image — CSS radial gradients colored from the current track's cover color (`ambientColor` in Zustand) | `src/components/AmbientBackground.tsx` |

## 5. Summary

- Local media assets: **favicon only** (plus 5 unused SVGs).
- The visual identity relies almost entirely on remote images (Unsplash + YouTube thumbnails) and code-drawn SVG/CSS — there is no local imagery pipeline, no `next/image`, no image manifest.

## Cross-references

- Cover fallback logic: docs/DATA_STRUCTURE.md §1.1
- Where genre tiles render: docs/ROUTES.md (/, /search)
- Light-mode contrast issue with tile text: docs/PROJECT_STATUS.md
