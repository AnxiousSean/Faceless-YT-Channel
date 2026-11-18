import React from 'react';
import {AbsoluteFill, interpolate, spring, useVideoConfig} from 'remotion';
import {BAR_H, FONT, VIOLET} from './theme';

const fade = (f: number, from: number, to: number, len = 10) =>
  interpolate(f, [from, from + len, to - len, to], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

// Narrator: small, white, top centre, max 8 words, fades in/out.
export const Narrator: React.FC<{text: string; frame: number; from: number; to: number}> = ({text, frame, from, to}) => {
  if (text.trim().split(/\s+/).length > 8) throw new Error(`Narrator line over 8 words: "${text}"`);
  return (
    <div style={{position: 'absolute', top: BAR_H + 34, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 40, color: 'white', opacity: fade(frame, from, to)}}>
      {text}
    </div>
  );
};

// Shadow line: accent colour, beside the shadow.
export const ShadowLine: React.FC<{text: string; frame: number; from: number; to: number; x: number; y: number}> = ({text, frame, from, to, x, y}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT, fontWeight: 700, fontSize: 46, color: VIOLET,
    textShadow: `0 0 18px ${VIOLET}aa`, opacity: fade(frame, from, to), transform: `translateY(${interpolate(frame, [from, from + 12], [10, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`}}>
    {text}
  </div>
);

// DAY counter top-left, pops when it changes.
export const DayCounter: React.FC<{day: number; frame: number; changedAt: number}> = ({day, frame, changedAt}) => {
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - changedAt, fps, config: {damping: 8, stiffness: 220}});
  return (
    <div style={{position: 'absolute', left: 70, top: BAR_H + 28, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: 'white',
      padding: '4px 16px', border: '2.5px solid #8A8F9C', borderRadius: 12, background: '#0C0E16cc',
      transform: `scale(${s})`, transformOrigin: 'left center', letterSpacing: 2}}>
      DAY {day}
    </div>
  );
};

// Rep count pop: overshoot, settle, float up and fade.
export const RepPop: React.FC<{text: string; frame: number; at: number; x: number; y: number; size?: number; color?: string}> = ({text, frame, at, x, y, size = 80, color = '#FFD45A'}) => {
  const {fps} = useVideoConfig();
  if (frame < at) return null;
  const s = spring({frame: frame - at, fps, config: {damping: 7, stiffness: 260}});
  const op = interpolate(frame - at, [18, 30], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rise = interpolate(frame - at, [0, 30], [0, -40]);
  return (
    <div style={{position: 'absolute', left: x, top: y + rise, transform: `translate(-50%,-50%) scale(${s}) rotate(-6deg)`, fontFamily: FONT, fontWeight: 700,
      fontSize: size, color, opacity: op, WebkitTextStroke: '3px #000', textShadow: `0 0 24px ${color}88`, whiteSpace: 'nowrap'}}>
      {text}
    </div>
  );
};

export const Letterbox: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: BAR_H, background: '#000'}} />
    <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: BAR_H, background: '#000'}} />
  </AbsoluteFill>
);

// Speed lines radiating from a point + white flash, for big hits.
export const HitFX: React.FC<{frame: number; at: number; cx: number; cy: number}> = ({frame, at, cx, cy}) => {
  const t = frame - at;
  if (t < 0 || t > 16) return null;
  const flash = interpolate(t, [0, 4], [0.85, 0], {extrapolateRight: 'clamp'});
  const lineOp = interpolate(t, [0, 3, 16], [0, 1, 0], {extrapolateRight: 'clamp'});
  const lines = Array.from({length: 34}, (_, i) => {
    const a = (i / 34) * Math.PI * 2 + Math.sin(i * 7.3) * 0.08;
    const r0 = 230 + (Math.sin(i * 3.1) * 0.5 + 0.5) * 120 + t * 14;
    const r1 = r0 + 500 + Math.sin(i * 5.7) * 200;
    const w = 3 + (Math.sin(i * 2.3) * 0.5 + 0.5) * 7;
    return <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * r1} y2={cy + Math.sin(a) * r1} stroke="white" strokeWidth={w} strokeLinecap="round" />;
  });
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: lineOp}}>{lines}</svg>
      <AbsoluteFill style={{background: 'white', opacity: flash}} />
    </AbsoluteFill>
  );
};
