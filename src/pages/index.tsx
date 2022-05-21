import React from 'react';

import { Meta } from '~components/meta';
import { VerkutLayerControllersList, VerkutLayerControllersListItem } from '~components/verkut-layer-controllers-list';

const Page: React.FC = () => {
  return (
    <div className="p-app">
      <Meta title="VERKUT" description="Glitch playground on the Web." canonicalPath="/" />

      <div className="verkut">
        <VerkutLayerControllersList>
          <VerkutLayerControllersListItem />
          <VerkutLayerControllersListItem />
          <VerkutLayerControllersListItem />
          <VerkutLayerControllersListItem />
        </VerkutLayerControllersList>
      </div>
    </div>
  );
};

export default Page;
