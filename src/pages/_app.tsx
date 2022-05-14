import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server.js';

import { World } from '~components/world';

export interface AppProps {
  children?: React.ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => (
  <World>
    <Helmet>
      <html lang="ja" />
    </Helmet>
    {children}
  </World>
);

interface ServerAppProps {
  children?: React.ReactNode;
  location: string;
  helmetContext?: {};
}

export const ServerApp: React.FC<ServerAppProps> = ({ children, location, helmetContext }) => (
  <HelmetProvider context={helmetContext}>
    <StaticRouter location={location}>
      <App>{children}</App>
    </StaticRouter>
  </HelmetProvider>
);

interface ClientAppProps {
  children?: React.ReactNode;
}

export const ClientApp: React.FC<ClientAppProps> = ({ children }) => (
  <HelmetProvider>
    <BrowserRouter>
      <App>{children}</App>
    </BrowserRouter>
  </HelmetProvider>
);
