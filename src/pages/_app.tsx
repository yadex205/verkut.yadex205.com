import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

export interface AppProps {
  children?: React.ReactNode;
  helmetContext?: {};
}

const App: React.FC<AppProps> = ({ children, helmetContext }) => (
  <HelmetProvider context={helmetContext}>
    <Helmet>
      <html lang="ja" />
    </Helmet>
    {children}
  </HelmetProvider>
);

export default App;
