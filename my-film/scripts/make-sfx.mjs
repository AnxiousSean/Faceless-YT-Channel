// Synthesizes every sound effect from pure math (oscillators, seeded noise, filters).
// No samples, no downloaded audio, no third-party sound libraries -> 100% ours, YouTube-safe.
// Run: npm run sfx   (deterministic: same output every time)
import fs from 'node:fs';
import path from 'node:path';

const SR = 44100;
const OUT = path.resolve('public/sfx');
fs.mkdirSync(OUT, {recursive: true});

let seed = 12345;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const noise = () => rand() * 2 - 1;
const N = (s) => Math.round(s * SR);
const TAU = Math.PI * 2;

function write(name, data, gain = 1) {
  let peak = 0;
  for (const v of data) peak = Math.max(peak, Math.abs(v));
  const k = peak > 0 ? (0.89 * gain) / peak : 1;
  const buf = Buffer.alloc(44 + data.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + data.length * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(data.length * 2, 40);
  for (let i = 0; i < data.length; i++) {
    const v = Math.max(-1, Math.min(1, data[i] * k));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, `${name}.wav`), buf);
  console.log(`  sfx/${name}.wav  ${(data.length / SR).toFixed(2)}s`);
}

// Tiny DSP helpers
const onePole = (fc) => { const a = Math.exp(-TAU * fc / SR); let z = 0; return (x) => (z = x * (1 - a) + z * a); };
const svf = () => { let low = 0, band = 0; return (x, fc, q = 0.5) => {
  const f = 2 * Math.sin(Math.PI * Math.min(fc, SR / 6) / SR);
  low += f * band; const high = x - low - q * band; band += f * high; return {low, band, high}; }; };
const fadeEdges = (d, ms = 3) => { const n = N(ms / 1000); for (let i = 0; i < n; i++) { d[i] *= i / n; d[d.length - 1 - i] *= i / n; } return d; };

// --- Lamp switch click (two-part mechanical click)
{ const d = new Float32Array(N(0.14));
  const click = (start, amp) => { for (let i = 0; i < N(0.03); i++) { const t = i / SR; const j = start + i;
    d[j] += amp * (noise() * Math.exp(-t / 0.0015) + 0.6 * Math.sin(TAU * 2300 * t) * Math.exp(-t / 0.006)); } };
  click(0, 1); click(N(0.045), 0.45); write('click', fadeEdges(d, 1), 0.8); }

// --- Pop (rising blip) - three pitches for rep counts / UI
for (const [name, p] of [['pop1', 1], ['pop2', 1.26], ['pop3', 1.5]]) {
  const d = new Float32Array(N(0.2)); let ph = 0;
  for (let i = 0; i < d.length; i++) { const t = i / SR;
    const f = 260 * p * Math.pow(3.2, Math.min(t / 0.06, 1)); ph += TAU * f / SR;
    const env = Math.min(t / 0.002, 1) * Math.exp(-t / 0.045);
    d[i] = env * (Math.sin(ph) + 0.25 * Math.sin(ph * 2)); }
  write(name, fadeEdges(d), 0.85); }

// --- Whoosh (band-passed noise sweeping up then down)
const whoosh = (name, dur, f0, fPeak, f1, gain) => {
  const d = new Float32Array(N(dur)); const flt = svf();
  for (let i = 0; i < d.length; i++) { const u = i / d.length;
    const fc = u < 0.5 ? f0 + (fPeak - f0) * (u / 0.5) : fPeak + (f1 - fPeak) * ((u - 0.5) / 0.5);
    d[i] = flt(noise(), fc, 0.35).band * Math.pow(Math.sin(Math.PI * u), 2); }
  write(name, fadeEdges(d), gain); };
whoosh('whoosh', 0.45, 400, 2400, 700, 0.8);
whoosh('whoosh_low', 0.9, 120, 700, 90, 0.9);

// --- Phone buzz (two vibration pulses)
{ const d = new Float32Array(N(0.55)); const lp = onePole(900); let ph = 0;
  for (let i = 0; i < d.length; i++) { const t = i / SR; ph += TAU * 155 / SR;
    const gate = (t < 0.2 || (t > 0.28 && t < 0.48)) ? 1 : 0;
    const raw = Math.sign(Math.sin(ph)) * 0.6 + Math.sin(ph * 2) * 0.4 + noise() * 0.08;
    d[i] = lp(raw * gate); }
  write('buzz', fadeEdges(d), 0.7); }

