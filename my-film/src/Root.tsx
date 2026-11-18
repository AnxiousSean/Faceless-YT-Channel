import React from 'react';
import {Composition} from 'remotion';
import {StyledTestFilm} from './films/TestFilm';
import {CastTest} from './films/CastTest';
import {CHANNEL_LOOK, STYLES} from './styles/looks';
import {CLASSIC} from './components/look';
import {ThreeChairs, THREE_CHAIRS_FRAMES} from './films/ThreeChairs';
import {Watched, WATCHED_FRAMES} from './films/watched/Watched';

// "Test" and "CastTest" render in the channel style (Horror Ink). Test-<style> compositions are alternates.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ThreeChairs" component={ThreeChairs} durationInFrames={THREE_CHAIRS_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Watched" component={Watched} durationInFrames={WATCHED_FRAMES} fps={30} width={1920} height={1080} />
    <Composition id="Test" component={() => <StyledTestFilm look={CHANNEL_LOOK} />} durationInFrames={300} fps={30} width={1920} height={1080} />
    <Composition id="CastTest" component={() => <CastTest look={CHANNEL_LOOK} />} durationInFrames={150} fps={30} width={1920} height={1080} />
    {[CLASSIC, ...STYLES].map((look) => (
      <Composition key={look.id} id={`Test-${look.id}`} component={() => <StyledTestFilm look={look} />}
        durationInFrames={300} fps={30} width={1920} height={1080} />
    ))}
  </>
);
