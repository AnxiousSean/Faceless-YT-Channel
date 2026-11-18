import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useLook} from '../../components/look';
import {HudClock, Narrator, Notify, Speech} from '../../components/Overlay';
import {blinkAt} from '../../components/anim';
import {ShadowSelf} from '../../components/ShadowSelf';
import {AP, Apartment, Beam, CamApp, CamFeed, LaptopScreen, WebcamClose, F, SIT_Y, ease, lin, theoPose, clamp01} from './kit';

const HEAD = {x: AP.chairX, y: SIT_Y - 205};
const secs = (f: number) => String(Math.floor(f / 30) % 60).padStart(2, '0');
const hand = (x: number, y: number, h: [number, number]) => ({x: x + h[0], y: y + h[1]});

// 10 · 1:18–1:28 — He turns to the real hallway. Phone flashlight sweeps: coats, closet, ceiling. Nothing. A creak.
export const CREAK_S10 = 210;
export const S10: React.FC = () => {
  const f = useCurrentFrame();
  const turn = ease(f, 0, 30);
  const on = lin(f, 40, 46);
  const hL: [number, number] = [140 - 230 * turn, -115 - 70 * turn];
  const p = hand(AP.chairX, SIT_Y, hL);
  // beam end sweeps: coats -> closet -> ceiling -> back to the closet door
  const kx = [[50, 210], [110, 360], [160, 330], [200, 380], [240, 260], [300, 300]] as const;
  const ky = [[50, 560], [110, 640], [160, 360], [200, 340], [240, 600], [300, 560]] as const;
  const pick = (keys: readonly (readonly [number, number])[]) => {
    for (let i = 0; i < keys.length - 1; i++) if (f <= keys[i + 1][0]) return keys[i][1] + (keys[i + 1][1] - keys[i][1]) * ease(f, keys[i][0], keys[i + 1][0]);
    return keys[keys.length - 1][1];
  };
  const beam: Beam | null = on > 0 ? {x0: p.x - 10, y0: p.y, x1: pick(kx), y1: pick(ky), spread: 90} : null;
  const startle = f > CREAK_S10 ? ease(f, CREAK_S10, CREAK_S10 + 8) : 0;
  return (
    <AbsoluteFill>
      <Apartment frame={f + 2340} screen={0.9} beam={beam} phone={{...p, on}}
        theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 0, look: 6 - 12 * turn, handL: hL,
          browL: -14 - 6 * startle, browR: -14 - 6 * startle, browY: -6 - 6 * startle, mouth: -0.3, mouthOpen: 0.3 * startle, squash: -0.05 * startle, blink: blinkAt(f, 130)})} />
      <HudClock label="NIGHT 4" frame={f} changedAt={-1} />
    </AbsoluteFill>
  );
};

// 11 · 1:28–1:38 — Clips 30, 31, 32: each night the figure is one step closer to the chair.
export const S11_CUTS: [number, number, number, string][] = [[0, 30, 0.35, 'NIGHT 3 · 02:12'], [90, 31, 0.6, 'NIGHT 3 · 03:40'], [180, 32, 0.9, 'NIGHT 4 · 01:58']];
export const S11: React.FC = () => {
  const f = useCurrentFrame();
  const clip = [...S11_CUTS].reverse().find(([at]) => f >= at)!;
  const [at, n, step, stamp] = clip;
  const g = f - at;
  const reaction = (at === 0 || at === 90) && g >= 60;
  if (reaction) {
    const k = at === 0 ? 0 : 1;
    return (
      <AbsoluteFill>
        <Apartment frame={f + 2640} screen={0.9} push={{s: 2.3 + 0.2 * k, ox: HEAD.x + 80, oy: HEAD.y + 30}}
          theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 0, browL: -18 - 4 * k, browR: -18 - 4 * k, browY: -10 - 4 * k, mouth: -0.5, mouthOpen: 0.2 + 0.2 * k})} />
        <HudClock label="NIGHT 4" frame={f} changedAt={-1} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <LaptopScreen frame={f} push={1.1 + 0.06 * (step - 0.35)} dot={0}>
        <CamApp frame={f} selected={n} label={`clip_${String(n).padStart(3, '0')}.mp4`} progress={lin(g, 0, 120)}>
          <CamFeed frame={f} w={1000} h={560} stamp={`${stamp}:${secs(g)}`} watcher={step} watcherX={0.25 + 0.5 * step} />
        </CamApp>
      </LaptopScreen>
      <HudClock label="NIGHT 4" frame={f} changedAt={-1} />
    </AbsoluteFill>
  );
};

