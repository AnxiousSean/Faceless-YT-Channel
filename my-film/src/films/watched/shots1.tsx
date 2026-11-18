import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HudClock, Narrator, Notify} from '../../components/Overlay';
import {blinkAt} from '../../components/anim';
import {AP, Apartment, CamApp, CamFeed, ChatApp, LaptopScreen, WebcamClose, F, SIT_Y, ease, lin, theoPose} from './kit';

const HEAD = {x: AP.chairX, y: SIT_Y - 205};
const walkPhase = (x: number) => x * 0.05;

// 1 · 0:00–0:08 — Theo works nights. Only the laptop lights the room.
export const S1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Apartment frame={f} theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 1, blink: blinkAt(f, 70, 180), browL: -4, browR: -4, mouth: -0.1})} />
      <HudClock label="11:48 PM" frame={f} changedAt={10} />
      <Narrator text="Theo works nights. From home. Alone." frame={f} from={24} to={210} />
    </AbsoluteFill>
  );
};

// 2 · 0:08–0:14 — Close-up: the work chat, and a little CAM 1 icon. Back to Theo: a big yawn.
export const S2: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 96) {
    return (
      <AbsoluteFill>
        <LaptopScreen frame={f} push={1 + 0.0005 * f}><ChatApp frame={f + 240} camIcon={0.8 + 0.2 * Math.sin(f * 0.15)} /></LaptopScreen>
      </AbsoluteFill>
    );
  }
  const g = f - 96;
  const yawn = Math.sin(Math.PI * lin(g, 8, 62));
  return (
    <AbsoluteFill>
      <Apartment frame={f + 240} theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 1 - yawn, squash: -0.07 * yawn, mouthOpen: yawn,
        blink: Math.max(yawn, blinkAt(g, 70)), browL: -10 * yawn, browR: -10 * yawn, browY: -6 * yawn,
        handL: [140 - 270 * yawn, -115 - 200 * yawn], handR: [178 - 50 * yawn, -113 - 215 * yawn]})} />
      <HudClock label="11:48 PM" frame={f} changedAt={-1} />
    </AbsoluteFill>
  );
};

// 3 · 0:14–0:22 — Theo goes to the fridge. Behind him, the webcam light blinks on.
export const DOT_ON_S3 = 130;
export const S3: React.FC = () => {
  const f = useCurrentFrame();
  const sit = 1 - ease(f, 4, 22);
  const x = AP.chairX + (1560 - AP.chairX) * ease(f, 20, 108);
  const moving = f > 22 && f < 106 ? 1 : 0;
  return (
    <AbsoluteFill>
      <Apartment frame={f + 420} fridge={ease(f, 108, 124)} dot={f >= DOT_ON_S3 ? 1 : 0}
        theo={theoPose(f, {x, sit, walk: walkPhase(x), walkAmt: moving, look: 6, blink: blinkAt(f, 60, 190), mouth: 0.1})} />
      <HudClock label="11:48 PM" frame={f} changedAt={-1} />
    </AbsoluteFill>
  );
};

// 4 · 0:22–0:26 — Hard cut: the webcam lens, its light glowing red.
export const S4: React.FC = () => {
  const f = useCurrentFrame();
  return <WebcamClose frame={f} dot={0.92 + 0.08 * Math.sin(f * 0.4)} push={1 + 0.0006 * f} />;
};

// 5 · 0:26–0:34 — Theo comes back. The light is off again. 2:05 AM.
export const DOT_OFF_S5 = 70;
export const S5: React.FC = () => {
  const f = useCurrentFrame();
  const x = 1560 + (AP.chairX - 1560) * ease(f, 14, 100);
  const sit = ease(f, 98, 118);
  const moving = f > 16 && f < 98 ? 1 : 0;
  return (
    <AbsoluteFill>
      <Apartment frame={f + 660} fridge={1 - ease(f, 0, 14)} dot={f < DOT_OFF_S5 ? 1 : 0}
        theo={theoPose(f, {x, sit, walk: walkPhase(x), walkAmt: moving, typing: lin(f, 140, 150), look: f < 100 ? -6 : 6, blink: blinkAt(f, 40, 180), mouth: 0.1})} />
      <HudClock label={f < 130 ? '11:48 PM' : '2:05 AM'} frame={f} changedAt={130} />
    </AbsoluteFill>
  );
};

