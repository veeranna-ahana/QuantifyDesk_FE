// src/components/ui/ReadOnlyField/ReadOnlyField.jsx
// Mirrors @UI/src/components/ui/ReadOnlyField/ReadOnlyField.tsx
import React from 'react';

/**
 * Displays a label-value pair in read-only form.
 * @param {{ label: string, value: string }} props
 */
export function ReadOnlyField({ label, value }) {
  return (
    <div className="readonly-field">
      <span className="readonly-field-label">{label}</span>
      <span className="readonly-field-value">{value}</span>
    </div>
  );
}

export default ReadOnlyField;
