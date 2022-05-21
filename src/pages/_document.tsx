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
      <link rel="stylesheet" href="/main.css" />
      {process.env.DEV_SERVER && <script src="/__dev-server-client.js" />}
    </head>
    <body>
      <div id="space" dangerouslySetInnerHTML={{ __html: pageBody }} />
      <script src="/main.js" />
    </body>
  </html>
);

export default Document;
