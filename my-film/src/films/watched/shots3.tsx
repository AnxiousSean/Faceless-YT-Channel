import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {useLook} from '../../components/look';
import {FONT} from '../../components/theme';
import {Glow} from '../../components/Glow';
import {HudClock, Narrator, Notify} from '../../components/Overlay';
import {blinkAt} from '../../components/anim';
import {Pip, CastMember} from '../../components/Pip';
import {Darkness, F, Light, THEO, ease, lin} from './kit';

export const JESS: CastMember = {skin: '#F1C7A3', shirt: '#3F6B4E', pants: '#2A2E38', hair: '#7A3B1E', hairStyle: 'long'};
export const OFFICER: CastMember = {skin: '#C99A72', shirt: '#1F2D4D', pants: '#1A2238', hair: '#0F1830', hairStyle: 'cap'};

// 20 · 2:55–3:00 — Black. Running feet, a door slam, an engine. "He didn't stop driving until Jess's."
export const S20: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Narrator text="He didn't stop driving until Jess's." frame={f} from={40} to={148} />
    </AbsoluteFill>
  );
};

// ---------- 21 · 3:00–3:16 — The drive. The road scrolls past. "You forgot your laptop." ----------
export const TEXT_S21 = 290;
const ROAD = 820;
const Car: React.FC<{f: number; phone: number; brows: number; mouthOpen: number}> = ({f, phone, brows, mouthOpen}) => {
  const L = useLook();
  const bob = Math.sin(f * 0.6) * 2;
  const wheel = (cx: number) => (
    <g transform={`translate(${cx} ${ROAD - 34}) rotate(${f * 24})`}>
      <circle r={34} fill="#08090C" stroke="#4E5466" strokeWidth={3} />
      <path d="M -20 0 L 20 0 M 0 -20 L 0 20" stroke="#2E3240" strokeWidth={5} />
    </g>
  );
  return (
    <g>
      {/* headlights: long cone ahead */}
      <polygon points={`1270,${ROAD - 92 + bob} 1920,${ROAD - 210} 1920,${ROAD + 30}`} fill="#FFF3D6" opacity={0.16} />
      <Glow id="headGlow" cx={1500} cy={ROAD - 70} r={420} rx={520} ry={150} color="#FFF3D6" opacity={0.5} />
      <Glow id="tailGlow" cx={655} cy={ROAD - 92 + bob} r={70} color={L.accent} opacity={0.7} />
      <g transform={`translate(0 ${bob})`}>
        <path d={`M 840 ${ROAD - 146} L 900 ${ROAD - 262} L 1110 ${ROAD - 262} L 1180 ${ROAD - 146} Z`} fill="#0B0D14" />
        {/* Theo behind the wheel (body hidden by the car door) */}
        <Pip {...THEO} x={940} y={ROAD - 58} frame={f} scale={0.72} look={6} browL={brows} browR={brows} browY={brows < -10 ? -8 : 0}
          mouth={-0.4} mouthOpen={mouthOpen} handL={[120, -110]} handR={[140, -106]} blink={blinkAt(f, 90, 220, 400)} />
        <path d={`M 840 ${ROAD - 146} L 900 ${ROAD - 262} L 1110 ${ROAD - 262} L 1180 ${ROAD - 146} Z`} fill="none" stroke="#4E5466" strokeWidth={3} />
        <path d={`M 660 ${ROAD - 52} L 668 ${ROAD - 140} L 1270 ${ROAD - 128} L 1278 ${ROAD - 52} Z`} fill="#20232C" stroke="#4E5466" strokeWidth={3} />
        <path d={`M 912 ${ROAD - 250} L 1100 ${ROAD - 250} L 1172 ${ROAD - 148} L 840 ${ROAD - 148} Z`} fill="#9CC4FF" opacity={0.07} stroke="#4E5466" strokeWidth={3} />
        <rect x={1000} y={ROAD - 252} width={8} height={104} fill="#20232C" />
        <rect x={1262} y={ROAD - 112} width={18} height={20} rx={4} fill="#FFF3D6" />
        <rect x={656} y={ROAD - 112} width={14} height={20} rx={4} fill={L.accent} />
        {/* phone on the passenger seat, glimpsed through the back window */}
        {phone > 0 && <Glow id="seatPhone" cx={1090} cy={ROAD - 160} r={120} color="#9CC4FF" opacity={0.9 * phone} />}
        <rect x={1076} y={ROAD - 168} width={28} height={12} rx={3} fill={phone > 0.3 ? '#BFD8FF' : '#14161D'} />
      </g>
      {wheel(790)}{wheel(1150)}
    </g>
  );
};
export const S21: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLook();
  const v = 34; // px per frame, near layer
  const lamps = Array.from({length: 4}, (_, i) => ((i * 760 - f * v) % 3040 + 3040) % 3040 - 400);
  const trees = Array.from({length: 9}, (_, i) => ((i * 330 - f * v * 0.45) % 2970 + 2970) % 2970 - 300);
  const hills = (f * v * 0.08) % 1920;
  const phone = f > TEXT_S21 ? 1 : 0;
  const shock = ease(f, TEXT_S21 + 6, TEXT_S21 + 16);
  const lights: Light[] = [{x: 1560, y: ROAD - 80, r: 520, k: 0.9}, {x: 1000, y: ROAD - 200, r: 200, k: 0.5 + 0.5 * phone},
    ...lamps.map((x) => ({x, y: ROAD - 60, r: 360, k: 0.85}))];
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect width={1920} height={1080} fill={L.bg} />
        {[0, 1].map((k) => (
          <path key={k} transform={`translate(${k * 1920 - hills} 0)`} d="M 0 640 Q 240 520 520 600 Q 820 680 1100 560 Q 1420 450 1700 590 L 1920 600 L 1920 820 L 0 820 Z" fill="#0C0F17" />
        ))}
        {trees.map((x, i) => (
          <g key={i}><rect x={x} y={ROAD - 210} width={10} height={210} fill="#0A0C12" /><ellipse cx={x + 5} cy={ROAD - 240} rx={60} ry={90} fill="#0D1018" /></g>
        ))}
        {lamps.map((x, i) => (
          <g key={i}>
            <Glow id={`lampPool${i}`} cx={x} cy={ROAD - 10} r={260} rx={300} ry={60} color="#FFB86B" opacity={0.55} />
            <Glow id={`lampHead${i}`} cx={x - 40} cy={ROAD - 470} r={260} color="#FFB86B" opacity={0.45} />
            <rect x={x - 6} y={ROAD - 480} width={12} height={480} fill="#1A1C24" stroke="#4E5466" strokeWidth={2} />
            <rect x={x - 70} y={ROAD - 484} width={70} height={12} fill="#1A1C24" stroke="#4E5466" strokeWidth={2} />
            <rect x={x - 66} y={ROAD - 472} width={30} height={8} fill="#FFD9A0" />
          </g>
        ))}
        <rect y={ROAD} width={1920} height={1080 - ROAD} fill={L.bgLow} />
        {Array.from({length: 8}, (_, i) => <rect key={i} x={((i * 300 - f * v) % 2400 + 2400) % 2400 - 200} y={ROAD + 70} width={140} height={8} fill="#3A3F4E" />)}
        <path d={`M 0 ${ROAD} L 1920 ${ROAD}`} stroke={L.floor} strokeWidth={L.floorW} />
        <Car f={f} phone={phone} brows={-14 - 10 * shock} mouthOpen={0.5 * shock} />
        <Darkness id="driveDark" lights={lights} amount={0.55} />
      </svg>
      <HudClock label="3:31 AM" frame={f} changedAt={8} />
      <Notify frame={f} at={TEXT_S21} until={480} x={1230} y={150} title="Unknown" body="You forgot your laptop." accent icon="✉" w={560} />
    </AbsoluteFill>
  );
};

