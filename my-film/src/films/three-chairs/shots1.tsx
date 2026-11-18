import React from 'react';
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame} from 'remotion';
import {FLOOR_Y, FONT} from '../../components/theme';
import {useLook} from '../../components/look';
import {Pip} from '../../components/Pip';
import {Neighbour} from '../../components/Neighbour';
import {ShadowSelf} from '../../components/ShadowSelf';
import {Narrator, ShadowLine, RepPop} from '../../components/Overlay';
import {Glow} from '../../components/Glow';
import {kf, blinkAt} from '../../components/anim';
import {C, Card, Chair, Rocket, Table, WallLamp, useLine} from './props';
import {COURT, Courtyard, FLAT, Flat, Moon} from './sets';

const F = FLOOR_Y;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lin = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const pop = (f: number, at: number, damping = 9, stiffness = 220) => (f < at ? 0 : spring({frame: f - at, fps: 30, config: {damping, stiffness}}));
export const breathe = (f: number, k = 0) => Math.sin(f * 0.12 + k) * 0.014;
export const Push: React.FC<{s: number; ox?: number; oy?: number; dx?: number; dy?: number; children: React.ReactNode}> = ({s, ox = 960, oy = 540, dx = 0, dy = 0, children}) => (
  <AbsoluteFill style={{transform: `translate(${dx}px, ${dy}px) scale(${s})`, transformOrigin: `${ox}px ${oy}px`}}>{children}</AbsoluteFill>
);

// ========== S1 (0-240): the courtyard. Three lamps, three rockets, three neighbours. ==========
export const S1: React.FC = () => {
  const f = useCurrentFrame();
  const lampOn = (at: number) => (f < at ? 0 : f < at + 2 ? 0.6 : 1) * (1 + 0.02 * Math.sin(f * 0.8 + at));
  return (
    <AbsoluteFill>
      <Push s={kf(f, [[0, 1.0], [240, 1.06]])} oy={520}>
        <Courtyard frame={f} pipLamp={lampOn(14)} bramLamp={lampOn(32)} luneLamp={lampOn(48)}
          pipSlot={<Pip x={COURT.pip.x} y={COURT.pip.y} frame={f} scale={0.42} squash={breathe(f)} look={kf(f, [[0, 0], [60, 0], [70, 6], [150, 6], [160, -2]])}
            browL={-8} browR={-8} mouth={-0.2} blink={blinkAt(f, 40, 130, 210)} />}
          bramSlot={<Neighbour kind="bram" x={COURT.bram.x} y={COURT.bram.y} frame={f} scale={0.42} squash={breathe(f, 1)}
            look={kf(f, [[0, 0], [80, 0], [88, 7], [170, 7], [178, -6]])} browL={14} browR={14} mouth={-0.3} blink={blinkAt(f, 66, 190)} />}
          luneSlot={<Neighbour kind="lune" x={COURT.lune.x} y={COURT.lune.y} frame={f} scale={0.45} squash={breathe(f, 2)}
            look={kf(f, [[0, 0], [100, 0], [108, -7], [200, -7]])} browL={10} browR={10} blink={blinkAt(f, 90, 160)} />} />
      </Push>
      <Narrator text="Three neighbours. Never once at one table." frame={f} from={70} to={220} />
    </AbsoluteFill>
  );
};

// One wooden chair + table, used across the flat shots.
export const Furniture: React.FC<{chairs?: ('L' | 'R' | 'B')[]; bSlide?: number}> = ({chairs = ['L'], bSlide = 1}) => (
  <>
    {chairs.includes('B') && <Chair x={kf(bSlide, [[0, 1500], [1, FLAT.chairB]])} y={F} kind="cafe" back={0} />}
    {chairs.includes('L') && <Chair x={FLAT.chairL} y={F} kind="wood" back={-1} />}
    {chairs.includes('R') && <Chair x={FLAT.chairR} y={F} kind="skip" back={1} />}
  </>
);