// 12 · 1:38–1:48 — "Every night, it came one step closer." He slams the laptop shut. Only his phone lights his face.
export const SLAM_S12 = 120;
export const S12: React.FC = () => {
  const f = useCurrentFrame();
  const lid = 1 - ease(f, SLAM_S12 - 6, SLAM_S12);
  const hR: [number, number] = f < SLAM_S12 - 20 ? [178, -113] : [178 + 20 * lin(f, SLAM_S12 - 20, SLAM_S12 - 6), -240 + 125 * lin(f, SLAM_S12 - 6, SLAM_S12)];
  const hL: [number, number] = f < SLAM_S12 + 30 ? [100, -120] : [70 - 10 * lin(f, SLAM_S12 + 30, SLAM_S12 + 50), -120 - 60 * lin(f, SLAM_S12 + 30, SLAM_S12 + 50)];
  const phoneOn = lin(f, SLAM_S12 + 40, SLAM_S12 + 50);
  const p = hand(AP.chairX, SIT_Y, hL);
  const jolt = f >= SLAM_S12 && f < SLAM_S12 + 10 ? (SLAM_S12 + 10 - f) / 10 : 0;
  return (
    <AbsoluteFill style={{transform: `translate(${Math.sin(f * 7) * 6 * jolt}px, ${Math.cos(f * 5) * 4 * jolt}px)`}}>
      <Apartment frame={f + 2940} screen={1} lid={lid} dark={f > SLAM_S12 ? 0.74 : 0.62} phone={f > SLAM_S12 + 30 ? {...p, on: phoneOn} : null}
        theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 0, handL: hL, handR: hR, look: f > SLAM_S12 + 40 ? 0 : 6,
          browL: f < SLAM_S12 - 20 ? -16 : 18, browR: f < SLAM_S12 - 20 ? -16 : 18, browY: f < SLAM_S12 - 20 ? -8 : 4, mouth: -0.6,
          squash: 0.06 * jolt, blink: blinkAt(f, 220)})} />
      <HudClock label="NIGHT 4" frame={f} changedAt={-1} />
      <Narrator text="Every night, it came one step closer." frame={f} from={10} to={110} />
    </AbsoluteFill>
  );
};

// 13 · 1:48–2:00 — NIGHT 5. Tape over the webcam. Relief. Back to work.
export const TAPE_S13 = 120;
export const S13: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 200) {
    return (
      <AbsoluteFill>
        <WebcamClose frame={f} dot={0} tape={ease(f, TAPE_S13 - 14, TAPE_S13)} push={1 + 0.0004 * f} />
        <HudClock label="NIGHT 5" frame={f} changedAt={6} />
      </AbsoluteFill>
    );
  }
  const g = f - 200;
  return (
    <AbsoluteFill>
      <Apartment frame={f + 3240} theo={theoPose(f, {x: AP.chairX, sit: 1, typing: lin(g, 20, 30), browL: 6, browR: 6, browY: 2, mouth: 0.3, blink: blinkAt(g, 50, 130)})} />
      <HudClock label="NIGHT 5" frame={f} changedAt={-1} />
    </AbsoluteFill>
  );
};

