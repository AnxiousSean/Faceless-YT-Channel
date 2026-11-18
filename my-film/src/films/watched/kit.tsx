import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring} from 'remotion';
import {useLook} from '../../components/look';
import {FLOOR_Y, FONT} from '../../components/theme';
import {Glow} from '../../components/Glow';
import {Pip, PipPose, CastMember} from '../../components/Pip';
import {ShadowSelf} from '../../components/ShadowSelf';
import {wobblyRect, wobblyLine} from '../../components/wobble';

export const F = FLOOR_Y;
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lin = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const ease = (f: number, a: number, b: number) => Easing.inOut(Easing.cubic)(lin(f, a, b));
export const pop = (f: number, at: number) => (f < at ? 0 : spring({frame: f - at, fps: 30, config: {damping: 9, stiffness: 220}}));

// ---------------- Cast ----------------
export const THEO: CastMember = {skin: '#8D5A3B', shirt: '#4A4F5C', pants: '#23262E', hair: '#140D08', hairStyle: 'short'};

// ---------------- Layout of Theo's apartment (side-on) ----------------
export const AP = {
  hall: {x: 150, w: 280, top: F - 540},
  desk: {x: 960, w: 340, top: F - 210},
  lid: {hx: 1130, hy: F - 220, tx: 1112, ty: F - 392},   // hinge -> top of the laptop lid (screen faces left)
  cam: {x: 1106, y: F - 384},                             // webcam on the lid's top edge
  chairX: 880,
  seatY: F - 150,
  fridge: {x: 1640, w: 170, top: F - 440},
  window: {x: 1380, y: 300, w: 190, h: 220},
};
export const SIT_Y = F - 112;   // Theo's feet-origin when seated

// Theo's pose: sit 1 = seated at the desk, 0 = standing. typing adds key-bob to the hands.
export type TheoState = {x: number; sit: number; typing?: number; walk?: number; walkAmt?: number} & Partial<PipPose>;
export const theoPose = (f: number, s: TheoState): PipPose => {
  const sit = clamp01(s.sit);
  const t = (s.typing ?? 0) * sit;
  const b1 = Math.max(0, Math.sin(f * 1.3)) * 7 * t;
  const b2 = Math.max(0, Math.sin(f * 1.3 + 2.1)) * 7 * t;
  const sway = Math.sin(f * 0.1) * 3 * (1 - sit);
  const mix = (a: number, b: number) => a * (1 - sit) + b * sit;
  const {x, sit: _s, typing: _t, ...rest} = s;
  return {
    ...THEO, frame: f, x, y: mix(F, SIT_Y),
    handL: [mix(-58 + sway, 140), mix(-40, -115 - b1)],
    handR: [mix(58 - sway, 178), mix(-40, -113 - b2)],
    look: 6, squash: Math.sin(f * 0.12) * 0.014,
    ...rest,
  };
};

// ---------------- Darkness: everything outside the light pools sinks into black ----------------
export type Light = {x: number; y: number; r: number; k?: number};
export const Darkness: React.FC<{id: string; lights: Light[]; amount?: number}> = ({id, lights, amount = 0.6}) => (
  <g>
    <defs>
      <radialGradient id={`${id}-g`}>
        <stop offset="0%" stopColor="#000" stopOpacity={1} />
        <stop offset="55%" stopColor="#000" stopOpacity={0.6} />
        <stop offset="100%" stopColor="#000" stopOpacity={0} />
      </radialGradient>
      <mask id={`${id}-m`}>
        <rect width={1920} height={1080} fill="#fff" />
        {lights.map((l, i) => <circle key={i} cx={l.x} cy={l.y} r={l.r} fill={`url(#${id}-g)`} opacity={l.k ?? 1} />)}
      </mask>
    </defs>
    <rect width={1920} height={1080} fill="#000" opacity={amount} mask={`url(#${id}-m)`} />
  </g>
);

const useLine = (w?: number) => {
  const L = useLook();
  return {stroke: L.outline, strokeWidth: w ?? L.outlineW};
};

