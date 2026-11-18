import {continueRender, delayRender, staticFile} from 'remotion';

const handle = delayRender('Loading Comic Neue');
Promise.all(
  [['400', 'comic-neue-latin-400-normal.woff2'], ['700', 'comic-neue-latin-700-normal.woff2']].map(([w, file]) => {
    const face = new FontFace('Comic Neue', `url('${staticFile(`fonts/${file}`)}') format('woff2')`, {weight: w});
    return face.load().then((f) => (document.fonts as unknown as Set<FontFace>).add(f));
  }),
).then(() => continueRender(handle));