// --- Shadow drone (dark detuned saws, slow tremolo, eerie shimmer)
{ const d = new Float32Array(N(3.2)); const lp1 = onePole(320), lp2 = onePole(320);
  const fr = [55, 55.35, 82.4, 41.2]; const ph = fr.map(() => rand());
  let sh = 0;
  for (let i = 0; i < d.length; i++) { const t = i / SR; let s = 0;
    fr.forEach((f, k) => { ph[k] = (ph[k] + f / SR) % 1; s += 2 * ph[k] - 1; });
    sh += TAU * (659 + 6 * Math.sin(TAU * 5 * t)) / SR;
    const trem = 1 + 0.3 * Math.sin(TAU * 2.5 * t);
    const env = Math.min(t / 0.6, 1) * Math.min((3.2 - t) / 0.9, 1);
    d[i] = env * (lp2(lp1(s)) * trem + 0.04 * Math.sin(sh)); }
  write('drone', fadeEdges(d), 0.8); }

// --- Impact (sub drop + crunchy noise burst, saturated)
{ const d = new Float32Array(N(1.0)); const lp = onePole(2500); let ph = 0;
  for (let i = 0; i < d.length; i++) { const t = i / SR;
    const f = 38 + 140 * Math.exp(-t / 0.08); ph += TAU * f / SR;
    const body = Math.sin(ph) * Math.exp(-t / 0.35);
    const crack = lp(noise()) * Math.exp(-t / 0.05) * 1.4;
    d[i] = Math.tanh(2.2 * (body + crack)); }
  write('impact', fadeEdges(d), 1); }

// --- Level-up arpeggio (square-ish, game feel)
{ const notes = [523.25, 659.25, 783.99, 1046.5]; const step = 0.07; const d = new Float32Array(N(step * 4 + 0.35));
  const lp = onePole(4000);
  notes.forEach((f, k) => { const start = N(k * step); let ph = 0;
    for (let i = 0; start + i < d.length; i++) { const t = i / SR; ph += TAU * f / SR;
      const env = Math.min(t / 0.003, 1) * Math.exp(-t / (k === 3 ? 0.18 : 0.06));
      d[start + i] += env * (Math.sin(ph) + 0.3 * Math.sign(Math.sin(ph))); } });
  for (let i = 0; i < d.length; i++) d[i] = lp(d[i]);
  write('levelup', fadeEdges(d), 0.7); }

// --- Typewriter key tick (3 variants)
for (let v = 0; v < 3; v++) { const d = new Float32Array(N(0.07)); const lp = onePole(1500);
  for (let i = 0; i < d.length; i++) { const t = i / SR; const n = noise();
    d[i] = (n - lp(n)) * Math.exp(-t / 0.006) + 0.5 * Math.sin(TAU * (1500 + v * 220) * t) * Math.exp(-t / 0.01); }
  write(`type${v + 1}`, fadeEdges(d, 1), 0.6); }

// --- Chime (bell-like partials)
{ const d = new Float32Array(N(1.6));
  [[880, 0.7, 1], [1318.5, 0.5, 0.6], [1760, 0.3, 0.35], [2637, 0.15, 0.15]].forEach(([f, dec, a]) => {
    for (let i = 0; i < d.length; i++) { const t = i / SR; d[i] += a * Math.sin(TAU * f * t) * Math.min(t / 0.004, 1) * Math.exp(-t / dec); } });
  write('chime', fadeEdges(d), 0.6); }

// --- Room tone (quiet brown noise bed)
{ const d = new Float32Array(N(10)); const lp = onePole(180); let b = 0;
  for (let i = 0; i < d.length; i++) { b = (b + noise() * 0.02) * 0.998; d[i] = lp(b); }
  write('room', fadeEdges(d, 300), 0.5); }


// ===== Added for "Three Chairs" (appended so the earlier sounds stay identical) =====