// ========== S2 (240-480): Pip at the window. The Shadow: "They'll never come." ==========
export const S2: React.FC = () => {
  const f = useCurrentFrame();
  const rise = f < 70 ? 0 : spring({frame: f - 70, fps: 30, config: {damping: 16, stiffness: 40}}) * (1 - lin(f, 205, 238));
  const turned = lin(f, 190, 200);
  const sigh = kf(f, [[40, 0], [52, 0.06], [70, 0]]);
  const worry = kf(f, [[0, -6], [60, -16]]);
  const brow = worry * (1 - turned) + 10 * turned;
  return (
    <AbsoluteFill>
      <Push s={kf(f, [[0, 1], [240, 1.05]])} ox={1200} oy={600}>
        <Flat frame={f}>
          <ShadowSelf x={1090} y={F} frame={f} grow={kf(f, [[70, 1.1], [190, 1.35]])} rise={rise} lean={kf(f, [[70, 0], [140, 6]])} glow={1.1} />
          <Furniture />
          <Table x={FLAT.table} y={F} />
          <Pip x={1290} y={F} frame={f} squash={breathe(f) + sigh} browL={brow} browR={brow} browY={-4 * (1 - turned)}
            mouth={-0.4 * (1 - turned) + 0.1 * turned} look={kf(f, [[0, 7], [190, 7], [198, -8]])} blink={blinkAt(f, 30, 150)}
            handL={[-58, -40 + Math.sin(f * 0.1) * 3]} handR={[58, -40 - Math.sin(f * 0.1) * 3]} />
        </Flat>
      </Push>
      <ShadowLine text="They'll never come." frame={f} from={100} to={190} x={300} y={250} />
    </AbsoluteFill>
  );
};

// Close-up tabletop background with the lamp hanging in frame.
export const TableClose: React.FC<{frame: number; children?: React.ReactNode; swing?: number}> = ({frame, children, swing = 0}) => {
  const L = useLook();
  const line = useLine();
  const lx = 960 + Math.sin((swing * Math.PI) / 180) * 200;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <rect width={1920} height={1080} fill={L.bg} />
      <rect x={-20} y={660} width={1960} height={500} fill={C.wood} {...line} />
      <rect x={-20} y={660} width={1960} height={26} fill={C.woodTop} />
      <Glow id="tcGlow" cx={lx} cy={130} r={900} color={L.glowWarm} opacity={0.55 * (1 + 0.02 * Math.sin(frame * 0.9))} />
      <Glow id="tcPool" cx={lx} cy={800} r={760} ry={260} color={L.glowWarm} opacity={0.45} />
      <path d={`M 960 0 L ${lx} 70`} stroke={L.outline} strokeWidth={10} />
      <path d={`M ${lx - 70} 70 L ${lx + 70} 70 L ${lx + 150} 200 L ${lx - 150} 200 Z`} fill={L.shadeOn} {...line} strokeWidth={7} />
      {children}
    </svg>
  );
};

