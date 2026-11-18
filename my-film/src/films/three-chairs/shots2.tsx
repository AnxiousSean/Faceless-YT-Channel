import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {FLOOR_Y, FONT} from '../../components/theme';
import {useLook} from '../../components/look';
import {Pip, PipPose} from '../../components/Pip';
import {Neighbour, NeighbourPose} from '../../components/Neighbour';
import {ShadowSelf} from '../../components/ShadowSelf';
import {Narrator, ShadowLine, RepPop, HitFX} from '../../components/Overlay';
import {kf, blinkAt} from '../../components/anim';
import {Glow} from '../../components/Glow';
import {Bowl, C, Cap, Card, Chair, Table, TABLE_TOP} from './props';
import {Courtyard, COURT, FLAT, Flat} from './sets';
import {Furniture, Push, TableClose, breathe, lin, pop} from './shots1';

const F = FLOOR_Y;
const TOP = F - TABLE_TOP; // table surface y
export const SEAT = {pip: F - 72, bram: F - 62, lune: F - 104};

// Lamp swing after Bram's slam (global frame), shared by every shot that follows.
export const SLAM = 2490;
export const swingAt = (g: number) => (g < SLAM ? 0 : 15 * Math.exp(-(g - SLAM) / 120) * Math.sin((g - SLAM) * 0.11));

type Sh = {x: number; grow: number; rise?: number; lean?: number; glow?: number; sit?: number};
type DinnerProps = {
  f: number; g: number;
  pip: Partial<PipPose> & {x: number; y: number};
  bram?: Partial<NeighbourPose> & {x: number; y: number};
  lune?: Partial<NeighbourPose> & {x: number; y: number};
  shadows?: {pip?: Sh; bram?: Sh; lune?: Sh};
  bowls?: {x: number; y: number; full?: number; steam?: number}[];
  caps?: {x: number; y: number}[];
  door?: number; note?: number; capped?: number; winLamps?: number;
  front?: React.ReactNode;
  bSlide?: number;
};

// The flat with the three chairs, the table and everyone at it.
export const Dinner: React.FC<DinnerProps> = ({f, g, pip, bram, lune, shadows = {}, bowls = [], caps = [], door = 0, note = 0, capped = 0, winLamps = 1, front, bSlide = 1}) => {
  const sh = (k: 'pip' | 'bram' | 'lune', s?: Sh) => s && s.grow > 0 && (s.rise ?? 1) > 0.01 && (
    <g key={k} transform={`translate(0 ${F}) scale(1 ${1 - 0.35 * (s.sit ?? 0)}) translate(0 ${-F})`}>
      <ShadowSelf kind={k} x={s.x} y={F} frame={f + (k === 'bram' ? 40 : k === 'lune' ? 80 : 0)} grow={s.grow} rise={s.rise ?? 1} lean={s.lean ?? 0} glow={s.glow ?? 1} />
    </g>
  );
  return (
    <Flat frame={g} swing={swingAt(g)} door={door} note={note} capped={capped} bramLamp={winLamps} luneLamp={winLamps}>
      {sh('pip', shadows.pip)}{sh('lune', shadows.lune)}{sh('bram', shadows.bram)}
      <Chair x={kf(bSlide, [[0, 1500], [1, FLAT.chairB]])} y={F} kind="cafe" back={0} />
      {lune && <Neighbour kind="lune" frame={f} {...lune} />}
      <Table x={FLAT.table} y={F} />
      <Chair x={FLAT.chairL} y={F} kind="wood" back={-1} />
      <Chair x={FLAT.chairR} y={F} kind="skip" back={1} />
      <Pip frame={f} bowtie={1} {...pip} />
      {bram && <Neighbour kind="bram" frame={f} {...bram} />}
      {bowls.map((b, i) => <Bowl key={i} frame={f + i * 13} {...b} />)}
      {caps.map((c, i) => <Cap key={i} {...c} />)}
      {front}
    </Flat>
  );
};

// ========== S7 (1560-1800): back home. Three mismatched chairs. ==========
export const S7: React.FC = () => {
  const f = useCurrentFrame();
  const slide = kf(f, [[16, 0], [86, 1]]);
  const chairX = kf(slide, [[0, 1500], [1, FLAT.chairB]], (t) => t);
  const pushing = f < 92;
  const pipX = pushing ? chairX + 150 : kf(f, [[92, FLAT.chairB + 150], [130, 1370]]);
  const walking = (f > 16 && f < 86) || (f > 92 && f < 130);
  const happy = lin(f, 132, 142);
  const rise = f < 150 ? 0 : spring({frame: f - 150, fps: 30, config: {damping: 16, stiffness: 50}}) * (1 - lin(f, 210, 236));
  return (
    <AbsoluteFill>
      <Push s={kf(f, [[0, 1], [240, 1.06]])} oy={620}>
        <Flat frame={f + 1560}>
          <ShadowSelf x={1490} y={F} frame={f} grow={0.62} rise={rise} glow={0.6} />
          <Furniture chairs={['B', 'L', 'R']} bSlide={slide} />
          <Table x={FLAT.table} y={F} />
          <Pip x={pipX} y={F} frame={f} bowtie={1} squash={breathe(f) + kf(f, [[86, 0], [90, 0.08], [96, 0]])}
            browL={-4 - 8 * happy} browR={-4 - 8 * happy} browY={-6 * happy} mouth={0.2 + 0.6 * happy} look={pushing ? -6 : kf(f, [[130, 0], [140, -8]])}
            blink={blinkAt(f, 60, 190)} walk={f * 0.5} walkAmt={walking ? 0.7 : 0}
            handL={pushing ? [-110, -90] : [-58, -40]} handR={pushing ? [-70, -110] : [58, -40]} />
        </Flat>
      </Push>
      <Narrator text="Three chairs. Now for the hard part." frame={f} from={128} to={228} />
    </AbsoluteFill>
  );
};

