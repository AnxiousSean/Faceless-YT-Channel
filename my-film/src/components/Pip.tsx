import React from 'react';
import {useLook} from './look';
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
  bowtie?: number;      // 0..1 pop-in of the bow tie item
  walk?: number;        // walk-cycle phase (radians); legs swing when walkAmt > 0
  walkAmt?: number;     // 0..1 stride size
  // Cast options: every story gets its own characters, same simple drawing style.
  skin?: string;        // head colour
  shirt?: string;       // body + arms
  pants?: string;       // legs
  hair?: string;        // hair colour
  hairStyle?: 'none' | 'short' | 'long' | 'cap' | 'bun' | 'spiky';
};
export type CastMember = Pick<PipPose, 'skin' | 'shirt' | 'pants' | 'hair' | 'hairStyle'>;

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

// Noodle leg with an optional walk cycle (foot swings forward/back and lifts).
export const leg = (side: number, phase: number, amt: number, top = -40, len = 0) => {
  const sw = Math.sin(phase + (side > 0 ? Math.PI : 0));
  const lift = Math.max(0, Math.cos(phase + (side > 0 ? Math.PI : 0)));
  const fx = side * 28 + sw * 26 * amt, fy = len - lift * 16 * amt;
  return `M ${side * 18} ${top} Q ${side * 26 + sw * 10 * amt} ${(top + fy) / 2} ${fx} ${fy}`;
};

