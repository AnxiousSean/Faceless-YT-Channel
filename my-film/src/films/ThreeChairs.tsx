import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '../components/fonts';
import {FilterDefs, Look, LookContext} from '../components/look';
import {PIXEL} from '../styles/looks';
import {DayCounter, Letterbox} from '../components/Overlay';
import {S1, S2, S3, S4, S5, S6, RUN_STEPS, RUN_STARTS} from './three-chairs/shots1';
import {S7, S8, S9, S10, S11, S12, S13, S14, S15, SLAM, WORD, LETTER_START, LETTER_GAP} from './three-chairs/shots2';

// "THREE CHAIRS" — a fable inspired by the first-ever three-way summit (Al Jazeera, Nov 2026).
// Three neighbours who have never sat at one table. 4500 frames = 2:30 @ 30fps.
export const THREE_CHAIRS_FRAMES = 4500;
const T = {s1: 0, s2: 240, s3: 480, s4: 660, s5: 960, s6: 1200, s7: 1560, s8: 1800, s9: 2100, s10: 2460, s11: 2700, s12: 3120, s13: 3480, s14: 3780, s15: 4140, end: 4500};

const SHOTS: [number, number, React.FC][] = [
  [T.s1, T.s2, S1], [T.s2, T.s3, S2], [T.s3, T.s4, S3], [T.s4, T.s5, S4], [T.s5, T.s6, S5], [T.s6, T.s7, S6], [T.s7, T.s8, S7],
  [T.s8, T.s9, S8], [T.s9, T.s10, S9], [T.s10, T.s11, S10], [T.s11, T.s12, S11], [T.s12, T.s13, S12], [T.s13, T.s14, S13], [T.s14, T.s15, S14], [T.s15, T.end, S15],
];

const Story: React.FC = () => {
  const g = useCurrentFrame();
  const day = g < 975 ? 1 : g < 1812 ? 2 : 3;
  const changedAt = day === 1 ? 20 : day === 2 ? 975 : 1812;
  return (
    <>
      {SHOTS.map(([a, b, Shot], i) => <Sequence key={i} from={a} durationInFrames={b - a}><Shot /></Sequence>)}
      {g >= 20 && g < T.s15 && <DayCounter day={day} frame={g} changedAt={changedAt} />}
    </>
  );
};

// ---------- SOUND (every waveform synthesized in scripts/make-sfx.mjs; the "hope" melody is composed there too) ----------
type Vol = number | ((f: number) => number);
const S: React.FC<{at: number; file: string; vol?: Vol}> = ({at, file, vol = 1}) => (
  <Sequence from={at} layout="none"><Audio src={staticFile(`sfx/${file}.wav`)} volume={vol} /></Sequence>
);
// The Shadows' drone, laid end to end (each copy fades in/out) across a span.
const droneSpan = (from: number, to: number, vol: number) => {
  const out: [number, string, Vol][] = [];
  for (let a = from; a < to - 30; a += 66) out.push([a, 'drone', vol]);
  return out;
};
const steps = (from: number, to: number, every: number, vol: number) => {
  const out: [number, string, Vol][] = [];
  for (let a = from; a < to; a += every) out.push([a, 'step', vol]);
  return out;
};