// ========== S8 (1800-2100): DAY 3. Knock. Bram fills the doorway, Lune slips in. Nobody sits. ==========
export const S8: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + 1800;
  const door = kf(f, [[84, 0], [98, 1], [236, 1], [248, 0]]);
  const knockJolt = kf(f, [[60, 0], [63, -0.1], [70, 0.05], [76, 0]]);
  const bramX = kf(f, [[100, 150], [190, 1340]], (t) => t);
  const luneX = kf(f, [[176, 150], [244, 960]], (t) => t);
  const bramIn = f >= 100, luneIn = f >= 176;
  const bramWalk = f > 100 && f < 190, luneWalk = f > 176 && f < 244;
  const pipX = kf(f, [[0, 1250], [64, 1250], [90, 560]]);
  const silence = lin(f, 246, 252);
  return (
    <AbsoluteFill>
      <Dinner f={f} g={g} door={door}
        shadows={{
          bram: bramIn ? {x: bramX + 90, grow: 0.95, rise: lin(f, 110, 150), lean: 3} : undefined,
          lune: luneIn ? {x: luneX - 110, grow: 0.85, rise: lin(f, 186, 226), lean: -3} : undefined,
          pip: {x: pipX - 90, grow: 0.8, rise: lin(f, 150, 200) * 0.9},
        }}
        pip={{x: pipX, y: F, squash: breathe(f) + knockJolt, browL: kf(f, [[0, -6], [62, -18], [120, -8]]), browR: kf(f, [[0, -6], [62, -18], [120, -8]]),
          browY: kf(f, [[60, 0], [64, -12], [110, -4]]), mouth: kf(f, [[0, 0.2], [62, -0.1], [120, 0.3], [250, -0.1]]),
          look: f < 60 ? 8 : f < 250 ? -8 : Math.round(Math.sin(f * 0.15)) * 8, blink: blinkAt(f, 40, 200, 280),
          walk: f * 0.7, walkAmt: f > 64 && f < 90 ? 0.8 : 0,
          handL: [-58, -40], handR: f > 110 && f < 150 ? [90, -230 + Math.sin(f * 0.6) * 20] : [58, -40]}}
        bram={bramIn ? {x: bramX, y: F, squash: breathe(f, 1), browL: 14, browR: 14, mouth: -0.3, look: f < 200 ? 6 : f < 250 ? -6 : Math.round(Math.sin(f * 0.13 + 1)) * 7,
          blink: blinkAt(f, 220, 270), walk: f * 0.4, walkAmt: bramWalk ? 0.8 : 0} : undefined}
        lune={luneIn ? {x: luneX, y: F, squash: breathe(f, 2), browL: 10, browR: 10, mouth: 0, look: f < 250 ? 6 : Math.round(Math.sin(f * 0.17 + 2)) * 6,
          blink: blinkAt(f, 255, 290), walk: f * 0.55, walkAmt: luneWalk ? 0.6 : 0} : undefined} />
      <Narrator text="Three seats. Nobody sits." frame={f} from={250} to={300 + 10} />
      {silence < 0 && null}
    </AbsoluteFill>
  );
};

// ========== S9 (2100-2460): they sit. The agenda. The Shadows lean in. ==========
const AgendaClose: React.FC<{f: number}> = ({f}) => {
  const L = useLook();
  const x = kf(f, [[0, -400], [18, 960]], Easing.out(Easing.cubic));
  const arm = 1 - lin(f, 30, 44);
  return (
    <TableClose frame={f}>
      <Card x={x} y={770} w={620} h={250} lines={['AGENDA:', 'THE ROCKETS.']} size={76} rot={-1} />
      {arm > 0 && <>
        <path d={`M -80 1200 Q ${x - 500} 980 ${x - 330 - (1 - arm) * 300} ${820 + (1 - arm) * 200}`} stroke="#3B1A06" strokeWidth={52} strokeLinecap="round" fill="none" />
        <path d={`M -80 1200 Q ${x - 500} 980 ${x - 330 - (1 - arm) * 300} ${820 + (1 - arm) * 200}`} stroke={L.pip} strokeWidth={40} strokeLinecap="round" fill="none" />
      </>}
    </TableClose>
  );
};

