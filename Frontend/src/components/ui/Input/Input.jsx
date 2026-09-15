// src/components/ui/Input/Input.jsx
// Mirrors @UI/src/components/ui/Input/Input.tsx — fully interactive (not readOnly)
import React from 'react';

/**
 * @param {React.InputHTMLAttributes<HTMLInputElement>} props
 */
export function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={['form-input', className].filter(Boolean).join(' ')}
    />
  );
}

export default Input;
