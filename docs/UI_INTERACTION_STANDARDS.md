# ORBITTUNE — UI INTERACTION & DESIGN STANDARDS

## Permanent Rules for UI, Interactions, and Coding Agents

This document defines the strict, permanent UI and interaction standards for OrbitTune (`Website Version/`). All future feature implementations, bug fixes, and agent workflows must strictly adhere to these guidelines.

---

### 1. Tooltip & Title Attribute Standards

- **Do NOT add unnecessary tooltips**: Avoid floating tooltips or popup helpers on common, self-explanatory controls (e.g., standard play, pause, volume, navigation buttons).
- **Do NOT add unnecessary HTML `title` attributes**: Native browser `title` tooltips produce delayed, distracting OS-style yellow/gray boxes that conflict with modern web motion and custom UI overlays.
- **Collapsed Sidebar Exception**: Tooltips are permitted exclusively in the collapsed desktop sidebar to identify icon-only buttons for users who have not yet memorized the icons. In expanded view, text labels must be used directly in the DOM without tooltips.
- **Preserve Accessible Labels**: Always use `aria-label` or visually hidden text (`sr-only`) on icon-only buttons so that screen readers have full accessibility context without generating visual hover clutter.

---

### 2. Clean Hover & Visual Restraint

- **Keep interactive controls visually clean on hover**: Hover states should be subtle, tactile, and natural (e.g., micro-scale `scale-[1.02]`, smooth background tint transition `hover:bg-surface/70`, or champagne gold border highlight).
- **Do NOT introduce route preview overlays**: Never show hover previews that display the URL, page screenshot, or path metadata when hovering over navigational elements.
- **Do NOT expose debug path labels in the UI**: Development aids, route names (e.g. `/profile/[username]`), component hierarchy indicators, or internal state badges must never be visible in user-facing production interfaces.
- **No Over-Animation**: Animations must serve a functional UX purpose (spatial orientation, loading state, visual continuity) rather than decorative excess. Ensure animations run smoothly at 60fps using CSS transforms (`transform`, `opacity`) without triggering layout reflows.

---

### 3. Visual Identity & Color Palette (Nocturne)

- **Obsidian Dark Surfaces**: Core background uses deep obsidian tones (`#0F1012`, `#14161A`, `#1C1E24`).
- **Champagne Gold (`#C9A94D`)**: The primary brand and playback accent color. Used for active music playback, seekbar scrubber, volume controls, and primary brand indicators.
- **Volt Lime (`#BBF41D`)**: Reserved strictly for gamification, streaks, level badges, and achievement milestones in Minigames.
- **Strict Color Exclusion**: Absolutely **NO pink, magenta, or saturated rose tones** anywhere in the application.

---

### 4. Audio Architecture & Session Mutex

- **Single Audio Owner**: Only one audio stream may play at any given time across the entire web application.
- **Centralized Audio Session (`src/lib/audioSession.ts`)**: All minigame previews and streaming audio must be coordinated through the `audioSession` singleton.
- **Race Condition Prevention**: Prevents orphaned audio streams via atomic session tokens (`++this.sessionToken`).
- **Immediate Teardown**: Transitioning rounds or switching tracks must immediately pause, detach listeners, set `src = ''`, and release previous audio elements from memory.

---

### 5. Copyright & Provider Compliance

- **No Stream Ripping**: Under YouTube Developer Terms of Service and applicable copyright laws, streaming audio (e.g., YouTube Music Innertube) must never be downloaded, converted into MP3s, or cached offline.
- **Explicit Licensing Evaluation**: The Download action (`src/lib/download.ts`) must check track capabilities and provide clear user feedback (*"Download Unavailable — Protected YouTube Music stream"*) when extraction is not legally permitted. Direct audio downloads are supported only for authorized direct sources (user uploads, Creative Commons, royalty-free audio).