// Seated poses with hands resting on the table.
const seatedPip = (f: number, extra: Partial<PipPose> = {}): Partial<PipPose> & {x: number; y: number} => ({
  x: FLAT.chairL, y: SEAT.pip, squash: breathe(f), handL: [-56, -30], handR: [100, TOP - SEAT.pip - 4], ...extra,
});
const seatedBram = (f: number, extra: Partial<NeighbourPose> = {}): Partial<NeighbourPose> & {x: number; y: number} => ({
  x: FLAT.chairR, y: SEAT.bram, squash: breathe(f, 1), handL: [-110, TOP - SEAT.bram - 4], handR: [66, -40], ...extra,
});
const seatedLune = (f: number, extra: Partial<NeighbourPose> = {}): Partial<NeighbourPose> & {x: number; y: number} => ({
  x: FLAT.chairB, y: SEAT.lune, squash: breathe(f, 2), handL: [-44, TOP - SEAT.lune + 8], handR: [44, TOP - SEAT.lune + 8], ...extra,
});

export const S9: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + 2100;
  if (f >= 60 && f < 130) return <AbsoluteFill><AgendaClose f={f - 60} /></AbsoluteFill>;
  const sit = (a: number) => lin(f, a, a + 18);
  const hop = (a: number) => -Math.sin(Math.PI * sit(a)) * 50;
  const pipSit = sit(6), bramSit = sit(20), luneSit = sit(34);
  const mad = lin(f, 136, 146);
  const grow = kf(f, [[140, 0], [330, 1]], Easing.inOut(Easing.sin));
  return (
    <AbsoluteFill>
      <Push s={kf(f, [[130, 1], [360, 1.06]])} oy={560}>
        <Dinner f={f} g={g}
          shadows={{
            pip: {x: 520, grow: 0.8 + 0.8 * grow, lean: 8 * grow, glow: 0.9 + 0.4 * grow},
            lune: {x: 840, grow: 0.85 + 0.85 * grow, lean: 6 * grow, glow: 0.9 + 0.4 * grow},
            bram: {x: 1420, grow: 0.95 + 0.85 * grow, lean: -9 * grow, glow: 0.9 + 0.4 * grow},
          }}
          pip={seatedPip(f, {x: kf(pipSit, [[0, 560], [1, FLAT.chairL]], (t) => t), y: interpolate(pipSit, [0, 1], [F, SEAT.pip]) + hop(6),
            handR: pipSit < 1 ? [58, -40] : [100, TOP - SEAT.pip - 4],
            browL: -8 - 10 * mad, browR: -8 - 10 * mad, browY: -4 * mad, mouth: 0.2 - 0.6 * mad, look: f < 140 ? 0 : Math.round(Math.sin(f * 0.1)) * 7, blink: blinkAt(f, 50, 200, 300)})}
          bram={seatedBram(f, {x: kf(bramSit, [[0, 1340], [1, FLAT.chairR]], (t) => t), y: interpolate(bramSit, [0, 1], [F, SEAT.bram]) + hop(20),
            handL: bramSit < 1 ? [-66, -44] : [-110, TOP - SEAT.bram - 4],
            browL: 14 + 12 * mad, browR: 14 + 12 * mad, browY: 6 * mad, mouth: -0.3 - 0.5 * mad, look: f < 140 ? -4 : -8, blink: blinkAt(f, 90, 240)})}
          lune={seatedLune(f, {y: interpolate(luneSit, [0, 1], [F, SEAT.lune]) + hop(34),
            browL: 10 + 14 * mad, browR: 10 + 14 * mad, browY: 5 * mad, mouth: -0.5 * mad, look: f < 140 ? 0 : Math.round(Math.sin(f * 0.08 + 2)) * 6, blink: blinkAt(f, 110, 270)})}
          front={<Card x={FLAT.table + 120} y={TOP - 22} w={120} h={44} lines={['AGENDA']} size={22} />} />
      </Push>
      <ShadowLine text="Don't blink first." frame={f} from={186} to={266} x={1180} y={180} />
      <ShadowLine text="They want you weak." frame={f} from={272} to={352} x={150} y={180} />
    </AbsoluteFill>
  );
};

// ========== S10 (2460-2700): SLAM. The lamp swings. The rockets outside. ==========
const RocketsClose: React.FC<{f: number}> = ({f}) => (
  <Push s={1.7} ox={1000} oy={520}>
    <Courtyard frame={f + 2550} pipLamp={1} bramLamp={0} luneLamp={0} glint={lin(f, 6, 46)} />
  </Push>
);