// ---------------- Props ----------------
export const Chair: React.FC<{x: number; frame: number}> = ({x, frame}) => {
  const line = useLine();
  const sy = AP.seatY;
  return (
    <g>
      <path d={wobblyRect(x - 92, sy - 190, 20, 196, frame, 71, 0.5)} fill="#1A1C24" {...line} />
      <path d={wobblyRect(x - 90, sy, 170, 16, frame, 72, 0.5)} fill="#1A1C24" {...line} />
      <rect x={x - 12} y={sy + 16} width={14} height={F - sy - 40} fill="#14161C" />
      <path d={`M ${x - 80} ${F - 10} L ${x + 70} ${F - 10}`} stroke="#4E5466" strokeWidth={6} strokeLinecap="round" />
      <circle cx={x - 76} cy={F - 6} r={7} fill="#0C0D12" {...line} />
      <circle cx={x + 66} cy={F - 6} r={7} fill="#0C0D12" {...line} />
    </g>
  );
};

export const Desk: React.FC<{frame: number}> = ({frame}) => {
  const line = useLine();
  const {x, w, top} = AP.desk;
  return (
    <g>
      <path d={wobblyRect(x, top, w, 18, frame, 81, 0.5)} fill="#1C1A1A" {...line} />
      <rect x={x + 14} y={top + 18} width={14} height={F - top - 18} fill="#15141A" {...line} />
      <rect x={x + w - 28} y={top + 18} width={14} height={F - top - 18} fill="#15141A" {...line} />
      {/* mug */}
      <path d={wobblyRect(x + 230, top - 46, 36, 46, frame, 82, 0.5)} fill="#2A2E3A" {...line} />
    </g>
  );
};

// Laptop seen side-on: screen faces left (toward Theo). screen = brightness 0..1, dot = webcam light 0..1
export const Laptop: React.FC<{frame: number; screen: number; dot: number}> = ({frame, screen, dot}) => {
  const L = useLook();
  const {hx, hy, tx, ty} = AP.lid;
  return (
    <g>
      <Glow id="lapGlow" cx={tx - 40} cy={(hy + ty) / 2} r={520} color="#9CC4FF" opacity={0.42 * screen} />
      <polygon points={`${tx - 4},${ty + 8} ${hx - 6},${hy} ${hx - 520},${F} ${hx - 560},${ty - 120}`} fill="#9CC4FF" opacity={0.045 * screen} />
      <path d={`M ${AP.desk.x + 40} ${hy + 10} L ${hx + 6} ${hy + 10}`} stroke="#3A3F4E" strokeWidth={10} strokeLinecap="round" />
      <path d={`M ${hx} ${hy + 6} L ${tx} ${ty}`} stroke="#2A2E3A" strokeWidth={13} strokeLinecap="round" />
      <path d={`M ${hx - 6} ${hy + 2} L ${tx - 6} ${ty + 6}`} stroke="#CFE3FF" strokeWidth={4} strokeLinecap="round" opacity={0.25 + 0.75 * screen} />
      {dot > 0 && (
        <>
          <Glow id="camDotGlow" cx={AP.cam.x} cy={AP.cam.y} r={46} color={L.accent} opacity={0.9 * dot} />
          <circle cx={AP.cam.x - 6} cy={AP.cam.y} r={4.5} fill={L.accent} opacity={dot} />
        </>
      )}
    </g>
  );
};

