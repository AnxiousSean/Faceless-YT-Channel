import React from 'react';
import {Composition} from 'remotion';
import {TestFilm, StyledTestFilm} from './films/TestFilm';
import {STYLES} from './styles/looks';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Test" component={TestFilm} durationInFrames={300} fps={30} width={1920} height={1080} />
    {STYLES.map((look) => (
      <Composition key={look.id} id={`Test-${look.id}`} component={() => <StyledTestFilm look={look} />}
        durationInFrames={300} fps={30} width={1920} height={1080} />
    ))}
  </>
);
