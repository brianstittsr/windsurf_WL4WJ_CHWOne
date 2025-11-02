'use client';

import React from 'react';

export interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: any) => void;
}

export function Select({ children, value, onValueChange }: SelectProps) {
  const selectId = React.useId();
  return (
    <div style={{ position: 'relative' }}>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          appearance: 'none',
          backgroundColor: 'white',
        }}
      >
        {children}
      </select>
    </div>
  );
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  // This component is a conceptual placeholder for shadcn/ui compatibility.
  // In this basic implementation, it doesn't render anything itself.
  return null;
}

export function SelectValue() {
  // This component is a conceptual placeholder for shadcn/ui compatibility.
  return null;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  // In a real implementation, this would be a dropdown/popover.
  // For this basic version, we rely on the native select options.
  return <>{children}</>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
}
