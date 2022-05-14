import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import { World } from '~components/world';

export interface AppProps {
  children?: React.ReactNode;
  helmetContext?: {};
}

const App: React.FC<AppProps> = ({ children, helmetContext }) => (
  <HelmetProvider context={helmetContext}>
    <Helmet>
      <html lang="ja" />
    </Helmet>
    <World>{children}</World>
  </HelmetProvider>
);

export default App;
