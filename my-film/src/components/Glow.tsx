import React from 'react';
// Big soft radial glow. Place inside an <svg>. Unique id per instance.
export const Glow: React.FC<{id: string; cx: number; cy: number; r: number; color: string; opacity: number; rx?: number; ry?: number}> = ({id, cx, cy, r, color, opacity, rx, ry}) => (
  <>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={color} stopOpacity={1} />
        <stop offset="35%" stopColor={color} stopOpacity={0.45} />
        <stop offset="70%" stopColor={color} stopOpacity={0.12} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <ellipse cx={cx} cy={cy} rx={rx ?? r} ry={ry ?? r} fill={`url(#${id})`} opacity={opacity} style={{mixBlendMode: 'screen'}} />
  </>
);
