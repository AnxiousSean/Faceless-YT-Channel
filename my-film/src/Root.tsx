import React from 'react';
import {Composition} from 'remotion';
import {StyledTestFilm} from './films/TestFilm';
import {CHANNEL_LOOK, STYLES} from './styles/looks';
import {CLASSIC} from './components/look';

// "Test" renders in the channel style (Pixel Art). Test-<style> compositions are alternates.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Test" component={() => <StyledTestFilm look={CHANNEL_LOOK} />} durationInFrames={300} fps={30} width={1920} height={1080} />
    {[CLASSIC, ...STYLES].map((look) => (
      <Composition key={look.id} id={`Test-${look.id}`} component={() => <StyledTestFilm look={look} />}
        durationInFrames={300} fps={30} width={1920} height={1080} />
    ))}
  </>
);
