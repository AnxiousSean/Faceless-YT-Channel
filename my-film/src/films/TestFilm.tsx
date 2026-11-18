import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '../components/fonts';
import {FLOOR_Y, FONT, VIOLET, BG, OUTLINE} from '../components/theme';
import {Room} from '../components/Room';
import {Pip, Barbell} from '../components/Pip';
import {ShadowSelf} from '../components/ShadowSelf';
import {Narrator, ShadowLine, DayCounter, RepPop, Letterbox, HitFX} from '../components/Overlay';
import {Glow} from '../components/Glow';
import {wobblyRect} from '../components/wobble';
import {kf, blinkAt} from '../components/anim';

const F = FLOOR_Y;
const PIP_X = 960;

// ---------- SHOT A (0-105): lamp clicks on, Day 1, first two reps ----------
const ShotA: React.FC = () => {
  const f = useCurrentFrame();
  const lamp = f < 8 ? 0 : interpolate(f, [8, 10], [0, 1], {extrapolateRight: 'clamp'}) * (f >= 11 && f <= 12 ? 0.55 : 1) * (1 + 0.02 * Math.sin(f * 0.9));
  const holding = f >= 46;
  const barY = kf(f, [[46, -46], [56, -46], [68, -150], [70, -150], [78, -330], [85, -150], [86, -150], [93, -330]]);
  const squash = kf(f, [[0, 0], [46, 0], [54, 0.14], [58, 0.14], [64, -0.07], [70, 0.02], [76, -0.06], [80, 0.03], [85, 0.02], [91, -0.06], [96, 0.03]]) + Math.sin(f * 0.12) * 0.012;
  const brow = kf(f, [[0, -6], [40, -6], [50, 14]]);
  return (
    <AbsoluteFill>
      <Room frame={f} lamp={lamp} phone={0}>
        {!holding && <g transform={`translate(${PIP_X} ${F})`}><Barbell y={-46} frame={f} /></g>}
        <Pip x={PIP_X} y={F} frame={f} squash={squash} barY={holding ? barY : null}
          browL={brow} browR={brow} browY={kf(f, [[0, -4], [40, -4], [50, 2]])}
          mouth={kf(f, [[0, 0], [20, 0.5], [44, 0.5], [52, -0.3]])} blink={blinkAt(f, 30, 66)}
          look={kf(f, [[0, 0], [36, 0], [42, 3]])}
          handL={[-58 + Math.sin(f * 0.1) * 3, -40]} handR={[58 - Math.sin(f * 0.1) * 3, -40]} />
      </Room>
      <DayCounter day={1} frame={f} changedAt={14} />
      <Narrator text="Day one. Time to get strong." frame={f} from={18} to={70} />
      <RepPop text="1" frame={f} at={78} x={1170} y={470} />
      <RepPop text="2" frame={f} at={93} x={1170} y={470} />
    </AbsoluteFill>
  );
};

