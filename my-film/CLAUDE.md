# Channel Rules — Director & Animator Bible

These rules apply to **every film** made in this folder. Follow them unless the user overrides one for a specific film.
The reference screenshots set the general *feel* (bold, expressive, comedic-but-heartfelt). **Never copy existing characters** — everything here is our own design.

---

## 1. FORMAT
- **1920×1080**, **30 fps**.
- Runtime **2:00–3:00** (3600–5400 frames).
- **Thin black letterbox bars** top and bottom (≈60px each), always on top of everything.
- **No voiceover.** Story is told through animation, on-screen text and sound only.
- **Everything is drawn in code in Remotion** (SVG / React). No AI video, no stock footage, no imported images of characters or props.

## 2. LOOK — PIXEL ART (the channel style)
Every film uses the **`PIXEL` look** (`src/styles/looks.tsx`). It is chosen and locked in; other looks are only for experiments the user asks for.
- **Chunky pixels:** the whole frame (scene, characters and text) passes through the `pixelate` filter, **7×7 screen-pixel blocks** (≈274×154 art resolution, upscaled to 1080p). Only the letterbox bars sit outside it and stay crisp.
- **Limited palette:** colours are posterized to **9 steps per channel**, so glows fall off in **hard, banded rings** like a 16-bit console game, never smooth gradients.
- **Very dark backgrounds:** deep night navy (`#1A1036` wall, `#0A0618` floor area).
- A **floor line** across the scene (`#6A70A0`, ~7px so it survives pixelation).
- **Side-on view**, like a 2D video game. Characters walk left/right along the floor line.
- **Light only comes from objects in the scene**: lamp, phone screen, street light, the moon, a spotlight, a fridge, a TV. No ambient light from nowhere.
- **Big glows** around every light source (large radial gradients that the palette turns into stepped rings), warm or cool to match the source.
- **Props are simple flat shapes** with **solid, steady grey-lilac outlines** (`#7C80A8`, ~5px). **No wobble**: pixel art outlines stay clean.
- **Characters have a dark sprite outline** (Pip: `#3B1A06`, ~6px around body, head and limbs) so they pop like game sprites.
- Keep details **big enough to survive 7px pixels**: lines at least ~5px thick, eyes and brows as drawn on Pip, no fine hairlines.
- Motion stays smooth every frame; it simply snaps to the pixel grid.

## 3. THE CHARACTER — "Pip"
- Body colour: **warm tangerine `#FF9F45`** (darker shade `#D9772A` for the far-side limbs).
- **Big round head, no neck** — head sits directly on a small bean-shaped body.
- **Dot eyes** (black), **one line per eyebrow**, **one line for the mouth**. No nose, no ears.
- **Long noodle limbs**, rounded ends, **no fingers, no feet details**.
- **Emotion lives in the eyebrows** — angle, height, and curve do most of the acting. Mouth line supports (flat, curve, wobble, small open oval for shock).
- Idle: gentle breathing (subtle squash/stretch), occasional blinks, noodle arms sway.

## 4. THE SHADOW — his inner voice
- **Same body shape as Pip, but pure black (`#000000`) and taller** (starts ~1.15× Pip's height).
- **Glowing outline in the accent colour: violet** (`#C38BFF` in pixel art; `#A259FF` base). Outer glow, crisp edge.
- **Two slit eyes** in the accent colour — no eyebrows, no mouth line (expression from eye shape and body posture).
- **It grows as Pip gets weaker.** Shadow scale is tied to Pip's state: confident Pip → shadow small/behind him; defeated Pip → shadow looms (up to ~2× Pip's height), glow brighter.
- Moves smoothly and a little *too* smoothly — slower, floatier easing than Pip.

## 5. TEXT
- Font: **Comic Neue** (load via `@remotion/google-fonts/ComicNeue`). Nothing else.
- Pixel-art text sizes are **1.75× the base sizes** (`textScale` in the PIXEL look) so letters stay readable after pixelation.
- **Narrator lines**: small (base 40px → ~70px on screen), **white**, **top centre** (just below the top bar), **8 words maximum**, **fade in and fade out** (~10 frames each). One line on screen at a time.
- **Shadow lines**: in the **accent violet (`#C38BFF` in pixel art, brighter so it survives the palette)**, positioned **beside the Shadow** (not top centre), on one line, kept inside the frame, with a glow and dark edge. Same fade in/out.

## 6. GAME FEEL
- A small **DAY counter** in the **top left** (e.g. `DAY 1`), inside the frame below the bar. Ticks up with a little pop when the day changes.
- **Rep counts pop on screen** (`+1`, `12`, `REP 30!`) with scale overshoot then settle/fade.
- **After Day 1, Pip gains one visible item** (e.g. headband, cap, scarf — chosen per film) and **keeps it for the rest of the film**.
- **Big hits** get **speed lines** and a **white flash** (2–4 frames).
- **When Pip runs, the city scrolls past behind him** (parallax layers: far skyline slow, near buildings / street lights faster). Pip stays roughly centred.

