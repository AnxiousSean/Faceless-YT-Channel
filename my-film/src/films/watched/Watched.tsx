import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile} from 'remotion';
import '../../components/fonts';
import {FilterDefs, Look, LookContext} from '../../components/look';
import {CHANNEL_LOOK} from '../../styles/looks';
import {Letterbox} from '../../components/Overlay';
import {S1, S2, S3, S4, S5, S6, S7, S8, S9, DOT_ON_S3, DOT_OFF_S5, MONTAGE, SCRUBS, EYES_AT} from './shots1';
import {S10, S11, S12, S13, S14, S15, S16, S17, S18, S19, CREAK_S10, S11_CUTS, SLAM_S12, TAPE_S13, TEXTS_S14, CALL_S15, REPLY_S15, CHIME_S16, CLOCK_S16, CAM2_S17, HEART_S17, SCARE_S19} from './shots2';
import {S20, S21, S22, S23, S24, TEXT_S21, SIRENS_S22, LAMP_OFF_S23, TV_BLINKS_S23, WORD, LETTER_START, LETTER_GAP, UNDERLINE_AT} from './shots3';

// Shot table (frames). Part 1 = shots 1-9 (0:00-1:18).
export const SHOTS1: [React.FC, number, number][] = [
  [S1, 0, 240], [S2, 240, 180], [S3, 420, 240], [S4, 660, 120], [S5, 780, 240],
  [S6, 1020, 300], [S7, 1320, 300], [S8, 1620, 360], [S9, 1980, 360],
];
export const WATCHED_PART1_FRAMES = 2340;
// Part 2 = shots 10-19 (1:18-2:55)
export const SHOTS2: [React.FC, number, number][] = [
  [S10, 2340, 300], [S11, 2640, 300], [S12, 2940, 300], [S13, 3240, 360], [S14, 3600, 240],
  [S15, 3840, 360], [S16, 4200, 300], [S17, 4500, 420], [S18, 4920, 240], [S19, 5160, 90],
];
// Part 3 = shots 20-24 (2:55-4:00)
export const SHOTS3: [React.FC, number, number][] = [[S20, 5250, 150], [S21, 5400, 480], [S22, 5880, 420], [S23, 6300, 540], [S24, 6840, 360]];
export const WATCHED_FRAMES = 7200; // 4:00

const Sfx: React.FC<{at: number; file: string; vol?: number | ((f: number) => number); dur?: number; loop?: boolean}> = ({at, file, vol = 1, dur, loop}) => (
  <Sequence from={at} durationInFrames={dur} layout="none"><Audio src={staticFile(`sfx/${file}.wav`)} volume={vol} loop={loop} /></Sequence>
);

