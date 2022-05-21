import React from 'react';

import { Meta } from '~components/meta';
import { Verkut } from '~components/verkut';

const Page: React.FC = () => {
  return (
    <div className="p-app">
      <Meta title="VERKUT" description="Glitch playground on the Web." canonicalPath="/" />

      <Verkut />
    </div>
  );
};

export default Page;