// 14 · 2:00–2:08 — Unknown: "Don't cover it." / "I like watching you work."
export const TEXTS_S14 = [24, 110];
export const S14: React.FC = () => {
  const f = useCurrentFrame();
  const shock1 = ease(f, TEXTS_S14[0] + 6, TEXTS_S14[0] + 14);
  const shock2 = ease(f, TEXTS_S14[1] + 6, TEXTS_S14[1] + 12);
  const phonePos = {x: AP.desk.x + 230, y: AP.desk.top - 6};
  return (
    <AbsoluteFill>
      <Apartment frame={f + 3600} phone={{...phonePos, on: f > TEXTS_S14[0] ? 1 : 0}} push={{s: 1 + 0.08 * ease(f, 0, 240), ox: HEAD.x + 100, oy: HEAD.y}}
        theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 1 - shock1, look: 6,
          browL: -16 * shock1 - 6 * shock2, browR: -16 * shock1 - 6 * shock2, browY: -8 * shock1 - 6 * shock2, mouth: -0.3 * shock1, mouthOpen: shock2 * 0.9, squash: -0.05 * shock2})} />
      <HudClock label="NIGHT 5" frame={f} changedAt={-1} />
      <Notify frame={f} at={TEXTS_S14[0]} until={240} x={1230} y={150} title="Unknown" body="Don't cover it." accent icon="✉" w={560} />
      <Notify frame={f} at={TEXTS_S14[1]} until={240} x={1230} y={300} title="Unknown" body="I like watching you work." accent icon="✉" w={560} />
    </AbsoluteFill>
  );
};

// 15 · 2:08–2:20 — He calls Jess. "Can I stay at yours tonight?" "Come now. Porch light's on." Grabs his bag.
export const CALL_S15 = 10, REPLY_S15 = 230;
export const S15: React.FC = () => {
  const f = useCurrentFrame();
  const stand = ease(f, 290, 320);
  const hL: [number, number] = f < 220 ? [-62, -205] : [-58, -40];
  const p = hand(AP.chairX, SIT_Y, hL);
  const x = AP.chairX - 120 * ease(f, 320, 360);
  return (
    <AbsoluteFill>
      <Apartment frame={f + 3840} phone={f < 220 ? {...p, on: 1} : null}
        theo={theoPose(f, {x, sit: 1 - stand, typing: 0, look: f < 290 ? 0 : -6, handL: f < 220 ? hL : undefined,
          walk: x * 0.05, walkAmt: f > 322 ? 1 : 0,
          browL: -14, browR: -14, browY: -6, mouth: f > REPLY_S15 + 10 ? -0.1 : -0.4, blink: blinkAt(f, 150, 280)})} />
      <HudClock label="NIGHT 5" frame={f} changedAt={-1} />
      <Notify frame={f} at={CALL_S15} until={115} x={1230} y={150} title="Calling Jess…" icon="☎" w={460} />
      <Speech text="Can I stay at yours tonight?" frame={f} from={120} to={225} x={AP.chairX - 200} y={300} />
      <Notify frame={f} at={REPLY_S15} until={360} x={1230} y={150} title="Jess" body="Come now. Porch light's on." icon="✉" w={560} />
    </AbsoluteFill>
  );
};

// 16 · 2:20–2:30 — Reaching to close the laptop: "1 new recording – 3:12 AM". The clock pops: it's 3:12 now.
export const CHIME_S16 = 46, CLOCK_S16 = 100;
export const S16: React.FC = () => {
  const f = useCurrentFrame();
  const sit = ease(f, 6, 30);
  const x = AP.chairX - 120 + 120 * ease(f, 0, 26);
  const shock = ease(f, CLOCK_S16 + 4, CLOCK_S16 + 14);
  return (
    <AbsoluteFill>
      <Apartment frame={f + 4200} push={{s: 1 + 0.15 * ease(f, 40, 300), ox: HEAD.x + 120, oy: HEAD.y + 60}}
        theo={theoPose(f, {x, sit, typing: 0, look: 6, walk: x * 0.05, walkAmt: f < 24 ? 1 : 0,
          handR: [178, -113 - 20 * lin(f, 30, 40)],
          browL: -10 - 12 * shock, browR: -10 - 12 * shock, browY: -4 - 10 * shock, mouth: -0.3, mouthOpen: 0.3 * shock, blink: blinkAt(f, 70)})} />
      <HudClock label={f < CLOCK_S16 ? 'NIGHT 5' : '3:12 AM'} frame={f} changedAt={CLOCK_S16} />
      <Notify frame={f} at={CHIME_S16} until={300} x={1230} y={150} title="CAM 1" body="1 new recording – 3:12 AM" accent icon="●" w={600} />
    </AbsoluteFill>
  );
};

