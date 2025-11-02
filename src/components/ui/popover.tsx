import React, { useState } from 'react';

export interface PopoverProps {
  children: React.ReactNode;
}

export function Popover({ children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { open, setOpen });
        }
        return child;
      })}
    </div>
  );
}

export function PopoverTrigger({ children, open, setOpen }: any) {
  return (
    <div onClick={() => setOpen?.(!open)}>
      {children}
    </div>
  );
}

export function PopoverContent({ children, open }: any) {
  if (!open) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: '4px',
      padding: '16px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000
    }}>
      {children}
    </div>
  );
}