## 7. ANIMATION
- **Everything moves smoothly on every frame — never a slideshow.** Even "still" shots have breathing, blinking and glow flicker.
- **Squash and stretch** on jumps, landings, impacts, reactions. Use `spring()` and `interpolate()` with easing.
- **Locked camera.** No handheld shake except on big hits.
- **Slow push-ins** (scale ~1.0 → 1.08 over the shot) on emotional moments.
- **Hard cuts to close-ups of objects** (phone screen, alarm clock, a dumbbell, a door handle) to punctuate beats.
- Shot length: **calm shots hold 4–8 seconds**; **montage shots ≈1 second**.

## 8. TITLE CARD — last 12 seconds (360 frames)
1. Dark background. The film's **one word** **types on letter by letter** in **big white Comic Neue letters**, centred.
2. A **wavy accent-violet underline** draws in beneath the word and keeps gently waving.
3. Then **one white line** fades in below.
4. Then **one short accent-violet line** fades in below that.
5. **Fade to black.**

## 9. SOUND
- **Every sound effect is synthesized in code** — oscillators, seeded noise and filters written in `scripts/make-sfx.mjs`, output as WAV into `public/sfx/`. Regenerate with `npm run sfx`.
- **Never** use downloaded samples, sound packs, stock/library audio, AI-generated audio or anyone else's music. Because we generate every waveform from math, the sounds are 100% ours and safe for YouTube (no Content ID claims).
- Any music, if a film uses it, follows the same rule: composed and synthesized in code.
- The generator is **deterministic** (fixed random seed), so the same code always produces the same sounds.
- Sounds are placed in Remotion with `<Sequence from={frame}><Audio src={staticFile('sfx/....wav')} /></Sequence>`, **synced to the exact frame** of the action (a click on the click, an impact on the hit frame).
- Standard kit (add new sounds to the generator, don't import them): `click` (lamp switch), `pop1–3` (rep counts / UI, rising pitch), `whoosh` / `whoosh_low` (moves, the Shadow appearing), `buzz` (phone), `drone` (the Shadow's presence), `impact` (big hits), `levelup` (new day / item), `type1–3` (title card letters), `chime` (title underline), `room` (quiet room tone).
- Mix: quiet room tone under every scene; the Shadow always brings the drone; big hits = impact + pop together. Keep peaks below 0 dBFS (check with `ffmpeg -i out/x.mp4 -af volumedetect -vn -f null -`).

---

## Project layout & commands
- `src/components/` — reusable kit: `Pip`, `ShadowSelf`, `Room`, `Glow`, `wobble` outlines, `Overlay` (narrator, shadow line, DAY counter, rep pops, hit FX, letterbox), `theme` colours.
- `src/films/` — one file per film; register it in `src/Root.tsx`.
- `src/components/look.tsx` — the Look system: colours, outlines, filters and overlays that decide HOW things are drawn. Story/timing/sound stay separate so any film can be re-rendered in another style.
- `src/styles/looks.tsx` — the styles. **`PIXEL` is the channel style** and the default for every film. Others (Classic, Paper Cut-out, Chalkboard, Neon, 1930s Film Reel) are kept only for experiments.
- `scripts/make-sfx.mjs` — the sound synthesizer. `scripts/stills.mjs` — renders check stills.
- `npm run sfx` → regenerate sounds · `npm run studio` → preview · `npm run render` → render to `out/`.

---

## Workflow checklist for each film
- [ ] Composition is 1920×1080 @ 30fps, 3600–5400 frames, letterbox bars on top layer.
- [ ] Rendered in the PIXEL look (pixelated, banded glows, sprite outlines, no wobble).
- [ ] Only scene-object light sources, with big glows.
- [ ] Pip and the Shadow match the specs above (colours, proportions, features).
- [ ] Shadow size tracks Pip's weakness through the story.
- [ ] Narrator lines ≤ 8 words, top centre, fading. Shadow lines violet, beside the Shadow.
- [ ] DAY counter, rep pops, Pip's post-Day-1 item persists, speed lines + flash on hits, city scroll on runs.
- [ ] No frame where nothing moves. Shot lengths follow the calm/montage rule.
- [ ] Final 12s title card exactly as specified.
- [ ] All sound effects (and any music) synthesized in code; no samples or downloaded audio; peaks below 0 dBFS.
- [ ] No voiceover, no AI/stock footage, no copied characters.
