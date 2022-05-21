import React, { useEffect, useRef, useState } from 'react';
import { createContainer } from 'unstated-next';

import { VerkutLayerControllersList, VerkutLayerControllersListItem } from '~components/verkut-layer-controllers-list';
import { VerkutWindow } from '~components/verkut-window';

const useVerkutEngine = () => {
  const [outputCanvasEl, setOutputCanvasEl] = useState<HTMLCanvasElement | null>(null);

  return { outputCanvasEl, setOutputCanvasEl };
};

export const VerkutEngine = createContainer(useVerkutEngine);

const VerkutBody: React.FC = () => {
  const outputPreviewElRef = useRef<HTMLCanvasElement>(null);
  const { setOutputCanvasEl } = useVerkutEngine();

  useEffect(() => {
    const outputPreviewEl = outputPreviewElRef.current;
    if (!outputPreviewEl) {
      return;
    }

    setOutputCanvasEl(outputPreviewEl);
  }, []);

  return (
    <div className="verkut__mixer-area">
      <div className="verkut__layer-controllers-list-container">
        <VerkutLayerControllersList>
          <VerkutLayerControllersListItem />
          <VerkutLayerControllersListItem />
          <VerkutLayerControllersListItem />
          <VerkutLayerControllersListItem />
        </VerkutLayerControllersList>
      </div>
      <div className="verkut__output-preview-container">
        <VerkutWindow title="Output Preview">
          <canvas className="verkut__output-preview" />
        </VerkutWindow>
      </div>
    </div>
  );
};

export const Verkut: React.FC = () => (
  <div className="verkut">
    <VerkutEngine.Provider>
      <VerkutBody />
    </VerkutEngine.Provider>
  </div>
);
