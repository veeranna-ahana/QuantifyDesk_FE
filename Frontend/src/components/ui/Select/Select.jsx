// src/components/ui/Select/Select.jsx
// Mirrors @UI/src/components/ui/Select/Select.tsx — fully interactive
import React from 'react';

/**
 * @param {{ value: string, options: Array<{value: string, label: string}>, onChange: Function } & React.SelectHTMLAttributes<HTMLSelectElement>} props
 */
export function Select({ value, options = [], className = '', ...props }) {
  return (
    <select
      value={value}
      {...props}
      className={['form-input', className].filter(Boolean).join(' ')}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export default Select;