export const Fridge: React.FC<{frame: number; open: number}> = ({frame, open}) => {
  const line = useLine();
  const {x, w, top} = AP.fridge;
  const doorW = w * (1 - 0.82 * open);
  return (
    <g>
      <Glow id="fridgeGlow" cx={x + w / 2} cy={top + 200} r={560} color="#FFF1D6" opacity={0.75 * open} />
      <path d={wobblyRect(x, top, w, F - top, frame, 91, 0.5)} fill={open > 0.05 ? '#FFF4DE' : '#1E2129'} {...line} />
      {open > 0.05 && [0.3, 0.52, 0.74].map((k, i) => <rect key={i} x={x + 10} y={top + (F - top) * k} width={w - 20} height={5} fill="#C9BFA8" />)}
      {open > 0.05 && <rect x={x + 30} y={top + (F - top) * 0.52 - 52} width={34} height={52} fill="#D9E6F2" stroke="#030305" strokeWidth={3} />}
      <path d={wobblyRect(x + w - doorW, top - 2, doorW + 10 * open, F - top + 4, frame, 92, 0.5)} fill="#22252E" {...line} />
      <rect x={x + w - doorW + 12} y={top + 60} width={8} height={80} fill="#4E5466" opacity={1 - open} />
    </g>
  );
};

export const Hallway: React.FC<{frame: number; beam?: number; beamAngle?: number}> = ({frame}) => {
  const line = useLine();
  const {x, w, top} = AP.hall;
  return (
    <g>
      <rect x={x} y={top} width={w} height={F - top} fill="#010102" />
      <path d={wobblyRect(x, top, w, F - top, frame, 61, 0.4)} fill="none" {...line} />
      {/* barely-there coat rack and closet edge inside the black */}
      <g opacity={0.5}>
        <rect x={x + 52} y={top + 90} width={8} height={F - top - 90} fill="#0D0F14" />
        <ellipse cx={x + 40} cy={top + 170} rx={30} ry={70} fill="#0B0D12" />
        <ellipse cx={x + 78} cy={top + 160} rx={24} ry={60} fill="#0A0C11" />
        <rect x={x + 200} y={top + 60} width={70} height={F - top - 60} fill="#07080C" />
        <path d={`M ${x + 200} ${top + 60} L ${x + 188} ${F}`} stroke="#14171F" strokeWidth={3} />
      </g>
    </g>
  );
};

export const Window: React.FC<{frame: number}> = ({frame}) => {
  const line = useLine();
  const {x, y, w, h} = AP.window;
  return (
    <g>
      <Glow id="streetGlow" cx={x + w * 0.7} cy={y + 40} r={240} color="#FFA552" opacity={0.28} />
      <path d={wobblyRect(x, y, w, h, frame, 51, 0.5)} fill="#0D1220" {...line} />
      {Array.from({length: 7}, (_, i) => <rect key={i} x={x + 6} y={y + 18 + i * 29} width={w - 12} height={5} fill="#1F2533" />)}
      <circle cx={x + w * 0.72} cy={y + 34} r={9} fill="#FFC27A" opacity={0.7} />
    </g>
  );
};

