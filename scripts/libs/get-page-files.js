import * as path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

import originalGlob from 'glob';

const glob = promisify(originalGlob);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pagesDirRoot = path.join(__dirname, '../../src/pages');
const tempJsDirRoot = path.join(__dirname, '../../temp/pages');
const pagesGlobPattern = path.join(pagesDirRoot, '**/!(_app|_document).tsx');

export const getPageFiles = async () => {
  /** @type string[] */
  const pageFilePaths = await glob(pagesGlobPattern);
  return pageFilePaths.map((pageFilePath) => ({
    fileSystemPath: pageFilePath,
    fsTempJsFilePath: path.join(tempJsDirRoot, path.relative(pagesDirRoot, pageFilePath)).replace(/\.tsx$/, '.js'),
    publicPath: '/' + path.relative(pagesDirRoot, pageFilePath).replace(/\.tsx$/, '.html'),
  }));
};