// 17 · 2:30–2:44 — CAM 2 connected. LIVE. The feed shows the back of Theo's own head, drifting closer.
export const CAM2_S17 = 12, HEART_S17 = 60;
export const S17: React.FC = () => {
  const f = useCurrentFrame();
  const feed = (zoom: number) => (
    <AbsoluteFill>
      <LaptopScreen frame={f} push={1.06 + 0.05 * lin(f, 0, 420)} dot={0}>
        <CamApp frame={f} selected={38} count={38} label="CAM 2 · live" progress={1}>
          <CamFeed frame={f} w={1000} h={560} stamp={`3:12:${secs(f + 120)} AM`} live theoBack zoom={zoom} />
        </CamApp>
      </LaptopScreen>
      <HudClock label="3:12 AM" frame={f} changedAt={-1} />
      <Notify frame={f} at={CAM2_S17} until={200} x={1180} y={170} title="CAM 2 connected" accent icon="●" w={480} />
    </AbsoluteFill>
  );
  if (f < 220) return feed(1 + 0.12 * ease(f, 30, 220));
  if (f < 320) {
    const g = f - 220;
    return (
      <AbsoluteFill>
        <Apartment frame={f + 4500} push={{s: 2.4 + 0.3 * ease(g, 0, 100), ox: HEAD.x + 80, oy: HEAD.y + 30}}
          theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 0, look: 6, browL: -22, browR: -22, browY: -14, mouth: -0.4, mouthOpen: 0.15, squash: 0})} />
        <HudClock label="3:12 AM" frame={f} changedAt={-1} />
      </AbsoluteFill>
    );
  }
  return feed(1.12 + 0.1 * ease(f, 320, 420));
};

// 18 · 2:44–2:52 — On the live feed a long black arm reaches for his shoulder. He doesn't move. Silence.
export const S18: React.FC = () => {
  const f = useCurrentFrame();
  if (f < 170) {
    return (
      <AbsoluteFill>
        <LaptopScreen frame={f} push={1.11 + 0.04 * lin(f, 0, 170)} dot={0}>
          <CamApp frame={f} selected={38} count={38} label="CAM 2 · live" progress={1}>
            <CamFeed frame={f} w={1000} h={560} stamp={`3:12:${secs(f + 540)} AM`} live theoBack zoom={1.22 + 0.06 * lin(f, 0, 170)} arm={ease(f, 20, 160)} />
          </CamApp>
        </LaptopScreen>
        <HudClock label="3:12 AM" frame={f} changedAt={-1} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Apartment frame={f + 4920} push={{s: 2.8, ox: HEAD.x + 80, oy: HEAD.y + 30}}
        theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 0, look: 6, browL: -24, browR: -24, browY: -16, mouth: -0.5, mouthOpen: 0.1, squash: 0, blink: 0})} />
      <HudClock label="3:12 AM" frame={f} changedAt={-1} />
    </AbsoluteFill>
  );
};

// 19 · 2:52–2:55 — Jump scare. He spins. Red flash: the eyes, inches away. Black.
export const SCARE_S19 = 8;
export const S19: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLook();
  if (f < SCARE_S19) {
    const spin = ease(f, 0, SCARE_S19);
    return (
      <AbsoluteFill>
        <Apartment frame={f + 5160} push={{s: 2.8, ox: HEAD.x + 80, oy: HEAD.y + 30}}
          theo={theoPose(f, {x: AP.chairX, sit: 1, typing: 0, look: 6 - 14 * spin, browL: -24, browR: -24, browY: -16, mouthOpen: 0.8 * spin, squash: -0.08 * spin})} />
      </AbsoluteFill>
    );
  }
  if (f < SCARE_S19 + 4) {
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <svg width={1920} height={1080} style={{position: 'absolute', transform: `scale(${1 + 0.03 * (f - SCARE_S19)})`}}>
          <ShadowSelf x={960} y={540 + 214 * 1.15 * 4} frame={f} grow={4} rise={1} glow={1.4} />
        </svg>
        <AbsoluteFill style={{background: L.accent, opacity: 0.55 - 0.12 * (f - SCARE_S19), mixBlendMode: 'screen'}} />
      </AbsoluteFill>
    );
  }
  return <AbsoluteFill style={{background: '#000'}} />;
};
export {F, clamp01};
