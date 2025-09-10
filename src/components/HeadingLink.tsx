import React from 'react';

interface HeadingLinkProps {
  children: React.ReactNode;
  id: string;
}

export const HeadingLink = ({ children, id }: HeadingLinkProps) => {
  return React.createElement('h2', { id }, children);
};

export default HeadingLink;
