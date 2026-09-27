import { forwardRef, useId } from 'react';

import { FormField } from '@/components/ui/FormField';
import { cn } from '@/lib/cn';

import { fieldStyles } from './Input.styles';

export const Input = forwardRef(function Input(
  { label, error, helperText, required, leadingIcon, size, id, className, wrapperClassName, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FormField label={label} htmlFor={inputId} required={required} error={error} helperText={helperText} className={wrapperClassName}>
      <div className="relative">
        {leadingIcon && (
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={cn(fieldStyles({ size, invalid: Boolean(error) }), leadingIcon && 'pl-9', className)}
          {...rest}
        />
      </div>
    </FormField>
  );
});