// ---------------- The full apartment shot ----------------
export const Apartment: React.FC<{
  frame: number; theo?: PipPose | null; screen?: number; dot?: number; fridge?: number; dark?: number;
  push?: {s: number; ox: number; oy: number}; extraLights?: Light[]; behind?: React.ReactNode; front?: React.ReactNode;
}> = ({frame, theo, screen = 1, dot = 0, fridge = 0, dark = 0.62, push, extraLights = [], behind, front}) => {
  const L = useLook();
  const lights: Light[] = [
    {x: AP.lid.tx - 120, y: AP.cam.y + 80, r: 560 * screen + 1, k: screen},
    {x: AP.window.x + 130, y: AP.window.y + 60, r: 260, k: 0.6},
    {x: AP.fridge.x + 60, y: AP.fridge.top + 240, r: 640 * fridge + 1, k: fridge},
    ...extraLights,
  ];
  const s = push?.s ?? 1;
  return (
    <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${push?.ox ?? 960}px ${push?.oy ?? 540}px`}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect width={1920} height={1080} fill={L.bg} />
        <rect y={F} width={1920} height={1080 - F} fill={L.bgLow} />
        <Window frame={frame} />
        <Hallway frame={frame} />
        {behind}
        <Fridge frame={frame} open={fridge} />
        <Desk frame={frame} />
        <Chair x={AP.chairX} frame={frame} />
        {theo && <Pip {...theo} />}
        <Laptop frame={frame} screen={screen} dot={dot} />
        {front}
        <path d={`M 0 ${F} L 1920 ${F}`} stroke={L.floor} strokeWidth={L.floorW} />
        <Darkness id="apDark" lights={lights} amount={dark} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------- Close-up: the webcam lens and its light ----------------
export const WebcamClose: React.FC<{frame: number; dot: number; push?: number}> = ({frame, dot, push = 1}) => {
  const L = useLook();
  return (
    <AbsoluteFill style={{background: '#050508', transform: `scale(${push})`}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect x={0} y={330} width={1920} height={420} fill="#191B22" />
        <rect x={0} y={330} width={1920} height={6} fill="#2E3240" />
        <rect x={0} y={500} width={1920} height={250} fill="#0B0D14" />
        <Glow id="cuDot" cx={1090} cy={430} r={260} color={L.accent} opacity={0.8 * dot} />
        <circle cx={900} cy={430} r={58} fill="#06070A" stroke="#3A3F4E" strokeWidth={5} />
        <circle cx={900} cy={430} r={30} fill="#0C1020" />
        <circle cx={886} cy={418} r={9} fill="#6E7FB0" opacity={0.5} />
        <circle cx={1090} cy={430} r={15} fill={dot > 0.05 ? L.accent : '#2A1416'} />
        {dot > 0.05 && <circle cx={1086} cy={426} r={5} fill="#FFD0D0" opacity={dot} />}
        <path d={wobblyLine(0, 750, 1920, 750, frame, 3, 0.4)} stroke="#2E3240" strokeWidth={3} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------- Camera footage (what the webcam saw) ----------------
// Rendered into a w x h box. step = how far the Watcher has come (0 = only eyes deep in the hall). eyes = slit opacity.
export const CamFeed: React.FC<{frame: number; w: number; h: number; stamp: string; eyes?: number; blink?: number; watcher?: number; watcherX?: number; live?: boolean; theoBack?: boolean}> =
  ({frame, w, h, stamp, eyes = 0, blink = 0, watcher = 0, watcherX = 0.3, live = false, theoBack = false}) => {
  const L = useLook();
  const seed = frame % 7;
  return (
    <svg width={w} height={h} viewBox="0 0 1000 560" style={{display: 'block'}}>
      <defs>
        <filter id={`feedNoise${seed}`}><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed={seed} /><feColorMatrix type="saturate" values="0" /></filter>
        <radialGradient id="feedVig"><stop offset="50%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.85} /></radialGradient>
      </defs>
      <rect width={1000} height={560} fill="#1B211F" />
      {/* hallway opening behind the chair */}
      <rect x={140} y={40} width={330} height={520} fill="#030404" />
      <rect x={140} y={40} width={330} height={520} fill="none" stroke="#2C3431" strokeWidth={4} />
      <g opacity={0.6}>
        <rect x={200} y={140} width={8} height={420} fill="#0C0F0E" />
        <ellipse cx={190} cy={220} rx={28} ry={66} fill="#0A0C0B" />
        <rect x={380} y={110} width={80} height={450} fill="#070908" />
      </g>
      {watcher > 0 && (
        <g opacity={watcher} style={{filter: 'saturate(0.6)'}}>
          <ShadowSelf x={140 + 330 * watcherX + 60} y={560 + 40 * (1 - watcher)} frame={frame} grow={0.55 + 0.9 * watcher} rise={1} glow={0.5} lean={-3} />
        </g>
      )}
      {eyes > 0 && (
        <g opacity={eyes} transform={`translate(${140 + 330 * watcherX + 60} 230) scale(1 ${1 - 0.9 * blink})`}>
          <path d="M -26 -6 L -6 2" stroke={L.accent} strokeWidth={5} strokeLinecap="round" />
          <path d="M 26 -6 L 6 2" stroke={L.accent} strokeWidth={5} strokeLinecap="round" />
          <circle cx={0} cy={0} r={34} fill={L.accent} opacity={0.12} />
        </g>
      )}
      {/* the empty chair back, close to the lens */}
      {theoBack ? (
        <g>
          <circle cx={560} cy={330} r={150} fill="#3A2A20" />
          <path d="M 420 290 Q 560 170 700 290 L 700 230 Q 560 140 420 230 Z" fill="#100B08" />
          <rect x={430} y={440} width={260} height={140} rx={40} fill="#2F3236" />
        </g>
      ) : (
        <rect x={470} y={250} width={190} height={330} rx={36} fill="#262C2A" stroke="#3A423F" strokeWidth={4} />
      )}
      <rect x={760} y={470} width={260} height={30} fill="#1F2523" />
      <rect width={1000} height={560} filter={`url(#feedNoise${seed})`} opacity={0.16} style={{mixBlendMode: 'screen'}} />
      {Array.from({length: 28}, (_, i) => <rect key={i} x={0} y={i * 20} width={1000} height={3} fill="#000" opacity={0.2} />)}
      <rect width={1000} height={560} fill="url(#feedVig)" />
      <circle cx={46} cy={40} r={11} fill={L.accent} opacity={0.5 + 0.5 * Math.round((Math.sin(frame * 0.2) + 1) / 2)} />
      <text x={66} y={50} fontFamily={FONT} fontWeight={700} fontSize={30} fill="#F2F2F2">{live ? 'LIVE' : 'REC'}</text>
      <text x={40} y={530} fontFamily={FONT} fontWeight={700} fontSize={30} fill="#F2F2F2">{stamp}</text>
      <text x={960} y={50} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={26} fill="#C9D2CF">{live ? 'CAM 2' : 'CAM 1'}</text>
    </svg>
  );
};

// ---------------- Close-up: the laptop screen ----------------
export const SCREEN = {x: 260, y: 140, w: 1400, h: 790};
export const LaptopScreen: React.FC<{frame: number; push?: number; children?: React.ReactNode; on?: number; reflect?: number; dot?: number}> =
  ({frame, push = 1, children, on = 1, reflect = 0, dot = 0}) => {
  const L = useLook();
  const {x, y, w, h} = SCREEN;
  return (
    <AbsoluteFill style={{background: '#030305', transform: `scale(${push})`}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <Glow id="scrGlow" cx={960} cy={535} r={1100} color="#7FA6FF" opacity={0.25 * on} />
        <rect x={x - 34} y={y - 34} width={w + 68} height={h + 68} rx={26} fill="#15171E" stroke="#3A3F4E" strokeWidth={4} />
        <circle cx={960} cy={y - 17} r={7} fill="#06070A" stroke="#2E3240" strokeWidth={2} />
        {dot > 0 && <circle cx={984} cy={y - 17} r={4} fill={L.accent} opacity={dot} />}
        {dot > 0 && <Glow id="scrDot" cx={984} cy={y - 17} r={30} color={L.accent} opacity={dot} />}
        <rect x={x} y={y} width={w} height={h} fill="#000" />
      </svg>
      <div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', opacity: on}}>{children}</div>
      {reflect > 0 && (
        <svg width={1920} height={1080} style={{position: 'absolute', opacity: reflect}}>
          {/* Theo's faint reflection in the dark glass, and the red dot above him */}
          <circle cx={900} cy={560} r={210} fill="#8D5A3B" opacity={0.07} />
          <ellipse cx={900} cy={880} rx={260} ry={150} fill="#4A4F5C" opacity={0.06} />
          <circle cx={830} cy={540} r={9} fill="#fff" opacity={0.08} />
          <circle cx={970} cy={540} r={9} fill="#fff" opacity={0.08} />
          <Glow id="reflDot" cx={984} cy={210} r={60} color={L.accent} opacity={0.6} />
          <circle cx={984} cy={210} r={6} fill={L.accent} opacity={0.8} />
        </svg>
      )}
      <AbsoluteFill style={{pointerEvents: 'none', background: 'linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.03) 50%, transparent 60%)'}} />
    </AbsoluteFill>
  );
};

// Support-chat work app (shot 1-2)
export const ChatApp: React.FC<{frame: number; camIcon?: number}> = ({frame, camIcon = 1}) => {
  const L = useLook();
  const scroll = (frame * 1.4) % 130;
  const msgs = ['Hi, my order never arrived.', 'Sorry about that! Let me check.', 'It says delivered?', 'I can send a replacement.', 'Thank you so much.', 'Anything else tonight?'];
  return (
    <div style={{width: '100%', height: '100%', background: '#161B26', fontFamily: FONT, color: '#E6E9F0', position: 'relative'}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 64, width: 320, background: '#10141D', padding: 24}}>
        {['Ticket #4821', 'Ticket #4822', 'Ticket #4823', 'Ticket #4824', 'Ticket #4825'].map((t, i) => (
          <div key={i} style={{fontSize: 28, padding: '14px 12px', marginBottom: 10, borderRadius: 10, background: i === 2 ? '#24304A' : 'transparent'}}>{t}</div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 360, right: 40, top: 30 - scroll, fontSize: 32}}>
        {[...msgs, ...msgs].map((m, i) => (
          <div key={i} style={{display: 'flex', justifyContent: i % 2 ? 'flex-end' : 'flex-start', marginBottom: 22}}>
            <div style={{background: i % 2 ? '#2B5FA8' : '#252B38', padding: '14px 22px', borderRadius: 20, maxWidth: 640}}>{m}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, background: '#0C0F16', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 30, gap: 26}}>
        <div style={{fontSize: 26, color: '#8C93A3'}}>Mail</div>
        <div style={{fontSize: 26, color: '#8C93A3'}}>Music</div>
        <div style={{fontSize: 26, fontWeight: 700, color: L.accent, opacity: camIcon, display: 'flex', alignItems: 'center', gap: 8}}>
          <svg width={34} height={24}><rect x={1} y={4} width={22} height={16} rx={4} fill="none" stroke={L.accent} strokeWidth={3} /><path d="M 24 12 L 33 6 L 33 18 Z" fill={L.accent} /></svg>
          CAM 1
        </div>
      </div>
    </div>
  );
};

// The CAM 1 app: recording list + player
export const CamApp: React.FC<{frame: number; selected: number; count?: number; children?: React.ReactNode; progress?: number; label: string}> =
  ({selected, count = 37, children, progress = 0, label}) => {
  const L = useLook();
  const first = Math.max(0, selected - 3);
  return (
    <div style={{width: '100%', height: '100%', background: '#0F1117', fontFamily: FONT, color: '#E6E9F0', position: 'relative'}}>
      <div style={{position: 'absolute', left: 30, top: 18, fontSize: 34, fontWeight: 700, display: 'flex', gap: 14, alignItems: 'center'}}>
        <span style={{color: L.accent}}>●</span> CAM 1 <span style={{fontSize: 26, color: '#8C93A3', fontWeight: 400}}>· {count} recordings</span>
      </div>
      <div style={{position: 'absolute', left: 30, top: 84, width: 300}}>
        {Array.from({length: 7}, (_, i) => {
          const n = first + i + 1;
          return (
            <div key={i} style={{fontSize: 24, padding: '12px 14px', marginBottom: 8, borderRadius: 10,
              background: n === selected ? '#3A1C20' : '#181B24', border: n === selected ? `2px solid ${L.accent}` : '2px solid transparent'}}>
              clip_{String(n).padStart(3, '0')}
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 360, top: 84, width: 1000, height: 560, background: '#000', overflow: 'hidden', borderRadius: 8}}>{children}</div>
      <div style={{position: 'absolute', left: 360, top: 664, width: 1000, height: 10, background: '#2A2E3A', borderRadius: 5}}>
        <div style={{width: `${progress * 100}%`, height: '100%', background: L.accent, borderRadius: 5}} />
      </div>
      <div style={{position: 'absolute', left: 360, top: 690, fontSize: 28, color: '#C9CED8'}}>{label}</div>
    </div>
  );
};

export const Black: React.FC = () => <AbsoluteFill style={{background: '#000'}} />;
export {interpolate};
