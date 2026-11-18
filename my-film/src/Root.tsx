import React from 'react';
import {Composition} from 'remotion';
import {TestFilm} from './films/TestFilm';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Test" component={TestFilm} durationInFrames={300} fps={30} width={1920} height={1080} />
  </>
);
