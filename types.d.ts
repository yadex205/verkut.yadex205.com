import React from 'react';

import { DocumentProps } from 'src/pages/_document';

declare module 'temp/pages/_document.js' {
  const Document: React.FC<DocumentProps>;
  export default Document;
}