// ========== S3 (480-660): close-up, Pip writes the invitations. ==========
const INVITE = ['DINNER.', 'MY PLACE.', 'ALL THREE OF US.'];
export const S3: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLook();
  const reveal = lin(f, 12, 118);
  // pen tip follows the handwriting
  const total = INVITE.join('').length;
  let n = reveal * total, li = 0;
  while (li < INVITE.length - 1 && n > INVITE[li].length) { n -= INVITE[li].length; li++; }
  const frac = Math.min(1, n / INVITE[li].length);
  const cx = 760, cy = 600, w = 640, h = 330, size = 66;
  const tw = INVITE[li].length * size * 0.52;
  const writing = f > 12 && f < 118;
  const lift = kf(f, [[116, 0], [130, 1]]);
  const tipX = cx - tw / 2 + frac * tw + (writing ? Math.sin(f * 1.9) * 5 : 0) + lift * 260;
  const tipY = cy - h / 2 + (li + 1) * (h / 4) + 8 + (writing ? Math.cos(f * 2.3) * 5 : 0) - lift * 120;
  const slideIn = spring({frame: f - 128, fps: 30, config: {damping: 14, stiffness: 120}});
  const hx = tipX + 70, hy = tipY + 90;
  const ink = '#3B1A06';
  return (
    <AbsoluteFill>
      <TableClose frame={f}>
        <Card x={cx} y={cy + 140} w={w} h={h} lines={INVITE} size={size} reveal={reveal} rot={-2} />
        {f >= 128 && <Card x={interpolate(slideIn, [0, 1], [2300, 1450])} y={cy + 170} w={w * 0.8} h={h * 0.8} lines={INVITE} size={size * 0.8} rot={4} />}
        {/* pencil + Pip's noodle arm */}
        <path d={`M 1990 1150 Q ${hx + 300} ${hy + 260} ${hx} ${hy}`} stroke={ink} strokeWidth={52} strokeLinecap="round" fill="none" />
        <path d={`M 1990 1150 Q ${hx + 300} ${hy + 260} ${hx} ${hy}`} stroke={L.pip} strokeWidth={40} strokeLinecap="round" fill="none" />
        <path d={`M ${hx} ${hy} L ${tipX} ${tipY + 140}`} stroke={ink} strokeWidth={26} strokeLinecap="round" />
        <path d={`M ${hx} ${hy} L ${tipX + 6} ${tipY + 146}`} stroke="#FFD45A" strokeWidth={14} strokeLinecap="round" />
        <circle cx={tipX + 4} cy={tipY + 142} r={7} fill={ink} />
      </TableClose>
    </AbsoluteFill>
  );
};

// ---------- montage pieces (S4) ----------
const Hallway: React.FC<{frame: number}> = ({frame: f}) => {
  const L = useLook();
  const line = useLine();
  const ex = kf(f, [[0, 280], [20, 900]]);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <rect width={1920} height={1080} fill={C.wall2} />
      <rect x={0} y={F} width={1920} height={220} fill={L.bgLow} />
      <WallLamp x={960} y={190} on={1} id="hallLamp" r={520} />
      <rect x={ex - 80} y={F - 14} width={160} height={14} fill={C.paper} {...line} />
      <rect x={746} y={300} width={428} height={F - 300} fill={C.wall} {...line} />
      <rect x={760} y={314} width={400} height={F - 314} fill={C.door} {...line} />
      <rect x={900} y={400} width={120} height={100} rx={10} fill="#C8B89A" {...line} />
      <text x={960} y={478} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={84} fill={C.ink}>9</text>
      <circle cx={1110} cy={620} r={16} fill="#C8B89A" />
      <path d={`M 0 ${F} L 1920 ${F}`} stroke={L.floor} strokeWidth={L.floorW} />
    </svg>
  );
};

const LuneBalcony: React.FC<{frame: number}> = ({frame: f}) => {
  const L = useLook();
  const line = useLine();
  const t = lin(f, 0, 22);
  const px = interpolate(t, [0, 1], [-150, 1000]);
  const py = 300 + Math.sin(t * Math.PI) * -120 + t * 500 + (f > 22 ? 0 : 0);
  const rot = interpolate(t, [0, 0.5, 1], [-10, 10, 24]);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <rect width={1920} height={1080} fill={L.bg} />
      <Moon x={300} y={230} r={70} id="lbMoon" />
      <rect x={1100} y={0} width={900} height={F} fill={C.brick} {...line} />
      <WallLamp x={1500} y={340} on={1} id="lbLamp" r={520} />
      <rect x={-20} y={F} width={1960} height={220} fill={C.brickTop} {...line} />
      <Rocket x={1250} y={700} angle={186} scale={1.8} frame={f} />
      <path d={`M 1250 ${F} L 1180 760 L 1320 ${F}`} stroke={L.outline} strokeWidth={10} fill="none" />
      <g transform={`translate(${px} ${py}) rotate(${rot}) scale(1.6)`}>
        <path d="M -60 -10 L 60 0 L -60 18 L -30 2 Z" fill={C.paper} {...line} />
      </g>
      <rect x={-20} y={F - 130} width={1960} height={14} fill={L.outline} />
      {Array.from({length: 22}, (_, i) => <rect key={i} x={i * 92} y={F - 130} width={12} height={130} fill={L.outline} />)}
    </svg>
  );
};

