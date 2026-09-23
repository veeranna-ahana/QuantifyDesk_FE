// src/components/ui/Textarea/Textarea.jsx
// Mirrors @UI/src/components/ui/Textarea/Textarea.tsx — fully interactive
import React from 'react';

/**
 * @param {React.TextareaHTMLAttributes<HTMLTextAreaElement>} props
 */
export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      {...props}
      className={['form-textarea', className].filter(Boolean).join(' ')}
    />
  );
}

export default Textarea;
