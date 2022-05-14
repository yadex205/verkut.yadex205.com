import { promises as fsPromises } from 'fs';
import path from 'path';

import esbuild from 'esbuild';
import React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';

interface PageModule {
  default: React.FC;
}

const pageSourcePaths = ['src/pages/index.tsx'];

const main = async () => {
  await esbuild.build({
    entryPoints: ['src/pages/_document.tsx'],
    outfile: 'temp/pages/_document.js',
    bundle: false,
  });
  const DocumentComponent = (await import('../temp/pages/_document.js')).default;

  for (const pageSourcePath of pageSourcePaths) {
    const tempPath = path.join('temp', path.relative('src', pageSourcePath));
    const destPath = path.join('build', path.relative('src/pages', pageSourcePath)).replace(/\.tsx$/, '.html');

    await esbuild.build({
      entryPoints: [pageSourcePath],
      outfile: tempPath,
      bundle: false,
    });

    const PageComponent = ((await import(path.resolve(tempPath))) as PageModule).default;

    const html = renderToStaticMarkup(<DocumentComponent pageBody={renderToString(<PageComponent />)} />);
    await fsPromises.mkdir(path.dirname(destPath), { recursive: true });
    await fsPromises.writeFile(destPath, html);
  }
};

main();
