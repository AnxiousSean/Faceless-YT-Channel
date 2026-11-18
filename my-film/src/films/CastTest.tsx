import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import '../components/fonts';
import {FLOOR_Y} from '../components/theme';
import {FilterDefs, Look, LookContext} from '../components/look';
import {Room} from '../components/Room';
import {Pip, CastMember} from '../components/Pip';
import {ShadowSelf} from '../components/ShadowSelf';
import {Narrator, Letterbox} from '../components/Overlay';
import {blinkAt} from '../components/anim';

// A line-up showing how each story gets its own cast, drawn in the channel style.
const CAST: (CastMember & {x: number; brow: number; mouth: number; delay: number})[] = [
  {x: 640, skin: '#F1C7A3', shirt: '#3B4A6B', pants: '#22262F', hair: '#2A1A10', hairStyle: 'short', brow: -10, mouth: -0.3, delay: 0},
  {x: 860, skin: '#8D5A3B', shirt: '#7A2E2E', pants: '#1E2230', hair: '#0E0A08', hairStyle: 'long', brow: -14, mouth: -0.5, delay: 7},
  {x: 1080, skin: '#C99A72', shirt: '#2F5A46', pants: '#2B2B2B', hair: '#3A2A1C', hairStyle: 'cap', brow: 8, mouth: 0, delay: 14},
  {x: 1300, skin: '#F4D3B8', shirt: '#5B4A7A', pants: '#1F1F28', hair: '#C9A26A', hairStyle: 'bun', brow: -6, mouth: 0.2, delay: 21},
];

export const CastTest: React.FC<{look: Look}> = ({look}) => {
  const f = useCurrentFrame();
  const flicker = f > 90 && f < 100 ? (Math.sin(f * 3.1) > 0 ? 0.25 : 1) : 1;
  const lamp = (0.97 + 0.03 * Math.sin(f * 0.9)) * flicker;
  const rise = interpolate(f, [92, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <LookContext.Provider value={look}>
      <AbsoluteFill style={{background: look.bg}}>
        <FilterDefs />
        <AbsoluteFill>
          <Room frame={f} lamp={lamp} phone={0}>
            <ShadowSelf x={1560} y={FLOOR_Y} frame={f} grow={1.25} rise={rise} lean={-4} />
            {CAST.map((c, i) => {
              const scared = interpolate(f, [100, 108], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
              return (
                <Pip key={i} {...c} y={FLOOR_Y} frame={f}
                  squash={Math.sin((f + c.delay) * 0.12) * 0.015 + scared * 0.05}
                  browL={c.brow * (1 - scared) - 20 * scared} browR={c.brow * (1 - scared) - 20 * scared} browY={-10 * scared}
                  mouth={c.mouth * (1 - scared)} mouthOpen={scared * 0.6} look={scared * 8}
                  blink={blinkAt(f, 30 + c.delay, 75 + c.delay)} />
              );
            })}
          </Room>
          <Narrator text="Every story gets its own cast." frame={f} from={8} to={85} />
        </AbsoluteFill>
        {look.Post && <look.Post frame={f} />}
        <Letterbox />
      </AbsoluteFill>
    </LookContext.Provider>
  );
};
