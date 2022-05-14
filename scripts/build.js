import { promises as fsPromises } from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

import * as esbuild from 'esbuild';
import * as React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';

const pageSourcePaths = ['src/pages/index.tsx'];

/** @type esbuild.CommonOptions.define */
const env = {
  'process.env.CANONICAL_URL_ORIGIN': JSON.stringify('https://www.yadex205.info'),
};

/** @type esbuild.Plugin */
const externalizeNodeModulesPlugin = {
  name: 'ExternalizeNodeModulesPlugin',
  setup: (build) => {
    build.onResolve({ filter: /^[^~].*/ }, async (args) => {
      const resolveDirUrl = pathToFileURL(args.resolveDir + '/');
      const dummyParentUrl = new URL('./dummy-parent.js', resolveDirUrl.href);
      const resolvedUrl = await import.meta.resolve(args.path, dummyParentUrl.href);
      const resolvedPath = fileURLToPath(resolvedUrl);

      if (resolvedPath.includes('node_modules')) {
        return { path: args.path, external: true };
      }

      return { path: resolvedPath };
    });
  },
};

const main = async () => {
  await esbuild.build({
    entryPoints: ['src/pages/_app.tsx'],
    outfile: 'temp/pages/_app.js',
    bundle: true,
    format: 'esm',
    plugins: [externalizeNodeModulesPlugin],
    define: env,
  });
  /** @type typeof import('../src/pages/_app').default */
  const AppComponent = (await import('../temp/pages/_app.js')).default;

  await esbuild.build({
    entryPoints: ['src/pages/_document.tsx'],
    outfile: 'temp/pages/_document.js',
    bundle: true,
    format: 'esm',
    plugins: [externalizeNodeModulesPlugin],
    define: env,
  });
  /** @type typeof import('../src/pages/_document').default */
  const DocumentComponent = (await import('../temp/pages/_document.js')).default;

  for (const pageSourcePath of pageSourcePaths) {
    const tempPath = path.join('temp', path.relative('src', pageSourcePath)).replace(/\.tsx$/, '.js');
    const destPath = path.join('build', path.relative('src/pages', pageSourcePath)).replace(/\.tsx$/, '.html');

    await esbuild.build({
      entryPoints: [pageSourcePath],
      outfile: tempPath,
      bundle: true,
      format: 'esm',
      plugins: [externalizeNodeModulesPlugin],
      define: env,
    });
    const PageComponent = (await import(path.resolve(tempPath))).default;
    /** @type import('react-helmet-async').FilledContext */
    const helmetContext = {};

    const pageBody = renderToString(
      React.createElement(AppComponent, { helmetContext }, React.createElement(PageComponent))
    );
    const htmlAttributes = helmetContext.helmet.htmlAttributes.toComponent();
    const headFragment = React.createElement(
      React.Fragment,
      null,
      helmetContext.helmet.title.toComponent(),
      helmetContext.helmet.meta.toComponent(),
      helmetContext.helmet.link.toComponent(),
      helmetContext.helmet.style.toComponent(),
      helmetContext.helmet.script.toComponent(),
      helmetContext.helmet.noscript.toComponent()
    );

    const html = renderToStaticMarkup(
      React.createElement(DocumentComponent, { htmlAttributes, headFragment, pageBody })
    );

    await fsPromises.mkdir(path.dirname(destPath), { recursive: true });
    await fsPromises.writeFile(destPath, html);
  }
};

main();