const Phone: React.FC<{frame: number; from: string; msg: string}> = ({frame: f, from, msg}) => {
  const L = useLook();
  const line = useLine();
  const buzzing = f >= 1 && f < 9;
  const jx = buzzing ? Math.sin(f * 9.1) * 9 : 0;
  const bubble = pop(f, 5, 8, 240);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <rect width={1920} height={1080} fill={L.bg} />
      <Glow id="phG" cx={960} cy={560} r={720} color={L.glowPhone} opacity={0.55} />
      <g transform={`translate(${960 + jx} 560) rotate(-6) scale(${1 + 0.003 * f})`}>
        <rect x={-200} y={-340} width={400} height={680} rx={40} fill={L.phoneOff} {...line} />
        <rect x={-174} y={-306} width={348} height={612} rx={16} fill={L.screen} />
        <text x={0} y={-220} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={58} fill="#EAF2FF">{from}</text>
        <g transform={`translate(-20 -60) scale(${bubble})`}>
          <rect x={-130} y={-60} width={280} height={120} rx={30} fill="#EAF2FF" {...line} />
          <text x={10} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={64} fill="#14161D">{msg}</text>
        </g>
      </g>
    </svg>
  );
};

const CloseFace: React.FC<{who: 'bram' | 'lune' | 'pip'; frame: number}> = ({who, frame: f}) => {
  const L = useLook();
  const line = useLine();
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <rect width={1920} height={1080} fill={who === 'lune' ? L.bg : C.wall2} />
      {who === 'bram' && <WallLamp x={360} y={360} on={1} id="cfBL" r={700} />}
      {who === 'lune' && <>
        <rect x={180} y={180} width={420} height={460} fill={C.sky} {...line} />
        <Moon x={400} y={360} r={60} id="cfMoon" />
        <rect x={386} y={180} width={10} height={460} fill={L.outline} />
      </>}
      {who === 'pip' && <Glow id="cfPip" cx={1500} cy={120} r={900} color={L.glowWarm} opacity={0.5} />}
      {who === 'bram' && (
        <Neighbour kind="bram" x={960} y={1230} frame={f} scale={2.3} browL={6} browR={kf(f, [[0, 6], [6, -16]])} browYR={kf(f, [[0, 0], [6, -16]])}
          browYL={4} mouth={-0.2} look={kf(f, [[0, 0], [8, 5]])} handR={[110, -190]} handL={[-66, -44]}>
          <Card x={170} y={-215} w={170} h={90} lines={['DINNER.']} size={34} rot={6} />
        </Neighbour>
      )}
      {who === 'lune' && (
        <Neighbour kind="lune" x={960} y={1150} frame={f} scale={2.6} browL={kf(f, [[0, 0], [6, 14]])} browR={kf(f, [[0, 0], [6, 14]])} browY={kf(f, [[0, 0], [6, 6]])}
          blink={kf(f, [[0, 0], [6, 0.55]])} look={kf(f, [[0, 0], [10, -4]])} mouth={0} handL={[-90, -150]} handR={[50, -32]}>
          <g transform="translate(-130 -150) rotate(-14) scale(0.8)"><path d="M -60 -10 L 60 0 L -60 18 L -30 2 Z" fill={C.paper} {...line} /></g>
        </Neighbour>
      )}
      {who === 'pip' && (
        <Pip x={960} y={1230} frame={f} scale={2.4} squash={-0.04 * pop(f, 3)} browL={kf(f, [[0, -4], [5, -18]])} browR={kf(f, [[0, -4], [5, -18]])}
          browY={kf(f, [[0, 0], [5, -14]])} mouth={kf(f, [[0, 0], [8, 0.9]])} blink={blinkAt(f, 20)} />
      )}
    </svg>
  );
};

