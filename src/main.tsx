import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Routes } from 'react-router-dom';

import { ClientApp } from '~pages/_app';
import IndexPage from '~pages/index';
import AboutPage from '~pages/about';

const Routing: React.FC = () => (
  <Routes>
    <Route path="/" element={<IndexPage />} />
    <Route path="/about/" element={<AboutPage />} />
  </Routes>
);

const rootEl = document.getElementById('space');

if (rootEl) {
  ReactDOM.hydrateRoot(
    rootEl,
    <ClientApp>
      <Routing />
    </ClientApp>
  );
}
