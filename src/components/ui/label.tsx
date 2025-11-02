import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={className}
        {...props}
        style={{
          display: 'block',
          marginBottom: '4px',
          fontWeight: 500,
          ...props.style
        }}
      />
    );
  }
);

Label.displayName = 'Label';
