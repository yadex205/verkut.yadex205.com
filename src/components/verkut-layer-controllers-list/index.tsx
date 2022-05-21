import React from 'react';

import { VerkutWindow } from '~components/verkut-window';

export interface VerkutLayerControllersListProps {
  children?: React.ReactNode;
}

export const VerkutLayerControllersList: React.FC<VerkutLayerControllersListProps> = ({ children }) => (
  <ul className="verkut-layer-controllers-list">{children}</ul>
);

export interface VerkutLayerControllersListItemProps {
  label?: string;
}

export const VerkutLayerControllersListItem: React.FC<VerkutLayerControllersListItemProps> = ({
  label = 'No name',
}) => (
  <li className="verkut-layer-controllers-list__item">
    <VerkutWindow title={label}>
      <div className="verkut-layer-controllers-list__item__body">
        <canvas className="verkut-layer-controllers-list__item__preview-area" />
        <div className="verkut-layer-controllers-list__item__status-area">
          <div className="verkut-layer-controllers-list__item__material-name">Material Name</div>
        </div>
      </div>
    </VerkutWindow>
  </li>
);
