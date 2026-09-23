// src/components/ui/FormField/FormField.jsx
// Mirrors @UI/src/components/ui/FormField/FormField.tsx
import React from 'react';

/**
 * Wraps a form control with a label.
 * @param {{ label: string, required?: boolean, children: React.ReactNode }} props
 */
export function FormField({ label, required = false, children }) {
  return (
    <div className="form-field">
      <label className="form-field-label">
        {label}
        {required && <span className="form-field-required">*</span>}
      </label>
      {children}
    </div>
  );
}

export default FormField;
