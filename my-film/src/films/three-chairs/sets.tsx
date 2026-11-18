import React from 'react';
import {useLook} from '../../components/look';
import {FLOOR_Y} from '../../components/theme';
import {Glow} from '../../components/Glow';
import {C, Rocket, Stand, WallLamp, useLine, HangingLamp} from './props';

const F = FLOOR_Y;

const Stars: React.FC<{frame: number; pts: [number, number][]}> = ({frame, pts}) => (
  <g>
    {pts.map(([x, y], i) => (
      <rect key={i} x={x} y={y} width={8} height={8} fill="#E8EEFF" opacity={0.35 + 0.35 * Math.sin(frame * 0.07 + i * 2.1)} />
    ))}
  </g>
);

export const Moon: React.FC<{x: number; y: number; r?: number; id: string}> = ({x, y, r = 46, id}) => {
  const L = useLook();
  return (
    <>
      <Glow id={id} cx={x} cy={y} r={r * 7} color={L.glowCool} opacity={0.35} />
      <circle cx={x} cy={y} r={r} fill={L.moon} />
      <circle cx={x + r * 0.3} cy={y - r * 0.2} r={r * 0.18} fill="#C9D3F0" />
    </>
  );
};

// ---------- COURTYARD (exterior, night). Three buildings, three balconies, three rockets in a loop of aim. ----------
export const COURT = {
  pip: {x: 320, y: 780, lamp: [320, 600] as const},
  bram: {x: 880, y: 380, lamp: [1010, 250] as const},
  lune: {x: 1500, y: 640, lamp: [1590, 520] as const},
};

export const Courtyard: React.FC<{frame: number; pipLamp: number; bramLamp: number; luneLamp: number; capped?: number; glint?: number;
  pipSlot?: React.ReactNode; bramSlot?: React.ReactNode; luneSlot?: React.ReactNode}> = ({frame, pipLamp, bramLamp, luneLamp, capped = 0, glint = 0, pipSlot, bramSlot, luneSlot}) => {
  const L = useLook();
  const line = useLine();
  const rail = (x0: number, x1: number, y: number) => (
    <g>
      <rect x={x0} y={y - 56} width={x1 - x0} height={10} fill={L.outline} />
      {Array.from({length: Math.floor((x1 - x0) / 46) + 1}, (_, i) => <rect key={i} x={x0 + i * 46} y={y - 56} width={8} height={56} fill={L.outline} />)}
    </g>
  );
  const winGlow = (x: number, y: number, w: number, h: number, on: number, id: string) => (
    <>
      <rect x={x} y={y} width={w} height={h} fill={C.glass} {...line} />
      <rect x={x + 5} y={y + 5} width={w - 10} height={h - 10} fill="#7A4A3A" opacity={on} />
      <Glow id={id} cx={x + w / 2} cy={y + h * 0.4} r={Math.max(w, h) * 0.9} color={L.glowWarm} opacity={0.7 * on} />
    </>
  );
  const darkWins = (x0: number, y0: number, cols: number, rows: number, dx: number, dy: number) => (
    <g>
      {Array.from({length: cols * rows}, (_, i) => (
        <rect key={i} x={x0 + (i % cols) * dx} y={y0 + Math.floor(i / cols) * dy} width={56} height={70} fill={C.brickDark} {...line} />
      ))}
    </g>
  );
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <rect width={1920} height={1080} fill={L.bg} />
      <rect x={0} y={F} width={1920} height={1080 - F} fill={L.bgLow} />
      <Stars frame={frame} pts={[[120, 120], [430, 200], [600, 90], [1260, 150], [1380, 90], [1820, 230], [520, 300], [250, 330]]} />
      <Moon x={1770} y={250} id="cMoon" />
      {/* buildings */}
      <rect x={60} y={420} width={540} height={F - 420} fill={C.brick} {...line} />
      <rect x={720} y={130} width={480} height={F - 130} fill={C.brick} {...line} />
      <rect x={1320} y={320} width={540} height={F - 320} fill={C.brick} {...line} />
      {darkWins(780, 470, 4, 4, 110, 96)}
      {darkWins(1360, 720, 4, 1, 120, 0)}
      {darkWins(100, 460, 4, 1, 130, 0)}
      {/* Pip: ground-floor window + ledge */}
      {winGlow(200, 560, 240, 220, pipLamp, 'cPipWin')}
      <Glow id="cPipSpill" cx={320} cy={F} r={300} ry={40} color={L.glowWarm} opacity={0.45 * pipLamp} />
      {pipSlot}
      <rect x={160} y={780} width={420} height={16} fill={C.brickTop} {...line} />
      <Stand x={500} y={780} h={40} />
      <Rocket x={500} y={742} angle={-42} scale={0.8} capped={capped} frame={frame} glint={glint} />
      {/* Bram: top-floor balcony */}
      {winGlow(780, 220, 170, 160, bramLamp, 'cBramWin')}
      <WallLamp x={COURT.bram.lamp[0]} y={COURT.bram.lamp[1]} on={bramLamp} id="cBramLamp" />
      {bramSlot}
      <rect x={690} y={380} width={540} height={18} fill={C.brickTop} {...line} />
      {rail(700, 1220, 380)}
      <Stand x={1080} y={380} h={40} />
      <Rocket x={1080} y={342} angle={32} scale={0.8} capped={capped} frame={frame + 30} glint={glint} />
      {/* Lune: balcony across the courtyard */}
      {winGlow(1660, 480, 150, 160, luneLamp, 'cLuneWin')}
      <WallLamp x={COURT.lune.lamp[0]} y={COURT.lune.lamp[1]} on={luneLamp} id="cLuneLamp" />
      {luneSlot}
      <rect x={1290} y={640} width={560} height={18} fill={C.brickTop} {...line} />
      {rail(1300, 1840, 640)}
      <Stand x={1400} y={640} h={40} />
      <Rocket x={1400} y={602} angle={176} scale={0.8} capped={capped} frame={frame + 60} glint={glint} />
      <path d={`M 0 ${F} L 1920 ${F}`} stroke={L.floor} strokeWidth={L.floorW} />
    </svg>
  );
};

