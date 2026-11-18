import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CLASSIC, Look} from '../components/look';

const hash = (f: number, k: number) => {
  const x = Math.sin(f * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// 1. PIXEL ART — 7x7 pixel blocks (~274x154 effective), 9-step posterized palette, banded glows.
export const PIXEL: Look = {
  ...CLASSIC, id: 'pixel', label: 'Pixel Art',
  bg: '#1A1036', bgLow: '#0A0618', floor: '#6A70A0', floorW: 7,
  outline: '#7C80A8', outlineW: 5, wobble: 0,
  windowFill: '#1A1A48', plate: '#30304A', plate2: '#44446A',
  pipStroke: '#3B1A06', pipStrokeW: 6, limbW: 16,
  accent: '#C38BFF', coneOpacity: 0.12, textScale: 1.75, hudBg: '#1A1036',
  frameFilter: () => 'url(#pixelate)',
};

// 2. PAPER CUT-OUT — construction-paper grain, cut edges, drop shadows under each piece.
const PaperGrain: React.FC<{frame: number}> = () => (
  <AbsoluteFill style={{mixBlendMode: 'soft-light', opacity: 0.55}}>
    <svg width={1920} height={1080}>
      <filter id="paperGrain"><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" seed="2" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width={1920} height={1080} filter="url(#paperGrain)" />
    </svg>
  </AbsoluteFill>
);
export const PAPER: Look = {
  ...CLASSIC, id: 'paper', label: 'Paper Cut-out',
  bg: '#232A40', bgLow: '#161A28', floor: '#3E4766', floorW: 5,
  outline: 'none', outlineW: 0, wobble: 2.4, wobbleStatic: true,
  shadeOff: '#4A4038', base: '#3A3F55', windowFill: '#1B2748', metal: '#C9CED8', plate: '#4B5268', plate2: '#5E6782',
  phoneOff: '#2B3044', shadowBody: '#08080D',
  propFilter: 'url(#paper)', charFilter: 'url(#paper)',
  glow: 0.8, textShadow: '4px 5px 0 rgba(0,0,0,0.55)', hudBg: '#2E3652', repStroke: '#3A2A00',
  Post: PaperGrain,
};

// 3. CHALKBOARD — slate board, chalk lines with gaps and dust, smudged glows.
const ChalkDust: React.FC<{frame: number}> = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={1920} height={1080}>
      <defs>
        <radialGradient id="smudge"><stop offset="0%" stopColor="#fff" stopOpacity={0.05} /><stop offset="100%" stopColor="#fff" stopOpacity={0} /></radialGradient>
        <radialGradient id="boardVig"><stop offset="60%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.55} /></radialGradient>
      </defs>
      {[[300, 300, 380], [1200, 700, 460], [1650, 200, 300], [700, 850, 340]].map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.45} fill="url(#smudge)" transform={`rotate(-12 ${x} ${y})`} />
      ))}
      <rect width={1920} height={1080} fill="url(#boardVig)" />
    </svg>
  </AbsoluteFill>
);
export const CHALK: Look = {
  ...CLASSIC, id: 'chalk', label: 'Chalkboard',
  bg: '#1D2A25', bgLow: '#19251F', floor: '#E6E4DA', floorW: 5,
  outline: '#ECEAE0', outlineW: 5, wobble: 1.4, propFillOpacity: 0.12,
  shadeOn: '#FFE2A8', shadeOff: '#ECEAE0', base: '#ECEAE0', windowFill: '#ECEAE0', moon: '#F4F2EA',
  phoneOff: '#ECEAE0', phoneOn: '#BFE0FF', screen: '#5C8FD0', metal: '#ECEAE0', plate: '#ECEAE0', plate2: '#ECEAE0',
  pip: '#FFB070', pipDark: '#E89A5C', pipStroke: '#FFB070', pipStrokeW: 6, pipFillOpacity: 0.25, limbW: 10,
  face: '#F4F1E8', item: '#FF7A7A', itemDark: '#E06060',
  shadowBody: '#1D2A25', accent: '#C590FF', accentCore: '#F0E2FF',
  glow: 0.5, glowWarm: '#FFD9A0', coneOpacity: 0.05,
  text: '#F4F1E8', hudBg: 'transparent', repColor: '#FFE27A', repStroke: 'transparent',
  frameFilter: () => 'url(#chalk)',
  Post: ChalkDust,
};

