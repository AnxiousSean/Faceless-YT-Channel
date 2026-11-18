import React, {createContext, useContext} from 'react';

// A "Look" decides HOW things are drawn. The story (timing, poses, sound) never changes.
export type Look = {
  id: string; label: string;
  bg: string; bgLow: string; floor: string; floorW: number;
  outline: string; outlineW: number; wobble: number; wobbleStatic?: boolean;
  propFillOpacity: number;
  shadeOn: string; shadeOff: string; base: string; windowFill: string; moon: string;
  phoneOff: string; phoneOn: string; screen: string;
  metal: string; plate: string; plate2: string;
  pip: string; pipDark: string; pipStroke: string; pipStrokeW: number; pipFillOpacity: number; limbW: number;
  face: string; item: string; itemDark: string;
  shadowBody: string; accent: string; accentCore: string;
  glow: number; glowWarm: string; glowCool: string; glowPhone: string; coneOpacity: number;
  propFilter?: string; charFilter?: string;
  text: string; textScale: number; textShadow: string; repColor: string; repStroke: string; hudBg: string;
  frameFilter?: (f: number) => string | undefined;
  weave?: (f: number) => string | undefined;
  Post?: React.FC<{frame: number}>;
};

export const CLASSIC: Look = {
  id: 'classic', label: 'Classic',
  bg: '#0C0E16', bgLow: '#08090E', floor: '#4A4E5A', floorW: 2.5,
  outline: '#8A8F9C', outlineW: 2.5, wobble: 1, propFillOpacity: 1,
  shadeOn: '#FFD9A0', shadeOff: '#2A2620', base: '#22252E', windowFill: '#111A30', moon: '#E8EEFF',
  phoneOff: '#1B1E26', phoneOn: '#9CCBFF', screen: '#2B5FA8',
  metal: '#B4B9C4', plate: '#2C303B', plate2: '#363B48',
  pip: '#FF9F45', pipDark: '#D9772A', pipStroke: 'none', pipStrokeW: 0, pipFillOpacity: 1, limbW: 14,
  face: '#1A1006', item: '#E8484F', itemDark: '#C23A41',
  shadowBody: '#000000', accent: '#A259FF', accentCore: '#E6D4FF',
  glow: 1, glowWarm: '#FFB86B', glowCool: '#8FB4FF', glowPhone: '#5EA8FF', coneOpacity: 0.08,
  text: '#FFFFFF', textScale: 1, textShadow: 'none', repColor: '#FFD45A', repStroke: '#000', hudBg: '#0C0E16cc',
};

export const LookContext = createContext<Look>(CLASSIC);
export const useLook = () => useContext(LookContext);

// Shared SVG filters (referenced by id from SVG groups and CSS `filter: url(#id)`).
export const FilterDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      {/* PIXEL: sample 1px per 7x7 block, grow it to fill the block, posterize the palette */}
      <filter id="pixelate" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
        <feFlood x="3" y="3" width="1" height="1" floodColor="#fff" />
        <feComposite width="7" height="7" />
        <feTile result="grid" />
        <feComposite in="SourceGraphic" in2="grid" operator="in" />
        <feMorphology operator="dilate" radius="3" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 0.125 0.25 0.375 0.5 0.625 0.75 0.875 1" />
          <feFuncG type="discrete" tableValues="0 0.125 0.25 0.375 0.5 0.625 0.75 0.875 1" />
          <feFuncB type="discrete" tableValues="0 0.125 0.25 0.375 0.5 0.625 0.75 0.875 1" />
        </feComponentTransfer>
      </filter>
      {/* PAPER: fibre texture + drop shadow under each cut-out piece */}
      <filter id="paper" x="-15%" y="-15%" width="140%" height="140%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="5" result="fib" />
        <feColorMatrix in="fib" type="saturate" values="0" />
        <feComponentTransfer result="fibg"><feFuncR type="linear" slope="0.45" intercept="0.28" /><feFuncG type="linear" slope="0.45" intercept="0.28" /><feFuncB type="linear" slope="0.45" intercept="0.28" /></feComponentTransfer>
        <feBlend in="SourceGraphic" in2="fibg" mode="soft-light" result="tex" />
        <feComposite in="tex" in2="SourceGraphic" operator="in" result="paper" />
        <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" />
        <feOffset dx="6" dy="8" />
        <feComponentTransfer><feFuncA type="linear" slope="0.65" /></feComponentTransfer>
        <feMerge><feMergeNode /><feMergeNode in="paper" /></feMerge>
      </filter>
      {/* CHALK: roughen edges + break strokes up with grain */}
      <filter id="chalk" x="0" y="0" width="1" height="1" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="6" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="9" result="g" />
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  7 0 0 0 -2.2" result="mask" />
        <feComposite in="d" in2="mask" operator="in" />
      </filter>
      {/* NEON: wide bloom + tight bloom + crisp tube */}
      <filter id="neon" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="b1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b2" />
        <feMerge><feMergeNode in="b1" /><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  </svg>
);
