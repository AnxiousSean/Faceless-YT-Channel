import React from 'react';
import {BG, BG_LOW, FLOOR_LINE, FLOOR_Y, OUTLINE} from './theme';
import {wobblyPoly, wobblyRect, wobblyLine, wobblyCircle} from './wobble';
import {Glow} from './Glow';

// Night bedroom, side-on. Light sources: floor lamp (warm), moon through window (cool), phone (cold blue).
export const Room: React.FC<{frame: number; lamp: number; phone: number; children?: React.ReactNode}> = ({frame, lamp, phone, children}) => {
  const F = FLOOR_Y;
  return (
    <svg width={1920} height={1080} style={{position: 'absolute'}}>
      <rect width={1920} height={1080} fill={BG} />
      <rect y={F} width={1920} height={1080 - F} fill={BG_LOW} />
      {/* moon + window */}
      <Glow id="moonGlow" cx={1560} cy={330} r={320} color="#8FB4FF" opacity={0.28} />
      <path d={wobblyRect(1390, 230, 300, 320, frame, 3)} fill="#111A30" stroke={OUTLINE} strokeWidth={2.5} />
      <path d={wobblyCircle(1580, 320, 40, frame, 9)} fill="#E8EEFF" />
      <path d={wobblyLine(1540, 232, 1540, 548, frame, 4)} stroke={OUTLINE} strokeWidth={2.5} fill="none" />
      <path d={wobblyLine(1392, 390, 1688, 390, frame, 5)} stroke={OUTLINE} strokeWidth={2.5} fill="none" />
      <polygon points={`1390,550 1690,550 1500,${F} 1150,${F}`} fill="#8FB4FF" opacity={0.05} />
      <Glow id="moonPool" cx={1330} cy={F} r={260} ry={26} color="#8FB4FF" opacity={0.25} />
      {/* floor lamp */}
      <Glow id="lampGlow" cx={380} cy={F - 450} r={720} color="#FFB86B" opacity={0.55 * lamp} />
      <polygon points={`292,${F - 430} 468,${F - 430} 640,${F} 120,${F}`} fill="#FFC27A" opacity={0.08 * lamp} />
      <Glow id="lampPool" cx={380} cy={F} r={380} ry={40} color="#FFC27A" opacity={0.6 * lamp} />
      <path d={wobblyLine(380, F - 430, 380, F - 10, frame, 11)} stroke={OUTLINE} strokeWidth={5} fill="none" />
      <path d={wobblyRect(335, F - 12, 90, 12, frame, 12)} fill="#22252E" stroke={OUTLINE} strokeWidth={2.5} />
      <path d={wobblyPoly([[330, F - 520], [430, F - 520], [470, F - 430], [290, F - 430]], frame, 13)}
        fill={lamp > 0.5 ? '#FFD9A0' : '#2A2620'} stroke={OUTLINE} strokeWidth={2.5} />
      {/* phone lying on the floor */}
      <Glow id="phoneGlow" cx={700} cy={F - 10} r={200} ry={110} color="#5EA8FF" opacity={0.7 * phone} />
      <path d={wobblyRect(665, F - 9, 70, 9, frame, 21, 1)} fill={phone > 0.5 ? '#9CCBFF' : '#1B1E26'} stroke={OUTLINE} strokeWidth={2} />
      {children}
      {/* floor line drawn last so feet sit on it */}
      <path d={wobblyLine(0, F, 1920, F, frame, 1, 0.8)} stroke={FLOOR_LINE} strokeWidth={2.5} fill="none" />
    </svg>
  );
};