// ---------- PIP'S FLAT (interior, night). Door left, note wall, hanging lamp over the table, window right. ----------
export const FLAT = {table: 960, chairL: 700, chairR: 1220, chairB: 960, doorX: 110, doorW: 200, lampX: 960, lampTop: 40, lampLen: 330};

export const Flat: React.FC<{frame: number; lamp?: number; swing?: number; door?: number; bramLamp?: number; luneLamp?: number; capped?: number;
  note?: number; children?: React.ReactNode; front?: React.ReactNode}> = ({frame, lamp = 1, swing = 0, door = 0, bramLamp = 1, luneLamp = 1, capped = 0, note = 0, children, front}) => {
  const L = useLook();
  const line = useLine();
  const {doorX, doorW} = FLAT;
  const panelW = doorW * (1 - 0.8 * door);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <defs><clipPath id="flatWin"><rect x={1385} y={225} width={370} height={370} /></clipPath></defs>
      <rect width={1920} height={1080} fill={L.bg} />
      <rect x={0} y={F} width={1920} height={1080 - F} fill={L.bgLow} />
      {/* skirting */}
      <rect x={0} y={F - 26} width={1920} height={26} fill={C.wall2} />
      {/* window with the courtyard beyond */}
      <rect x={1380} y={220} width={380} height={380} fill={C.sky} {...line} />
      <g clipPath="url(#flatWin)">
        <Moon x={1690} y={290} r={30} id="fMoon" />
        <rect x={1400} y={380} width={150} height={260} fill={C.brick} {...line} />
        <rect x={1590} y={470} width={190} height={200} fill={C.brick} {...line} />
        <rect x={1392} y={400} width={170} height={10} fill={C.brickTop} />
        <rect x={1580} y={540} width={190} height={10} fill={C.brickTop} />
        <Glow id="fBramL" cx={1460} cy={392} r={90} color={L.glowWarm} opacity={0.8 * bramLamp} />
        <rect x={1452} y={384} width={16} height={14} fill={bramLamp > 0.5 ? L.shadeOn : L.shadeOff} />
        <Glow id="fLuneL" cx={1650} cy={530} r={90} color={L.glowWarm} opacity={0.8 * luneLamp} />
        <rect x={1642} y={522} width={16} height={14} fill={luneLamp > 0.5 ? L.shadeOn : L.shadeOff} />
        <Rocket x={1500} y={392} angle={32} scale={0.25} capped={capped} frame={frame} />
        <Rocket x={1720} y={532} angle={176} scale={0.25} capped={capped} frame={frame} />
      </g>
      <rect x={1380} y={220} width={380} height={380} fill="none" {...line} strokeWidth={8} />
      <rect x={1566} y={220} width={8} height={380} fill={L.outline} />
      <rect x={1380} y={406} width={380} height={8} fill={L.outline} />
      <rect x={1360} y={600} width={420} height={18} fill={C.wall2} {...line} />
      <Glow id="fMoonSpill" cx={1570} cy={F} r={300} ry={34} color={L.glowCool} opacity={0.25} />
      {/* door */}
      <rect x={doorX - 14} y={460} width={doorW + 28} height={F - 460} fill={C.wall2} {...line} />
      <rect x={doorX} y={474} width={doorW} height={F - 474} fill={C.doorDark} />
      {door > 0.02 && <Glow id="fHall" cx={doorX + doorW / 2} cy={560} r={260} color={L.glowWarm} opacity={0.35 * door} />}
      <rect x={doorX} y={474} width={panelW} height={F - 474} fill={C.door} {...line} />
      {door < 0.6 && <circle cx={doorX + panelW - 26} cy={680} r={11} fill="#C8B89A" />}
      {/* note pinned on the wall */}
      {note > 0 && (
        <g transform={`translate(600 300) scale(${note}) rotate(-3)`}>
          <rect x={-190} y={-100} width={380} height={200} rx={8} fill={C.paper} {...line} />
          <circle cx={0} cy={-88} r={12} fill={C.rocketStripe} />
          <text x={0} y={-14} textAnchor="middle" fontFamily="'Comic Neue', sans-serif" fontWeight={700} fontSize={52} fill={C.ink}>SAME TIME</text>
          <text x={0} y={56} textAnchor="middle" fontFamily="'Comic Neue', sans-serif" fontWeight={700} fontSize={52} fill={C.ink}>NEXT MONTH?</text>
        </g>
      )}
      {/* little kitchen counter with the soup pot */}
      <rect x={350} y={F - 160} width={200} height={160} fill={C.woodDark} {...line} />
      <rect x={340} y={F - 172} width={220} height={18} fill={C.wood} {...line} />
      <rect x={400} y={F - 232} width={100} height={60} rx={10} fill="#6A70A0" {...line} />
      <rect x={390} y={F - 242} width={120} height={14} rx={6} fill="#8A90C0" {...line} />
      {[0, 1].map((i) => {
        const t = (frame * 0.8 + i * 20) % 40;
        return <path key={i} d={`M ${436 + i * 28} ${F - 250 - t} q 8 -12 0 -24`} stroke="#E6E2F4" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.5 * (1 - t / 40)} />;
      })}
      <HangingLamp x={FLAT.lampX} top={FLAT.lampTop} len={FLAT.lampLen} swing={swing} on={lamp} floorY={F} id="fLamp" />
      <Glow id="fPool" cx={FLAT.lampX + Math.sin((swing * Math.PI) / 180) * 300} cy={F} r={420} ry={44} color={L.glowWarm} opacity={0.5 * lamp} />
      {children}
      <path d={`M 0 ${F} L 1920 ${F}`} stroke={L.floor} strokeWidth={L.floorW} />
      {front}
    </svg>
  );
};
