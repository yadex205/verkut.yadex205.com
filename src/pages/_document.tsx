import React from 'react';

export interface DocumentProps {
  pageBody?: string;
}

const Document: React.FC<DocumentProps> = ({ pageBody = '' }) => (
  <html lang="ja">
    <head>
      <meta charSet="utf-8" />
    </head>
    <body>
      <div id="space" dangerouslySetInnerHTML={{ __html: pageBody }} />
    </body>
  </html>
);

export default Document;