// ---------- 22 · 3:16–3:30 — Police lights. A hatch above the hallway closet, open. ----------
export const SIRENS_S22 = [10, 70];
const PoliceWash: React.FC<{f: number}> = ({f}) => {
  const red = Math.max(0, Math.sin(f * 0.35));
  const blue = Math.max(0, Math.sin(f * 0.35 + Math.PI));
  return (
    <>
      <AbsoluteFill style={{background: '#FF2A2A', opacity: 0.1 * red, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: '#2A5BFF', opacity: 0.12 * blue, mixBlendMode: 'screen'}} />
    </>
  );
};
export const S22: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLook();
  const red = Math.max(0, Math.sin(f * 0.35));
  const blue = Math.max(0, Math.sin(f * 0.35 + Math.PI));
  if (f < 140) {
    // exterior: Theo's building, police car at the kerb
    return (
      <AbsoluteFill>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          <rect width={1920} height={1080} fill={L.bg} />
          <rect x={300} y={160} width={1200} height={F - 160} fill="#14161E" stroke="#4E5466" strokeWidth={3} />
          {Array.from({length: 8}, (_, i) => (
            <rect key={i} x={380 + (i % 4) * 280} y={230 + Math.floor(i / 4) * 230} width={140} height={150} fill="#0B0E18" stroke="#4E5466" strokeWidth={3} />
          ))}
          <rect x={820} y={F - 230} width={140} height={230} fill="#07080C" stroke="#4E5466" strokeWidth={3} />
          <rect y={F} width={1920} height={1080 - F} fill={L.bgLow} />
          <path d={`M 0 ${F} L 1920 ${F}`} stroke={L.floor} strokeWidth={L.floorW} />
          {/* police car */}
          <g transform="translate(1180 0)">
            <path d={`M 0 ${F - 30} L 10 ${F - 120} L 140 ${F - 132} L 210 ${F - 220} L 420 ${F - 220} L 490 ${F - 132} L 600 ${F - 116} L 608 ${F - 30} Z`} fill="#1C2132" stroke="#4E5466" strokeWidth={3} />
            <rect x={240} y={F - 160} width={170} height={20} fill="#C9D2E6" />
            <circle cx={130} cy={F - 30} r={34} fill="#08090C" stroke="#4E5466" strokeWidth={3} />
            <circle cx={480} cy={F - 30} r={34} fill="#08090C" stroke="#4E5466" strokeWidth={3} />
            <rect x={270} y={F - 240} width={46} height={20} rx={5} fill="#FF3A3A" opacity={0.3 + 0.7 * red} />
            <rect x={318} y={F - 240} width={46} height={20} rx={5} fill="#3A6BFF" opacity={0.3 + 0.7 * blue} />
          </g>
          <Glow id="polRed" cx={1470} cy={F - 230} r={700} color="#FF3A3A" opacity={0.7 * red} />
          <Glow id="polBlue" cx={1520} cy={F - 230} r={700} color="#3A6BFF" opacity={0.7 * blue} />
          <Darkness id="extDark" lights={[{x: 1490, y: F - 230, r: 900, k: 0.6 + 0.3 * Math.max(red, blue)}]} amount={0.5} />
        </svg>
        <HudClock label="4:10 AM" frame={f} changedAt={6} />
        <PoliceWash f={f} />
      </AbsoluteFill>
    );
  }
  const g = f - 140;
  // interior: the hallway, the officer, a flashlight up into the open hatch
  const beamUp = ease(g, 20, 70);
  const hx = 900, hy = 230, hw = 260, hh = 120;
  const ox = 1160;
  const handY = -170 - 30 * beamUp;
  const bx0 = ox - 70, by0 = F + handY;
  const bx1 = hx + hw / 2 + 20 * Math.sin(g * 0.03), by1 = hy - 10;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect width={1920} height={1080} fill={L.bg} />
        <rect y={F} width={1920} height={1080 - F} fill={L.bgLow} />
        {/* ceiling line and closet */}
        <path d={`M 0 ${hy + hh} L 1920 ${hy + hh}`} stroke="#2E3240" strokeWidth={3} />
        <rect x={700} y={hy + hh} width={460} height={F - hy - hh} fill="#101219" stroke="#4E5466" strokeWidth={3} />
        <rect x={720} y={hy + hh + 30} width={10} height={F - hy - hh - 30} fill="#0A0B10" />
        {/* the hatch: open, a black square in the ceiling, its panel hanging down */}
        <rect x={hx} y={hy} width={hw} height={hh} fill="#020203" />
        <path d={`M ${hx + hw} ${hy + hh} L ${hx + hw + 30} ${hy + hh + 220}`} stroke="#2A2E38" strokeWidth={22} strokeLinecap="round" />
        {/* what the beam reveals inside */}
        <g clipPath="url(#hatchClip)" opacity={beamUp}>
          <defs><clipPath id="hatchClip"><rect x={hx} y={hy} width={hw} height={hh} /></clipPath></defs>
          <rect x={hx} y={hy} width={hw} height={hh} fill="#2A2620" />
          <rect x={hx + 20} y={hy + 60} width={150} height={56} rx={24} fill="#3E4A6B" stroke="#030305" strokeWidth={3} />
          <rect x={hx + 30} y={hy + 70} width={40} height={36} rx={14} fill="#5A6888" />
          <rect x={hx + 180} y={hy + 92} width={22} height={14} fill="#C23A41" />
          <rect x={hx + 206} y={hy + 98} width={18} height={10} fill="#D9B44A" />
          {/* tripod camera aimed down the hall, its light on */}
          <path d={`M ${hx + 235} ${hy + 116} L ${hx + 222} ${hy + 70} M ${hx + 235} ${hy + 116} L ${hx + 248} ${hy + 70}`} stroke="#8A8F9C" strokeWidth={3} />
          <rect x={hx + 214} y={hy + 50} width={40} height={24} rx={4} fill="#14161D" stroke="#8A8F9C" strokeWidth={2} />
          <circle cx={hx + 250} cy={hy + 56} r={4} fill={L.accent} />
        </g>
        <Glow id="hatchCamDot" cx={hx + 250} cy={hy + 56} r={40} color={L.accent} opacity={beamUp * (0.6 + 0.4 * Math.sin(g * 0.3))} />
        {/* flashlight beam */}
        <polygon points={`${bx0},${by0} ${bx1 - 170},${by1} ${bx1 + 170},${by1}`} fill="#FFF6E0" opacity={0.13 + 0.05 * beamUp} />
        <Pip {...OFFICER} x={ox} y={F} frame={f} look={-6} handL={[-70, handY]} browL={-12 * beamUp} browR={-12 * beamUp} browY={-6 * beamUp}
          mouth={-0.3} mouthOpen={0.3 * ease(g, 60, 70)} blink={blinkAt(g, 140)} />
        <rect x={ox - 84} y={F + handY - 10} width={30} height={16} rx={4} fill="#2A2E38" stroke="#030305" strokeWidth={3} />
        <Darkness id="hatchDark" lights={[{x: bx1, y: by1 + 40, r: 360, k: 0.95}, {x: (bx0 + bx1) / 2, y: (by0 + by1) / 2, r: 300, k: 0.6}, {x: 1700, y: 500, r: 700, k: 0.25 + 0.2 * Math.max(red, blue)}]} amount={0.7} />
      </svg>
      <HudClock label="4:10 AM" frame={f} changedAt={-1} />
      <PoliceWash f={f} />
      <Narrator text="Someone had been living above his hallway." frame={f} from={200} to={410} />
    </AbsoluteFill>
  );
};