// --- Knock (three knuckle thuds on a wooden door)
{ const d = new Float32Array(N(0.75)); const lp = onePole(700);
  [0, 0.2, 0.4].forEach((st, k) => { const s0 = N(st); let ph = 0;
    for (let i = 0; i < N(0.15); i++) { const t = i / SR; ph += TAU * (150 - 40 * t / 0.15) / SR;
      d[s0 + i] += (1 - k * 0.12) * (Math.sin(ph) * Math.exp(-t / 0.035) + 0.5 * noise() * Math.exp(-t / 0.004)); } });
  for (let i = 0; i < d.length; i++) d[i] = lp(d[i]);
  write('knock', fadeEdges(d), 0.9); }

// --- Pen scribble (scratchy band-passed noise in strokes)
{ const d = new Float32Array(N(1.1)); const flt = svf();
  for (let i = 0; i < d.length; i++) { const t = i / SR;
    const stroke = Math.max(0, Math.sin(TAU * 4.3 * t)) ** 0.6 * (0.6 + 0.4 * Math.sin(TAU * 11 * t));
    d[i] = flt(noise(), 3200 + 900 * Math.sin(TAU * 7 * t), 0.4).band * stroke; }
  write('scribble', fadeEdges(d, 20), 0.5); }

// --- Paper slide (soft swish of paper on a surface)
{ const d = new Float32Array(N(0.4)); const flt = svf();
  for (let i = 0; i < d.length; i++) { const u = i / d.length;
    d[i] = flt(noise(), 1800 + 2400 * u, 0.6).band * Math.sin(Math.PI * u) ** 1.5; }
  write('paper', fadeEdges(d), 0.6); }

// --- Clink (ceramic bowl set down)
{ const d = new Float32Array(N(0.6));
  [[2100, 0.12, 1], [3350, 0.08, 0.6], [5200, 0.05, 0.3], [180, 0.04, 0.8]].forEach(([f, dec, a]) => {
    for (let i = 0; i < d.length; i++) { const t = i / SR; d[i] += a * Math.sin(TAU * f * t) * Math.exp(-t / dec); } });
  for (let i = 0; i < N(0.005); i++) d[i] += noise() * 0.4;
  write('clink', fadeEdges(d, 1), 0.55); }

// --- Door (latch click, then a heavy wooden thud as it shuts)
{ const d = new Float32Array(N(0.8)); const lp = onePole(400);
  for (let i = 0; i < N(0.03); i++) { const t = i / SR; d[i] += 0.5 * noise() * Math.exp(-t / 0.002) + 0.4 * Math.sin(TAU * 1900 * t) * Math.exp(-t / 0.006); }
  const s0 = N(0.12); let ph = 0;
  for (let i = 0; s0 + i < d.length; i++) { const t = i / SR; ph += TAU * (70 + 60 * Math.exp(-t / 0.03)) / SR;
    d[s0 + i] += Math.sin(ph) * Math.exp(-t / 0.12) + lp(noise()) * 2 * Math.exp(-t / 0.04); }
  write('door', fadeEdges(d), 0.85); }

// --- Footstep (soft padded tap)
{ const d = new Float32Array(N(0.12)); const lp = onePole(500); let ph = 0;
  for (let i = 0; i < d.length; i++) { const t = i / SR; ph += TAU * (110 - 300 * t) / SR;
    d[i] = Math.sin(ph) * Math.exp(-t / 0.02) + lp(noise()) * 1.5 * Math.exp(-t / 0.015); }
  write('step', fadeEdges(d, 1), 0.5); }

// --- Steam / soup pour (gentle filtered hiss swelling and fading)
{ const d = new Float32Array(N(1.4)); const flt = svf();
  for (let i = 0; i < d.length; i++) { const u = i / d.length; const t = i / SR;
    d[i] = flt(noise(), 900 + 300 * Math.sin(TAU * 3 * t), 0.7).band * Math.sin(Math.PI * u) * (0.7 + 0.3 * Math.sin(TAU * 9 * t)); }
  write('pour', fadeEdges(d, 20), 0.5); }

