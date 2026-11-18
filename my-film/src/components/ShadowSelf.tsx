import React from 'react';
import {useLook} from './look';

// The Shadow: Pip's body, pure black, taller, glowing accent outline, two slit eyes.
// grow: 1 = normal (1.15x Pip). Bigger when Pip is weaker. rise: 0..1 emerging from floor.
export const ShadowSelf: React.FC<{x: number; y: number; frame: number; grow: number; rise: number; glow?: number; lean?: number}> = ({x, y, frame, grow, rise, glow = 1, lean = 0}) => {
  const L = useLook();
  const sway = Math.sin(frame * 0.05) * 4;
  const handL: [number, number] = [-62, -36 + sway];
  const handR: [number, number] = [62, -36 - sway];
  const arm = (side: number, h: [number, number]) => `M ${side * 36} -118 Q ${side * 70} -80 ${h[0]} ${h[1]}`;
  const shapes = (c: string, limb: number, extra: number) => (
    <g fill={c} stroke={c} strokeLinecap="round">
      <path d="M -18 -40 Q -24 -18 -26 0" strokeWidth={limb} fill="none" />
      <path d="M 18 -40 Q 24 -18 26 0" strokeWidth={limb} fill="none" />
      <ellipse cx={0} cy={-90} rx={47 + extra} ry={58 + extra} strokeWidth={0} />
      <circle cx={0} cy={-205} r={78 + extra} strokeWidth={0} />
      <path d={arm(-1, handL)} strokeWidth={limb} fill="none" />
      <path d={arm(1, handR)} strokeWidth={limb} fill="none" />
    </g>
  );
  const flick = 0.85 + 0.15 * Math.sin(frame * 0.6) * Math.sin(frame * 0.23);
  return (
    <g filter={L.charFilter}>
      <g transform={`translate(${x} ${y}) skewX(${lean}) scale(${grow} ${grow * 1.15 * rise})`} opacity={Math.min(1, rise * 1.5)}>
        <defs>
          <filter id="vglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={14} /></filter>
          <filter id="vglowS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={4} /></filter>
        </defs>
        <g filter="url(#vglow)" opacity={0.85 * glow * flick * L.glow}>{shapes(L.accent, 26, 8)}</g>
        {shapes(L.accent, 20, 3)}
        {shapes(L.shadowBody, 14, 0)}
        {/* slit eyes */}
        <g stroke={L.accent} strokeWidth={6} strokeLinecap="round">
          <g filter="url(#vglowS)"><path d="M -44 -214 L -12 -202" /><path d="M 44 -214 L 12 -202" /></g>
          <path d="M -44 -214 L -12 -202" stroke={L.accentCore} strokeWidth={3} />
          <path d="M 44 -214 L 12 -202" stroke={L.accentCore} strokeWidth={3} />
        </g>
      </g>
    </g>
  );
};
