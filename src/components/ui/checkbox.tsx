'use client';

import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={className}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
        style={{ width: '16px', height: '16px', ...props.style }}
      />
    );
  }
);

Checkbox.displayName = 'Checkbox';