// ========== S4 (660-960): montage, invitations delivered, two replies ==========
export const S4: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={30}><MontageA /></Sequence>
      <Sequence from={30} durationInFrames={30}><MontageB /></Sequence>
      <Sequence from={60} durationInFrames={30}><MontageFace who="bram" /></Sequence>
      <Sequence from={90} durationInFrames={30}><MontageFace who="lune" /></Sequence>
      <Sequence from={120} durationInFrames={30}><MontageWait /></Sequence>
      <Sequence from={150} durationInFrames={30}><MontagePhone from="BRAM" msg="...fine." /></Sequence>
      <Sequence from={180} durationInFrames={30}><MontageFace who="pip" /></Sequence>
      <Sequence from={210} durationInFrames={30}><MontagePhone from="LUNE" msg="...maybe." /></Sequence>
      <Sequence from={240} durationInFrames={60}><MontageJump /></Sequence>
      {f < 0 && null}
    </AbsoluteFill>
  );
};
const MontageA: React.FC = () => { const f = useCurrentFrame(); return <AbsoluteFill><Hallway frame={f} /></AbsoluteFill>; };
const MontageB: React.FC = () => { const f = useCurrentFrame(); return <AbsoluteFill><LuneBalcony frame={f} /></AbsoluteFill>; };
const MontageFace: React.FC<{who: 'bram' | 'lune' | 'pip'}> = ({who}) => { const f = useCurrentFrame(); return <AbsoluteFill><Push s={1 + f * 0.002}><CloseFace who={who} frame={f} /></Push></AbsoluteFill>; };
const MontagePhone: React.FC<{from: string; msg: string}> = ({from, msg}) => { const f = useCurrentFrame(); return <AbsoluteFill><Phone frame={f} from={from} msg={msg} /></AbsoluteFill>; };

const MontageWait: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLook();
  const tap = Math.max(0, Math.sin(f * 0.9)) * 0.03;
  return (
    <AbsoluteFill>
      <Flat frame={f + 400}>
        <Furniture />
        <Table x={FLAT.table} y={F} />
        <Glow id="waitPh" cx={1305} cy={F - 210} r={170} color={L.glowPhone} opacity={0.7} />
        <Pip x={1260} y={F} frame={f} squash={tap} browL={-10} browR={-10} mouth={-0.1} look={5} blink={blinkAt(f, 14)}
          handL={[-30, -150]} handR={[44, -150]} />
        <rect x={1278} y={F - 250} width={40} height={64} rx={6} fill={L.phoneOn} stroke={L.outline} strokeWidth={5} />
      </Flat>
    </AbsoluteFill>
  );
};

const MontageJump: React.FC = () => {
  const f = useCurrentFrame();
  const up = kf(f, [[0, 0], [10, 0], [22, 170], [32, 0]], (t) => Math.sin((t * Math.PI) / 2));
  const air = kf(f, [[10, 0], [22, 170], [32, 0]]);
  const sq = kf(f, [[0, 0], [9, 0.16], [12, -0.16], [22, -0.04], [31, -0.1], [33, 0.18], [40, -0.04], [46, 0]]);
  return (
    <AbsoluteFill>
      <Flat frame={f + 500}>
        <Furniture />
        <Table x={FLAT.table} y={F} />
        <Pip x={1200} y={F - (f < 10 ? 0 : air) + 0 * up} frame={f} squash={sq} browL={-14} browR={-14} browY={-8} mouth={0.9} blink={0}
          mouthOpen={kf(f, [[12, 0], [16, 0.6], [30, 0.6], [34, 0]])} handL={[-90, kf(f, [[8, -40], [14, -300], [36, -300], [44, -60]])]} handR={[90, kf(f, [[8, -40], [14, -300], [36, -300], [44, -60]])]} />
      </Flat>
      <RepPop text="RSVP 2/2!" frame={f} at={14} x={1200} y={330} size={110} />
    </AbsoluteFill>
  );
};

