import React from 'react';

export interface WorldProps {
  children?: React.ReactNode;
}
export const World: React.FC<WorldProps> = ({ children }) => <div className="world">{children}</div>;