// ---------- 23 · 3:30–3:48 — Jess's living room. A blanket. Lamp off. Across the room, the TV's standby light blinks twice. ----------
export const LAMP_OFF_S23 = 300, TV_BLINKS_S23 = [420, 452];
export const S23: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLook();
  const lamp = f < LAMP_OFF_S23 ? 1 : 0;
  const jx = 1560 - 380 * ease(f, 10, 90) + 180 * ease(f, 200, 260) + 800 * ease(f, 320, 420);
  const drape = ease(f, 100, 140);
  const relax = ease(f, 150, 230);
  const blink = TV_BLINKS_S23.some((t) => f >= t && f < t + 12) ? 1 : 0;
  const tvX = 300, tvY = 560;
  const seatY = F - 120;
  const lights: Light[] = [{x: 1300, y: 420, r: 760, k: lamp}, {x: tvX + 160, y: tvY + 150, r: 120, k: blink * 0.8}];
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <rect width={1920} height={1080} fill={L.bg} />
        <rect y={F} width={1920} height={1080 - F} fill={L.bgLow} />
        {/* TV on a low stand, far left */}
        <rect x={tvX - 20} y={F - 120} width={360} height={120} fill="#14161D" stroke="#4E5466" strokeWidth={3} />
        <rect x={tvX} y={tvY - 30} width={320} height={190} fill="#06070A" stroke="#4E5466" strokeWidth={3} />
        <circle cx={tvX + 160} cy={tvY + 152} r={5} fill={blink ? L.accent : '#2A1416'} />
        <Glow id="tvStandby" cx={tvX + 160} cy={tvY + 152} r={50} color={L.accent} opacity={blink} />
        {/* floor lamp by the couch */}
        <Glow id="jessLamp" cx={1300} cy={420} r={680} color={L.glowWarm} opacity={0.55 * lamp} />
        <rect x={1294} y={420} width={10} height={F - 420} fill="#1A1C24" stroke="#4E5466" strokeWidth={2} />
        <path d={`M 1250 340 L 1350 340 L 1380 430 L 1220 430 Z`} fill={lamp ? L.shadeOn : L.shadeOff} stroke="#4E5466" strokeWidth={3} />
        {/* couch */}
        <rect x={720} y={seatY - 150} width={520} height={130} rx={30} fill="#3A2E3E" stroke="#030305" strokeWidth={4} />
        {/* Theo sits on the couch */}
        <Pip {...THEO} x={960} y={seatY + 30} frame={f} look={-4 + 6 * ease(f, 30, 60) - 6 * ease(f, 400, 420)} handL={[-60, -60]} handR={[60, -60]}
          browL={-12 + 16 * relax - 18 * ease(f, 422, 432)} browR={-12 + 16 * relax - 18 * ease(f, 422, 432)} browY={-4 + 4 * relax - 8 * ease(f, 422, 432)}
          mouth={-0.4 + 0.6 * relax} blink={Math.max(blinkAt(f, 180, 260), f > 330 && f < 380 ? 1 : 0)} squash={Math.sin(f * 0.08) * 0.012} />
        {/* blanket */}
        <path d={`M ${960 - 90 * drape} ${seatY - 70} Q 960 ${seatY - 110 - 20 * drape} ${960 + 90 * drape} ${seatY - 70} L ${960 + 100 * drape} ${seatY + 10} L ${960 - 100 * drape} ${seatY + 10} Z`}
          fill="#6B4F7A" stroke="#030305" strokeWidth={4} opacity={drape > 0.02 ? 1 : 0} />
        <rect x={700} y={seatY - 30} width={560} height={90} rx={24} fill="#4A3B4F" stroke="#030305" strokeWidth={4} />
        <rect x={700} y={seatY + 60} width={20} height={F - seatY - 60} fill="#2A222E" />
        <rect x={1240} y={seatY + 60} width={20} height={F - seatY - 60} fill="#2A222E" />
        {/* side table with Jess's laptop, its webcam already taped */}
        <rect x={1420} y={F - 200} width={220} height={16} fill="#2A2420" stroke="#4E5466" strokeWidth={3} />
        <rect x={1436} y={F - 184} width={12} height={184} fill="#1E1A18" />
        <rect x={1612} y={F - 184} width={12} height={184} fill="#1E1A18" />
        <path d={`M 1460 ${F - 206} L 1580 ${F - 206} L 1566 ${F - 330}`} stroke="#2A2E3A" strokeWidth={10} fill="none" strokeLinecap="round" />
        <rect x={1554} y={F - 336} width={18} height={10} fill="#D8CDB0" />
        {/* Jess brings the blanket, then heads off */}
        <Pip {...JESS} x={jx} y={F} frame={f} look={jx < 1300 ? -6 : 6} walk={jx * 0.05} walkAmt={(f > 12 && f < 88) || (f > 202 && f < 258) || (f > 322 && f < 418) ? 1 : 0}
          handL={drape < 1 && f < 150 ? [-80, -150] : [-58, -40]} handR={f > 270 && f < 310 ? [70, -330 + 60 * ease(f, 296, 304)] : [58, -40]} mouth={0.4} browL={-6} browR={-6} blink={blinkAt(f, 60, 170)} />
        <path d={`M 0 ${F} L 1920 ${F}`} stroke={L.floor} strokeWidth={L.floorW} />
        <Darkness id="jessDark" lights={lights} amount={lamp ? 0.5 : 0.82} />
      </svg>
      <HudClock label="4:40 AM" frame={f} changedAt={6} />
    </AbsoluteFill>
  );
};

