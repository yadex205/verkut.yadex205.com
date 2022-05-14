import esbuild from 'esbuild';
import React from 'react';
import { renderToString } from 'react-dom/server';

const main = async () => {
  await esbuild.build({
    entryPoints: ['src/pages/index.tsx'],
    outfile: 'temp/pages/index.js',
    bundle: false,
  });

  const page = (await import('../temp/pages/index.js')).default;
  const html = renderToString(React.createElement(page));

  console.log(html);
};

main();
