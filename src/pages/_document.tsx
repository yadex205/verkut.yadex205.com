import React from 'react';

export interface DocumentProps {
  htmlAttributes?: React.HTMLAttributes<HTMLHtmlElement>;
  headFragment?: React.ReactNode;
  pageBody?: string;
}

const Document: React.FC<DocumentProps> = ({ htmlAttributes, headFragment, pageBody = '' }) => (
  <html {...htmlAttributes}>
    <head>
      <meta charSet="utf-8" />
      {headFragment}
    </head>
    <body>
      <div id="space" dangerouslySetInnerHTML={{ __html: pageBody }} />
    </body>
  </html>
);

export default Document;
