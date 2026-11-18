import React from 'react';
import {FLOOR_Y} from './theme';
import {useLook} from './look';
import {wobblyPoly, wobblyRect, wobblyLine, wobblyCircle} from './wobble';
import {Glow} from './Glow';

// Night bedroom, side-on. Light sources: floor lamp (warm), moon through window (cool), phone (cold blue).
export const Room: React.FC<{frame: number; lamp: number; phone: number; children?: React.ReactNode}> = ({frame, lamp, phone, children}) => {
  const L = useLook();
  const F = FLOOR_Y;
  const wf = L.wobbleStatic ? 0 : frame;
  const a = (x = 1.6) => x * L.wobble;
  const line = {stroke: L.outlineW > 0 ? L.outline : 'none', strokeWidth: L.outlineW, fillOpacity: L.propFillOpacity};
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <rect width={1920} height={1080} fill={L.bg} />
      <rect y={F} width={1920} height={1080 - F} fill={L.bgLow} />
      {/* moon + window */}
      <Glow id="moonGlow" cx={1560} cy={330} r={320} color={L.glowCool} opacity={0.28} />
      <g filter={L.propFilter}>
        <path d={wobblyRect(1390, 230, 300, 320, wf, 3, a())} fill={L.windowFill} {...line} />
        <path d={wobblyCircle(1580, 320, 40, wf, 9, a(1.4))} fill={L.moon} />
        <path d={wobblyLine(1540, 232, 1540, 548, wf, 4, a())} {...line} fill="none" />
        <path d={wobblyLine(1392, 390, 1688, 390, wf, 5, a())} {...line} fill="none" />
      </g>
      <polygon points={`1390,550 1690,550 1500,${F} 1150,${F}`} fill={L.glowCool} opacity={0.05 * L.glow} />
      <Glow id="moonPool" cx={1330} cy={F} r={260} ry={26} color={L.glowCool} opacity={0.25} />
      {/* floor lamp */}
      <Glow id="lampGlow" cx={380} cy={F - 450} r={720} color={L.glowWarm} opacity={0.55 * lamp} />
      <polygon points={`292,${F - 430} 468,${F - 430} 640,${F} 120,${F}`} fill={L.glowWarm} opacity={L.coneOpacity * lamp} />
      <Glow id="lampPool" cx={380} cy={F} r={380} ry={40} color={L.glowWarm} opacity={0.6 * lamp} />
      <g filter={L.propFilter}>
        <path d={wobblyLine(380, F - 430, 380, F - 10, wf, 11, a())} stroke={L.outlineW > 0 ? L.outline : L.base} strokeWidth={Math.max(5, L.outlineW + 2)} fill="none" />
        <path d={wobblyRect(335, F - 12, 90, 12, wf, 12, a())} fill={L.base} {...line} />
        <path d={wobblyPoly([[330, F - 520], [430, F - 520], [470, F - 430], [290, F - 430]], wf, 13, a())}
          fill={lamp > 0.5 ? L.shadeOn : L.shadeOff} {...line} fillOpacity={lamp > 0.5 ? Math.max(L.propFillOpacity, 0.75) : L.propFillOpacity} />
      </g>
      {/* phone lying on the floor */}
      <Glow id="phoneGlow" cx={700} cy={F - 10} r={200} ry={110} color={L.glowPhone} opacity={0.7 * phone} />
      <g filter={L.propFilter}>
        <path d={wobblyRect(665, F - 9, 70, 9, wf, 21, a(1))} fill={phone > 0.5 ? L.phoneOn : L.phoneOff} {...line} fillOpacity={phone > 0.5 ? 1 : L.propFillOpacity} />
      </g>
      {children}
      {/* floor line drawn last so feet sit on it */}
      <g filter={L.propFilter}>
        {L.floorW > 0 && <path d={wobblyLine(0, F, 1920, F, wf, 1, a(0.8))} stroke={L.floor} strokeWidth={L.floorW} fill="none" />}
      </g>
    </svg>
  );
};
