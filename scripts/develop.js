import * as esbuild from 'esbuild';
import * as React from 'react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';

import { DevServer } from './libs/dev-server.js';
import { externalizeNodeModulesPlugin } from './libs/esbuild-plugins.js';
import { getPageFiles } from './libs/get-page-files.js';

const NODE_ENV = process.env.NODE_ENV || 'development';

/** @type esbuild.CommonOptions.define */
const env = {
  'process.env.CANONICAL_URL_ORIGIN': JSON.stringify('https://www.yadex205.info'),
  'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
  'process.env.DEV_SERVER': JSON.stringify('true'),
};

/**
 * @param {DevServer} devServer
 * @param {string} publicPath
 * @return {esbuild.Plugin}
 */
// const pushSingleFile

class Develop {
  #devServer = new DevServer();
  /** @type typeof import('../src/pages/_document').default */
  #documentComponent;
  /** @type esbuild.BuildIncremental */
  #appBuilder;
  /** @type typeof import('../src/pages/_app').ServerApp */
  #appComponent;
  /** @type esbuild.BuildIncremental[] */
  #pageBuilders = [];

  setup = async () => {
    let isFirstBuild = true;

    /** @type esbuild.Plugin */
    const mainScriptBuilderPlugin = {
      name: 'MainScriptBuilderPlugin',
      setup: (build) => {
        build.onEnd((result) => {
          const file = result.outputFiles[0];
          if (file) {
            this.#devServer.pushFiles([{ contents: file.contents, pathname: '/main.js' }]);
          }
        });
      },
    };

    await esbuild.build({
      entryPoints: ['src/main.tsx'],
      outfile: 'build/main.js',
      minify: NODE_ENV === 'production',
      bundle: true,
      format: 'iife',
      define: env,
      watch: true,
      incremental: true,
      write: false,
      plugins: [mainScriptBuilderPlugin],
    });

    /** @type esbuild.Plugin */
    const mainStyleBuilderPlugin = {
      name: 'MainStyleBuilderPlugin',
      setup: (build) => {
        build.onEnd((result) => {
          const file = result.outputFiles[0];
          if (file) {
            this.#devServer.pushFiles([{ contents: file.contents, pathname: '/main.css' }]);
          }
        });
      },
    };

    await esbuild.build({
      entryPoints: ['src/styles/main.css'],
      outfile: 'build/main.css',
      minify: NODE_ENV === 'production',
      bundle: true,
      watch: true,
      incremental: true,
      write: false,
      plugins: [mainStyleBuilderPlugin],
    });

    /** @type esbuild.Plugin */
    const documentBuilderPlugin = {
      name: 'DocumentBuilderPlugin',
      setup: (build) => {
        build.onEnd(async () => {
          this.#documentComponent = (await import('../temp/pages/_document.js')).default;
          if (!isFirstBuild && this.#appBuilder) {
            this.#appBuilder.rebuild();
          }
        });
      },
    };

    await esbuild.build({
      entryPoints: ['src/pages/_document.tsx'],
      outfile: 'temp/pages/_document.js',
      bundle: true,
      minify: NODE_ENV === 'production',
      format: 'esm',
      define: env,
      watch: true,
      incremental: true,
      plugins: [externalizeNodeModulesPlugin, documentBuilderPlugin],
    });

    /** @type esbuild.Plugin */
    const appBuilderPlugin = {
      name: 'AppBuilderPlugin',
      setup: (build) => {
        build.onEnd(async () => {
          this.#appComponent = (await import('../temp/pages/_app.js')).ServerApp;
          if (!isFirstBuild) {
            this.#pageBuilders.forEach((pageBuilder) => pageBuilder.rebuild());
          }
        });
      },
    };

    this.#appBuilder = await esbuild.build({
      entryPoints: ['src/pages/_app.tsx'],
      outfile: 'temp/pages/_app.js',
      bundle: true,
      minify: NODE_ENV === 'production',
      format: 'esm',
      define: env,
      watch: true,
      incremental: true,
      plugins: [externalizeNodeModulesPlugin, appBuilderPlugin],
    });

    const pageFiles = await getPageFiles();
    for (const pageFile of pageFiles) {
      /** @type esbuild.Plugin */
      const pageBuilderPlugin = {
        name: 'PageBuilderPlugin',
        setup: (build) => {
          build.onEnd(async () => {
            const DocumentComponent = this.#documentComponent;
            const AppComponent = this.#appComponent;
            const PageComponent = (await import(pageFile.fsTempJsFilePath)).default;
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

            const contents = renderToStaticMarkup(
              React.createElement(DocumentComponent, { htmlAttributes, headFragment, pageBody })
            );
            this.#devServer.pushFiles([{ contents, pathname: pageFile.publicPath }]);
          });
        },
      };

      const pageBuilder = await esbuild.build({
        entryPoints: [pageFile.fileSystemPath],
        outfile: pageFile.fsTempJsFilePath,
        bundle: true,
        format: 'esm',
        define: env,
        incremental: true,
        watch: true,
        plugins: [externalizeNodeModulesPlugin, pageBuilderPlugin],
      });

      this.#pageBuilders.push(pageBuilder);
    }

    isFirstBuild = false;
  };

  start = () => {
    this.#devServer.start();
  };
}

const dev = new Develop();
await dev.setup();
dev.start();
