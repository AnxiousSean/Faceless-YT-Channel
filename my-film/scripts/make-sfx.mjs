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

console.log('done.');
