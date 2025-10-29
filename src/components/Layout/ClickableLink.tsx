'use client';

import React, { forwardRef } from 'react';
import NextLink from 'next/link';
import { styled } from '@mui/material/styles';

/**
 * ClickableLink Component
 * 
 * A wrapper around Next.js Link component that ensures links are always clickable
 * by using pointer-events: all and a high z-index.
 */

interface ClickableLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

// Styled component with SUPER aggressive pointer events and z-index
const StyledLink = styled(NextLink)`
  position: relative;
  z-index: 99999; /* Ultra high z-index */
  pointer-events: all !important; /* Force pointer events with !important */
  cursor: pointer !important; /* Force cursor with !important */
  text-decoration: none;
  color: inherit;
  &:hover {
    text-decoration: none;
  }
  &::before {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    z-index: -1; /* Behind the link but still part of its clickable area */
    pointer-events: auto !important; /* Expand clickable area */
  }
`;

const ClickableLink = forwardRef<HTMLAnchorElement, ClickableLinkProps>(
  ({ href, children, className, onClick, style, ...props }, ref) => {
    return (
      <StyledLink
        href={href}
        className={className}
        onClick={(e) => {
          console.log(`[LINK] Clicked link to: ${href}`, {
            target: e.target,
            currentTarget: e.currentTarget,
            eventPhase: e.eventPhase,
            timestamp: new Date().toISOString(),
            bubbles: e.bubbles,
            cancelable: e.cancelable,
            defaultPrevented: e.defaultPrevented
          });
          
          // Don't stop propagation - this was preventing navigation
          // e.stopPropagation();
          
          // Call the original onClick handler if provided
          if (onClick) onClick(e);
        }}
        style={{
          ...style,
          position: 'relative',
          zIndex: 99999,
          pointerEvents: 'all',
          cursor: 'pointer',
          userSelect: 'none', // Prevent text selection interfering with clicks
          WebkitTapHighlightColor: 'transparent', // Remove tap highlight on mobile
        }}
        {...props}
        ref={ref}
      >
        {children}
      </StyledLink>
    );
  }
);

ClickableLink.displayName = 'ClickableLink';

export default ClickableLink;
