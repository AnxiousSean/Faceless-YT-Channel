import React from 'react';
import {PIP, PIP_DARK, OUTLINE} from './theme';
import {wobblyRect, wobblyLine} from './wobble';

// Pip: big round head, no neck, dot eyes, one-line brows + mouth, noodle limbs, no fingers.
// Local origin = between the feet, on the floor. Height ~ 285px at scale 1.
export type PipPose = {
  x: number; y: number; frame: number;
  scale?: number;
  squash?: number;      // + = squashed (wide/short), - = stretched
  browL?: number;       // degrees: + = inner end down (angry), - = inner end up (worried)
  browR?: number;
  browY?: number;       // raise (-) / lower (+)
  mouth?: number;       // -1 frown .. +1 smile
  mouthOpen?: number;   // 0..1 shout
  blink?: number;       // 0..1
  look?: number;        // pupils shift x
  barY?: number | null; // barbell held at this local y (hands on it). null = no bar
  handL?: [number, number];
  handR?: [number, number];
  headband?: number;    // 0..1 pop-in of the Day-2 item
};

const HEAD_Y = -205;
const HEAD_R = 78;

const arm = (side: number, hand: [number, number]) => {
  const s: [number, number] = [side * 36, -118];
  const c: [number, number] = [(s[0] + hand[0]) / 2 + side * 34, (s[1] + hand[1]) / 2 + 18];
  return `M ${s[0]} ${s[1]} Q ${c[0]} ${c[1]} ${hand[0]} ${hand[1]}`;
};

const brow = (side: number, angle: number, dy: number) => {
  const a = (angle * Math.PI) / 180;
  const cx = side * 28, cy = HEAD_Y - 30 + dy, h = 16;
  return `M ${cx - side * h * Math.cos(a)} ${cy + h * Math.sin(a)} L ${cx + side * h * Math.cos(a)} ${cy - h * Math.sin(a)}`;
};

export const Barbell: React.FC<{y: number; frame: number}> = ({y, frame}) => (
  <g>
    <path d={wobblyLine(-150, y, 150, y, frame, 41, 0.8)} stroke="#B4B9C4" strokeWidth={7} strokeLinecap="round" fill="none" />
    {[-1, 1].map((s) => (
      <g key={s}>
        <path d={wobblyRect(s * 118 - 14, y - 46, 28, 92, frame, 50 + s, 1.3)} fill="#2C303B" stroke={OUTLINE} strokeWidth={2.5} />
        <path d={wobblyRect(s * 140 - 8, y - 30, 16, 60, frame, 60 + s, 1.2)} fill="#363B48" stroke={OUTLINE} strokeWidth={2.5} />
      </g>
    ))}
  </g>
);

export const Pip: React.FC<PipPose> = (p) => {
  const {x, y, frame, scale = 1, squash = 0, browL = 0, browR = 0, browY = 0, mouth = 0, mouthOpen = 0, blink = 0, look = 0, barY = null, headband = 0} = p;
  const handL: [number, number] = barY !== null ? [-66, barY] : p.handL ?? [-58, -40];
  const handR: [number, number] = barY !== null ? [66, barY] : p.handR ?? [58, -40];
  const sx = scale * (1 + squash);
  const sy = scale * (1 - squash);
  const eyeRy = 8 * Math.max(0.12, 1 - blink);
  const tail = Math.sin(frame * 0.25) * 8;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
      <defs>
        <clipPath id={`pipHead${x.toFixed(0)}`}><circle cx={0} cy={HEAD_Y} r={HEAD_R} /></clipPath>
      </defs>
      {/* legs */}
      <path d="M -18 -40 Q -26 -18 -28 0" stroke={PIP_DARK} strokeWidth={15} strokeLinecap="round" fill="none" />
      <path d="M 18 -40 Q 26 -18 28 0" stroke={PIP} strokeWidth={15} strokeLinecap="round" fill="none" />
      {/* body + head (no neck) */}
      <ellipse cx={0} cy={-90} rx={47} ry={58} fill={PIP} />
      <circle cx={0} cy={HEAD_Y} r={HEAD_R} fill={PIP} />
      {/* Day-2 item: red headband */}
      {headband > 0 && (
        <g transform={`translate(0 ${HEAD_Y - 52}) scale(${headband}) translate(0 ${-(HEAD_Y - 52)})`}>
          <path d={`M 66 ${HEAD_Y - 52} q 26 ${4 + tail * 0.3} 44 ${14 + tail}`} stroke="#E8484F" strokeWidth={10} strokeLinecap="round" fill="none" />
          <path d={`M 66 ${HEAD_Y - 46} q 22 ${14 - tail * 0.3} 30 ${32 - tail * 0.5}`} stroke="#C23A41" strokeWidth={10} strokeLinecap="round" fill="none" />
          <rect x={-90} y={HEAD_Y - 62} width={180} height={20} fill="#E8484F" clipPath={`url(#pipHead${x.toFixed(0)})`} />
        </g>
      )}
      {/* face */}
      <ellipse cx={-26 + look} cy={HEAD_Y} rx={7.5} ry={eyeRy} fill="#1A1006" />
      <ellipse cx={26 + look} cy={HEAD_Y} rx={7.5} ry={eyeRy} fill="#1A1006" />
      <path d={brow(-1, browL, browY)} stroke="#1A1006" strokeWidth={6} strokeLinecap="round" />
      <path d={brow(1, browR, browY)} stroke="#1A1006" strokeWidth={6} strokeLinecap="round" />
      {mouthOpen > 0.05 ? (
        <ellipse cx={0} cy={HEAD_Y + 36} rx={10 + 6 * mouthOpen} ry={4 + 14 * mouthOpen} fill="#1A1006" />
      ) : (
        <path d={`M -19 ${HEAD_Y + 36} Q 0 ${HEAD_Y + 36 + mouth * 16} 19 ${HEAD_Y + 36}`} stroke="#1A1006" strokeWidth={5.5} strokeLinecap="round" fill="none" />
      )}
      {barY !== null && <Barbell y={barY} frame={frame} />}
      {/* noodle arms on top (mitten ends, no fingers) */}
      <path d={arm(-1, handL)} stroke={PIP} strokeWidth={14} strokeLinecap="round" fill="none" />
      <path d={arm(1, handR)} stroke={PIP} strokeWidth={14} strokeLinecap="round" fill="none" />
    </g>
  );
};
