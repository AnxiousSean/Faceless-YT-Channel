# Channel Rules — Director & Animator Bible

These rules apply to **every film** made in this folder. Follow them unless the user overrides one for a specific film.
The channel makes **animated scary true stories** shared by people online (Reddit, X, Instagram, etc.). The reference screenshots set the general *feel* (tense, dark, red-accented thumbnails). **Never copy existing characters** — everything here is our own design.

---

## 1. FORMAT
- **1920×1080**, **30 fps**.
- Runtime **3:00–5:00** (5400–9000 frames).
- **Thin black letterbox bars** top and bottom (≈60px each), always on top of everything.
- **No voiceover.** Story is told through animation, on-screen text and sound only.
- **Everything is drawn in code in Remotion** (SVG / React). No AI video, no stock footage, no imported images of characters or props.

## 2. LOOK — HORROR INK (the channel style)
Every film uses the **`HORROR` look** (`CHANNEL_LOOK` in `src/styles/looks.tsx`). **No pixelation**: everything stays crisp at full 1080p.
- **Near-black night backgrounds** (`#090A10` wall, `#050609` floor area), with a **soft vignette** and a very faint film grain (6%, never blurry).
- A **thin grey floor line** (`#3A3F4E`, ~3px) across the scene.
- **Side-on view**, like a 2D video game. Characters walk left/right along the floor line.
- **Light only comes from objects in the scene**: lamp, phone screen, street light, the moon, a flashlight, a fridge, a TV, headlights. No ambient light from nowhere. Darkness is the main tool for fear.
- **Big soft glows** around every light source (large radial gradients), warm or cool to match the source.
- **Props are simple flat dark shapes** with **thin grey outlines** (`#4E5466`, ~3px) that wobble only very slightly.
- **Characters are flat colour with a dark ink outline** (`#030305`, ~4px), so they pop against the dark.
- **Accent colour: blood red `#E5383B`**, used for anything threatening (glowing outlines, eyes, the menace's lines, the title underline).

## 3. CHARACTERS — a new cast for every story
- **Each film casts characters to match the story being told**: the right number of people, ages, skin tones, hair and clothes. Nobody carries over between films unless the story calls for it.
- They all share **one simple drawing style**: **big round head, no neck**, small bean body, **dot eyes**, **one line per eyebrow**, **one line for the mouth**, **long noodle limbs**, **no fingers, no feet details**.
- Variety comes from the `Pip` component's cast options: `skin`, `shirt`, `pants`, `hair`, `hairStyle` (`none`, `short`, `long`, `cap`, `bun`, `spiky`). Add new hair styles or accessories (glasses, hoodie hood, uniform) to the component when a story needs them.
- **Emotion lives in the eyebrows**: angle, height and curve do most of the acting. The mouth supports it (flat, curve, small open oval for shock).
- Idle: gentle breathing (subtle squash/stretch), occasional blinks.
- **Real people in the story are never drawn to look like the real person**; use the simple style only and change identifying details if the poster asks.

## 4. THE MENACE — optional
- When the story has a threat that should feel unknowable (a stranger in the dark, a figure on a camera, a voice in the woods), draw it with the `ShadowSelf` component: **pure black body, taller than the cast, glowing red outline, two slit eyes**.
- It can **grow taller as the danger gets closer** and moves a little *too* smoothly (slower, floatier easing than the cast).
- When the threat is an ordinary-looking person, draw them as a normal cast member instead and let lighting, framing and their eyebrows do the work. Use the menace only where it serves the story.

## 5. TEXT
- Font: **Comic Neue** (load via `@remotion/google-fonts/ComicNeue`). Nothing else.
- **Narrator lines**: small (~40px), **white**, **top centre** (just below the top bar), **8 words maximum**, **fade in and fade out** (~10 frames each). One line on screen at a time.
- **Spoken lines** (a character or the menace speaking): positioned **beside the speaker**, on one line, kept inside the frame. Cast lines are white; the menace's lines are in the **red accent**, with a glow and dark edge. Same fade in/out.

## 6. GAME FEEL
- A small **DAY counter** in the **top left** (e.g. `DAY 1`), inside the frame below the bar. Ticks up with a little pop when the day changes.
- **Rep counts pop on screen** (`+1`, `12`, `REP 30!`) with scale overshoot then settle/fade.
- **After Day 1, the main character gains one visible item** (e.g. headband, cap, scarf — chosen per film) and **keeps it for the rest of the film**.
- **Big hits** get **speed lines** and a **white flash** (2–4 frames).
- **When a character runs or drives, the world scrolls past behind them** (parallax layers: far skyline slow, near buildings / street lights faster). The character stays roughly centred.

## 7. ANIMATION
- **Everything moves smoothly on every frame — never a slideshow.** Even "still" shots have breathing, blinking and glow flicker.
- **Squash and stretch** on jumps, landings, impacts, reactions. Use `spring()` and `interpolate()` with easing.
- **Locked camera.** No handheld shake except on big hits.
- **Slow push-ins** (scale ~1.0 → 1.08 over the shot) on emotional moments.
- **Hard cuts to close-ups of objects** (phone screen, alarm clock, a dumbbell, a door handle) to punctuate beats.
- Shot length: **calm shots hold 4–8 seconds**; **montage shots ≈1 second**.

## 8. TITLE CARD — last 12 seconds (360 frames)
1. Dark background. The film's **one word** **types on letter by letter** in **big white Comic Neue letters**, centred.
2. A **wavy accent-red underline** draws in beneath the word and keeps gently waving.
3. Then **one white line** fades in below.
4. Then **one short accent-red line** fades in below that.
5. **Fade to black.**

## 9. SOUND
- **Every sound effect is synthesized in code** — oscillators, seeded noise and filters written in `scripts/make-sfx.mjs`, output as WAV into `public/sfx/`. Regenerate with `npm run sfx`.
- **Never** use downloaded samples, sound packs, stock/library audio, AI-generated audio or anyone else's music. Because we generate every waveform from math, the sounds are 100% ours and safe for YouTube (no Content ID claims).
- Any music, if a film uses it, follows the same rule: composed and synthesized in code.
- The generator is **deterministic** (fixed random seed), so the same code always produces the same sounds.
- Sounds are placed in Remotion with `<Sequence from={frame}><Audio src={staticFile('sfx/....wav')} /></Sequence>`, **synced to the exact frame** of the action (a click on the click, an impact on the hit frame).
- Standard kit (add new sounds to the generator, don't import them): `click` (lamp switch), `pop1–3` (rep counts / UI, rising pitch), `whoosh` / `whoosh_low` (moves, the menace appearing), `buzz` (phone), `drone` (the menace's presence / dread), `impact` (big hits), `levelup` (new day / item), `type1–3` (title card letters), `chime` (title underline), `room` (quiet room tone).
- Mix: quiet room tone under every scene; the menace always brings the drone; big hits = impact + pop together. Keep peaks below 0 dBFS (check with `ffmpeg -i out/x.mp4 -af volumedetect -vn -f null -`).

---

## Project layout & commands
- `src/components/` — reusable kit: `Pip`, `ShadowSelf`, `Room`, `Glow`, `wobble` outlines, `Overlay` (narrator, shadow line, DAY counter, rep pops, hit FX, letterbox), `theme` colours.
- `src/films/` — one file per film; register it in `src/Root.tsx`.
- `src/components/look.tsx` — the Look system: colours, outlines, filters and overlays that decide HOW things are drawn. Story/timing/sound stay separate so any film can be re-rendered in another style.
- `src/styles/looks.tsx` — the styles. **`HORROR` (Horror Ink) is the channel style** and the default for every film (`CHANNEL_LOOK`). Others (Classic, Pixel Art, Paper Cut-out, Chalkboard, Neon, 1930s Film Reel) are kept only for experiments.
- `scripts/make-sfx.mjs` — the sound synthesizer. `scripts/stills.mjs` — renders check stills.
- `npm run sfx` → regenerate sounds · `npm run studio` → preview · `npm run render` → render to `out/`.

---

## Workflow checklist for each film
- [ ] Composition is 1920×1080 @ 30fps, 5400–9000 frames (3–5 min), letterbox bars on top layer.
- [ ] Rendered in the HORROR look (crisp, no pixelation, ink-outlined cast, red accent, vignette).
- [ ] Only scene-object light sources, with big glows.
- [ ] Cast designed for this story, in the shared drawing style.
- [ ] Menace (if used) matches the spec and grows as the danger closes in.
- [ ] Narrator lines ≤ 8 words, top centre, fading. Spoken lines beside the speaker (menace lines in red).
- [ ] DAY counter, count pops, the main character's post-Day-1 item persists, speed lines + flash on hits, city scroll on runs.
- [ ] No frame where nothing moves. Shot lengths follow the calm/montage rule.
- [ ] Final 12s title card exactly as specified.
- [ ] All sound effects (and any music) synthesized in code; no samples or downloaded audio; peaks below 0 dBFS.
- [ ] No voiceover, no AI/stock footage, no copied characters.
- [ ] The original poster gave permission and is credited on screen and in the description.
