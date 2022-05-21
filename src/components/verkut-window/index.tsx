import React from 'react';

interface VerkutWindowProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
}

export const VerkutWindow: React.FC<VerkutWindowProps> = ({ children, title }) => (
  <div className="verkut-window">
    <div className="verkut-window__header">{title}</div>
    <div className="verkut-window__body">{children}</div>
  </div>
);
