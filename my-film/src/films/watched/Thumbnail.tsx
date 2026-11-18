import React from 'react';
import {AbsoluteFill} from 'remotion';
import '../../components/fonts';
import {FilterDefs, LookContext} from '../../components/look';
import {CHANNEL_LOOK} from '../../styles/looks';
import {ShadowSelf} from '../../components/ShadowSelf';
import {FONT} from '../../components/theme';
import {AP, Apartment, F, SIT_Y, theoPose} from './kit';

// YouTube thumbnail for WATCHED (render as a still at 1280x720).
const PUSH = {s: 2.15, ox: 930, oy: 560};
export const WatchedThumbnail: React.FC<{variant?: 'who' | 'count'}> = ({variant = 'who'}) => {
  const L = CHANNEL_LOOK;
  const menace = (glowOnly: boolean) => (
    <g opacity={glowOnly ? 0.85 : 1}>
      <ShadowSelf x={AP.chairX - 210} y={F + 40} frame={12} grow={1.55} rise={1} glow={glowOnly ? 1.6 : 1.2} lean={6} />
    </g>
  );
  return (
    <LookContext.Provider value={L}>
      <AbsoluteFill style={{background: L.bg}}>
        <FilterDefs />
        <AbsoluteFill style={{filter: 'contrast(1.35) saturate(1.45) brightness(1.08)'}}>
        <Apartment frame={0} dark={0.5} screen={1} push={PUSH} behind={menace(false)}
          theo={theoPose(0, {x: AP.chairX, sit: 1, typing: 0, look: -7, browL: -26, browR: -26, browY: -16, mouth: -0.6, mouthOpen: 0.9, squash: -0.04})} />
        </AbsoluteFill>
        {/* re-light the menace's red edge and eyes above the darkness so they pop at small sizes */}
        <AbsoluteFill style={{transform: `scale(${PUSH.s})`, transformOrigin: `${PUSH.ox}px ${PUSH.oy}px`, mixBlendMode: 'screen', opacity: 0.75}}>
          <svg width={1920} height={1080} style={{position: 'absolute'}}>
            <g style={{filter: 'saturate(1.3)'}}>{menace(true)}</g>
          </svg>
        </AbsoluteFill>
        {/* text */}
        {variant === 'who' ? (
          <div style={{position: 'absolute', right: 60, top: 70, textAlign: 'right', fontFamily: FONT, fontWeight: 700, fontSize: 150, lineHeight: 0.95,
            color: '#FFFFFF', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 8px 24px #000'}}>
            WHO'S<br /><span style={{color: L.accent, textShadow: `0 0 40px ${L.accent}aa, 0 8px 24px #000`}}>WATCHING?</span>
          </div>
        ) : (
          <div style={{position: 'absolute', right: 60, top: 40, textAlign: 'right', fontFamily: FONT, fontWeight: 700, lineHeight: 0.9,
            color: '#FFFFFF', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 8px 24px #000'}}>
            <div style={{fontSize: 260, color: L.accent, textShadow: `0 0 50px ${L.accent}aa, 0 8px 24px #000`}}>37</div>
            <div style={{fontSize: 118}}>RECORDINGS</div>
          </div>
        )}
        {/* little REC badge */}
        <div style={{position: 'absolute', left: 60, top: 60, fontFamily: FONT, fontWeight: 700, fontSize: 64, color: '#fff', WebkitTextStroke: '6px #000', paintOrder: 'stroke fill',
          display: 'flex', alignItems: 'center', gap: 16}}>
          <span style={{display: 'inline-block', width: 46, height: 46, borderRadius: 23, background: L.accent, boxShadow: `0 0 30px ${L.accent}`, border: '5px solid #000'}} /> REC
        </div>
        {/* red glowing frame like the reference thumbnails */}
        <AbsoluteFill style={{border: `16px solid ${L.accent}`, boxShadow: `inset 0 0 60px ${L.accent}aa`}} />
      </AbsoluteFill>
    </LookContext.Provider>
  );
};
export {SIT_Y};