// ---------- 24 · 3:48–4:00 — TITLE CARD ----------
export const WORD = 'WATCHED';
export const LETTER_START = 20, LETTER_GAP = 9, UNDERLINE_AT = 96;
export const S24: React.FC = () => {
  const f = useCurrentFrame();
  const L = useLook();
  const shown = Math.max(0, Math.min(WORD.length, Math.floor((f - LETTER_START) / LETTER_GAP) + 1));
  const draw = Easing.out(Easing.cubic)(lin(f, UNDERLINE_AT, UNDERLINE_AT + 36));
  const wave = Array.from({length: 81}, (_, i) => {
    const x = 560 + i * 10;
    const y = 640 + Math.sin(i * 0.5 + f * 0.15) * 10;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`;
  }).join(' ');
  const fadeIn = (a: number) => interpolate(f, [a, a + 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const black = interpolate(f, [318, 358], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: L.bg}}>
      <div style={{position: 'absolute', top: 380, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 200, color: '#F2F2F2', letterSpacing: 10}}>
        {WORD.split('').map((ch, i) => {
          const s = i < shown ? spring({frame: f - (LETTER_START + i * LETTER_GAP), fps: 30, config: {damping: 15, stiffness: 300}}) : 0;
          return <span key={i} style={{display: 'inline-block', transform: `scale(${s})`, opacity: i < shown ? 1 : 0}}>{ch}</span>;
        })}
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={wave} stroke={L.accent} strokeWidth={10} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}
          style={{filter: `drop-shadow(0 0 12px ${L.accent})`}} />
      </svg>
      <div style={{position: 'absolute', top: 720, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 52, color: '#F2F2F2', opacity: fadeIn(150)}}>Cover your camera.</div>
      <div style={{position: 'absolute', top: 800, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 40, color: L.accent, opacity: fadeIn(210)}}>Check your ceiling.</div>
      <AbsoluteFill style={{background: '#000', opacity: black}} />
    </AbsoluteFill>
  );
};
