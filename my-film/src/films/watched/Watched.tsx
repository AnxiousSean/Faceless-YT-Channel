import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import '../../components/fonts';
import {FilterDefs, Look, LookContext} from '../../components/look';
import {CHANNEL_LOOK} from '../../styles/looks';
import {Letterbox} from '../../components/Overlay';
import {S1, S2, S3, S4, S5, S6, S7, S8, S9, DOT_ON_S3, DOT_OFF_S5, MONTAGE, SCRUBS, EYES_AT} from './shots1';

// Shot table (frames). Part 1 = shots 1-9 (0:00-1:18).
export const SHOTS1: [React.FC, number, number][] = [
  [S1, 0, 240], [S2, 240, 180], [S3, 420, 240], [S4, 660, 120], [S5, 780, 240],
  [S6, 1020, 300], [S7, 1320, 300], [S8, 1620, 360], [S9, 1980, 360],
];
export const WATCHED_PART1_FRAMES = 2340;

const Sfx: React.FC<{at: number; file: string; vol?: number | ((f: number) => number); dur?: number; loop?: boolean}> = ({at, file, vol = 1, dur, loop}) => (
  <Sequence from={at} durationInFrames={dur} layout="none"><Audio src={staticFile(`sfx/${file}.wav`)} volume={vol} loop={loop} /></Sequence>
);

const SoundPart1: React.FC = () => (
  <>
    <Sfx at={0} file="room" vol={0.4} dur={WATCHED_PART1_FRAMES} loop />
    {/* typing */}
    <Sfx at={0} file="keys" vol={0.5} dur={336} loop />
    <Sfx at={780 + 145} file="keys" vol={0.5} dur={95} loop />
    {/* clock pops */}
    {[10, 780 + 130, 1020, 1020 + 90, 1320 + 6].map((t) => <Sfx key={t} at={t} file="pop1" vol={0.35} />)}
    {/* fridge, webcam blips */}
    <Sfx at={420 + 108} file="fridge" vol={0.6} dur={132} />
    <Sfx at={780} file="fridge" vol={(f) => interpolate(f, [0, 14], [0.4, 0], {extrapolateRight: 'clamp'})} dur={16} />
    <Sfx at={420 + DOT_ON_S3} file="blip" vol={0.6} />
    <Sfx at={780 + DOT_OFF_S5} file="blip" vol={0.3} />
    {MONTAGE.blips.map((t) => <Sfx key={t} at={1020 + t} file="blip" vol={0.6} />)}
    {/* dread */}
    <Sfx at={660} file="drone" vol={(f) => interpolate(f, [0, 30, 90, 120], [0, 0.5, 0.5, 0], {extrapolateRight: 'clamp'})} dur={120} />
    <Sfx at={1320 + 60} file="drone" vol={(f) => interpolate(f, [0, 40, 80, 120], [0, 0.35, 0.35, 0], {extrapolateRight: 'clamp'})} dur={120} />
    <Sfx at={1320 + 200} file="pop2" vol={0.6} />
    {SCRUBS.slice(1).map(([t]) => <Sfx key={t} at={1620 + t} file="pop1" vol={0.25} />)}
    <Sfx at={1980 + EYES_AT} file="whoosh_low" vol={0.7} />
    <Sfx at={1980 + EYES_AT} file="drone" vol={(f) => interpolate(f, [0, 20, 150, 200], [0, 0.9, 0.9, 0.2], {extrapolateRight: 'clamp'})} dur={300} />
    <Sfx at={1980 + 95} file="heartbeat" vol={0.7} dur={110} />
  </>
);

export const WatchedPart1: React.FC<{look?: Look}> = ({look = CHANNEL_LOOK}) => {
  const Post = look.Post;
  return (
    <LookContext.Provider value={look}>
      <AbsoluteFill style={{background: look.bg}}>
        <FilterDefs />
        {SHOTS1.map(([C, from, dur], i) => <Sequence key={i} from={from} durationInFrames={dur}><C /></Sequence>)}
        {Post && <PostLayer Post={Post} />}
        <Letterbox />
        <SoundPart1 />
      </AbsoluteFill>
    </LookContext.Provider>
  );
};
import {useCurrentFrame} from 'remotion';
const PostLayer: React.FC<{Post: React.FC<{frame: number}>}> = ({Post}) => { const f = useCurrentFrame(); return <Post frame={f} />; };
