# ORBITTUNE — MINI GAMES SPECIFICATION
**Route Hub:** `/games`  
**Sub-routes:** `/games/guess-the-song`, `/games/trivia` (backward compatible alias: `/quiz`)  
**Design:** Nocturne Audio Experience v3 + Glass3D HUD

---

## 1. MINI GAMES HUB (`/games`)
- **Header:**
  - Badge: `AI & Interactive Audio`
  - Title: `Mini Games`
  - Description: *"Take a break from listening and challenge your music knowledge."*
- **Game Cards:**
  1. **Guess the Song:**
     - Tag: `Audio Identification` • `10 Rounds`
     - Icon: Headphone / Vinyl Disc
     - Description: *"Listen to a short music preview and guess the correct song title and artist."*
     - CTA: *"Play Guess the Song"*
  2. **Music Trivia:**
     - Tag: `Knowledge Challenge` • `8 Questions`
     - Icon: Sparkles / Trophy
     - Description: *"Test your knowledge of artists, albums, music genres, discography, and music history."*
     - CTA: *"Play Music Trivia"*

---

## 2. GAME 1: GUESS THE SONG (`/games/guess-the-song`)
- **Structure:** Exactly 10 rounds per session.
- **Audio Engine Integration:**
  - Sources tracks from verified catalog playlist (Pop, Indonesian hits, Global top 50).
  - Audio played via authorized stream `/api/stream/[id]` with 15–20s sample limit.
  - While guessing: Album art is masked with a dynamic spinning vinyl record to prevent visual spoiling.
  - User can tap Replay to hear the preview again.
- **Answer Selection:**
  - 4 shuffled choices (1 correct answer, 3 distractors from same genre).
  - Immediate tactile feedback:
    - Selected correct: Champagne Gold / Emerald outline with checkmark.
    - Selected incorrect: Crimson outline, revealing correct answer.
  - Locks all buttons to prevent double click.
- **Scoring & Streak:**
  - Base: 100 points per correct answer.
  - Streak Bonus: `+ (streak * 15)` points.
  - Perfect score: 1,500+ points with 10x streak.
- **Results Screen:**
  - Final Score & High Score.
  - Accuracy (e.g., 9/10).
  - Highest Streak.
  - Performance Title (Legendary Maestro, Sonic Virtuoso, Music Buff, Curious Listener).
  - Full round review list showing each track title, artist, and whether user got it right.
  - Actions: *"Play Again"*, *"Back to Games Hub"*.

---

## 3. GAME 2: MUSIC TRIVIA (`/games/trivia`)
- **Evolution of Music Quiz:**
  - Renamed from "Music Quiz" to "Music Trivia".
  - Curated, reliable questions across:
    - World Artists & History.
    - Grammys & Billboards.
    - Music Theory (Chords, tempos, octaves).
    - Indonesian & Global Pop Culture.
  - Difficulty selection: Easy, Medium, Hard.
  - Final results breakdown with review mode.