// 6 · 0:34–0:44 — Montage: night after night, the light comes on only when he leaves.
export const MONTAGE = {cut: 30, blips: [20, 34, 112, 124, 214]};
export const S6: React.FC = () => {
  const f = useCurrentFrame();
  const sub = Math.floor(f / 30);
  const g = f - sub * 30;
  const night = sub < 3 ? 'NIGHT 2' : 'NIGHT 3';
  const clock = <HudClock label={night} frame={f} changedAt={sub < 3 ? 0 : 90} />;
  const narr = <Narrator text="The light only came on when he left." frame={f} from={30} to={285} />;
  const wide = (theo: Parameters<typeof theoPose>[1], dot: number, fridge = 0, push?: {s: number; ox: number; oy: number}) => (
    <AbsoluteFill>
      <Apartment frame={f + 780} theo={theoPose(f, theo)} dot={dot} fridge={fridge} push={push} />
      {clock}{narr}
    </AbsoluteFill>
  );
  if (sub === 1 || sub === 4 || sub === 7) {
    return <AbsoluteFill><WebcamClose frame={f} dot={g < 4 ? 0 : 1} push={1 + 0.002 * g} />{narr}</AbsoluteFill>;
  }
  if (sub === 0) { const x = 1000 + 260 * lin(g, 0, 30); return wide({x, sit: 0, walk: walkPhase(x), walkAmt: 1}, g >= 20 ? 1 : 0); }
  if (sub === 2) return wide({x: AP.chairX, sit: 1, typing: 1, browL: -8, browR: -8, browY: -4 * lin(g, 8, 16)}, 0);
  if (sub === 3) { const x = 700 - 330 * lin(g, 0, 30); return wide({x, sit: 0, walk: walkPhase(x), walkAmt: 1, look: -6}, g >= 22 ? 1 : 0); }
  if (sub === 5) return wide({x: AP.chairX, sit: 1, typing: 0.4, browL: 10, browR: 10, browY: 2}, 0);
  if (sub === 6) return wide({x: 1560, sit: 0, look: 6}, 1, 1);
  if (sub === 8) return wide({x: AP.chairX, sit: 1, typing: 0, browL: -12, browR: -12, browY: -6, mouth: -0.4}, 0);
  return wide({x: AP.chairX, sit: 1, typing: 0, browL: -14, browR: -14, browY: -8, mouth: -0.5, blink: blinkAt(g, 12)}, 0, 0,
    {s: 1 + 0.25 * ease(g, 0, 30), ox: HEAD.x + 60, oy: HEAD.y});
};

// 7 · 0:44–0:54 — NIGHT 4. The screen sleeps; in the black glass, the red dot. 37 new recordings.
export const S7: React.FC = () => {
  const f = useCurrentFrame();
  const clock = <HudClock label="NIGHT 4" frame={f} changedAt={6} />;
  if (f < 120) {
    return (
      <AbsoluteFill>
        <LaptopScreen frame={f} on={1 - lin(f, 30, 50)} reflect={lin(f, 55, 85)} dot={f > 60 ? 1 : 0}><ChatApp frame={f + 1320} /></LaptopScreen>
        {clock}
      </AbsoluteFill>
    );
  }
  if (f < 180) {
    const g = f - 120;
    const shock = ease(g, 6, 16);
    return (
      <AbsoluteFill>
        <Apartment frame={f + 1320} screen={0.12} dot={1} push={{s: 1.9, ox: HEAD.x + 80, oy: HEAD.y + 40}}
          theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 0, browL: -18 * shock, browR: -18 * shock, browY: -12 * shock, mouth: -0.2, mouthOpen: 0.35 * shock, squash: -0.04 * shock})} />
        {clock}
      </AbsoluteFill>
    );
  }
  const g = f - 180;
  return (
    <AbsoluteFill>
      <LaptopScreen frame={f} on={lin(g, 0, 8)} dot={1}>
        <CamApp frame={f} selected={1} label="Select a recording">
          <AbsoluteFill style={{background: '#000'}} />
        </CamApp>
      </LaptopScreen>
      <Notify frame={f} at={200} until={300} x={1100} y={170} title="CAM 1" body="37 new recordings" accent icon="●" />
      {clock}
    </AbsoluteFill>
  );
};