export const BowTie: React.FC<{y: number; s: number; frame: number; w?: number}> = ({y, s, frame, w = 1}) => {
  const L = useLook();
  const flap = Math.sin(frame * 0.2) * 2;
  return (
    <g transform={`translate(0 ${y}) scale(${s * w} ${s})`}>
      <path d={`M -6 0 L -44 ${-22 - flap} L -44 ${22 + flap} Z`} fill={L.item} stroke={L.pipStroke} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M 6 0 L 44 ${-22 + flap} L 44 ${22 - flap} Z`} fill={L.item} stroke={L.pipStroke} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-12} y={-12} width={24} height={24} rx={6} fill={L.itemDark} stroke={L.pipStroke} strokeWidth={5} />
    </g>
  );
};

export const Barbell: React.FC<{y: number; frame: number}> = ({y, frame}) => {
  const L = useLook();
  const wf = L.wobbleStatic ? 0 : frame;
  const line = {stroke: L.outlineW > 0 ? L.outline : 'none', strokeWidth: L.outlineW, fillOpacity: L.propFillOpacity};
  return (
    <g filter={L.propFilter}>
      <path d={wobblyLine(-150, y, 150, y, wf, 41, 0.8 * L.wobble)} stroke={L.metal} strokeWidth={7} strokeLinecap="round" fill="none" />
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={wobblyRect(s * 118 - 14, y - 46, 28, 92, wf, 50 + s, 1.3 * L.wobble)} fill={L.plate} {...line} />
          <path d={wobblyRect(s * 140 - 8, y - 30, 16, 60, wf, 60 + s, 1.2 * L.wobble)} fill={L.plate2} {...line} />
        </g>
      ))}
    </g>
  );
};

export const Pip: React.FC<PipPose> = (p) => {
  const L = useLook();
  const {x, y, frame, scale = 1, squash = 0, browL = 0, browR = 0, browY = 0, mouth = 0, mouthOpen = 0, blink = 0, look = 0, barY = null, headband = 0, bowtie = 0, walk = 0, walkAmt = 0} = p;
  const skin = p.skin ?? L.pip;
  const shirt = p.shirt ?? L.pip;
  const hair = p.hair ?? '#1A120C';
  const hairStyle = p.hairStyle ?? 'none';
  const handL: [number, number] = barY !== null ? [-66, barY] : p.handL ?? [-58, -40];
  const handR: [number, number] = barY !== null ? [66, barY] : p.handR ?? [58, -40];
  const sx = scale * (1 + squash);
  const sy = scale * (1 - squash);
  const eyeRy = 8 * Math.max(0.12, 1 - blink);
  const tail = Math.sin(frame * 0.25) * 8;
  const inked = L.pipFillOpacity >= 1 && L.pipStrokeW > 0; // solid fill with ink outline
  const bodyStroke = {stroke: L.pipStrokeW > 0 ? L.pipStroke : 'none', strokeWidth: L.pipStrokeW, fillOpacity: L.pipFillOpacity};
  const limb = (d: string, color: string) => (
    <>
      {inked && <path d={d} stroke={L.pipStroke} strokeWidth={L.limbW + 2 * L.pipStrokeW} strokeLinecap="round" fill="none" />}
      <path d={d} stroke={color} strokeWidth={L.limbW} strokeLinecap="round" fill="none" />
    </>
  );
  const clipId = `pipHead${x.toFixed(0)}`;
  return (
    <g filter={L.charFilter}>
      <g transform={`translate(${x} ${y}) scale(${sx} ${sy})`}>
        <defs>
          <clipPath id={clipId}><circle cx={0} cy={HEAD_Y} r={HEAD_R} /></clipPath>
        </defs>
        {hairStyle === 'long' && (
          <path d={`M -82 ${HEAD_Y - 10} Q -86 ${HEAD_Y + 70} -60 ${HEAD_Y + 105} L 60 ${HEAD_Y + 105} Q 86 ${HEAD_Y + 70} 82 ${HEAD_Y - 10} Z`}
            fill={hair} stroke={inked ? L.pipStroke : 'none'} strokeWidth={L.pipStrokeW} />
        )}
        {limb(leg(-1, walk, walkAmt), p.pants ?? L.pipDark)}
        {limb(leg(1, walk, walkAmt), p.pants ?? L.pip)}
        {/* body + head (no neck) */}
        {inked && <ellipse cx={0} cy={-90} rx={47} ry={58} fill={shirt} {...bodyStroke} />}
        <circle cx={0} cy={HEAD_Y} r={HEAD_R} fill={skin} {...bodyStroke} />
        <ellipse cx={0} cy={-90} rx={inked ? 47 - L.pipStrokeW / 2 : 47} ry={inked ? 58 - L.pipStrokeW / 2 : 58} fill={shirt}
          {...(inked ? {stroke: 'none'} : bodyStroke)} />
        {/* hair (drawn on the head, above the brows) */}
        {hairStyle !== 'none' && hairStyle !== 'cap' && (
          <g>
            <path clipPath={`url(#${clipId})`} fill={hair}
              d={hairStyle === 'spiky'
                ? `M -90 ${HEAD_Y - 44} L -60 ${HEAD_Y - 60} L -40 ${HEAD_Y - 44} L -18 ${HEAD_Y - 62} L 4 ${HEAD_Y - 46} L 28 ${HEAD_Y - 64} L 48 ${HEAD_Y - 46} L 70 ${HEAD_Y - 58} L 90 ${HEAD_Y - 40} L 90 ${HEAD_Y - 100} L -90 ${HEAD_Y - 100} Z`
                : `M -90 ${HEAD_Y - 10} L -70 ${HEAD_Y - 10} Q -60 ${HEAD_Y - 48} -10 ${HEAD_Y - 50} Q 40 ${HEAD_Y - 58} 70 ${HEAD_Y - 30} L 90 ${HEAD_Y - 10} L 90 ${HEAD_Y - 100} L -90 ${HEAD_Y - 100} Z`} />
            {hairStyle === 'spiky' && (
              <path fill={hair} d={`M -50 ${HEAD_Y - 70} L -36 ${HEAD_Y - 96} L -20 ${HEAD_Y - 74} L 0 ${HEAD_Y - 100} L 18 ${HEAD_Y - 74} L 38 ${HEAD_Y - 94} L 52 ${HEAD_Y - 68} Z`} />
            )}
            {hairStyle === 'bun' && <circle cx={0} cy={HEAD_Y - HEAD_R - 14} r={26} fill={hair} stroke={inked ? L.pipStroke : 'none'} strokeWidth={L.pipStrokeW} />}
            {inked && <circle cx={0} cy={HEAD_Y} r={HEAD_R} fill="none" stroke={L.pipStroke} strokeWidth={L.pipStrokeW} />}
          </g>
        )}
        {hairStyle === 'cap' && (
          <g stroke={inked ? L.pipStroke : 'none'} strokeWidth={L.pipStrokeW}>
            <path fill={hair} d={`M -76 ${HEAD_Y - 30} Q -74 ${HEAD_Y - 92} 0 ${HEAD_Y - 92} Q 74 ${HEAD_Y - 92} 76 ${HEAD_Y - 30} Z`} />
            <path fill={hair} d={`M 40 ${HEAD_Y - 34} L 122 ${HEAD_Y - 30} Q 120 ${HEAD_Y - 18} 60 ${HEAD_Y - 20} Z`} />
          </g>
        )}
        {/* Day-2 item: headband */}
        {headband > 0 && (
          <g transform={`translate(0 ${HEAD_Y - 52}) scale(${headband}) translate(0 ${-(HEAD_Y - 52)})`}>
            <path d={`M 66 ${HEAD_Y - 52} q 26 ${4 + tail * 0.3} 44 ${14 + tail}`} stroke={L.item} strokeWidth={10} strokeLinecap="round" fill="none" />
            <path d={`M 66 ${HEAD_Y - 46} q 22 ${14 - tail * 0.3} 30 ${32 - tail * 0.5}`} stroke={L.itemDark} strokeWidth={10} strokeLinecap="round" fill="none" />
            <rect x={-90} y={HEAD_Y - 62} width={180} height={20} fill={L.item} clipPath={`url(#${clipId})`} />
          </g>
        )}
        {/* item: bow tie at the head/body join */}
        {bowtie > 0 && <BowTie y={HEAD_Y + HEAD_R - 2} s={bowtie} frame={frame} />}
        {/* face */}
        <ellipse cx={-26 + look} cy={HEAD_Y} rx={7.5} ry={eyeRy} fill={L.face} />
        <ellipse cx={26 + look} cy={HEAD_Y} rx={7.5} ry={eyeRy} fill={L.face} />
        <path d={brow(-1, browL, browY)} stroke={L.face} strokeWidth={6} strokeLinecap="round" />
        <path d={brow(1, browR, browY)} stroke={L.face} strokeWidth={6} strokeLinecap="round" />
        {mouthOpen > 0.05 ? (
          <ellipse cx={0} cy={HEAD_Y + 36} rx={10 + 6 * mouthOpen} ry={4 + 14 * mouthOpen} fill={L.face} />
        ) : (
          <path d={`M -19 ${HEAD_Y + 36} Q 0 ${HEAD_Y + 36 + mouth * 16} 19 ${HEAD_Y + 36}`} stroke={L.face} strokeWidth={5.5} strokeLinecap="round" fill="none" />
        )}
        {barY !== null && <Barbell y={barY} frame={frame} />}
        {/* noodle arms on top (mitten ends, no fingers) */}
        {limb(arm(-1, handL), shirt)}
        {limb(arm(1, handR), shirt)}
      </g>
    </g>
  );
};