// ========== S5 (960-1200): DAY 2. The bow tie. Only one chair. ==========
export const S5: React.FC = () => {
  const f = useCurrentFrame();
  const bow = pop(f, 44, 7, 240);
  const fix = lin(f, 26, 34) * (1 - lin(f, 46, 56));
  const worried = lin(f, 140, 148) * (1 - lin(f, 190, 198));
  const set = lin(f, 190, 198);
  const happy = lin(f, 44, 52) * (1 - lin(f, 110, 120));
  const brow = -10 * happy - 16 * worried + 12 * set;
  const runX = kf(f, [[0, 1180], [100, 1180], [116, 1010], [210, 1010], [236, 160]], (t) => t * t);
  const lookX = kf(f, [[0, 0], [100, 0], [104, -8], [180, -8]]);
  const door = kf(f, [[200, 0], [210, 1], [236, 1]]);
  const running = f > 210;
  return (
    <AbsoluteFill>
      <Flat frame={f + 600} door={door}>
        <Furniture />
        <Table x={FLAT.table} y={F} />
        <Pip x={runX} y={F} frame={f} squash={breathe(f) + kf(f, [[44, 0], [47, -0.08], [52, 0.05], [58, 0]])} bowtie={bow}
          browL={brow} browR={brow} browY={-6 * happy} mouth={0.8 * happy - 0.3 * worried + 0.1 * set}
          look={lookX} blink={blinkAt(f, 80, 170)} walk={running ? f * 0.9 : f > 100 && f < 116 ? f * 0.6 : 0} walkAmt={running ? 1 : f > 100 && f < 116 ? 0.6 : 0}
          handL={fix > 0 ? [-20, -130 - 4 * Math.sin(f)] : running ? [-58 + Math.sin(f * 0.9) * 30, -60] : [-58, -40]}
          handR={fix > 0 ? [20, -130 + 4 * Math.sin(f)] : running ? [58 - Math.sin(f * 0.9) * 30, -60] : [58, -40]} />
      </Flat>
      <RepPop text="CHAIRS 1/3" frame={f} at={146} x={FLAT.chairL} y={470} size={90} />
      <Narrator text="One table. One chair. Three guests." frame={f} from={100} to={200} />
    </AbsoluteFill>
  );
};

// ========== S6 (1200-1560): run through the city for two more chairs ==========
const SPEED: [number, number][] = [[0, 0], [14, 17], [74, 17], [92, 0], [140, 0], [160, 19], [226, 19], [245, 0], [292, 0], [312, 22], [360, 26]];
const POS: number[] = (() => { const a = [0]; for (let i = 0; i < 400; i++) a.push(a[i] + kf(i, SPEED, (t) => t)); return a; })();
const posAt = (t: number) => { const i = Math.max(0, Math.min(398, Math.floor(t))); return POS[i] + (POS[i + 1] - POS[i]) * (t - i); };
export const speedAt = (t: number) => kf(t, SPEED, (x) => x);
const PIP_RUN_X = 860;
const SKIP_X = posAt(92) + 1000;
const CAFE_X = posAt(245) + 1000;
// footstep frames (for the soundtrack)
export const RUN_STEPS: number[] = (() => { const out: number[] = []; let last = 0; for (let t = 0; t < 360; t++) { const k = Math.floor(posAt(t) * 0.045 / Math.PI); if (k > last && speedAt(t) > 4) out.push(t); last = k; } return out; })();
export const RUN_STARTS = [14, 140, 292];