// 8 · 0:54–1:06 — Clip 1: his empty chair, the black hallway. Nothing. He scrubs through.
export const SCRUBS: [number, number, string][] = [[0, 1, 'NIGHT 1 · 02:03'], [200, 2, 'NIGHT 1 · 02:41'], [236, 5, 'NIGHT 1 · 04:10'], [266, 9, 'NIGHT 2 · 01:15'], [296, 12, 'NIGHT 2 · 02:20'], [326, 14, 'NIGHT 2 · 02:47']];
const clipAt = (f: number) => [...SCRUBS].reverse().find(([at]) => f >= at)!;
const secs = (f: number) => String(Math.floor(f / 30) % 60).padStart(2, '0');
export const S8: React.FC = () => {
  const f = useCurrentFrame();
  const [at, n, stamp] = clipAt(f);
  return (
    <AbsoluteFill>
      <LaptopScreen frame={f} push={1 + 0.08 * ease(f, 0, 360)} dot={0}>
        <CamApp frame={f} selected={n} label={`clip_${String(n).padStart(3, '0')}.mp4`} progress={lin(f - at, 0, 360)}>
          <CamFeed frame={f} w={1000} h={560} stamp={`${stamp}:${secs(f - at)}`} />
        </CamApp>
      </LaptopScreen>
      <HudClock label="NIGHT 4" frame={f} changedAt={-1} />
    </AbsoluteFill>
  );
};

// 9 · 1:06–1:18 — Clip 14: deep in the hallway, two red slits blink once. Theo freezes. Back: gone.
export const EYES_AT = 34;
export const S9: React.FC = () => {
  const f = useCurrentFrame();
  const clock = <HudClock label="NIGHT 4" frame={f} changedAt={-1} />;
  if (f < 90 || f >= 200) {
    const eyes = f < 90 ? lin(f, EYES_AT, EYES_AT + 8) : 0;
    const blink = f < 90 ? Math.max(0, Math.sin(Math.PI * lin(f, 58, 66))) : 0;
    return (
      <AbsoluteFill>
        <LaptopScreen frame={f} push={1.08 + 0.04 * lin(f, 0, 360)} dot={0}>
          <CamApp frame={f} selected={14} label="clip_014.mp4" progress={0.1 + 0.6 * lin(f, 0, 360)}>
            <CamFeed frame={f} w={1000} h={560} stamp={`NIGHT 2 · 02:47:${secs(f + 300)}`} eyes={eyes} blink={blink} watcherX={0.35} />
          </CamApp>
        </LaptopScreen>
        {clock}
      </AbsoluteFill>
    );
  }
  const g = f - 90;
  const climb = ease(g, 0, 100);
  return (
    <AbsoluteFill>
      <Apartment frame={f + 1980} screen={0.9} push={{s: 2.2 + 0.25 * climb, ox: HEAD.x + 80, oy: HEAD.y + 30}}
        theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 0, browL: -14 - 8 * climb, browR: -14 - 8 * climb, browY: -6 - 8 * climb,
          mouth: -0.3, mouthOpen: 0.25, blink: blinkAt(g, 80), squash: 0})} />
      {clock}
    </AbsoluteFill>
  );
};
export {F};
