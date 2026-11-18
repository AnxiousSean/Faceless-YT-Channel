import {Easing, interpolate} from 'remotion';
// Keyframe helper: kf(frame, [[f0,v0],[f1,v1],...]) with smooth in-out easing between keys.
export const kf = (f: number, keys: [number, number][], easing = Easing.inOut(Easing.cubic)) =>
  interpolate(f, keys.map((k) => k[0]), keys.map((k) => k[1]), {easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const blinkAt = (f: number, ...ats: number[]) =>
  Math.max(0, ...ats.map((a) => interpolate(f, [a, a + 2, a + 5], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