// --- "Hope" theme: a short music-box melody composed here, note by note (C major, 72 bpm)
{ const beat = 60 / 72 / 2; // eighth notes
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // [midi note, start in eighths, length in eighths]
  const mel = [[72,0,2],[76,2,2],[79,4,3],[77,7,1],[76,8,2],[74,10,2],[72,12,4],
               [69,16,2],[72,18,2],[76,20,3],[74,23,1],[72,24,2],[71,26,2],[72,28,6]];
  const bass = [[48,0,8],[55,4,4],[53,8,8],[57,16,8],[53,20,4],[55,24,4],[48,28,6]];
  const total = 34 * beat + 2.5; const d = new Float32Array(N(total));
  const pluck = (m, st, len, amp, bright) => { const f = hz(m); const s0 = N(st * beat);
    for (let i = 0; s0 + i < d.length && i < N(len * beat + 1.8); i++) { const t = i / SR;
      const env = Math.min(t / 0.004, 1) * Math.exp(-t / (0.5 + len * 0.08));
      d[s0 + i] += amp * env * (Math.sin(TAU * f * t) + bright * Math.sin(TAU * 2 * f * t) * Math.exp(-t / 0.15) + 0.2 * bright * Math.sin(TAU * 3.01 * f * t) * Math.exp(-t / 0.08)); } };
  mel.forEach(([m, st, len]) => pluck(m, st, len, 0.5, 0.5));
  bass.forEach(([m, st, len]) => pluck(m, st, len, 0.35, 0.15));
  // a little room: two quiet echoes
  for (let i = d.length - 1; i >= N(0.18); i--) d[i] += 0.22 * d[i - N(0.18)];
  write('hope', fadeEdges(d, 200), 0.6); }

// ===== Added for "WATCHED" (appended so the earlier sounds stay identical) =====

// --- Keyboard typing (bursts of small plastic clicks, ~4 s loop)
{ const d = new Float32Array(N(4)); const hp = onePole(2500);
  let t0 = 0.05;
  while (t0 < 3.9) { const s0 = N(t0); const pitch = 1800 + rand() * 1600; const amp = 0.5 + rand() * 0.5;
    for (let i = 0; i < N(0.03) && s0 + i < d.length; i++) { const t = i / SR; const n = noise();
      d[s0 + i] += amp * ((n - hp(n)) * 0 + n * Math.exp(-t / 0.002) * 0.6 + Math.sin(TAU * pitch * t) * Math.exp(-t / 0.004) * 0.5); }
    t0 += rand() < 0.12 ? 0.35 + rand() * 0.4 : 0.07 + rand() * 0.09; }
  write('keys', fadeEdges(d, 20), 0.45); }

// --- Webcam blip (tiny electronic two-tone tick)
{ const d = new Float32Array(N(0.16));
  for (let i = 0; i < d.length; i++) { const t = i / SR; const f = t < 0.05 ? 2400 : 3200;
    d[i] = Math.sin(TAU * f * t) * Math.min(t / 0.002, 1) * Math.exp(-((t < 0.05 ? t : t - 0.05)) / 0.03) * (t < 0.05 ? 0.8 : 1); }
  write('blip', fadeEdges(d, 2), 0.4); }

// --- Low thud (soft body-felt hit for montage cuts)
{ const d = new Float32Array(N(0.6)); let ph = 0; const lp = onePole(300);
  for (let i = 0; i < d.length; i++) { const t = i / SR; ph += TAU * (45 + 50 * Math.exp(-t / 0.05)) / SR;
    d[i] = Math.sin(ph) * Math.exp(-t / 0.18) + lp(noise()) * Math.exp(-t / 0.03); }
  write('thud', fadeEdges(d), 0.85); }

// --- Fridge (door unseal pop, then electric hum with compressor buzz, 4 s)
{ const d = new Float32Array(N(4)); const lp = onePole(600);
  for (let i = 0; i < N(0.08); i++) { const t = i / SR; d[i] += lp(noise()) * 3 * Math.exp(-t / 0.02); }
  for (let i = 0; i < d.length; i++) { const t = i / SR;
    const env = Math.min(t / 0.4, 1) * Math.min((4 - t) / 0.4, 1);
    d[i] += env * 0.25 * (Math.sin(TAU * 60 * t) + 0.5 * Math.sin(TAU * 120 * t) + 0.2 * Math.sign(Math.sin(TAU * 120 * t))); }
  write('fridge', fadeEdges(d, 20), 0.4); }

// --- Floorboard creak (stick-slip resonant wood groan)
{ const d = new Float32Array(N(1.1)); const flt = svf(); let ph = 0;
  for (let i = 0; i < d.length; i++) { const t = i / SR; const u = t / 1.1;
    const f = 95 + 40 * Math.sin(Math.PI * u) + 8 * Math.sin(TAU * 7 * t);
    ph = (ph + f / SR) % 1; const pulse = ph < 0.08 ? 1 : 0;
    d[i] = flt(pulse + noise() * 0.05, 700 + 300 * Math.sin(Math.PI * u), 0.15).band * Math.sin(Math.PI * u) ** 0.7; }
  write('creak', fadeEdges(d, 10), 0.75); }

