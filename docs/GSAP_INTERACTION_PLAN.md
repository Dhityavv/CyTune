# OrbitTune — GSAP UI Research & Interaction Plan

> **Phase 2 Deliverable** — Comprehensive animation and interaction strategy combining GSAP 3 core and React integration (`@gsap/react`) with Framer Motion and native CSS performance optimizations.
> Reference: [GSAP UI Documentation](https://gsap.com/ui/) and [GSAP React Guide](https://gsap.com/resources/React/).

---

## 1. GSAP Features Inspected

1. **GSAP Core (`gsap.to()`, `gsap.from()`, `gsap.fromTo()`, `gsap.timeline()`):**
   - High-performance tweens on GPU-accelerated CSS properties (`transform: translate3d/scale`, `opacity`).
   - Smooth non-linear easings (`power2.out`, `power3.out`, `expo.out`).
   - Staggered entrances for search results, queue items, and track card collections.
2. **`@gsap/react` (`useGSAP` hook):**
   - React 19 lifecycle integration with automatic context scoping and cleanup (`revert()`).
   - Prevents memory leaks, dangling animation frame loops, and stale DOM element references during fast tab switches or modal unmounting.
3. **GSAP Flip (Optional lightweight layout morphing):**
   - Evaluated for grid-to-list transitions and expanding mini-player to full listening view.
   - Decided: Keep lightweight CSS/Framer Motion transforms where layout shifts can cause CLS; utilize GSAP for micro-interactions and smooth numeric scrubbing.
4. **GSAP Observer / Draggable:**
   - Evaluated for swipe-to-dismiss mobile sheets, player scrubbers, and reordering. Native touch events and framer-motion drag handles remain primary for gestures, while GSAP controls the fluid easing response.

---

## 2. Relevant UI Examples & Patterns (from GSAP UI Reference)

- **Audio Track Scrubber & Equalizer Waves:** Smooth interpolation of timeline playback without React re-render lag.
- **Context Drawer / Drawer Reveal:** Smooth spring/expo slide-over from right edge with staggered content reveals.
- **Card Hover & Spotlight Tilt:** Dynamic ambient glow and subtle 3D translation following pointer coordinates.
- **Top Navigation Morphing:** Smooth transition between collapsed search pill and expanded global search bar.
- **Mobile Bottom Sheet Snapping:** Responsive sheet snapping between mini-player (76px) and full-screen view.

---

## 3. Proposed Animations in OrbitTune

| Surface / Component | Interaction / Animation | GSAP Technique | Easing & Duration |
| :--- | :--- | :--- | :--- |
| **Top Navigation** | Search bar expand on focus / collapse on blur | `gsap.to(width, padding)` | `power2.out`, 0.3s |
| **Search Results** | Staggered track row entrance on search completion | `gsap.from(children, { y: 12, opacity: 0, stagger: 0.04 })` | `power2.out`, 0.35s |
| **TrackCard Hover** | Quick scale and subtle gold border glow pulse | `gsap.to(target, { scale: 1.02, duration: 0.25 })` | `power1.out`, 0.25s |
| **Bottom Player** | Play/Pause icon morphing and track change cross-slide | `gsap.fromTo(meta, { opacity: 0, y: 6 }, { opacity: 1, y: 0 })` | `power2.out`, 0.25s |
| **Listening Page Panel** | 4-tab content cross-fade with tab indicator slide | `gsap.fromTo(tabPanel, { opacity: 0, x: 8 }, { opacity: 1, x: 0 })` | `power3.out`, 0.2s |
| **Add to Playlist Sheet** | Backdrop blur-in + sheet slide-up | `gsap.from(sheet, { y: 40, opacity: 0 })` | `back.out(1.2)`, 0.3s |
| **Audio Visualizer** | Smooth reactive canvas/SVG bars synchronized with playback | Canvas render loop throttled to `requestAnimationFrame` | Realtime |
| **Quiz Feedback** | Score counter roll-up & correct/incorrect indicator bounce | `gsap.to(counter, { innerText: score, snap: { innerText: 1 } })` | `power1.inOut`, 0.5s |

---

## 4. Components That Should Use GSAP

- `TopNav.tsx`: Search expansion, notification popover spring entrance.
- `BottomPlayer.tsx`: Playback bar scrubbing, track metadata change cross-transition, volume slider feedback.
- `ListeningView.tsx`: 4-tab panel switches, album art ambient lighting.
- `TrackRow.tsx` / `TrackCard.tsx`: Smooth hover and active playing equalizer animation.
- `MusicQuiz.tsx`: Score tallying, countdown timer circle, answer reveal card flip.
- `AudioVisualizer.tsx`: Waveform movement and canvas bar transitions.

---

## 5. Components That Should NOT Use GSAP

- **Native Page Scrolling (`main#main-content`):** Do not hijack native browser scrolling with ScrollSmoother. Native momentum scrolling on mobile and trackpad scrolling on desktop must remain completely untouched.
- **Route Navigation Shell (`Sidebar` & `MobileNav`):** Keep React Router link transitions instant and declarative; avoid blocking navigation behind animation delays.
- **IndexedDB Live Queries:** Database reads and state updates must remain strictly decoupled from visual tween lifecycles.

---

## 6. Mobile Interaction Differences

- **Reduced Motion & Touch Feedback:** On mobile viewports (<768px), disable multi-element staggers and 3D card tilt. Replace with fast 150ms opacity fades and active touch scaling (`scale: 0.98`).
- **Touch Targets:** Minimum 44×44px hit areas on all playback and sheet trigger controls.
- **No Hover-Dependent Controls:** All actions (Add to Playlist, Like, Options) must be immediately visible or accessible via a 3-dots touch menu on mobile.

---

## 7. Accessibility Considerations (WCAG 2.1 AA)

- **`prefers-reduced-motion`:**
  ```ts
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    gsap.globalTimeline.timeScale(100); // Collapse animations instantaneously
  }
  ```
- **Focus Preservation:** Dialogs and bottom sheets must trap focus and release focus back to the triggering element upon closure.
- **No Flashing/Strobing:** Animations are constrained to smooth opacity and translation without high-frequency flashing.

---

## 8. Performance Considerations

- Only animate CSS `transform` (translates, scales) and `opacity`. Never animate `width`, `height`, `left`, `top`, or `margin` where it causes layout reflows.
- Always use `useGSAP` with scoped container `ref` for automatic garbage collection.
- Batch animations: avoid triggering animations on every audio tick (`timeupdate`). Audio time is handled directly via GPU progress width styling.

---

## 9. Dependencies & Installation

Required packages:
- `gsap` (`^3.12.5`): Official core library.
- `@gsap/react` (`^2.1.1`): Official React hook for safe lifecycle management.

No commercial or paid plugins required.

---

## 10. Implementation Priorities

1. Install `gsap` and `@gsap/react`.
2. Wrap global reduced-motion check in an animation helper utility (`src/lib/motion.ts`).
3. Apply GSAP to Top Navigation search focus and notifications.
4. Apply GSAP to BottomPlayer track change and progress scrubbing.
5. Apply GSAP to the 4-tab Context Panel in the dedicated Listening view.
6. Apply GSAP to Quiz and Visualizer components.