const Skyline: React.FC<{off: number; seed: number; color: string; minH: number; maxH: number; lit: number}> = ({off, seed, color, minH, maxH, lit}) => {
  const L = useLook();
  const line = useLine(4);
  const period = 2600;
  const blds: React.ReactNode[] = [];
  let x = 0, i = 0;
  while (x < period) {
    const r = (k: number) => { const v = Math.sin((i + 1) * 12.9898 * seed + k * 78.233) * 43758.5453; return v - Math.floor(v); };
    const w = 140 + r(1) * 160, h = minH + r(2) * (maxH - minH);
    for (let rep = -1; rep <= 1; rep++) {
      const bx = ((x - off) % period + period) % period + rep * period - 200;
      if (bx > 2000 || bx + w < -100) continue;
      blds.push(
        <g key={`${i}-${rep}`}>
          <rect x={bx} y={F - h} width={w} height={h} fill={color} {...line} />
          {Array.from({length: 6}, (_, k) => (r(10 + k) < lit && F - h + 30 + Math.floor(k / 2) * 70 + 60 < F ? <rect key={k} x={bx + 20 + (k % 2) * (w / 2 - 10)} y={F - h + 30 + Math.floor(k / 2) * 70} width={28} height={36} fill={C.warmWin} opacity={0.75} /> : null))}
        </g>,
      );
    }
    x += w + 10 + r(3) * 40; i++;
  }
  return <g>{blds}{L && null}</g>;
};

const StreetLights: React.FC<{off: number}> = ({off}) => {
  const L = useLook();
  const out: React.ReactNode[] = [];
  const gap = 560;
  const first = Math.floor((off - 200) / gap);
  for (let k = first; k < first + 6; k++) {
    const x = k * gap - off + 300;
    if (x < -300 || x > 2200) continue;
    out.push(
      <g key={k}>
        <Glow id={`sl${k}`} cx={x + 60} cy={F - 420} r={300} color={L.glowWarm} opacity={0.6} />
        <polygon points={`${x + 30},${F - 412} ${x + 90},${F - 412} ${x + 220},${F} ${x - 100},${F}`} fill={L.glowWarm} opacity={L.coneOpacity} />
        <Glow id={`slp${k}`} cx={x + 60} cy={F} r={240} ry={32} color={L.glowWarm} opacity={0.6} />
        <rect x={x - 8} y={F - 440} width={16} height={440} fill={L.outline} />
        <rect x={x - 8} y={F - 444} width={80} height={12} fill={L.outline} />
        <path d={`M ${x + 26} ${F - 432} L ${x + 94} ${F - 432} L ${x + 84} ${F - 410} L ${x + 36} ${F - 410} Z`} fill={L.shadeOn} stroke={L.outline} strokeWidth={5} />
      </g>,
    );
  }
  return <g>{out}</g>;
};