// 4. NEON — glowing tube outlines on black, scanlines, slight tube flicker.
const Scanlines: React.FC<{frame: number}> = () => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.18,
    background: 'repeating-linear-gradient(to bottom, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 2px, transparent 2px, transparent 5px)'}} />
);
export const NEON: Look = {
  ...CLASSIC, id: 'neon', label: 'Neon',
  bg: '#04030A', bgLow: '#04030A', floor: '#2EE6FF', floorW: 4,
  outline: '#2EE6FF', outlineW: 4, wobble: 0, propFillOpacity: 0.06,
  shadeOn: '#FFCF7A', shadeOff: '#04030A', base: '#2EE6FF', windowFill: '#2EE6FF', moon: '#E8EEFF',
  phoneOff: '#2EE6FF', phoneOn: '#9CE8FF', screen: '#0E4C7A', metal: '#FF4FD8', plate: '#FF4FD8', plate2: '#FF4FD8',
  pip: '#FF9F45', pipDark: '#FF9F45', pipStroke: '#FF9F45', pipStrokeW: 6, pipFillOpacity: 0.1, limbW: 8,
  face: '#FFE0C2', item: '#FF3B6B', itemDark: '#FF3B6B',
  shadowBody: '#04030A', accent: '#B26BFF',
  glow: 0.5, coneOpacity: 0.04,
  propFilter: 'url(#neon)', charFilter: 'url(#neon)',
  text: '#E9FDFF', textShadow: '0 0 14px #2EE6FF, 0 0 3px #2EE6FF', repColor: '#FFE45A', repStroke: 'transparent', hudBg: 'transparent',
  frameFilter: (f) => `brightness(${(1 + 0.035 * Math.sin(f * 1.7) * Math.sin(f * 0.37)).toFixed(3)})`,
  Post: Scanlines,
};

// 5. 1930s FILM REEL — sepia, ink outlines, grain, scratches, dust, gate weave, exposure flicker.
const FilmDamage: React.FC<{frame: number}> = ({frame}) => {
  const scratches = [0, 1].filter((k) => hash(frame, k + 10) > 0.55).map((k) => ({x: hash(frame, k) * 1920, o: 0.25 + hash(frame, k + 3) * 0.35}));
  const dust = Array.from({length: 6}, (_, k) => ({x: hash(frame, k + 20) * 1920, y: hash(frame, k + 40) * 1080, r: 1 + hash(frame, k + 60) * 4, on: hash(frame, k + 80) > 0.6}));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1920} height={1080}>
        <defs>
          <filter id={`grain${frame % 8}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 8} /><feColorMatrix type="saturate" values="0" /></filter>
          <radialGradient id="filmVig"><stop offset="55%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.8} /></radialGradient>
        </defs>
        <rect width={1920} height={1080} filter={`url(#grain${frame % 8})`} opacity={0.22} style={{mixBlendMode: 'overlay'}} />
        {scratches.map((s, i) => <line key={i} x1={s.x} y1={0} x2={s.x + 6} y2={1080} stroke="#EDE3C8" strokeWidth={1.5} opacity={s.o} />)}
        {dust.filter((d) => d.on).map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#000" opacity={0.7} />)}
        <rect width={1920} height={1080} fill="url(#filmVig)" />
      </svg>
    </AbsoluteFill>
  );
};
export const VINTAGE: Look = {
  ...CLASSIC, id: 'vintage', label: '1930s Film Reel',
  bg: '#2A251F', bgLow: '#1C1915', floor: '#0A0A0A', floorW: 5,
  outline: '#0A0A0A', outlineW: 5, wobble: 1.3,
  shadeOn: '#FFF1D0', shadeOff: '#5A5148', base: '#4A4238', windowFill: '#3E434A', moon: '#FFFBEA',
  phoneOff: '#3A3632', metal: '#CFC7BA', plate: '#5C554C', plate2: '#6E665C',
  pip: '#F2A65A', pipDark: '#D18A44', pipStroke: '#0A0A0A', pipStrokeW: 5, limbW: 14, face: '#0A0A0A',
  shadowBody: '#000000', accent: '#B98CFF',
  glow: 0.9, textShadow: '3px 3px 0 #000', hudBg: '#1C1915',
  frameFilter: (f) => `sepia(0.85) contrast(1.25) brightness(${(0.96 + hash(f, 99) * 0.1).toFixed(3)})`,
  weave: (f) => `translate(${((hash(f, 1) - 0.5) * 3).toFixed(1)}px, ${((hash(f, 2) - 0.5) * 5).toFixed(1)}px)`,
  Post: FilmDamage,
};

export const STYLES: Look[] = [PIXEL, PAPER, CHALK, NEON, VINTAGE];
