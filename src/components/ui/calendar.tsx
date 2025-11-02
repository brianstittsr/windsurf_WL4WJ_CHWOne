import React from 'react';

export interface CalendarProps {
  mode?: 'single' | 'multiple';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
}

export function Calendar({ mode = 'single', selected, onSelect, initialFocus }: CalendarProps) {
  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '4px' }}>
      <input
        type="date"
        value={selected ? selected.toISOString().split('T')[0] : ''}
        onChange={(e) => onSelect?.(e.target.value ? new Date(e.target.value) : undefined)}
        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
      />
    </div>
  );
}