// ---------- SHOT B (30f): hard cut close-up, phone buzzes ----------
const ShotB: React.FC = () => {
  const f = useCurrentFrame();
  const on = interpolate(f, [3, 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const buzzing = (f >= 3 && f < 9) || (f >= 11 && f < 17);
  const jx = buzzing ? Math.sin(f * 9.1) * 7 : 0;
  const pop = spring({frame: f - 5, fps: 30, config: {damping: 9, stiffness: 200}});
  return (
    <AbsoluteFill style={{background: BG}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <Glow id="cuPhone" cx={960} cy={560} r={700} color="#5EA8FF" opacity={0.55 * on} />
        <g transform={`translate(${960 + jx} 560) rotate(-8) scale(${1 + 0.004 * f})`}>
          <path d={wobblyRect(-190, -330, 380, 660, f, 31, 2)} fill="#14161D" stroke={OUTLINE} strokeWidth={3} />
          <path d={wobblyRect(-166, -300, 332, 600, f, 32, 1.5)} fill={on > 0.5 ? '#2B5FA8' : '#0A0B10'} />
          {on > 0.5 && (
            <g transform={`translate(0 -150) scale(${pop})`}>
              <path d={wobblyRect(-140, -55, 280, 110, f, 33, 1.5)} fill="#EAF2FF" stroke={OUTLINE} strokeWidth={2} />
              <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={40} fill="#14161D">Skip today?</text>
              <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={400} fontSize={26} fill="#4A4E5A">the couch is free</text>
            </g>
          )}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------- SHOT C (90f): the Shadow rises, Pip fights back, REP 3, Day 2 ----------
const ShotC: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const push = kf(f, [[0, 1], [58, 1.08]]);
  const shake = f >= 62 && f < 74 ? (74 - f) / 12 : 0;
  const sx = Math.sin(f * 7.7) * 14 * shake, sy = Math.cos(f * 6.3) * 10 * shake;
  const angry = kf(f, [[38, 0], [44, 1]]);
  const happy = kf(f, [[72, 0], [80, 1]]);
  const brow = (-16 * (1 - angry) + 22 * angry) * (1 - happy) + -10 * happy;
  const barY = kf(f, [[0, -150], [40, -126], [50, -126], [58, -105], [62, -340]], Easing.inOut(Easing.quad));
  const squash = kf(f, [[0, 0.04], [48, 0.04], [58, 0.15], [62, -0.16], [70, 0.04], [76, 0]]) + Math.sin(f * 0.08) * 0.015 * (1 - angry);
  const rise = spring({frame: f - 3, fps, config: {damping: 14, stiffness: 60}});
  const grow = kf(f, [[0, 1.25], [62, 1.3], [80, 0.72]]);
  const headband = f < 77 ? 0 : spring({frame: f - 77, fps, config: {damping: 7, stiffness: 240}});
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${push})`, transformOrigin: '960px 640px'}}>
        <Room frame={f + 105} lamp={1 + 0.02 * Math.sin(f * 0.9)} phone={1}>
          <ShadowSelf x={1215} y={F} frame={f} grow={grow} rise={rise} glow={kf(f, [[0, 1], [62, 1.2], [80, 0.5]])} lean={kf(f, [[0, 0], [40, -7], [62, -7], [70, 6], [85, 2]])} />
          <Pip x={PIP_X} y={F} frame={f} squash={squash} barY={barY}
            browL={brow} browR={brow} browY={-6 * (1 - angry) + 4 * angry - 8 * happy}
            mouth={-0.6 * (1 - angry) - 0.1 * angry + 0.8 * happy} mouthOpen={kf(f, [[59, 0], [62, 1], [70, 1], [74, 0]])}
            blink={blinkAt(f, 24)} look={kf(f, [[0, 0], [10, 6], [40, 6], [44, 0]])} headband={headband} />
        </Room>
      </AbsoluteFill>
      <ShadowLine text="You'll quit by Friday." frame={f} from={16} to={58} x={1340} y={330} />
      <HitFX frame={f} at={62} cx={PIP_X} cy={F - 340} />
      <RepPop text="REP 3!" frame={f} at={62} x={1210} y={430} size={110} />
      <DayCounter day={f < 77 ? 1 : 2} frame={f} changedAt={f < 77 ? -100 : 77} />
    </AbsoluteFill>
  );
};

// ---------- SHOT D (75f): title card (compressed for the test; real films use the full 12s) ----------
const WORD = 'STRONG';
const LETTER_START = 4, LETTER_GAP = 4;
const ShotD: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shown = Math.max(0, Math.min(WORD.length, Math.floor((f - LETTER_START) / LETTER_GAP) + 1));
  const draw = kf(f, [[26, 0], [42, 1]], Easing.out(Easing.cubic));
  const wave = Array.from({length: 61}, (_, i) => {
    const x = 640 + i * 10.67;
    const y = 632 + Math.sin(i * 0.55 + f * 0.18) * 9;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  const fadeIn = (a: number) => interpolate(f, [a, a + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const black = interpolate(f, [62, 75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: BG}}>
      <div style={{position: 'absolute', top: 360, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 220, color: 'white', letterSpacing: 8}}>
        {WORD.split('').map((ch, i) => {
          const s = i < shown ? spring({frame: f - (LETTER_START + i * LETTER_GAP), fps, config: {damping: 9, stiffness: 300}}) : 0;
          return <span key={i} style={{display: 'inline-block', transform: `scale(${s}) translateY(${(1 - s) * 30}px)`, opacity: i < shown ? 1 : 0}}>{ch}</span>;
        })}
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={wave} stroke={VIOLET} strokeWidth={10} strokeLinecap="round" fill="none" pathLength={1}
          strokeDasharray={1} strokeDashoffset={1 - draw} style={{filter: `drop-shadow(0 0 12px ${VIOLET})`}} />
      </svg>
      <div style={{position: 'absolute', top: 700, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 48, color: 'white', opacity: fadeIn(32)}}>
        Every rep is a fight.
      </div>
      <div style={{position: 'absolute', top: 775, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 36, color: VIOLET, opacity: fadeIn(42)}}>
        Day 2 tomorrow.
      </div>
      <AbsoluteFill style={{background: 'black', opacity: black}} />
    </AbsoluteFill>
  );
};

// ---------- SOUND (all synthesized in code: scripts/make-sfx.mjs) ----------
const S: React.FC<{at: number; file: string; vol?: number | ((f: number) => number)}> = ({at, file, vol = 1}) => (
  <Sequence from={at} layout="none"><Audio src={staticFile(`sfx/${file}.wav`)} volume={vol} /></Sequence>
);

const C = 135, D = 225;
export const TestFilm: React.FC = () => (
  <AbsoluteFill style={{background: 'black'}}>
    <Sequence durationInFrames={105}><ShotA /></Sequence>
    <Sequence from={105} durationInFrames={30}><ShotB /></Sequence>
    <Sequence from={C} durationInFrames={90}><ShotC /></Sequence>
    <Sequence from={D} durationInFrames={75}><ShotD /></Sequence>
    <Letterbox />

    <Sequence durationInFrames={D} layout="none"><Audio src={staticFile('sfx/room.wav')} volume={0.35} /></Sequence>
    <S at={8} file="click" vol={0.8} />
    <S at={14} file="pop1" vol={0.5} />
    <S at={60} file="whoosh" vol={0.35} />
    <S at={78} file="pop1" vol={0.7} />
    <S at={93} file="pop2" vol={0.7} />
    <S at={108} file="buzz" vol={0.8} />
    <S at={C + 2} file="whoosh_low" vol={0.8} />
    <S at={C + 2} file="drone" vol={(f) => interpolate(f, [0, 58, 64, 78], [0.9, 0.9, 0.35, 0], {extrapolateRight: 'clamp'})} />
    <S at={C + 58} file="whoosh" vol={0.45} />
    <S at={C + 62} file="impact" vol={0.7} />
    <S at={C + 62} file="pop3" vol={0.55} />
    <S at={C + 77} file="levelup" vol={0.6} />
    {WORD.split('').map((_, i) => <S key={i} at={D + LETTER_START + i * LETTER_GAP} file={`type${(i % 3) + 1}`} vol={0.6} />)}
    <S at={D + 26} file="chime" vol={0.55} />
  </AbsoluteFill>
);
