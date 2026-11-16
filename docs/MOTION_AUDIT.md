# ORBITTUNE — MOTION AUDIT & STANDARDIZATION
**Audit Target:** UI Animations, Transitions, Gesture Handling & Performance  
**System:** OrbitTune Web Version (Next.js 16 + GSAP + Framer Motion)

---

## 1. AUDIT FINDINGS

### A. Issues Identified in Legacy Animations
1. **Competing Animation Paradigms:**
   - Some components mixed CSS keyframe animations with Framer Motion `motion.div` and native GSAP without unified timing or easing curves.
2. **Layout Thrashing & Shift:**
   - Sidebar toggling shifted the central `<main>` margin width dynamically, triggering re-flows on every click.
   - Fixed by switching Desktop Sidebar to a smooth hover-expand overlay rail that preserves main viewport stability.
3. **Overuse of Unbounded CSS Transitions:**
   - Several elements used generic `transition-all duration-500` which animated expensive layout properties (`padding`, `width`, `height`).
4. **Uncleaned Intervals & Listeners:**
   - Visualizer previously re-triggered on every `currentTime` update (resolved in Phase 1).

---

## 2. STANDARDIZED MOTION TOKENS

```css
:root {
  /* Durations */
  --motion-instant: 100ms;
  --motion-micro: 160ms;
  --motion-standard: 240ms;
  --motion-panel: 320ms;
  --motion-ambient: 8000ms;

  /* Easings */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);
}
```

---

## 3. COMPONENT IMPLEMENTATION RULES

| Component | Allowed Properties | Motion Engine | Easing |
|-----------|-------------------|---------------|--------|
| Avatar Frame (SVG) | `transform: rotate()`, `stroke-dashoffset` | CSS Keyframes / GSAP | Linear / `ease-in-out` |
| Button CTA | `transform: scale()`, `box-shadow` | CSS / GSAP Magnetic | `back.out(2)` |
| Card Hover | `transform: rotateX(), rotateY(), scale()` | GSAP 3D Tilt | `power1.out` |
| Dialog / Modal | `opacity`, `transform: scale(), translateY()` | GSAP Portal | `back.out(1.7)` |
| Dropdown Menu | `opacity`, `transform: translateY()` | Tailwind / GSAP | `power2.out` |
| Sidebar Rail | `width`, `box-shadow`, `opacity` | CSS GPU Transition | `cubic-bezier(0.16, 1, 0.3, 1)` |

---

## 4. REDUCED MOTION SAFEGUARDS
Every animation helper in `src/lib/motion.ts` and global CSS checks `prefers-reduced-motion: reduce`. When active:
- CSS animations set to `0.01ms`.
- GSAP tweens jump to final state with `gsap.set()`.
- Continuous background particle and rotating loops are paused.
