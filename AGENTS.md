<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## OrbitTune Permanent UI & Architecture Standards

When developing or modifying any part of OrbitTune (`Website Version/`), you MUST strictly adhere to the following permanent rules documented in `docs/UI_INTERACTION_STANDARDS.md`:

1. **Tooltip & Title Attributes**:
   - Do NOT add unnecessary tooltips or HTML `title` attributes to buttons and controls.
   - Do NOT introduce route preview overlays or expose debug path labels in the UI.
   - Keep interactive controls visually clean on hover while preserving accessibility (`aria-label`, `sr-only`).
   - Tooltips are allowed ONLY on the collapsed desktop sidebar for icon-only navigation items.

2. **Nocturne Visual Identity**:
   - Deep obsidian surfaces (`#0F1012`), Champagne Gold accent (`#C9A94D`), and Volt Lime (`#BBF41D` for gamification).
   - Strictly NO pink, magenta, or rose tones.

3. **Audio Architecture & Mutex**:
   - Strictly ONE audio stream playing at a time across the entire app.
   - All minigame and preview audio MUST route through `src/lib/audioSession.ts` to prevent race conditions and audio overlap.
   - Never extract, rip, or bypass DRM/licensing on YouTube Music streams.
