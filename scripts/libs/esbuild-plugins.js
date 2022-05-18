import { pathToFileURL, fileURLToPath } from 'url';

/** @type import('esbuild').Plugin */
export const externalizeNodeModulesPlugin = {
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