const SoundPart1: React.FC = () => (
  <>
    <Sfx at={0} file="room" vol={0.4} dur={4960} loop />
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

const SoundPart2: React.FC = () => (
  <>
    <Sfx at={2340} file="drone" vol={0.35} dur={96} />
    <Sfx at={2340 + CREAK_S10} file="creak" vol={0.9} />
    {S11_CUTS.map(([t]) => <Sfx key={t} at={2640 + t} file="thud" vol={0.8} />)}
    <Sfx at={2640} file="drone" vol={(f) => interpolate(f, [0, 30, 270, 300], [0, 0.7, 0.8, 0.4], {extrapolateRight: 'clamp'})} dur={300} />
    <Sfx at={2940} file="drone" vol={(f) => interpolate(f, [0, 110, 120], [0.4, 0.5, 0], {extrapolateRight: 'clamp'})} dur={120} />
    <Sfx at={2940 + SLAM_S12} file="thud" vol={0.9} />
    <Sfx at={2940 + SLAM_S12} file="click" vol={0.7} />
    <Sfx at={3240 + 6} file="pop1" vol={0.35} />
    <Sfx at={3240 + TAPE_S13 - 14} file="tape" vol={0.9} />
    <Sfx at={3240 + 220} file="keys" vol={0.5} dur={140} loop />
    {TEXTS_S14.map((t) => <Sfx key={t} at={3600 + t} file="buzz" vol={0.8} />)}
    {TEXTS_S14.map((t) => <Sfx key={`p${t}`} at={3600 + t} file="pop2" vol={0.45} />)}
    <Sfx at={3600 + 110} file="drone" vol={(f) => interpolate(f, [0, 40], [0, 0.45], {extrapolateRight: 'clamp'})} dur={130} />
    <Sfx at={3840 + CALL_S15} file="ring" vol={0.6} dur={100} />
    <Sfx at={3840 + REPLY_S15} file="buzz" vol={0.6} />
    <Sfx at={3840 + REPLY_S15} file="pop1" vol={0.4} />
    <Sfx at={3840 + 300} file="step" vol={0.5} />
    <Sfx at={3840 + 330} file="step" vol={0.5} />
    <Sfx at={4200 + CHIME_S16} file="blip" vol={0.7} />
    <Sfx at={4200 + CHIME_S16} file="pop2" vol={0.5} />
    <Sfx at={4200 + CLOCK_S16} file="pop3" vol={0.5} />
    <Sfx at={4200 + CLOCK_S16} file="whoosh_low" vol={0.6} />
    <Sfx at={4200 + CLOCK_S16} file="drone" vol={(f) => interpolate(f, [0, 60], [0, 0.6], {extrapolateRight: 'clamp'})} dur={200} />
    <Sfx at={4500 + CAM2_S17} file="whoosh_low" vol={0.7} />
    <Sfx at={4500} file="drone" vol={(f) => interpolate(f, [0, 380, 420], [0.6, 0.9, 0.9], {extrapolateRight: 'clamp'})} dur={420} />
    <Sfx at={4500 + HEART_S17} file="heartbeat" vol={0.8} dur={120} />
    <Sfx at={4500 + HEART_S17 + 120} file="heartbeat" vol={0.9} dur={120} />
    <Sfx at={4500 + HEART_S17 + 240} file="heartbeat" vol={1} dur={120} />
    {/* 18: everything drops away; one creak in the silence */}
    <Sfx at={4920} file="drone" vol={(f) => interpolate(f, [0, 40], [0.9, 0], {extrapolateRight: 'clamp'})} dur={40} />
    <Sfx at={4920 + 80} file="creak" vol={0.5} />
    {/* 19: the scare */}
    <Sfx at={5160 + SCARE_S19} file="impact" vol={0.8} />
    <Sfx at={5160 + SCARE_S19} file="whoosh" vol={0.6} />
    <Sfx at={5160 + SCARE_S19 + 8} file="slam" vol={0.6} />
  </>
);

const SoundPart3: React.FC = () => (
  <>
    {/* 20: running, door, engine, all in the dark */}
    {[5262, 5270, 5278, 5286, 5294, 5302].map((t) => <Sfx key={t} at={t} file="step" vol={0.7} />)}
    <Sfx at={5312} file="slam" vol={0.7} />
    <Sfx at={5330} file="engine" vol={0.7} dur={70} />
    {/* 21: the drive */}
    <Sfx at={5400} file="engine" vol={0.55} dur={480} loop />
    <Sfx at={5400} file="room" vol={0.25} dur={480} loop />
    <Sfx at={5400 + 8} file="pop1" vol={0.35} />
    <Sfx at={5400 + TEXT_S21} file="buzz" vol={0.8} />
    <Sfx at={5400 + TEXT_S21} file="pop2" vol={0.5} />
    <Sfx at={5400 + TEXT_S21} file="drone" vol={(f) => interpolate(f, [0, 30, 160, 190], [0, 0.7, 0.7, 0], {extrapolateRight: 'clamp'})} dur={190} />
    {/* 22: police, the hatch */}
    {SIRENS_S22.map((t) => <Sfx key={t} at={5880 + t} file="siren" vol={0.45} />)}
    <Sfx at={5880 + 6} file="pop1" vol={0.35} />
    <Sfx at={5880} file="room" vol={0.3} dur={420} loop />
    <Sfx at={5880 + 140 + 20} file="creak" vol={0.6} />
    <Sfx at={5880 + 140 + 50} file="whoosh_low" vol={0.6} />
    <Sfx at={5880 + 140 + 50} file="drone" vol={(f) => interpolate(f, [0, 40, 200, 230], [0, 0.6, 0.6, 0], {extrapolateRight: 'clamp'})} dur={230} />
    {/* 23: Jess's place */}
    <Sfx at={6300} file="room" vol={0.35} dur={540} loop />
    <Sfx at={6300 + 6} file="pop1" vol={0.3} />
    {[20, 36, 52, 68, 84, 212, 228, 244, 330, 346, 362, 378, 394].map((t) => <Sfx key={t} at={6300 + t} file="step" vol={0.4} />)}
    <Sfx at={6300 + 104} file="paper" vol={0.6} />
    <Sfx at={6300 + LAMP_OFF_S23} file="click" vol={0.8} />
    {TV_BLINKS_S23.map((t) => <Sfx key={t} at={6300 + t} file="blip" vol={0.25} />)}
    <Sfx at={6300 + TV_BLINKS_S23[0] - 10} file="drone" vol={(f) => interpolate(f, [0, 40, 110, 130], [0, 0.6, 0.6, 0], {extrapolateRight: 'clamp'})} dur={130} />
    {/* 24: title */}
    {WORD.split('').map((_, i) => <Sfx key={i} at={6840 + LETTER_START + i * LETTER_GAP} file={`type${(i % 3) + 1}`} vol={0.6} />)}
    <Sfx at={6840 + UNDERLINE_AT} file="chime" vol={0.55} />
  </>
);

export const Watched: React.FC<{look?: Look}> = ({look = CHANNEL_LOOK}) => {
  const Post = look.Post;
  return (
    <LookContext.Provider value={look}>
      <AbsoluteFill style={{background: look.bg}}>
        <FilterDefs />
        {[...SHOTS1, ...SHOTS2, ...SHOTS3].map(([C, from, dur], i) => <Sequence key={i} from={from} durationInFrames={dur}><C /></Sequence>)}
        {Post && <PostLayer Post={Post} />}
        <Letterbox />
        <SoundPart1 />
        <SoundPart2 />
        <SoundPart3 />
      </AbsoluteFill>
    </LookContext.Provider>
  );
};
import {useCurrentFrame} from 'remotion';
const PostLayer: React.FC<{Post: React.FC<{frame: number}>}> = ({Post}) => { const f = useCurrentFrame(); return <Post frame={f} />; };
