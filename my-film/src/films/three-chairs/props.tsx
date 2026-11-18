import React from 'react';
import {useLook} from '../../components/look';
import {FONT} from '../../components/theme';
import {Glow} from '../../components/Glow';

// Shared prop colours for "Three Chairs" (flat shapes, steady grey-lilac outline).
export const C = {
  wall: '#1A1036', wall2: '#22164A', floor: '#0A0618',
  brick: '#2A1F5A', brickDark: '#1E1646', brickTop: '#3A2C70',
  wood: '#8A5A3A', woodDark: '#5E3A24', woodTop: '#A86E48',
  skipChair: '#6A7FA8', cafeChair: '#C86A8A',
  rocket: '#E8E4F0', rocketStripe: '#E8484F', fin: '#B0344A', cap: '#FFD45A',
  door: '#3A2A5A', doorDark: '#0A0618',
  paper: '#F4EEDC', ink: '#1A1006', bowl: '#E8D6B0', soup: '#FF9F45',
  sky: '#1A1A48', warmWin: '#FFD27A', glass: '#2A2A60',
};

export const useLine = (w?: number) => {
  const L = useLook();
  return {stroke: L.outline, strokeWidth: w ?? L.outlineW, strokeLinejoin: 'round' as const};
};

// Firework rocket, pointing along +x in local space. Tail (fuse end) at x=0. capped = safety cap over the fuse.
export const Rocket: React.FC<{x: number; y: number; angle: number; scale?: number; capped?: number; frame: number; glint?: number}> = ({x, y, angle, scale = 1, capped = 0, frame, glint = 0}) => {
  const line = useLine();
  const fuseWave = Math.sin(frame * 0.15) * 3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
      {/* fuse */}
      <path d={`M 0 0 Q -22 ${-14 + fuseWave} -44 ${-4 - fuseWave}`} stroke="#C8B89A" strokeWidth={7} strokeLinecap="round" fill="none" />
      {capped > 0 && (
        <g transform={`translate(-44 ${-4 - fuseWave}) scale(${capped})`}>
          <rect x={-16} y={-12} width={26} height={24} rx={6} fill={C.rocketStripe} {...line} />
        </g>
      )}
      {/* fins */}
      <path d="M 8 -26 L -22 -52 L 40 -26 Z" fill={C.fin} {...line} />
      <path d="M 8 26 L -22 52 L 40 26 Z" fill={C.fin} {...line} />
      {/* body */}
      <rect x={0} y={-28} width={180} height={56} rx={10} fill={C.rocket} {...line} />
      <rect x={52} y={-26} width={22} height={52} fill={C.rocketStripe} />
      <rect x={110} y={-26} width={22} height={52} fill={C.rocketStripe} />
      {/* nose cone */}
      <path d="M 178 -30 L 252 0 L 178 30 Z" fill={C.rocketStripe} {...line} />
      {glint > 0 && (
        <g transform={`translate(${30 + glint * 150} -10) rotate(${frame * 6})`} opacity={Math.sin(glint * Math.PI)}>
          <path d="M 0 -30 L 6 -6 L 30 0 L 6 6 L 0 30 L -6 6 L -30 0 L -6 -6 Z" fill="#FFFFFF" />
        </g>
      )}
    </g>
  );
};

// A-frame launch stand under a rocket.
export const Stand: React.FC<{x: number; y: number; h?: number}> = ({x, y, h = 50}) => {
  const line = useLine();
  return <path d={`M ${x - 36} ${y} L ${x} ${y - h} L ${x + 36} ${y}`} stroke={line.stroke} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
};

// Side-on chair. x = seat centre, y = floor. back = which side the backrest is on (-1 left, 1 right, 0 = seen from the front).
export type ChairKind = 'wood' | 'skip' | 'cafe';
export const Chair: React.FC<{x: number; y: number; kind: ChairKind; back: -1 | 0 | 1; scale?: number; rot?: number}> = ({x, y, kind, back, scale = 1, rot = 0}) => {
  const line = useLine();
  const col = kind === 'wood' ? C.wood : kind === 'skip' ? C.skipChair : C.cafeChair;
  const wonky = kind === 'skip' ? 10 : 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      {/* legs */}
      <rect x={-56} y={-92} width={14} height={92 - wonky} fill={col} {...line} />
      <rect x={42} y={-92} width={14} height={92} fill={col} {...line} />
      {/* backrest */}
      {back !== 0 && (kind === 'cafe' ? (
        <path d={`M ${back * 50} -96 L ${back * 50} -200 Q ${back * 50} -236 ${back * 20} -236`} stroke={col} strokeWidth={16} fill="none" strokeLinecap="round" />
      ) : (
        <>
          <rect x={back * 50 - 8} y={-232} width={16} height={140} fill={col} {...line} />
          <rect x={back > 0 ? 6 : -58} y={-226} width={52} height={22} fill={col} {...line} transform={kind === 'skip' ? `rotate(${back * 6} ${back * 50} -215)` : undefined} />
        </>
      ))}
      {back === 0 && (kind === 'cafe' ? (
        <path d="M -48 -96 L -48 -190 Q 0 -250 48 -190 L 48 -96" stroke={col} strokeWidth={16} fill="none" strokeLinecap="round" />
      ) : (
        <rect x={-50} y={-230} width={100} height={130} rx={8} fill="none" stroke={col} strokeWidth={16} />
      ))}
      {/* seat */}
      <rect x={-64} y={-104} width={128} height={18} rx={4} fill={col} {...line} />
    </g>
  );
};

