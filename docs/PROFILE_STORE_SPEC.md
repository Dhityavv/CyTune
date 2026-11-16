# ORBITTUNE — PROFILE & COSMETIC STORE SPECIFICATION
**Routes:**
- Store: `/store`
- Profile: `/profile`, `/profile/[username]`
- Edit Profile: `/profile/edit`

---

## 1. COSMETIC STORE CATALOG (`/store`)

### A. Avatar Frames (Free & Unlockable)
1. **Solar Halo** (Gold solar ring with pulsing corona flare).
2. **Celestial Orbit** (Orbiting champagne gold moon & stardust).
3. **Aurora Ring** (Bioluminescent teal-indigo luminous ribbon).
4. **Liquid Chrome** (Reflective fluid mercury ring).
5. **Golden Relic** (Intricate sculpted baroque gold filigree).
6. **Prism Circuit** (Cyber geometric volt-gold vector lines).

### B. Profile Borders
1. **Animated Gold Edge** (Moving linear champagne gold gradient).
2. **Subtle Neon Edge** (Hairline volt glow with corner nodes).
3. **Aurora Border** (Teal to indigo slow ambient gradient).
4. **Metallic Frame** (Beveled brushed graphite with champagne accents).
5. **Dark Crystal Border** (Faceted obsidian cut with subtle prism highlights).

### C. Profile Backgrounds (PREMIUM ONLY)
1. **Deep Space Nebula** (Volumetric cosmic clouds, stardust & amber core).
2. **Luminous Soundwave** (Flowing holographic silk audio frequencies).
3. **Midnight Cityscape** (Cinematic moody night skyline with bokeh).
4. **Cosmic Aurora** (Polar deep teal and violet atmospheric curtain).
5. **Dark Liquid Silk** (Fluid black waves with champagne gold sheen).
6. **Celestial Horizon** (Starlit event horizon with subtle twilight haze).

*Security Guarantee:* Profile backgrounds are strictly gated by `is_premium` / `entitlements` records. Non-premium users cannot equip them.

---

## 2. USER PROFILE PAGE (`/profile`)
- **Hero Canvas:**
  - High-res equipped background with dark Nocturne gradient mask ensuring 100% text contrast.
  - Profile Card framed by equipped **Profile Border**.
  - Avatar prominently framed by equipped **Avatar Frame**.
  - Verified listener badge & membership tier (Free Listener or Hi-Fi Premium).
- **Public Showcase:**
  - Pinned Favorite Songs.
  - Public Playlists created by user.
  - Listening telemetry snapshot (Minutes streamed, Top genres, Favorite artists).

---

## 3. EDIT PROFILE INTERFACE (`/profile/edit`)
- **Live Preview Studio:**
  - Changes to avatar, frame, border, or background update real-time in the preview viewport.
- **Controls:**
  - Display name input.
  - Username input (slugified).
  - Bio / About text area (max 200 chars).
  - Avatar image URL or local photo upload with client-side compression.
  - Visual selector tabs for Frames, Borders, and Backgrounds.
- **Save Behavior:**
  - Validates inputs.
  - Updates Zustand `useAuthStore` and persists to `localStorage`/Dexie for local users, or syncs to Supabase `user_profile_appearance` when connected.
  - Instant toast feedback without full page refresh.
