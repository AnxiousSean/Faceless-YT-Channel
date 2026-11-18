// Usage: node scripts/stills.mjs outDir frame1,frame2 comp1,comp2
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [outDir, frames, comps] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const id of comps.split(',')) {
  const composition = await selectComposition({serveUrl, id, browserExecutable});
  for (const frame of frames.split(',').map(Number)) {
    await renderStill({serveUrl, composition, frame, output: `${outDir}/${id}-${frame}.png`, scale: Number(process.env.SCALE ?? 0.5), browserExecutable});
  }
}
console.log('done');
