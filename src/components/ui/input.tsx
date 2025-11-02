import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={className}
        ref={ref}
        {...props}
        style={{
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '100%',
          ...props.style
        }}
      />
    );
  }
);

Input.displayName = 'Input';