export const S6: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLook();
  const line = useLine();
  const pos = posAt(f);
  const v = speedAt(f);
  const phase = pos * 0.045;
  const amt = Math.min(1, v / 8);
  const got1 = f >= 112, got2 = f >= 266;
  const reach1 = lin(f, 96, 108) * (1 - lin(f, 110, 124));
  const reach2 = lin(f, 250, 262) * (1 - lin(f, 264, 278));
  const carry = got1 ? lin(f, 110, 124) : 0;
  const lift = kf(f, [[110, 0], [124, 1]]);
  const skipX = SKIP_X - pos, cafeX = CAFE_X - pos;
  const lean = Math.min(10, v * 0.5);
  const pumpL: [number, number] = [-58 + Math.sin(phase) * 32, -70];
  const pumpR: [number, number] = [58 - Math.sin(phase) * 32, -70];
  const up: [number, number][] = [[-74, -300], [74, -300]];
  const handL: [number, number] = reach1 > 0 ? [-58 + reach1 * 120, -40 - reach1 * 40] : reach2 > 0 ? [-58 + reach2 * 120, -40 - reach2 * 40] : carry > 0 ? [interpolate(carry, [0, 1], [pumpL[0], up[0][0]]), interpolate(carry, [0, 1], [pumpL[1], up[0][1]])] : pumpL;
  const handR: [number, number] = reach1 > 0 ? [58 + reach1 * 120, -40 - reach1 * 60] : reach2 > 0 ? [58 + reach2 * 120, -40 - reach2 * 60] : carry > 0 ? [interpolate(carry, [0, 1], [pumpR[0], up[1][0]]), interpolate(carry, [0, 1], [pumpR[1], up[1][1]])] : pumpR;
  const bob = v > 4 ? Math.abs(Math.sin(phase)) * -14 : 0;
  const chairY = F + bob - interpolate(lift, [0, 1], [130, 300]);
  const chair2Y = chairY - 106;
  const grabSq = kf(f, [[106, 0], [112, 0.14], [118, -0.08], [126, 0]]) + kf(f, [[260, 0], [266, 0.14], [272, -0.08], [280, 0]]);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect width={1920} height={1080} fill={L.bg} />
        <rect x={0} y={F} width={1920} height={1080 - F} fill={L.bgLow} />
        <Moon x={1560} y={190} r={52} id="cityMoon" />
        <Skyline off={pos * 0.15} seed={1.3} color="#120A2A" minH={260} maxH={560} lit={0.35} />
        <Skyline off={pos * 0.45 + 400} seed={2.7} color="#241A52" minH={160} maxH={360} lit={0.25} />
        {/* the skip, with a chair sticking out */}
        {skipX > -400 && skipX < 2300 && (
          <g>
            <rect x={skipX - 30} y={F - 130} width={260} height={130} fill="#3E6A5A" {...line} />
            <rect x={skipX - 44} y={F - 146} width={288} height={22} fill="#4E7E6C" {...line} />
            {!got1 && <Chair x={skipX + 40} y={F - 110 - reach1 * 20} kind="skip" back={1} rot={-18} />}
          </g>
        )}
        {/* the café, closing up, with one chair outside */}
        {cafeX > -600 && cafeX < 2500 && (
          <g>
            <Glow id="cafeG" cx={cafeX + 260} cy={F - 200} r={420} color={L.glowWarm} opacity={0.6} />
            <rect x={cafeX + 60} y={F - 420} width={420} height={420} fill="#3A2C70" {...line} />
            <rect x={cafeX + 90} y={F - 330} width={240} height={220} fill={C.warmWin} opacity={0.85} {...line} />
            <rect x={cafeX + 350} y={F - 300} width={100} height={300} fill={C.door} {...line} />
            <rect x={cafeX + 110} y={F - 400} width={320} height={56} rx={8} fill={C.cafeChair} {...line} />
            <text x={cafeX + 270} y={F - 356} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={44} fill="#FFFFFF">CAFE</text>
            <g transform={`translate(${cafeX + 400} ${F - 230}) rotate(${kf(f, [[200, 0], [230, 180]])})`}>
              <rect x={-44} y={-22} width={88} height={44} rx={6} fill={C.paper} stroke={L.outline} strokeWidth={4} />
            </g>
            {!got2 && <Chair x={cafeX} y={F - reach2 * 20} kind="cafe" back={0} />}
          </g>
        )}
        <StreetLights off={pos} />
        <g transform={`rotate(${lean} ${PIP_RUN_X} ${F})`}>
          <Pip x={PIP_RUN_X} y={F + bob} frame={f} squash={grabSq + (v > 4 ? 0.03 * Math.sin(phase * 2) : breathe(f))} bowtie={1}
            browL={v > 4 ? 10 : -12} browR={v > 4 ? 10 : -12} browY={v > 4 ? 4 : -8} mouth={v > 4 ? 0.1 : 0.7}
            look={v > 4 ? 8 : reach1 + reach2 > 0 ? 8 : 4} blink={blinkAt(f, 130, 280)} walk={phase} walkAmt={amt} handL={handL} handR={handR} />
        </g>
        {got1 && <Chair x={PIP_RUN_X + lean * 3} y={chairY} kind="skip" back={1} scale={0.92} />}
        {got2 && <Chair x={PIP_RUN_X + lean * 3 + 6} y={chair2Y} kind="cafe" back={0} scale={0.9} rot={5} />}
        <path d={`M 0 ${F} L 1920 ${F}`} stroke={L.floor} strokeWidth={L.floorW} />
      </svg>
      <RepPop text="CHAIRS 2/3" frame={f} at={114} x={PIP_RUN_X + 240} y={330} size={96} />
      <RepPop text="CHAIRS 3/3!" frame={f} at={268} x={PIP_RUN_X + 260} y={260} size={110} />
    </AbsoluteFill>
  );
};