// --- Tape rip (fast tearing crackle)
{ const d = new Float32Array(N(0.6)); const flt = svf();
  for (let i = 0; i < d.length; i++) { const t = i / SR; const u = t / 0.6;
    const crackle = Math.max(0, Math.sin(TAU * (90 + 60 * u) * t)) ** 3;
    d[i] = flt(noise(), 2600, 0.5).band * crackle * Math.sin(Math.PI * Math.min(u * 1.6, 1)) * (1 - u * 0.6); }
  write('tape', fadeEdges(d, 5), 0.7); }

// --- Phone ringback (two rings of 440+480 Hz, as heard while calling)
{ const d = new Float32Array(N(3.2));
  for (let i = 0; i < d.length; i++) { const t = i / SR; const on = (t % 1.6) < 1.0 ? 1 : 0;
    d[i] = on * (Math.sin(TAU * 440 * t) + Math.sin(TAU * 480 * t)) * 0.5; }
  const lp = onePole(3000); for (let i = 0; i < d.length; i++) d[i] = lp(d[i]);
  write('ring', fadeEdges(d, 10), 0.35); }

// --- Heartbeat (lub-dub x5, slightly speeding up)
{ const d = new Float32Array(N(4)); let t0 = 0.05; let gap = 0.86;
  const beat = (st, amp, f0) => { const s0 = N(st); let ph = 0;
    for (let i = 0; i < N(0.25) && s0 + i < d.length; i++) { const t = i / SR; ph += TAU * (f0 + 30 * Math.exp(-t / 0.02)) / SR;
      d[s0 + i] += amp * Math.sin(ph) * Math.exp(-t / 0.06); } };
  while (t0 < 3.7) { beat(t0, 1, 48); beat(t0 + 0.2, 0.7, 42); t0 += gap; gap *= 0.94; }
  write('heartbeat', fadeEdges(d, 10), 0.9); }

// --- Car engine (starter crank, catch, then idle/drive rumble, 6 s)
{ const d = new Float32Array(N(6)); const lp = onePole(400); let ph = 0;
  for (let i = 0; i < d.length; i++) { const t = i / SR;
    let f, amp;
    if (t < 0.9) { f = 14; amp = 0.6 * (Math.sin(TAU * 7 * t) > 0 ? 1 : 0.5); }
    else { f = 28 + 22 * Math.min((t - 0.9) / 1.5, 1) + 3 * Math.sin(TAU * 0.7 * t); amp = 1; }
    ph = (ph + f / SR) % 1;
    d[i] = amp * lp((ph < 0.3 ? 1 : -0.4) + noise() * 0.3) * Math.min((6 - t) / 0.5, 1); }
  write('engine', fadeEdges(d, 20), 0.8); }

// --- Door slam (big wooden bang with rattle)
{ const d = new Float32Array(N(1.0)); const lp = onePole(900); let ph = 0;
  for (let i = 0; i < d.length; i++) { const t = i / SR; ph += TAU * (60 + 90 * Math.exp(-t / 0.02)) / SR;
    d[i] = Math.tanh(2.5 * (Math.sin(ph) * Math.exp(-t / 0.15) + lp(noise()) * 2.5 * Math.exp(-t / 0.05)))
      + 0.15 * noise() * Math.exp(-((t - 0.12) ** 2) / 0.002); }
  write('slam', fadeEdges(d), 0.95); }

// --- Police siren chirp (one short whoop up and down)
{ const d = new Float32Array(N(1.2)); let ph = 0;
  for (let i = 0; i < d.length; i++) { const t = i / SR; const u = t / 1.2;
    const f = 650 + 900 * Math.sin(Math.PI * u); ph += TAU * f / SR;
    d[i] = (Math.sin(ph) + 0.3 * Math.sign(Math.sin(ph))) * Math.sin(Math.PI * u) ** 0.5; }
  const lp = onePole(2500); for (let i = 0; i < d.length; i++) d[i] = lp(d[i]);
  write('siren', fadeEdges(d, 10), 0.5); }

console.log('done.');
