# OrbitTune — Design System Specification (v2.0)
*Engineered with UI UX Pro Max & Impeccable Craft Standards*

## 1. Visual Identity & Design World
OrbitTune is a modern, high-fidelity music streaming platform. The visual world is defined by **editorial restraint, tactile depth, and artwork-first presentation**—combining the clean precision of Apple Music with the dynamic fluidity of Spotify.

### Anti-Patterns Strictly Refused
- ❌ **No generic AI-dashboard aesthetics**: No excessive gradient text, no rainbow neon badges, no nested cards.
- ❌ **No fake hero banners**: No large empty cards with generic text like *"Good Morning Explorer"*. Real music artwork and curated editorial spotlights lead the experience.
- ❌ **No arbitrary glassmorphism**: Backgrounds use crisp, intentional solid surfaces (`#090B10`, `#0D1018`, `#141925`) with ultra-fine `1px` borders (`rgba(255,255,255,0.07)`).
- ❌ **No gray-on-gray unreadable text**: High contrast typography (minimum 4.5:1 ratio).

---

## 2. Color System & Tokens

| Token | Hex / Value | Purpose |
| :--- | :--- | :--- |
| `--color-canvas` | `#090B10` | Global application root background |
| `--color-sidebar` | `#0D1018` | Persistent sidebar / docked navigation |
| `--color-surface` | `#141925` | Elevated content surfaces, track cards, rows |
| `--color-surface-hover` | `#1A2130` | Hover states, interactive row highlights |
| `--color-surface-active`| `#222B3D` | Active selection, pressed states |
| `--color-text-primary` | `#F5F6FA` | Headings, active song titles, prominent text |
| `--color-text-secondary`| `#929CAF` | Artist names, navigation items, subtitles |
| `--color-text-muted` | `#647087` | Timestamps, durations, table headers |
| `--color-accent` | `#5B82F6` | Primary CTAs, active playing indicator, seekbar |
| `--color-accent-hover` | `#789BFA` | Accent hover state |
| `--color-border-subtle` | `rgba(255,255,255,0.07)` | Structural dividers and card outlines |
| `--color-border-hover` | `rgba(255,255,255,0.14)` | Card hover boundaries |

---

## 3. Typography Hierarchy

| Level | Size / Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- |
| **Page Title** | `32px` (`text-3xl`) / SemiBold (`font-semibold`) | `-0.03em` | Main page headers |
| **Section Header** | `22px` (`text-xl`) / SemiBold (`font-semibold`) | `-0.02em` | Category & playlist section titles |
| **Card / Item Title**| `14px` (`text-sm`) / Medium (`font-medium`) | `-0.01em` | Song title, album name |
| **Body / Secondary**| `13px` (`text-[13px]`) / Normal (`font-normal`) | `0` | Artist name, descriptions |
| **Metadata / Micro**| `11px` (`text-[11px]`) / Medium (`font-medium`) | `0.02em` | Timestamps, badge labels, queue counters |

---

## 4. Component Standards

### 4.1 Music Cards (`TrackCard`)
- **Ratio**: Strict 1:1 square artwork (`aspect-square`) with `rounded-xl` (12px).
- **Surface**: Subtle `#141925` with `1px border rgba(255,255,255,0.06)`.
- **Hover**: Artwork slightly elevates with a centered round play button (`bg-white text-black shadow-xl shadow-black/60 scale-100 hover:scale-105 active:scale-95`).
- **Typography**: Single-line truncated title (`text-white font-medium`) + single-line artist (`text-[#929CAF] text-xs`).

### 4.2 Track Rows (`TrackRow`)
- **Height**: 54px comfortable scanning height.
- **Columns**: Index/Equalizer (w-8), Thumbnail (40x40 rounded-lg), Title & Artist (flex-1), Album (hidden on mobile, w-1/4), Actions (Queue, Like, Duration).
- **Interactive State**: Hover turns background to `#1A2130`, shows play button in place of index number.

### 4.3 Persistent Bottom Player (`BottomPlayer`)
- **Height**: 76px compact height.
- **Layout**: 3-Zone Balance (Left 28%, Center 44%, Right 28%).
- **Tactile Elements**:
  - Scrub bar: 3px line expanding to 5px on hover, smooth thumb indicator.
  - Controls: Crisp icon sizes (18px for utility, 36px circular for Play/Pause).

### 4.4 Mobile Navigation (`MobileNav`)
- Fixed bottom dock (`h-14`) for viewports `< 768px` with Home, Search, and Library icons, ensuring 100% thumb accessibility.
