// src/components/ui/Button/Button.jsx
// Mirrors @UI/src/components/ui/Button/Button.tsx
import React from 'react';

/**
 * @param {{ children: React.ReactNode, variant?: 'primary' | 'secondary' } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button
      {...props}
      className={[
        'button',
        variant === 'primary'   && 'button-primary',
        variant === 'secondary' && 'button-secondary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

export default Button;
