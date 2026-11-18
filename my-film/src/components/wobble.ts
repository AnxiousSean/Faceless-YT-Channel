// Hand-drawn "boiling" outlines: points drift smoothly every frame (never stepped).
type P = [number, number];
const jitter = (seed: number, i: number, frame: number, amp: number): P => [
  Math.sin(frame * 0.13 + i * 1.91 + seed * 3.7) * amp + Math.sin(frame * 0.071 + i * 0.53 + seed) * amp * 0.5,
  Math.cos(frame * 0.11 + i * 2.37 + seed * 1.3) * amp + Math.sin(frame * 0.093 + i * 1.17 + seed * 2) * amp * 0.5,
];
const toPath = (pts: P[], closed: boolean) =>
  'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L') + (closed ? ' Z' : '');

export function wobblyPoly(pts: P[], frame: number, seed: number, amp = 1.6, closed = true) {
  const out: P[] = [];
  const segs = closed ? pts.length : pts.length - 1;
  let k = 0;
  for (let s = 0; s < segs; s++) {
    const [x1, y1] = pts[s];
    const [x2, y2] = pts[(s + 1) % pts.length];
    const steps = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 26));
    for (let j = 0; j < steps; j++) {
      const t = j / steps;
      const [jx, jy] = jitter(seed, k++, frame, amp);
      out.push([x1 + (x2 - x1) * t + jx, y1 + (y2 - y1) * t + jy]);
    }
  }
  if (!closed) {
    const [x, y] = pts[pts.length - 1];
    const [jx, jy] = jitter(seed, k, frame, amp);
    out.push([x + jx, y + jy]);
  }
  return toPath(out, closed);
}
export const wobblyRect = (x: number, y: number, w: number, h: number, frame: number, seed: number, amp = 1.6) =>
  wobblyPoly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], frame, seed, amp);
export const wobblyLine = (x1: number, y1: number, x2: number, y2: number, frame: number, seed: number, amp = 1.6) =>
  wobblyPoly([[x1, y1], [x2, y2]], frame, seed, amp, false);
export function wobblyCircle(cx: number, cy: number, r: number, frame: number, seed: number, amp = 1.4) {
  const n = Math.max(18, Math.round((Math.PI * 2 * r) / 12));
  const pts: P[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const [jx] = jitter(seed, i, frame, amp);
    pts.push([cx + Math.cos(a) * (r + jx), cy + Math.sin(a) * (r + jx)]);
  }
  return toPath(pts, true);
}