const CUES: [number, string, Vol][] = [
  // S1 courtyard: three lamps
  [14, 'click', 0.7], [32, 'click', 0.5], [48, 'click', 0.45],
  // S2 the Shadow at the window
  [T.s2 + 70, 'whoosh_low', 0.7], ...droneSpan(T.s2 + 70, T.s2 + 236, 0.7),
  // S3 writing the invitations
  [T.s3 + 12, 'scribble', 0.8], [T.s3 + 45, 'scribble', 0.8], [T.s3 + 80, 'scribble', 0.8], [T.s3 + 128, 'paper', 0.8],
  // S4 montage
  [T.s4 + 2, 'paper', 0.8], [T.s4 + 30, 'whoosh', 0.5], [T.s4 + 52, 'paper', 0.6], [T.s4 + 66, 'pop1', 0.3], [T.s4 + 96, 'pop1', 0.3],
  [T.s4 + 151, 'buzz', 0.8], [T.s4 + 155, 'pop1', 0.6], [T.s4 + 183, 'whoosh', 0.3], [T.s4 + 211, 'buzz', 0.8], [T.s4 + 215, 'pop2', 0.6],
  [T.s4 + 250, 'whoosh', 0.45], [T.s4 + 254, 'pop3', 0.65], [T.s4 + 272, 'step', 0.8],
  // S5 day 2, bow tie, one chair, run out
  [975, 'levelup', 0.6], [T.s5 + 44, 'levelup', 0.45], ...steps(T.s5 + 102, T.s5 + 116, 7, 0.5), [T.s5 + 146, 'pop1', 0.7],
  [T.s5 + 200, 'click', 0.5], [T.s5 + 212, 'whoosh', 0.5], ...steps(T.s5 + 212, T.s5 + 236, 6, 0.5),
  // S6 the run
  ...RUN_STEPS.map((t) => [T.s6 + t, 'step', 0.55] as [number, string, Vol]), ...RUN_STARTS.map((t) => [T.s6 + t, 'whoosh', 0.4] as [number, string, Vol]),
  [T.s6 + 110, 'whoosh', 0.35], [T.s6 + 114, 'pop2', 0.7], [T.s6 + 264, 'whoosh', 0.35], [T.s6 + 268, 'pop3', 0.7], [T.s6 + 268, 'levelup', 0.4],
  // S7 back home
  ...steps(T.s7 + 18, T.s7 + 86, 12, 0.35), [T.s7 + 88, 'step', 0.9], ...steps(T.s7 + 94, T.s7 + 130, 9, 0.4), [T.s7 + 150, 'whoosh_low', 0.35], [T.s7 + 150, 'drone', 0.3],
  // S8 day 3, the knock, the guests
  [1812, 'levelup', 0.6], [T.s8 + 60, 'knock', 0.9], ...steps(T.s8 + 66, T.s8 + 90, 8, 0.45), [T.s8 + 84, 'click', 0.6],
  ...steps(T.s8 + 104, T.s8 + 190, 15, 0.85), [T.s8 + 110, 'whoosh_low', 0.6], ...steps(T.s8 + 180, T.s8 + 244, 11, 0.3),
  [T.s8 + 186, 'whoosh_low', 0.4], ...droneSpan(T.s8 + 110, T.s8 + 300, 0.45), [T.s8 + 244, 'door', 0.7],
  // S9 sitting, agenda, the Shadows lean in
  [T.s9 + 24, 'step', 0.8], [T.s9 + 38, 'step', 0.9], [T.s9 + 52, 'step', 0.6], [T.s9 + 62, 'paper', 0.8],
  [T.s9 + 138, 'whoosh_low', 0.8], ...droneSpan(T.s9, T.s9 + 140, 0.4), ...droneSpan(T.s9 + 140, T.s10, 0.9),
  // S10 the slam
  [T.s10 + 4, 'whoosh', 0.45], [SLAM, 'impact', 0.8], [SLAM, 'pop3', 0.55], ...droneSpan(T.s10 + 20, T.s11, 0.9), [T.s10 + 96, 'chime', 0.2],
  // S11 soup
  ...droneSpan(T.s11, T.s11 + 300, 0.6), [T.s11 + 46, 'step', 0.6], ...steps(T.s11 + 60, T.s11 + 96, 9, 0.4), [T.s11 + 104, 'pour', 0.8],
  ...steps(T.s11 + 152, T.s11 + 196, 9, 0.4), [T.s11 + 210, 'clink', 0.7], [T.s11 + 226, 'clink', 0.7], [T.s11 + 242, 'clink', 0.7], [T.s11 + 272, 'step', 0.6],
  // S12 the caps
  ...droneSpan(T.s12, T.s12 + 250, 0.35), [T.s12 + 70, 'pop1', 0.7], [T.s12 + 140, 'pop2', 0.7], [T.s12 + 250, 'pop3', 0.75], [T.s12 + 254, 'whoosh_low', 0.4],
  [T.s12 + 312, 'levelup', 0.6], [T.s12 + 312, 'pop3', 0.5],
  // S13 goodbyes, door handle, the note
  [T.s13 + 18, 'click', 0.5], ...steps(T.s13 + 24, T.s13 + 88, 13, 0.5), [T.s13 + 86, 'door', 0.8], [T.s13 + 92, 'click', 0.6],
  ...steps(T.s13 + 160, T.s13 + 180, 9, 0.4), [T.s13 + 194, 'paper', 0.8], [T.s13 + 194, 'pop1', 0.4], ...steps(T.s13 + 214, T.s13 + 262, 10, 0.4),
  // S14 two blinks each
  [T.s14 + 36, 'click', 0.5], [T.s14 + 56, 'click', 0.45],
  [T.s14 + 100, 'click', 0.6], [T.s14 + 107, 'click', 0.6], [T.s14 + 116, 'click', 0.6], [T.s14 + 123, 'click', 0.6],
  [T.s14 + 144, 'click', 0.55], [T.s14 + 151, 'click', 0.55], [T.s14 + 160, 'click', 0.55], [T.s14 + 167, 'click', 0.55],
  [T.s14 + 176, 'pop2', 0.5],
  // S15 title card
  ...WORD.split('').map((_, i) => [T.s15 + LETTER_START + i * LETTER_GAP, `type${(i % 3) + 1}`, 0.6] as [number, string, Vol]),
  [T.s15 + 72, 'chime', 0.55],
];

const Soundtrack: React.FC = () => (
  <>
    <Sequence durationInFrames={T.s15} layout="none"><Audio src={staticFile('sfx/room.wav')} loop volume={0.35} /></Sequence>
    <Sequence from={T.s14 + 10} durationInFrames={T.end - T.s14 - 10} layout="none">
      <Audio src={staticFile('sfx/hope.wav')} volume={(f) => interpolate(f, [0, 20, T.s15 - T.s14 + 30, T.s15 - T.s14 + 110], [0, 0.55, 0.55, 0], {extrapolateRight: 'clamp'})} />
    </Sequence>
    {CUES.map(([at, file, vol], i) => <S key={i} at={at} file={file} vol={vol} />)}
  </>
);

export const ThreeChairs: React.FC<{look?: Look}> = ({look = PIXEL}) => {
  const frame = useCurrentFrame();
  return (
    <LookContext.Provider value={look}>
      <AbsoluteFill style={{background: look.bg}}>
        <FilterDefs />
        <AbsoluteFill style={{filter: look.frameFilter?.(frame)}}>
          <Story />
        </AbsoluteFill>
        <Letterbox />
        <Soundtrack />
      </AbsoluteFill>
    </LookContext.Provider>
  );
};