const BIG = {pip: 1.6, lune: 1.7, bram: 1.8};
export const S10: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + 2460;
  const hit = 30;
  if (f >= 90 && f < 150) return <AbsoluteFill><RocketsClose f={f - 90} /></AbsoluteFill>;
  const shake = f >= hit && f < hit + 12 ? (hit + 12 - f) / 12 : 0;
  const sx = Math.sin(f * 7.7) * 16 * shake, sy = Math.cos(f * 6.3) * 12 * shake;
  const raise = kf(f, [[0, 0], [24, 1], [hit - 2, 1.05], [hit, 0]], Easing.inOut(Easing.quad));
  const jolt = kf(f, [[hit, 0], [hit + 2, 0.14], [hit + 8, -0.08], [hit + 14, 0]]);
  const grow = kf(f, [[0, 0], [hit, 0.1], [hit + 20, 0.18]]);
  const fistY = TOP - SEAT.bram - 4 - raise * 300;
  const fistX = -110 + raise * 40;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(1.06)`, transformOrigin: '960px 560px'}}>
        <Dinner f={f + 360} g={g}
          shadows={{
            pip: {x: 520, grow: BIG.pip + grow, lean: 8, glow: 1.3},
            lune: {x: 840, grow: BIG.lune + grow, lean: 6, glow: 1.3},
            bram: {x: 1420, grow: BIG.bram + grow, lean: -9 + 6 * raise, glow: 1.3 + 0.4 * raise},
          }}
          pip={seatedPip(f, {squash: breathe(f) + jolt, browL: -20, browR: -20, browY: kf(f, [[hit, -4], [hit + 2, -14]]), mouth: -0.4,
            mouthOpen: kf(f, [[hit, 0], [hit + 2, 0.8], [hit + 30, 0.6], [hit + 50, 0]]), look: kf(f, [[0, 0], [10, 8]]), blink: blinkAt(f, 80, 200)})}
          bram={seatedBram(f, {y: SEAT.bram - raise * 20, squash: breathe(f, 1) + kf(f, [[hit - 4, -0.08], [hit, 0.12], [hit + 8, 0]]),
            handL: [fistX, fistY], handR: [100 - raise * 40, -40 - raise * 290 + (f >= hit ? 0 : 0)],
            browL: 30, browR: 30, browY: 10, mouth: -0.8, mouthOpen: kf(f, [[10, 0], [22, 0.9], [hit + 6, 0.9], [hit + 20, 0]]), look: -8, blink: blinkAt(f, 170)})}
          lune={seatedLune(f, {squash: breathe(f, 2) - jolt * 1.3, browL: kf(f, [[hit, 22], [hit + 2, -16], [hit + 50, 18]]), browR: kf(f, [[hit, 22], [hit + 2, -16], [hit + 50, 18]]),
            browY: kf(f, [[hit, 5], [hit + 2, -12], [hit + 50, 4]]), mouthOpen: kf(f, [[hit, 0], [hit + 2, 0.6], [hit + 24, 0]]), look: 6, blink: blinkAt(f, 120, 220)})}
          front={<Card x={FLAT.table + 120} y={TOP - 22 - (f >= hit && f < hit + 10 ? Math.sin(((f - hit) / 10) * Math.PI) * 40 : 0)} w={120} h={44} lines={['AGENDA']} size={22}
            rot={f >= hit ? kf(f, [[hit, 0], [hit + 10, 14]]) : 0} />} />
      </AbsoluteFill>
      <HitFX frame={f} at={hit} cx={1110} cy={TOP} />
    </AbsoluteFill>
  );
};

// ========== S11 (2700-3120): "No deal tonight." Pip serves soup. Lune sips, then Bram. ==========
export const S11: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + 2700;
  const stand = lin(f, 40, 56);
  const pipX = kf(f, [[56, FLAT.chairL], [96, 470], [150, 470], [196, 860], [256, 860], [276, FLAT.chairL]], (t) => t);
  const pipY = f < 40 ? SEAT.pip : f < 56 ? interpolate(stand, [0, 1], [SEAT.pip, F]) : f < 256 ? F : interpolate(lin(f, 256, 276), [0, 1], [F, SEAT.pip]) - Math.sin(Math.PI * lin(f, 256, 276)) * 40;
  const walking = (f > 56 && f < 96) || (f > 150 && f < 196);
  const carrying = f >= 150 && f < 250;
  const placed = [210, 226, 242];
  const bx = [830, 960, 1090];
  const luneSip = kf(f, [[284, 0], [300, 1], [326, 1], [342, 0]]);
  const bramSip = kf(f, [[352, 0], [370, 1], [394, 1], [408, 0]]);
  const soft = lin(f, 300, 330), bramSoft = lin(f, 370, 410);
  const dim = lin(f, 300, 410);
  const lunePos = {x: FLAT.chairB, y: SEAT.lune};
  const bramPos = {x: FLAT.chairR, y: SEAT.bram};
  const luneMouth: [number, number] = [lunePos.x, lunePos.y - 176 + 40];
  const bramMouth: [number, number] = [bramPos.x - 10, bramPos.y - 252 + 56];
  const bowls = bx.map((x, i) => {
    if (f < placed[i]) return null;
    const sip = i === 1 ? luneSip : i === 2 ? bramSip : 0;
    const to = i === 1 ? luneMouth : bramMouth;
    return {x: interpolate(sip, [0, 1], [x, to[0]]), y: interpolate(sip, [0, 1], [TOP, to[1] + 30]), full: 1 - (i === 1 ? lin(f, 300, 326) : i === 2 ? lin(f, 370, 394) : 0) * 0.6, steam: 1 - sip};
  }).filter(Boolean) as {x: number; y: number; full: number; steam: number}[];
  const trayN = carrying ? placed.filter((p) => f < p).length : 0;
  const reaching = placed.some((p) => f > p - 10 && f < p + 4);
  const hold = carrying ? [[-80, -150], [80, -150]] : null;
  return (
    <AbsoluteFill>
      <Push s={kf(f, [[200, 1.02], [420, 1.1]])} oy={600} ox={980}>
        <Dinner f={f + 600} g={g}
          shadows={{
            pip: {x: 520, grow: BIG.pip + 0.18 - 0.1 * dim, lean: 8, glow: 1.3 - 0.5 * dim},
            lune: {x: 840, grow: BIG.lune + 0.18 - 0.1 * dim, lean: 6 - 3 * soft, glow: 1.3 - 0.5 * dim},
            bram: {x: 1420, grow: BIG.bram + 0.18 - 0.1 * dim, lean: -9 + 3 * bramSoft, glow: 1.3 - 0.5 * dim},
          }}
          bowls={bowls}
          pip={{x: pipX, y: pipY, squash: breathe(f), browL: kf(f, [[0, -14], [40, 4], [280, 0], [320, -8]]), browR: kf(f, [[0, -14], [40, 4], [280, 0], [320, -8]]),
            mouth: kf(f, [[0, -0.2], [40, 0.1], [320, 0.5]]), look: f < 40 ? 0 : f < 96 ? -8 : f < 150 ? -4 : f < 280 ? 6 : f < 340 ? 4 : 8, blink: blinkAt(f, 30, 130, 260, 380),
            walk: f * 0.6, walkAmt: walking ? 0.8 : 0,
            handL: hold ? (hold[0] as [number, number]) : f > 96 && f < 150 ? [-80, -170 + Math.sin(f * 0.3) * 20] : f >= 276 ? [-56, -30] : [-58, -40],
            handR: reaching ? [150, TOP - F - 10] : hold ? (hold[1] as [number, number]) : f >= 276 ? [100, TOP - SEAT.pip - 4] : f < 40 ? [100, TOP - SEAT.pip - 4] : [58, -40]}}
          lune={seatedLune(f, {browL: 18 - 26 * soft, browR: 18 - 26 * soft, browY: 4 - 8 * soft, mouth: -0.3 + 0.8 * soft, look: f < 280 ? -4 : f < 340 ? 0 : 6, blink: kf(f, [[300, 0], [306, 0.7], [326, 0.7], [332, 0]]) + blinkAt(f, 100, 220),
            handL: luneSip > 0.01 ? [-34, luneMouth[1] - lunePos.y + 20 + (1 - luneSip) * 60] : [-44, TOP - SEAT.lune + 8], handR: luneSip > 0.01 ? [34, luneMouth[1] - lunePos.y + 20 + (1 - luneSip) * 60] : [44, TOP - SEAT.lune + 8]})}
          bram={seatedBram(f, {browL: 24 - 26 * bramSoft, browR: 24 - 26 * bramSoft, browY: 8 - 8 * bramSoft, mouth: -0.6 + 0.8 * bramSoft, look: f < 330 ? -6 : f < 352 ? -3 : 0,
            browYR: kf(f, [[330, 0], [340, -10], [352, 0]]),
            blink: kf(f, [[370, 0], [376, 0.8], [394, 0.8], [400, 0]]) + blinkAt(f, 160, 260),
            handL: bramSip > 0.01 ? [-60, bramMouth[1] - bramPos.y + 30 + (1 - bramSip) * 80] : [-110, TOP - SEAT.bram - 4], handR: bramSip > 0.01 ? [10, bramMouth[1] - bramPos.y + 30 + (1 - bramSip) * 80] : [66, -40]})}
          front={<>
            {carrying && trayN > 0 && (
              <g transform={`translate(${pipX} ${pipY - 150})`}>
                <rect x={-110} y={0} width={220} height={14} rx={6} fill="#8A90C0" stroke="#7C80A8" strokeWidth={5} />
                {Array.from({length: trayN}, (_, i) => <Bowl key={i} x={-60 + i * 60} y={0} frame={f + i * 9} scale={0.7} />)}
              </g>
            )}
            {f < 300 && <Card x={FLAT.table + 150} y={TOP - 22} w={120} h={44} lines={['AGENDA']} size={22} rot={14} />}
          </>} />
      </Push>
      <Narrator text="No deal tonight." frame={f} from={8} to={104} />
    </AbsoluteFill>
  );
};

// ========== S12 (3120-3480): a small step. Three caps slide to the middle. Shadows shrink. ==========
const CapsClose: React.FC<{f: number}> = ({f}) => (
  <TableClose frame={f} swing={swingAt(f + 3420) * 0.5}>
    {[[760, 'Pip'], [960, 'Lune'], [1160, 'Bram']].map(([x], i) => <Cap key={i} x={x as number} y={880} scale={3.2} />)}
    {[420, 1500].map((x, i) => <Bowl key={i} x={x} y={900} frame={f + i * 20} scale={2.6} full={0.3} steam={0.4} />)}
  </TableClose>
);

export const S12: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + 3120;
  if (f >= 300) return <AbsoluteFill><CapsClose f={f - 300} /><RepPop text="TALKS: 1" frame={f - 300} at={12} x={960} y={420} size={140} /></AbsoluteFill>;
  const capPip = kf(f, [[40, 0], [70, 1]]), capLune = kf(f, [[110, 0], [140, 1]]), capBram = kf(f, [[222, 0], [250, 1]]);
  const shrinkP = lin(f, 70, 130), shrinkL = lin(f, 140, 200), shrinkB = lin(f, 250, 296);
  const hesitate = lin(f, 150, 160) * (1 - lin(f, 214, 224));
  const everyoneLooks = f > 150 && f < 222;
  const caps = [
    f >= 30 ? {x: interpolate(capPip, [0, 1], [800, 925]), y: TOP} : null,
    f >= 100 ? {x: interpolate(capLune, [0, 1], [1010, 960]), y: TOP} : null,
    f >= 212 ? {x: interpolate(capBram, [0, 1], [1120, 995]), y: TOP} : null,
  ].filter(Boolean) as {x: number; y: number}[];
  const drone = 1 - lin(f, 250, 300);
  return (
    <AbsoluteFill>
      <Push s={1.06} oy={560}>
        <Dinner f={f + 1020} g={g}
          shadows={{
            pip: {x: 520, grow: interpolate(shrinkP, [0, 1], [BIG.pip + 0.08, 0.7]), lean: 8 * (1 - shrinkP), glow: 0.8 * drone + 0.3},
            lune: {x: 840, grow: interpolate(shrinkL, [0, 1], [BIG.lune + 0.08, 0.7]), lean: 3 * (1 - shrinkL), glow: 0.8 * drone + 0.3},
            bram: {x: 1420, grow: interpolate(shrinkB, [0, 1], [BIG.bram + 0.08, 0.75]), lean: -6 * (1 - shrinkB), glow: 0.8 * drone + 0.3},
          }}
          bowls={[{x: 830, y: TOP, full: 0.5, steam: 0.4}, {x: 900, y: TOP, full: 0.4, steam: 0.3}, {x: 1060, y: TOP, full: 0.4, steam: 0.3}]}
          caps={caps}
          pip={seatedPip(f, {handR: f > 20 && f < 76 ? [interpolate(capPip, [0, 1], [100, 225]), TOP - SEAT.pip - 14] : [100, TOP - SEAT.pip - 4],
            browL: kf(f, [[0, -4], [40, 6], [76, -6]]), browR: kf(f, [[0, -4], [40, 6], [76, -6]]), mouth: kf(f, [[0, 0.2], [76, 0.5]]),
            look: everyoneLooks ? 8 : f > 100 && f < 150 ? 5 : 3, blink: blinkAt(f, 90, 240)})}
          lune={seatedLune(f, {handR: f > 96 && f < 146 ? [interpolate(capLune, [0, 1], [50, 0]), TOP - SEAT.lune - 10] : [44, TOP - SEAT.lune + 8],
            browL: -6, browR: -6, mouth: 0.4, look: everyoneLooks ? 7 : f < 60 ? -5 : 0, blink: blinkAt(f, 60, 200, 280)})}
          bram={seatedBram(f, {handL: f > 208 && f < 256 ? [interpolate(capBram, [0, 1], [-100, -225]), TOP - SEAT.bram - 14] : [-110, TOP - SEAT.bram - 4],
            browL: 4 + 12 * hesitate, browR: 4 + 12 * hesitate, browY: 6 * hesitate, mouth: -0.2 * hesitate + 0.3 * lin(f, 250, 270),
            look: hesitate > 0.5 ? kf(f, [[160, -6], [190, -2], [214, -6]]) : -4, blink: kf(f, [[180, 0], [186, 0.6], [200, 0.6], [206, 0]]) + blinkAt(f, 120, 280)})} />
      </Push>
      <Narrator text="A small step. Not a big one." frame={f} from={6} to={96} />
    </AbsoluteFill>
  );
};

// ========== S13 (3480-3780): they leave. Door handle. Pip pins a note, looks out. ==========
const HandleClose: React.FC<{f: number}> = ({f}) => {
  const L = useLook();
  const rot = kf(f, [[0, 28], [10, -4], [16, 2], [22, 0]]);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <rect width={1920} height={1080} fill={C.door} />
      <rect x={-20} y={-20} width={330} height={1120} fill={C.wall2} stroke={L.outline} strokeWidth={8} />
      <Glow id="hcG" cx={1900} cy={90} r={1100} color={L.glowWarm} opacity={0.5} />
      <path d="M 1760 70 L 1960 70 L 1960 200 L 1700 200 Z" fill={L.shadeOn} stroke={L.outline} strokeWidth={8} />
      <circle cx={1200} cy={560} r={260} fill="#2E2050" />
      <rect x={1090} y={420} width={110} height={280} rx={30} fill="#A89878" stroke={L.outline} strokeWidth={8} />
      <g transform={`rotate(${rot} 1145 520)`}>
        <rect x={1145 - 420} y={490} width={440} height={64} rx={30} fill="#D8C8A0" stroke={L.outline} strokeWidth={8} />
      </g>
      <circle cx={1145} cy={520} r={40} fill="#C8B89A" stroke={L.outline} strokeWidth={8} />
      <rect x={1125} y={610} width={40} height={60} rx={12} fill="#2A1E40" />
    </svg>
  );
};

export const S13: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + 3480;
  if (f >= 90 && f < 150) return <AbsoluteFill><HandleClose f={f - 90} /></AbsoluteFill>;
  const away = f >= 150;
  const bramUp = lin(f, 4, 20), luneUp = lin(f, 0, 16);
  const bramX = kf(f, [[30, FLAT.chairR], [88, 150]], (t) => t);
  const luneX = kf(f, [[20, FLAT.chairB], [70, 150]], (t) => t);
  const door = kf(f, [[16, 0], [28, 1], [82, 1], [88, 0]]);
  const pipStand = lin(f, 10, 26);
  const pipX = away ? kf(f, [[150, 760], [160, 760], [180, 600], [200, 600], [214, 600], [262, 1280]], (t) => t) : FLAT.chairL + 60 * pipStand;
  const pipWalk = away && ((f > 160 && f < 180) || (f > 214 && f < 262));
  const pinning = f > 180 && f < 204;
  const wave = !away && f > 30 && f < 88;
  const note = away ? pop(f, 194, 8, 220) : 0;
  return (
    <AbsoluteFill>
      <Dinner f={f + 1400} g={g} door={away ? 0 : door} note={note} capped={away ? 1 : 0} winLamps={0}
        bowls={[{x: 830, y: TOP, full: 0, steam: 0}, {x: 900, y: TOP, full: 0, steam: 0}, {x: 1060, y: TOP, full: 0, steam: 0}]}
        caps={away ? [{x: 925, y: TOP}] : [{x: 925, y: TOP}, ...(f < 26 ? [{x: 960, y: TOP}] : []), ...(f < 30 ? [{x: 995, y: TOP}] : [])]}
        shadows={{
          pip: {x: pipX - 120, grow: away ? 0.55 : 0.65, glow: 0.5},
          lune: !away ? {x: luneX - 100, grow: 0.65, rise: 1 - lin(f, 60, 80), glow: 0.5} : undefined,
          bram: !away ? {x: bramX + 100, grow: 0.7, rise: 1 - lin(f, 76, 90), glow: 0.5} : undefined,
        }}
        pip={{x: pipX, y: away ? F : interpolate(pipStand, [0, 1], [SEAT.pip, F]), squash: breathe(f) + (note > 0 ? kf(f, [[194, 0], [197, -0.06], [204, 0]]) : 0),
          browL: away ? kf(f, [[150, 0], [170, -8], [262, -12]]) : -8, browR: away ? kf(f, [[150, 0], [170, -8], [262, -12]]) : -8, browY: -4, mouth: away ? kf(f, [[150, 0.1], [200, 0.5]]) : 0.5,
          look: away ? (f < 214 ? -6 : 8) : -7, blink: blinkAt(f, 60, 170, 240), walk: f * 0.55, walkAmt: pipWalk ? 0.7 : 0,
          handL: pinning ? [-60, -300] : wave ? [-90, -240 + Math.sin(f * 0.5) * 30] : [-58, -40],
          handR: pinning ? [-20, -300] : [58, -40]}}
        bram={!away && f < 90 ? {x: bramX, y: interpolate(bramUp, [0, 1], [SEAT.bram, F]), squash: breathe(f, 1), browL: -4, browR: -4, mouth: 0.2, look: -6,
          blink: blinkAt(f, 50), walk: f * 0.4, walkAmt: f > 30 && f < 88 ? 0.8 : 0, handL: f < 26 ? [-110, TOP - SEAT.bram - 4] : [-66, -44]} : undefined}
        lune={!away && f < 72 ? {x: luneX, y: interpolate(luneUp, [0, 1], [SEAT.lune, F]), squash: breathe(f, 2), browL: -6, browR: -6, mouth: 0.4, look: -6,
          blink: blinkAt(f, 40), walk: f * 0.55, walkAmt: f > 20 && f < 70 ? 0.6 : 0} : undefined} />
    </AbsoluteFill>
  );
};

// ========== S14 (3780-4140): two blinks from each balcony. A yes. Pip's tiny Shadow sits down. ==========
export const S14: React.FC = () => {
  const f = useCurrentFrame();
  const g = f + 3780;
  const blinkLamp = (on: number, ...offs: number[]) => (f < on ? 0 : offs.some((o) => f >= o && f < o + 7) ? 0 : 1);
  const bramLamp = blinkLamp(36, 100, 116);
  const luneLamp = blinkLamp(56, 144, 160);
  if (f < 210) {
    const hop = kf(f, [[176, 0], [184, 24], [192, 0]]);
    return (
      <AbsoluteFill>
        <Push s={kf(f, [[0, 1.02], [210, 1.08]])} oy={540}>
          <Courtyard frame={g} pipLamp={1} bramLamp={bramLamp} luneLamp={luneLamp} capped={1}
            pipSlot={<Pip x={COURT.pip.x} y={COURT.pip.y - hop} frame={f} scale={0.42} bowtie={1} squash={breathe(f) + kf(f, [[172, 0.12], [178, -0.1], [192, 0.1], [198, 0]])}
              look={f < 130 ? 6 : 8} browL={kf(f, [[100, -4], [170, -16]])} browR={kf(f, [[100, -4], [170, -16]])} mouth={kf(f, [[100, 0], [170, 0.9]])} blink={blinkAt(f, 60)} />}
            bramSlot={f >= 30 ? <Neighbour kind="bram" x={COURT.bram.x} y={COURT.bram.y} frame={f} scale={0.42} squash={breathe(f, 1)} look={-7} browL={-2} browR={-2} mouth={0.2} blink={blinkAt(f, 80)}
              handR={f > 96 && f < 124 ? [90, -260] : undefined} /> : undefined}
            luneSlot={f >= 50 ? <Neighbour kind="lune" x={COURT.lune.x} y={COURT.lune.y} frame={f} scale={0.45} squash={breathe(f, 2)} look={-7} browL={-6} browR={-6} mouth={0.4} blink={blinkAt(f, 120)}
              handL={f > 140 && f < 168 ? [-70, -200] : undefined} /> : undefined} />
        </Push>
        <Narrator text="Two blinks. That means yes." frame={f} from={104} to={204} />
      </AbsoluteFill>
    );
  }
  const t = f - 210;
  const sitDown = lin(t, 30, 70);
  return (
    <AbsoluteFill>
      <Push s={kf(t, [[0, 1.02], [150, 1.1]])} ox={1300} oy={560}>
        <Dinner f={f + 1800} g={g} capped={1} winLamps={1} note={1}
          bowls={[{x: 830, y: TOP, full: 0, steam: 0}, {x: 900, y: TOP, full: 0, steam: 0}, {x: 1060, y: TOP, full: 0, steam: 0}]}
          caps={[{x: 925, y: TOP}]}
          shadows={{pip: {x: 1130, grow: 0.5, glow: 0.45, lean: -4 * sitDown, sit: sitDown}}}
          pip={{x: 1280, y: F, squash: breathe(f), browL: -12, browR: -12, browY: -6, mouth: 0.8, look: kf(t, [[0, 8], [60, 8], [70, -6], [110, -6]]), blink: blinkAt(t, 40, 120),
            handL: [-58, -40], handR: [58, -40]}} />
      </Push>
    </AbsoluteFill>
  );
};

// ========== S15 (4140-4500): title card ==========
export const WORD = 'TABLE';
export const LETTER_START = 20, LETTER_GAP = 9;
export const S15: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLook();
  const shown = Math.max(0, Math.min(WORD.length, Math.floor((f - LETTER_START) / LETTER_GAP) + 1));
  const draw = kf(f, [[72, 0], [104, 1]], Easing.out(Easing.cubic));
  const wave = Array.from({length: 61}, (_, i) => {
    const x = 600 + i * 12;
    const y = 640 + Math.sin(i * 0.5 + f * 0.15) * 10;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const fadeIn = (a: number) => interpolate(f, [a, a + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const black = interpolate(f, [318, 356], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: L.bg}}>
      <div style={{position: 'absolute', top: 330, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 250, color: L.text, letterSpacing: 10}}>
        {WORD.split('').map((ch, i) => {
          const s = i < shown ? spring({frame: f - (LETTER_START + i * LETTER_GAP), fps: 30, config: {damping: 15, stiffness: 300}}) : 0;
          return <span key={i} style={{display: 'inline-block', transform: `scale(${s}) translateY(${(1 - s) * 30}px)`, opacity: i < shown ? 1 : 0}}>{ch}</span>;
        })}
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={wave} stroke={L.accent} strokeWidth={12} strokeLinecap="round" fill="none" pathLength={1}
          strokeDasharray={1} strokeDashoffset={1 - draw} style={{filter: `drop-shadow(0 0 12px ${L.accent})`}} />
      </svg>
      <div style={{position: 'absolute', top: 712, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 40 * L.textScale, color: L.text, opacity: fadeIn(130)}}>
        Nothing was solved. Everyone came.
      </div>
      <div style={{position: 'absolute', top: 812, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 34 * L.textScale, color: L.accent, opacity: fadeIn(190)}}>
        That's how it starts.
      </div>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};