// Round table seen side-on: top slab, pedestal, foot. x = centre, y = floor. Top surface at y - 170.
export const TABLE_TOP = 170;
export const Table: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 400}) => {
  const line = useLine();
  return (
    <g>
      <rect x={x - 16} y={y - TABLE_TOP + 18} width={32} height={TABLE_TOP - 26} fill={C.woodDark} {...line} />
      <rect x={x - 90} y={y - 12} width={180} height={12} rx={5} fill={C.woodDark} {...line} />
      <rect x={x - w / 2} y={y - TABLE_TOP} width={w} height={22} rx={8} fill={C.wood} {...line} />
    </g>
  );
};

// Hanging lamp: pivots at (x, top). swing = degrees. Returns the shade's light point via `lampPoint`.
export const lampPoint = (x: number, top: number, len: number, swing: number) => {
  const a = (swing * Math.PI) / 180;
  return [x + Math.sin(a) * len, top + Math.cos(a) * len] as const;
};
export const HangingLamp: React.FC<{x: number; top: number; len: number; swing: number; on: number; floorY: number; id: string}> = ({x, top, len, swing, on, floorY, id}) => {
  const L = useLook();
  const line = useLine();
  const [lx, ly] = lampPoint(x, top, len, swing);
  const flick = 1 + 0.02 * Math.sin(lx * 0.3 + ly);
  return (
    <g>
      <Glow id={`${id}G`} cx={lx} cy={ly + 10} r={760} color={L.glowWarm} opacity={0.6 * on * flick} />
      <polygon points={`${lx - 60},${ly + 6} ${lx + 60},${ly + 6} ${lx + 60 + (floorY - ly) * 0.45 + Math.sin((swing * Math.PI) / 180) * 260},${floorY} ${lx - 60 - (floorY - ly) * 0.45 + Math.sin((swing * Math.PI) / 180) * 260},${floorY}`}
        fill={L.glowWarm} opacity={L.coneOpacity * on} />
      <path d={`M ${x} ${top} L ${lx} ${ly - 60}`} stroke={L.outline} strokeWidth={6} />
      <g transform={`translate(${lx} ${ly}) rotate(${-swing})`}>
        <path d="M -30 -62 L 30 -62 L 70 6 L -70 6 Z" fill={on > 0.5 ? L.shadeOn : L.shadeOff} {...line} />
        <ellipse cx={0} cy={10} rx={22} ry={10} fill="#FFF4D8" opacity={on} />
      </g>
    </g>
  );
};

// Bowl of soup on a surface at (x, y = surface). sip lifts it; steam rises.
export const Bowl: React.FC<{x: number; y: number; frame: number; full?: number; steam?: number; scale?: number}> = ({x, y, frame, full = 1, steam = 1, scale = 1}) => {
  const line = useLine();
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {steam > 0 && [-14, 12].map((dx, i) => {
        const t = (frame * 0.9 + i * 22) % 44;
        const pts = Array.from({length: 6}, (_, k) => `${dx + Math.sin(k * 1.3 + frame * 0.12 + i) * 7},${-36 - k * 12 - t * 0.4}`).join(' ');
        return <polyline key={i} points={pts} stroke="#E6E2F4" strokeWidth={6} fill="none" strokeLinecap="round" opacity={steam * 0.7 * (1 - t / 44)} />;
      })}
      <path d="M -40 -30 L 40 -30 Q 38 0 0 0 Q -38 0 -40 -30 Z" fill={C.bowl} {...line} />
      {full > 0 && <rect x={-34} y={-34} width={68} height={8} rx={4} fill={C.soup} opacity={full} />}
    </g>
  );
};

// Safety cap (for a rocket fuse), sitting on a surface at (x, y).
export const Cap: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => {
  const line = useLine();
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-14} y={-26} width={28} height={26} rx={7} fill={C.rocketStripe} {...line} />
      <rect x={-14} y={-14} width={28} height={7} fill="#FFFFFF" />
    </g>
  );
};

// Paper card with lines of handwriting. reveal = 0..1 portion of characters written.
export const Card: React.FC<{x: number; y: number; w: number; h: number; lines: string[]; size: number; reveal?: number; rot?: number; scale?: number}> = ({x, y, w, h, lines, size, reveal = 1, rot = 0, scale = 1}) => {
  const line = useLine();
  const total = lines.join('').length;
  let left = Math.floor(reveal * total + 0.0001);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={C.paper} {...line} />
      {lines.map((t, i) => {
        const shown = t.slice(0, Math.max(0, left));
        left -= t.length;
        return (
          <text key={i} x={0} y={-h / 2 + (i + 1) * (h / (lines.length + 1)) + size * 0.35} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={size} fill={C.ink}>
            {shown}
          </text>
        );
      })}
    </g>
  );
};

// Wall lamp (small bulb with shade) used on balconies and in hallways.
export const WallLamp: React.FC<{x: number; y: number; on: number; id: string; r?: number}> = ({x, y, on, id, r = 300}) => {
  const L = useLook();
  const line = useLine();
  return (
    <g>
      <Glow id={id} cx={x} cy={y + 14} r={r} color={L.glowWarm} opacity={0.65 * on} />
      <rect x={x - 6} y={y - 30} width={12} height={20} fill={L.outline} />
      <path d={`M ${x - 22} ${y - 12} L ${x + 22} ${y - 12} L ${x + 30} ${y + 12} L ${x - 30} ${y + 12} Z`} fill={on > 0.5 ? L.shadeOn : L.shadeOff} {...line} />
    </g>
  );
};
