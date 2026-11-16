# ORBITTUNE — NEW FEATURES DESIGN RESEARCH
**Scope:** Mini Games, Cosmetic Store / Profile Marketplace, User Profiles, Sidebar Redesign, and Motion Polish  
**Design System:** Nocturne Audio Experience v3  
**Date:** November 2026

---

## 1. DESIGN REFERENCES & FINDINGS

### A. GSAP UI (https://gsap.com/ui/)
- **Core Primitives Evaluated:**
  - `Flip`: Shared-element layout transitions when switching from Mini Games Hub into active game mode, expanding cosmetic previews into modal view, and grid-to-list toggles.
  - `Observer`: Gesture detection for mobile drawers and swipe-to-dismiss bottom sheets.
  - `Draggable` & `Inertia`: Smooth horizontal scroll rails for avatar frames and profile borders without broken native scrollbars.
  - `Timeline` & `stagger`: Coordinated entrance for store items, quiz answers, and game result metrics.
  - `Elastic & Back Easing`: `back.out(1.5)` for CTAs, dialog reveals, and answer badges.
- **Key Takeaways for OrbitTune:**
  - Avoid animating layout properties (`width`, `height`, `top`, `margin`); use GPU transforms (`scale`, `translate3d`, `opacity`).
  - Isolate animation lifecycles with React hooks and proper cleanup on component unmount to prevent memory leaks and zombie tickers.

### B. Glass3D (https://glass3d.dev/)
- **Material Science & Visual Tokens:**
  - Surface transparency: 60%–80% opacity on dark graphite `#191B20`.
  - Specular Highlights: 1px top hairline gradient (`rgba(255, 255, 255, 0.12)` down to `transparent`).
  - Layered Backdrops: `backdrop-filter: blur(16px) saturate(180%)`.
  - Inner Shadows: `inset 0 1px 0 0 rgba(201, 169, 77, 0.2)` for Champagne Gold metallic reflections.
- **Selective Application in OrbitTune:**
  - Game HUD (round counter, streak multiplier chip, score ticker).
  - Cosmetic Store Preview Studio (3D glass pedestal previewing equipped avatar + border).
  - Profile Hero Badge overlay (clear contrast over photographic or animated nebula backgrounds).
  - Strictly avoid: Full-page opaque blur that washes out dark contrast or degrades mobile frame rates.

### C. CTA Gallery (https://www.cta.gallery/)
- **Action Hierarchy & Microcopy:**
  - Primary Game CTA: *"Start Guessing"*, *"Play Round 1"*, *"Next Track →"*.
  - Store Actions: *"Claim Free"*, *"Equip Frame"*, *"Equipped ✓"*, *"Unlock with Premium"*.
  - Profile Actions: *"Save Changes"*, *"Customize Appearance"*, *"View Public Profile"*.
- **Tactile Feedback:**
  - Active state compression: `scale(0.96)` with 120ms ease-out.
  - Hover glow: Subtle 12px radial shadow using `rgba(201, 169, 77, 0.25)`.
  - Status transitions: Smooth morph from idle state into loader or checkmark without layout shift.

### D. 60fps Design (https://60fps.design/)
- **Interaction Fluidity & Performance:**
  - Micro-interactions capped at 140–200ms for instantaneous perceived responsiveness.
  - Page and mode transitions capped at 280–360ms.
  - Touch targets guaranteed at minimum 44×44px with 8px spatial buffers.
  - Absolute suppression of Cumulative Layout Shift (CLS) through fixed container aspect ratios (`aspect-square` for avatar frames, `aspect-[16/9]` for backgrounds).

### E. UI Colors & Palette Analysis (#BBF41D)
- **Scale Generated from #BBF41D:**
  - 50: `#f7fee7` | 100: `#ecfccb` | 200: `#d9f99d` | 300: `#bbf41d` (Base Volt Lime)
  - 400: `#a3e635` | 500: `#84cc16` | 600: `#65a30d` | 700: `#4d7c0f` | 800: `#3f6212` | 900: `#365314`
- **Role in OrbitTune Nocturne Identity:**
  - **Verdict:** Do NOT replace Champagne Gold (`#C9A94D`) as the primary brand color.
  - **Application:** Use `#BBF41D` (Volt Electric Lime) exclusively as a high-energy **Gamification & Rewards Accent**:
    - Streak multipliers (e.g., "5x STREAK 🔥" badge in Guess the Song).
    - Perfect 10/10 Score badges in Mini Games.
    - "New Arrival" / "Limited Edition" tags in the Cosmetic Store.
  - **Color Prohibition Upheld:** Absolute zero pink, magenta, or rose (`#EC4899`, `#F43F5E`) anywhere in the application.

---

## 2. GSAP INTERACTION STRATEGY

| Target Component | GSAP Effect | Easing | Duration | Trigger |
|------------------|-------------|--------|----------|---------|
| Desktop Sidebar | Width expansion & label stagger | `power3.out` | 260ms | Pointer hover on sidebar rail |
| Mini Games Cards | 3D Tilt & Glass Elevation | `power1.out` | 300ms | Mouse move over card |
| Guess the Song Options | Stagger in + select scale bounce | `back.out(2)` | 180ms | Round start / user click |
| Cosmetic Store Items | Flip layout + preview pedestal reveal | `power2.out` | 320ms | Category filter / item click |
| Profile Hero | Parallax depth + avatar frame aura | Continuous | 8s infinite | Natural ambient animation |

---

## 3. ACCESSIBILITY & REDUCED MOTION
- All continuous animations check `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- If reduced motion is requested:
  - Complex 3D tilt, continuous rotation, and bouncing are replaced by instantaneous opacity transitions.
  - Avatar frame particle effects render as static, high-contrast decorative vectors.
  - Audio playback and keyboard navigation retain 100% functionality without motion reliance.
