import React from 'react';
import {useLook} from './look';
import {leg} from './Pip';

// Pip's two neighbours, built from the same kit (dot eyes, one-line brows + mouth, noodle limbs, sprite outline).
//  - Bram: steel-blue, tall, square head. The loud one from the top floor.
//  - Lune: jade-green, small and round, with a leaf sprout. The quiet one across the courtyard.
// Local origin = between the feet, on the floor.
export type NeighbourKind = 'bram' | 'lune';

type Spec = {
  body: string; dark: string; stroke: string;
  headY: number; headW: number; headH: number; headR: number;
  bodyY: number; bodyRx: number; bodyRy: number;
  legTop: number; shoulderX: number; shoulderY: number; eyeX: number;
  rest: [number, number];
};

export const SPECS: Record<NeighbourKind, Spec> = {
  bram: {body: '#5B8FE0', dark: '#3E69B0', stroke: '#0E1D44', headY: -252, headW: 176, headH: 150, headR: 34,
    bodyY: -108, bodyRx: 54, bodyRy: 66, legTop: -46, shoulderX: 42, shoulderY: -142, eyeX: 32, rest: [66, -44]},
  lune: {body: '#4FC98E', dark: '#2F9A68', stroke: '#0B3A24', headY: -176, headW: 128, headH: 128, headR: 64,
    bodyY: -78, bodyRx: 40, bodyRy: 46, legTop: -34, shoulderX: 30, shoulderY: -100, eyeX: 22, rest: [50, -32]},
};

export type NeighbourPose = {
  kind: NeighbourKind; x: number; y: number; frame: number;
  scale?: number; squash?: number;
  browL?: number; browR?: number; browY?: number; browYL?: number; browYR?: number;
  mouth?: number; mouthOpen?: number; blink?: number; look?: number; lookY?: number;
  handL?: [number, number]; handR?: [number, number];
  walk?: number; walkAmt?: number; flip?: boolean;
  children?: React.ReactNode; // drawn in local space, under the arms (e.g. a held card)
};

export const Neighbour: React.FC<NeighbourPose> = (p) => {
  const L = useLook();
  const S = SPECS[p.kind];
  const {x, y, frame, scale = 1, squash = 0, browL = 0, browR = 0, browY = 0, mouth = 0, mouthOpen = 0, blink = 0, look = 0, lookY = 0, walk = 0, walkAmt = 0} = p;
  const sway = Math.sin(frame * 0.1 + (p.kind === 'bram' ? 1 : 2)) * 3;
  const handL = p.handL ?? [-S.rest[0] - sway, S.rest[1]];
  const handR = p.handR ?? [S.rest[0] + sway, S.rest[1]];
  const sx = scale * (1 + squash) * (p.flip ? -1 : 1);
  const sy = scale * (1 - squash);
  const sw = 6, limbW = 16;
  const limb = (d: string, color: string) => (
    <>
      <path d={d} stroke={S.stroke} strokeWidth={limbW + 2 * sw} strokeLinecap="round" fill="none" />
      <path d={d} stroke={color} strokeWidth={limbW} strokeLinecap="round" fill="none" />
    </>
  );
  const arm = (side: number, h: [number, number]) => {
    const s: [number, number] = [side * S.shoulderX, S.shoulderY];
    const c: [number, number] = [(s[0] + h[0]) / 2 + side * 30, (s[1] + h[1]) / 2 + 16];
    return `M ${s[0]} ${s[1]} Q ${c[0]} ${c[1]} ${h[0]} ${h[1]}`;
  };
  const brow = (side: number, angle: number, dy: number) => {
    const a = (angle * Math.PI) / 180;
    const cx = side * (S.eyeX + 2), cy = S.headY - 30 + dy, h = 16;
    return `M ${cx - side * h * Math.cos(a)} ${cy + h * Math.sin(a)} L ${cx + side * h * Math.cos(a)} ${cy - h * Math.sin(a)}`;
  };
  const eyeRy = 8 * Math.max(0.12, 1 - blink);
  const leafSway = Math.sin(frame * 0.08) * 8;
  const hy = S.headY;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
      {limb(leg(-1, walk, walkAmt, S.legTop), S.dark)}
      {limb(leg(1, walk, walkAmt, S.legTop), S.body)}
      {p.kind === 'lune' && (
        <g transform={`rotate(${leafSway} 0 ${hy - S.headH / 2})`}>
          <path d={`M 0 ${hy - S.headH / 2 + 4} Q 4 ${hy - S.headH / 2 - 22} 14 ${hy - S.headH / 2 - 34}`} stroke={S.stroke} strokeWidth={16} strokeLinecap="round" fill="none" />
          <path d={`M 0 ${hy - S.headH / 2 + 4} Q 4 ${hy - S.headH / 2 - 22} 14 ${hy - S.headH / 2 - 34}`} stroke={S.dark} strokeWidth={6} strokeLinecap="round" fill="none" />
          <ellipse cx={30} cy={hy - S.headH / 2 - 40} rx={22} ry={11} transform={`rotate(-25 30 ${hy - S.headH / 2 - 40})`} fill={S.body} stroke={S.stroke} strokeWidth={sw} />
        </g>
      )}
      <ellipse cx={0} cy={S.bodyY} rx={S.bodyRx} ry={S.bodyRy} fill={S.body} stroke={S.stroke} strokeWidth={sw} />
      <rect x={-S.headW / 2} y={hy - S.headH / 2} width={S.headW} height={S.headH} rx={S.headR} fill={S.body} stroke={S.stroke} strokeWidth={sw} />
      <ellipse cx={0} cy={S.bodyY} rx={S.bodyRx - sw / 2} ry={S.bodyRy - sw / 2} fill={S.body} />
      {/* face */}
      <ellipse cx={-S.eyeX + look} cy={hy + lookY} rx={7.5} ry={eyeRy} fill={L.face} />
      <ellipse cx={S.eyeX + look} cy={hy + lookY} rx={7.5} ry={eyeRy} fill={L.face} />
      <path d={brow(-1, browL, browY + (p.browYL ?? 0))} stroke={L.face} strokeWidth={6} strokeLinecap="round" />
      <path d={brow(1, browR, browY + (p.browYR ?? 0))} stroke={L.face} strokeWidth={6} strokeLinecap="round" />
      {mouthOpen > 0.05 ? (
        <ellipse cx={0} cy={hy + 38} rx={10 + 6 * mouthOpen} ry={4 + 14 * mouthOpen} fill={L.face} />
      ) : (
        <path d={`M -18 ${hy + 38} Q 0 ${hy + 38 + mouth * 15} 18 ${hy + 38}`} stroke={L.face} strokeWidth={5.5} strokeLinecap="round" fill="none" />
      )}
      {p.children}
      {limb(arm(-1, handL), S.body)}
      {limb(arm(1, handR), S.body)}
    </g>
  );
};
